"""
SSH Router - Terminal WebSocket and File Browser API

Provides:
- WebSocket endpoint for interactive terminal
- REST endpoints for file operations (list, read, write, delete)
- Server management (add, remove, connect)
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import select
import asyncio
import uuid
import asyncssh
import json

from models import VPSServer as VPSServerModel, async_session
from services.ssh import (
    SSHCredentials,
    SSHConnection,
    ssh_manager,
    servers_cache,
    load_server_to_cache,
    remove_from_cache
)

router = APIRouter()


# === Models ===

class ServerCreate(BaseModel):
    id: Optional[str] = None  # Optional: use existing ID (for syncing from localStorage)
    name: str
    host: str
    port: int = 22
    username: str
    auth_type: str = "password"  # "password" or "key"
    password: Optional[str] = None
    private_key: Optional[str] = None
    passphrase: Optional[str] = None
    project_id: Optional[str] = None


class Server(BaseModel):
    id: str
    name: str
    host: str
    port: int
    username: str
    auth_type: str
    project_id: Optional[str]
    connected: bool = False


class FileItem(BaseModel):
    name: str
    path: str
    is_dir: bool
    size: int
    modified: Optional[float]


class FileContent(BaseModel):
    path: str
    content: str


class TestConnectionRequest(BaseModel):
    host: str
    port: int = 22
    username: str = "root"
    password: Optional[str] = None
    private_key: Optional[str] = None
    passphrase: Optional[str] = None


class TestConnectionResponse(BaseModel):
    success: bool
    message: str
    server_info: Optional[dict] = None


# === Server Management ===

@router.get("/servers")
async def list_servers(project_id: Optional[str] = None) -> list[Server]:
    """List all configured servers from database"""
    async with async_session() as session:
        query = select(VPSServerModel)
        result = await session.execute(query)
        db_servers = result.scalars().all()

        servers = []
        for server in db_servers:
            # Load into cache
            await load_server_to_cache(server)
            servers.append(Server(
                id=server.id,
                name=server.name,
                host=server.host,
                port=server.port,
                username=server.username,
                auth_type=server.auth_type,
                project_id=None,
                connected=ssh_manager.get(server.id) is not None
            ))
        return servers


@router.post("/servers", response_model=Server)
async def add_server(server: ServerCreate):
    """Add a new server configuration. If id is provided, use it (for syncing from localStorage)."""
    from datetime import datetime

    server_id = server.id if server.id else str(uuid.uuid4())

    async with async_session() as session:
        # Check if exists
        result = await session.execute(select(VPSServerModel).where(VPSServerModel.id == server_id))
        existing = result.scalar_one_or_none()

        if existing:
            # Update
            existing.name = server.name
            existing.host = server.host
            existing.port = server.port
            existing.username = server.username
            existing.auth_type = server.auth_type
            existing.password = server.password
            existing.private_key = server.private_key
            existing.passphrase = server.passphrase
            await session.commit()
            await session.refresh(existing)
            await load_server_to_cache(existing)
        else:
            # Create new
            new_server = VPSServerModel(
                id=server_id,
                name=server.name,
                host=server.host,
                port=server.port,
                username=server.username,
                auth_type=server.auth_type,
                password=server.password,
                private_key=server.private_key,
                passphrase=server.passphrase,
                created_at=datetime.utcnow()
            )
            session.add(new_server)
            await session.commit()
            await session.refresh(new_server)
            await load_server_to_cache(new_server)

    return Server(
        id=server_id,
        name=server.name,
        host=server.host,
        port=server.port,
        username=server.username,
        auth_type=server.auth_type,
        project_id=server.project_id,
        connected=False
    )


@router.delete("/servers/{server_id}")
async def remove_server(server_id: str):
    """Remove a server configuration"""
    async with async_session() as session:
        result = await session.execute(select(VPSServerModel).where(VPSServerModel.id == server_id))
        server = result.scalar_one_or_none()
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")

        # Disconnect if connected
        await ssh_manager.disconnect(server_id)
        remove_from_cache(server_id)

        await session.delete(server)
        await session.commit()

    return {"status": "deleted"}


@router.post("/servers/{server_id}/connect")
async def connect_server(server_id: str):
    """Establish SSH connection to a server"""
    if server_id not in servers_cache:
        # Try to load from database
        async with async_session() as session:
            result = await session.execute(select(VPSServerModel).where(VPSServerModel.id == server_id))
            server = result.scalar_one_or_none()
            if not server:
                raise HTTPException(status_code=404, detail="Server not found")
            await load_server_to_cache(server)

    data = servers_cache[server_id]
    credentials = SSHCredentials(
        host=data["host"],
        port=data["port"],
        username=data["username"],
        password=data.get("password"),
        private_key=data.get("private_key"),
        passphrase=data.get("passphrase")
    )

    try:
        await ssh_manager.connect(server_id, credentials)
        return {"status": "connected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connection failed: {str(e)}")


@router.post("/servers/{server_id}/disconnect")
async def disconnect_server(server_id: str):
    """Disconnect from a server"""
    await ssh_manager.disconnect(server_id)
    return {"status": "disconnected"}


# === Test Connection (without storing) ===

@router.post("/test", response_model=TestConnectionResponse)
async def test_connection(request: TestConnectionRequest):
    """
    Test SSH connection without storing credentials.
    Used in Create Project flow to validate VPS settings.
    """
    credentials = SSHCredentials(
        host=request.host,
        port=request.port,
        username=request.username,
        password=request.password,
        private_key=request.private_key,
        passphrase=request.passphrase
    )

    conn = SSHConnection(credentials)

    try:
        # Attempt connection with timeout
        await asyncio.wait_for(conn.connect(), timeout=10.0)

        # Try to get some server info by running a simple command
        server_info = {}
        try:
            process = await conn.conn.run("uname -a", timeout=5)
            server_info["os"] = process.stdout.strip()
        except Exception:
            server_info["os"] = "Unknown"

        try:
            process = await conn.conn.run("hostname", timeout=5)
            server_info["hostname"] = process.stdout.strip()
        except Exception:
            server_info["hostname"] = request.host

        try:
            process = await conn.conn.run("whoami", timeout=5)
            server_info["user"] = process.stdout.strip()
        except Exception:
            server_info["user"] = request.username

        await conn.close()

        return TestConnectionResponse(
            success=True,
            message=f"Successfully connected to {request.host}:{request.port}",
            server_info=server_info
        )

    except asyncio.TimeoutError:
        return TestConnectionResponse(
            success=False,
            message=f"Connection timed out after 10 seconds. Check that {request.host}:{request.port} is reachable."
        )
    except asyncssh.misc.PermissionDenied:
        return TestConnectionResponse(
            success=False,
            message="Authentication failed. Check your username, password, or SSH key."
        )
    except asyncssh.misc.HostKeyNotVerifiable:
        return TestConnectionResponse(
            success=False,
            message="Host key verification failed. The server's identity could not be verified."
        )
    except asyncssh.misc.ConnectionLost as e:
        return TestConnectionResponse(
            success=False,
            message=f"Connection lost: {str(e)}"
        )
    except Exception as e:
        error_msg = str(e)
        # Clean up common error messages
        if "Connection refused" in error_msg:
            return TestConnectionResponse(
                success=False,
                message=f"Connection refused. Check that SSH is running on {request.host}:{request.port}."
            )
        if "Name or service not known" in error_msg or "getaddrinfo failed" in error_msg:
            return TestConnectionResponse(
                success=False,
                message=f"Could not resolve hostname '{request.host}'. Check the IP address or hostname."
            )
        if "Network is unreachable" in error_msg:
            return TestConnectionResponse(
                success=False,
                message=f"Network unreachable. Check your network connection and firewall settings."
            )

        return TestConnectionResponse(
            success=False,
            message=f"Connection failed: {error_msg}"
        )
    finally:
        # Ensure connection is closed even on error
        try:
            await conn.close()
        except Exception:
            pass


# === WebSocket Terminal ===

@router.websocket("/servers/{server_id}/terminal")
async def terminal_websocket(websocket: WebSocket, server_id: str):
    """
    WebSocket endpoint for interactive terminal

    Client sends: {"type": "input", "data": "ls -la\n"}
    Client sends: {"type": "resize", "cols": 120, "rows": 40}
    Server sends: {"type": "output", "data": "..."}
    """
    await websocket.accept()

    # Load server from database if not in cache
    if server_id not in servers_cache:
        async with async_session() as session:
            result = await session.execute(select(VPSServerModel).where(VPSServerModel.id == server_id))
            server = result.scalar_one_or_none()
            if not server:
                await websocket.send_json({"type": "error", "message": "Server not found"})
                await websocket.close()
                return
            await load_server_to_cache(server)

    # Get or create connection
    conn = ssh_manager.get(server_id)
    if not conn:
        data = servers_cache[server_id]
        credentials = SSHCredentials(
            host=data["host"],
            port=data["port"],
            username=data["username"],
            password=data.get("password"),
            private_key=data.get("private_key"),
            passphrase=data.get("passphrase")
        )
        try:
            conn = await ssh_manager.connect(server_id, credentials)
        except Exception as e:
            await websocket.send_json({"type": "error", "message": str(e)})
            await websocket.close()
            return

    # Start shell
    try:
        await conn.start_shell()
    except Exception as e:
        await websocket.send_json({"type": "error", "message": f"Shell failed: {str(e)}"})
        await websocket.close()
        return

    # Handle bidirectional communication
    async def read_terminal():
        """Read from terminal and send to WebSocket"""
        try:
            async for data in conn.read_output():
                await websocket.send_json({
                    "type": "output",
                    "data": data.decode("utf-8", errors="replace")
                })
        except Exception as e:
            print(f"Terminal read error: {e}")

    async def write_terminal():
        """Read from WebSocket and write to terminal"""
        try:
            while True:
                message = await websocket.receive_json()

                if message["type"] == "input":
                    await conn.write_input(message["data"])
                elif message["type"] == "resize":
                    await conn.resize_terminal(
                        message.get("cols", 120),
                        message.get("rows", 40)
                    )
        except WebSocketDisconnect:
            pass
        except Exception as e:
            print(f"Terminal write error: {e}")

    # Run both tasks concurrently
    try:
        await asyncio.gather(read_terminal(), write_terminal())
    except Exception as e:
        print(f"Terminal session ended: {e}")
    finally:
        await websocket.close()


# === File Browser API ===

@router.get("/servers/{server_id}/files")
async def list_files(server_id: str, path: str = "~") -> list[FileItem]:
    """List files in a directory"""
    conn = ssh_manager.get(server_id)
    if not conn:
        raise HTTPException(status_code=400, detail="Not connected. Connect first.")

    try:
        # Expand ~ to home directory
        if path == "~":
            path = "."

        files = await conn.list_directory(path)
        return [FileItem(**f) for f in files]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/servers/{server_id}/files/read")
async def read_file(server_id: str, path: str) -> FileContent:
    """Read file contents"""
    conn = ssh_manager.get(server_id)
    if not conn:
        raise HTTPException(status_code=400, detail="Not connected")

    try:
        content = await conn.read_file(path)
        return FileContent(path=path, content=content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/servers/{server_id}/files/write")
async def write_file(server_id: str, file: FileContent):
    """Write file contents"""
    conn = ssh_manager.get(server_id)
    if not conn:
        raise HTTPException(status_code=400, detail="Not connected")

    try:
        await conn.write_file(file.path, file.content)
        return {"status": "saved", "path": file.path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/servers/{server_id}/files")
async def delete_file(server_id: str, path: str):
    """Delete a file or directory"""
    conn = ssh_manager.get(server_id)
    if not conn:
        raise HTTPException(status_code=400, detail="Not connected")

    try:
        info = await conn.get_file_info(path)
        if info["is_dir"]:
            await conn.delete_directory(path)
        else:
            await conn.delete_file(path)
        return {"status": "deleted", "path": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/servers/{server_id}/files/mkdir")
async def create_directory(server_id: str, path: str):
    """Create a directory"""
    conn = ssh_manager.get(server_id)
    if not conn:
        raise HTTPException(status_code=400, detail="Not connected")

    try:
        await conn.create_directory(path)
        return {"status": "created", "path": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/servers/{server_id}/files/rename")
async def rename_file(server_id: str, old_path: str, new_path: str):
    """Rename/move a file or directory"""
    conn = ssh_manager.get(server_id)
    if not conn:
        raise HTTPException(status_code=400, detail="Not connected")

    try:
        await conn.rename(old_path, new_path)
        return {"status": "renamed", "old_path": old_path, "new_path": new_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
