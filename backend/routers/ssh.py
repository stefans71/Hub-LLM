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
    SSHCredentials as LegacySSHCredentials,
    SSHConnection,
    ssh_manager,
    servers_cache,
    load_server_to_cache,
    remove_from_cache
)
from services.vps_connection import (
    vps_manager,
    SSHCredentials,
    ConnectionStatus
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
    claude_code_detected: bool = False


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
    credentials = LegacySSHCredentials(
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


# === Claude Code Detection ===

class ClaudeCodeStatus(BaseModel):
    installed: bool
    version: Optional[str] = None
    authenticated: bool = False
    error: Optional[str] = None


@router.get("/servers/{server_id}/claude-code", response_model=ClaudeCodeStatus)
async def detect_claude_code(server_id: str):
    """
    Detect if Claude Code is installed and authenticated on the VPS.
    Runs `which claude` and `claude --version` to check.
    """
    from services.ssh import get_connection, servers_cache

    if server_id not in servers_cache:
        # Try to load from database
        async with async_session() as session:
            result = await session.execute(select(VPSServerModel).where(VPSServerModel.id == server_id))
            server = result.scalar_one_or_none()
            if not server:
                raise HTTPException(status_code=404, detail="Server not found")
            await load_server_to_cache(server)

    try:
        conn = await get_connection(server_id)

        # Check if claude is installed
        stdout, stderr, exit_code = await conn.run_command("which claude")

        if exit_code != 0 or not stdout.strip():
            return ClaudeCodeStatus(
                installed=False,
                authenticated=False,
                error="Claude Code not found. Install with: npm install -g @anthropic-ai/claude-code"
            )

        # Get version
        version_stdout, version_stderr, version_exit = await conn.run_command("claude --version")
        version = version_stdout.strip() if version_exit == 0 else None

        # Check if authenticated by running a simple command
        # Claude Code shows auth status when you run it
        auth_stdout, auth_stderr, auth_exit = await conn.run_command("claude --help 2>&1 | head -5")

        # If claude --help works without auth errors, assume authenticated
        # In practice, we might need to check for specific auth messages
        authenticated = auth_exit == 0 and "not authenticated" not in auth_stdout.lower()

        return ClaudeCodeStatus(
            installed=True,
            version=version,
            authenticated=authenticated
        )

    except Exception as e:
        return ClaudeCodeStatus(
            installed=False,
            authenticated=False,
            error=f"Failed to detect Claude Code: {str(e)}"
        )


# === Test Connection (without storing) ===

@router.post("/test", response_model=TestConnectionResponse)
async def test_connection(request: TestConnectionRequest):
    """
    Test SSH connection without storing credentials.
    Used in Create Project flow to validate VPS settings.
    """
    credentials = LegacySSHCredentials(
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

        # Check if Claude Code is installed
        claude_detected = False
        try:
            process = await conn.conn.run("which claude", timeout=5)
            claude_detected = process.exit_status == 0 and bool(process.stdout.strip())
        except Exception:
            claude_detected = False

        await conn.close()

        return TestConnectionResponse(
            success=True,
            message=f"Successfully connected to {request.host}:{request.port}",
            server_info=server_info,
            claude_code_detected=claude_detected
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
    WebSocket endpoint for interactive terminal (multiplexed).

    Uses VPSConnectionManager for shared connection - all terminals to
    same VPS share one SSH connection with multiple PTY channels.

    Client sends: {"type": "input", "data": "ls -la\n"}
    Client sends: {"type": "resize", "cols": 120, "rows": 40}
    Server sends: {"type": "output", "data": "..."}
    Server sends: {"type": "connection_status", "status": "..."}
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

    data = servers_cache[server_id]
    credentials = SSHCredentials(
        host=data["host"],
        port=data["port"],
        username=data["username"],
        password=data.get("password"),
        private_key=data.get("private_key"),
        passphrase=data.get("passphrase")
    )

    vps_conn = None
    channel = None
    status_listener = None

    try:
        # Get or create multiplexed VPS connection
        vps_conn = await vps_manager.get_connection(server_id, credentials)

        # Status listener for connection changes
        async def on_status_change(sid: str, status: ConnectionStatus, error_msg):
            try:
                await websocket.send_json({
                    "type": "connection_status",
                    "server_id": sid,
                    "status": status.value,
                    "message": error_msg
                })
            except Exception:
                pass

        status_listener = on_status_change
        vps_conn.add_status_listener(status_listener)

        # Connect if needed
        try:
            await vps_conn.connect(timeout=15.0)
        except Exception as e:
            await websocket.send_json({"type": "error", "message": str(e)})
            await websocket.close()
            return

        # Create PTY channel (default size, will be resized)
        channel = await vps_conn.create_channel(120, 40)

        await websocket.send_json({
            "type": "connected",
            "server_id": server_id,
            "channel_id": channel.id
        })

        # Handle bidirectional communication
        async def read_terminal():
            """Read from PTY channel and send to WebSocket"""
            try:
                async for output in channel.read_output():
                    await websocket.send_json({
                        "type": "output",
                        "data": output.decode("utf-8", errors="replace")
                    })
            except Exception:
                pass

        async def write_terminal():
            """Read from WebSocket and write to PTY channel"""
            try:
                while True:
                    message = await websocket.receive_json()

                    if message["type"] == "input":
                        await channel.write_input(message["data"])
                    elif message["type"] == "resize":
                        await channel.resize(
                            message.get("cols", 120),
                            message.get("rows", 40)
                        )
            except WebSocketDisconnect:
                pass
            except Exception:
                pass

        # Run both tasks concurrently
        await asyncio.gather(read_terminal(), write_terminal())

    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except:
            pass
    finally:
        # Close the channel (not the connection)
        if channel and vps_conn:
            await vps_conn.close_channel(channel.id)
        if vps_conn and status_listener:
            vps_conn.remove_status_listener(status_listener)
        try:
            await websocket.close()
        except:
            pass


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
