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
import asyncio
import uuid

from services.ssh import SSHCredentials, ssh_manager

router = APIRouter()


# === Models ===

class ServerCreate(BaseModel):
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


# === In-memory storage (replace with DB later) ===
servers_db: dict[str, dict] = {}


# === Server Management ===

@router.get("/servers")
async def list_servers(project_id: Optional[str] = None) -> list[Server]:
    """List all configured servers"""
    servers = []
    for server_id, data in servers_db.items():
        if project_id and data.get("project_id") != project_id:
            continue
        servers.append(Server(
            id=server_id,
            name=data["name"],
            host=data["host"],
            port=data["port"],
            username=data["username"],
            auth_type=data["auth_type"],
            project_id=data.get("project_id"),
            connected=ssh_manager.get(server_id) is not None
        ))
    return servers


@router.post("/servers", response_model=Server)
async def add_server(server: ServerCreate):
    """Add a new server configuration"""
    server_id = str(uuid.uuid4())
    
    servers_db[server_id] = {
        "name": server.name,
        "host": server.host,
        "port": server.port,
        "username": server.username,
        "auth_type": server.auth_type,
        "password": server.password,  # TODO: Encrypt in production
        "private_key": server.private_key,
        "passphrase": server.passphrase,
        "project_id": server.project_id
    }
    
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
    if server_id not in servers_db:
        raise HTTPException(status_code=404, detail="Server not found")
    
    # Disconnect if connected
    await ssh_manager.disconnect(server_id)
    del servers_db[server_id]
    
    return {"status": "deleted"}


@router.post("/servers/{server_id}/connect")
async def connect_server(server_id: str):
    """Establish SSH connection to a server"""
    if server_id not in servers_db:
        raise HTTPException(status_code=404, detail="Server not found")
    
    data = servers_db[server_id]
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
    
    if server_id not in servers_db:
        await websocket.send_json({"type": "error", "message": "Server not found"})
        await websocket.close()
        return
    
    # Get or create connection
    conn = ssh_manager.get(server_id)
    if not conn:
        data = servers_db[server_id]
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
