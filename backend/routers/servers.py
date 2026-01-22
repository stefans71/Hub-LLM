"""
Servers Router - Manage SSH servers and connections
"""
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
import asyncio

from services.ssh import (
    ServerCredentials, 
    servers_db, 
    get_connection, 
    close_connection,
    SSHConnection
)

router = APIRouter()


# ============ Server Management ============

class ServerCreate(BaseModel):
    name: str
    host: str
    port: int = 22
    username: str = "root"
    password: Optional[str] = None
    private_key: Optional[str] = None
    project_id: Optional[str] = None


class ServerResponse(BaseModel):
    id: str
    name: str
    host: str
    port: int
    username: str
    project_id: Optional[str]
    has_password: bool
    has_key: bool
    created_at: Optional[datetime]


class ServerUpdate(BaseModel):
    name: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None
    private_key: Optional[str] = None
    project_id: Optional[str] = None


@router.get("/")
async def list_servers(project_id: Optional[str] = None) -> list[ServerResponse]:
    """List all servers, optionally filtered by project"""
    servers = []
    for server in servers_db.values():
        if project_id and server.project_id != project_id:
            continue
        servers.append(ServerResponse(
            id=server.id,
            name=server.name,
            host=server.host,
            port=server.port,
            username=server.username,
            project_id=server.project_id,
            has_password=bool(server.password),
            has_key=bool(server.private_key),
            created_at=server.created_at
        ))
    return servers


@router.post("/", response_model=ServerResponse)
async def create_server(server: ServerCreate):
    """Add a new SSH server"""
    server_id = str(uuid.uuid4())
    
    credentials = ServerCredentials(
        id=server_id,
        name=server.name,
        host=server.host,
        port=server.port,
        username=server.username,
        password=server.password,
        private_key=server.private_key,
        project_id=server.project_id,
        created_at=datetime.utcnow()
    )
    
    servers_db[server_id] = credentials
    
    return ServerResponse(
        id=server_id,
        name=credentials.name,
        host=credentials.host,
        port=credentials.port,
        username=credentials.username,
        project_id=credentials.project_id,
        has_password=bool(credentials.password),
        has_key=bool(credentials.private_key),
        created_at=credentials.created_at
    )


@router.get("/{server_id}", response_model=ServerResponse)
async def get_server(server_id: str):
    """Get server details"""
    if server_id not in servers_db:
        raise HTTPException(status_code=404, detail="Server not found")
    
    server = servers_db[server_id]
    return ServerResponse(
        id=server.id,
        name=server.name,
        host=server.host,
        port=server.port,
        username=server.username,
        project_id=server.project_id,
        has_password=bool(server.password),
        has_key=bool(server.private_key),
        created_at=server.created_at
    )


@router.patch("/{server_id}", response_model=ServerResponse)
async def update_server(server_id: str, update: ServerUpdate):
    """Update server details"""
    if server_id not in servers_db:
        raise HTTPException(status_code=404, detail="Server not found")
    
    server = servers_db[server_id]
    update_data = update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(server, field, value)
    
    # Close existing connection if credentials changed
    await close_connection(server_id)
    
    return ServerResponse(
        id=server.id,
        name=server.name,
        host=server.host,
        port=server.port,
        username=server.username,
        project_id=server.project_id,
        has_password=bool(server.password),
        has_key=bool(server.private_key),
        created_at=server.created_at
    )


@router.delete("/{server_id}")
async def delete_server(server_id: str):
    """Delete a server"""
    if server_id not in servers_db:
        raise HTTPException(status_code=404, detail="Server not found")
    
    await close_connection(server_id)
    del servers_db[server_id]
    
    return {"status": "deleted", "id": server_id}


@router.post("/{server_id}/test")
async def test_connection(server_id: str):
    """Test SSH connection to server"""
    if server_id not in servers_db:
        raise HTTPException(status_code=404, detail="Server not found")
    
    try:
        conn = await get_connection(server_id)
        return {"status": "connected", "server_id": server_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connection failed: {str(e)}")


# ============ File Browser ============

class FileOperation(BaseModel):
    path: str
    content: Optional[str] = None
    new_path: Optional[str] = None
    is_dir: bool = False


@router.get("/{server_id}/files")
async def list_files(server_id: str, path: str = "/"):
    """List files in directory"""
    try:
        conn = await get_connection(server_id)
        files = await conn.list_directory(path)
        return {"path": path, "files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{server_id}/files/read")
async def read_file(server_id: str, path: str):
    """Read file contents"""
    try:
        conn = await get_connection(server_id)
        content = await conn.read_file(path)
        info = await conn.get_file_info(path)
        return {"path": path, "content": content, "info": info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{server_id}/files/write")
async def write_file(server_id: str, operation: FileOperation):
    """Write file contents"""
    try:
        conn = await get_connection(server_id)
        await conn.write_file(operation.path, operation.content or "")
        return {"status": "written", "path": operation.path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{server_id}/files/mkdir")
async def create_directory(server_id: str, operation: FileOperation):
    """Create directory"""
    try:
        conn = await get_connection(server_id)
        await conn.create_directory(operation.path)
        return {"status": "created", "path": operation.path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{server_id}/files/delete")
async def delete_file(server_id: str, operation: FileOperation):
    """Delete file or directory"""
    try:
        conn = await get_connection(server_id)
        await conn.delete(operation.path, operation.is_dir)
        return {"status": "deleted", "path": operation.path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{server_id}/files/rename")
async def rename_file(server_id: str, operation: FileOperation):
    """Rename/move file or directory"""
    if not operation.new_path:
        raise HTTPException(status_code=400, detail="new_path required")
    
    try:
        conn = await get_connection(server_id)
        await conn.rename(operation.path, operation.new_path)
        return {"status": "renamed", "old_path": operation.path, "new_path": operation.new_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ WebSocket Terminal ============

@router.websocket("/{server_id}/terminal")
async def terminal_websocket(websocket: WebSocket, server_id: str):
    """WebSocket endpoint for interactive terminal"""
    await websocket.accept()
    
    if server_id not in servers_db:
        await websocket.close(code=4004, reason="Server not found")
        return
    
    conn = None
    try:
        # Create new connection for this terminal session
        conn = SSHConnection(servers_db[server_id])
        await conn.connect()
        
        # Get initial terminal size from client
        init_msg = await websocket.receive_json()
        cols = init_msg.get("cols", 80)
        rows = init_msg.get("rows", 24)
        
        # Create terminal
        await conn.create_terminal(cols, rows)
        
        # Handle bidirectional communication
        async def read_from_terminal():
            try:
                async for data in conn.read_output():
                    await websocket.send_json({"type": "output", "data": data})
            except Exception as e:
                await websocket.send_json({"type": "error", "data": str(e)})
        
        async def write_to_terminal():
            try:
                while True:
                    msg = await websocket.receive_json()
                    
                    if msg.get("type") == "input":
                        await conn.send_input(msg.get("data", ""))
                    
                    elif msg.get("type") == "resize":
                        await conn.resize_terminal(
                            msg.get("cols", 80),
                            msg.get("rows", 24)
                        )
            except WebSocketDisconnect:
                pass
        
        # Run both tasks concurrently
        await asyncio.gather(
            read_from_terminal(),
            write_to_terminal(),
            return_exceptions=True
        )
    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "data": str(e)})
        except:
            pass
    finally:
        if conn:
            await conn.disconnect()
