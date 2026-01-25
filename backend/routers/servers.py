"""
Servers Router - Manage SSH servers and connections
"""
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from sqlalchemy import select
import uuid
import asyncio
import json

from models import VPSServer as VPSServerModel, get_session
from services.ssh import (
    get_connection,
    close_connection,
    SSHConnection,
    SSHCredentials,
    load_server_to_cache,
    remove_from_cache
)

router = APIRouter()


# ============ Server Management ============

class ServerCreate(BaseModel):
    id: Optional[str] = None  # Allow client to specify ID for sync
    name: str
    host: str
    port: int = 22
    username: str = "root"
    password: Optional[str] = None
    private_key: Optional[str] = None
    passphrase: Optional[str] = None
    project_id: Optional[str] = None
    last_test_success: Optional[bool] = False
    server_info: Optional[dict] = None


class ServerResponse(BaseModel):
    id: str
    name: str
    host: str
    port: int
    username: str
    auth_type: str
    project_id: Optional[str]
    has_password: bool
    has_key: bool
    last_test_success: bool
    server_info: Optional[dict]
    created_at: Optional[datetime]


class ServerUpdate(BaseModel):
    name: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None
    private_key: Optional[str] = None
    passphrase: Optional[str] = None
    project_id: Optional[str] = None
    last_test_success: Optional[bool] = None
    server_info: Optional[dict] = None


def db_to_response(server: VPSServerModel) -> ServerResponse:
    """Convert database model to response"""
    server_info = None
    if server.server_info:
        try:
            server_info = json.loads(server.server_info)
        except:
            pass

    return ServerResponse(
        id=server.id,
        name=server.name,
        host=server.host,
        port=server.port,
        username=server.username,
        auth_type=server.auth_type,
        project_id=None,  # Not stored in VPSServer model directly
        has_password=bool(server.password),
        has_key=bool(server.private_key),
        last_test_success=server.last_test_success,
        server_info=server_info,
        created_at=server.created_at
    )


@router.get("/")
async def list_servers(project_id: Optional[str] = None) -> list[ServerResponse]:
    """List all servers, optionally filtered by project"""
    async with get_session() as session:
        query = select(VPSServerModel).order_by(VPSServerModel.created_at.desc())
        result = await session.execute(query)
        servers = result.scalars().all()

        responses = []
        for server in servers:
            resp = db_to_response(server)
            # Also load into cache for SSH operations
            await load_server_to_cache(server)
            responses.append(resp)

        return responses


@router.post("/", response_model=ServerResponse)
async def create_server(server: ServerCreate):
    """Add a new SSH server"""
    server_id = server.id or str(uuid.uuid4())
    created_at = datetime.utcnow()

    async with get_session() as session:
        # Check if server already exists (for upsert behavior)
        result = await session.execute(select(VPSServerModel).where(VPSServerModel.id == server_id))
        existing = result.scalar_one_or_none()

        if existing:
            # Update existing server
            existing.name = server.name
            existing.host = server.host
            existing.port = server.port
            existing.username = server.username
            existing.auth_type = "key" if server.private_key else "password"
            existing.password = server.password
            existing.private_key = server.private_key
            existing.passphrase = server.passphrase
            existing.last_test_success = server.last_test_success or False
            existing.server_info = json.dumps(server.server_info) if server.server_info else None
            await session.commit()
            await session.refresh(existing)
            await load_server_to_cache(existing)
            return db_to_response(existing)

        # Create new server
        new_server = VPSServerModel(
            id=server_id,
            name=server.name,
            host=server.host,
            port=server.port,
            username=server.username,
            auth_type="key" if server.private_key else "password",
            password=server.password,
            private_key=server.private_key,
            passphrase=server.passphrase,
            last_test_success=server.last_test_success or False,
            server_info=json.dumps(server.server_info) if server.server_info else None,
            created_at=created_at
        )

        session.add(new_server)
        await session.commit()
        await session.refresh(new_server)

        # Load into cache for SSH operations
        await load_server_to_cache(new_server)

        return db_to_response(new_server)


@router.get("/{server_id}", response_model=ServerResponse)
async def get_server(server_id: str):
    """Get server details"""
    async with get_session() as session:
        result = await session.execute(select(VPSServerModel).where(VPSServerModel.id == server_id))
        server = result.scalar_one_or_none()
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")
        return db_to_response(server)


@router.patch("/{server_id}", response_model=ServerResponse)
async def update_server(server_id: str, update: ServerUpdate):
    """Update server details"""
    async with get_session() as session:
        result = await session.execute(select(VPSServerModel).where(VPSServerModel.id == server_id))
        server = result.scalar_one_or_none()
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")

        update_data = update.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if field == "server_info" and value is not None:
                setattr(server, field, json.dumps(value))
            else:
                setattr(server, field, value)

        # Update auth_type if credentials changed
        if "private_key" in update_data or "password" in update_data:
            server.auth_type = "key" if server.private_key else "password"

        await session.commit()
        await session.refresh(server)

        # Close existing connection and reload cache
        await close_connection(server_id)
        await load_server_to_cache(server)

        return db_to_response(server)


@router.delete("/{server_id}")
async def delete_server(server_id: str):
    """Delete a server"""
    async with get_session() as session:
        result = await session.execute(select(VPSServerModel).where(VPSServerModel.id == server_id))
        server = result.scalar_one_or_none()
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")

        await close_connection(server_id)
        remove_from_cache(server_id)
        await session.delete(server)
        await session.commit()

        return {"status": "deleted", "id": server_id}


@router.post("/{server_id}/test")
async def test_connection(server_id: str):
    """Test SSH connection to server"""
    async with get_session() as session:
        result = await session.execute(select(VPSServerModel).where(VPSServerModel.id == server_id))
        server = result.scalar_one_or_none()
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")

        try:
            conn = await get_connection(server_id)
            # Update last_test_success
            server.last_test_success = True
            await session.commit()
            return {"status": "connected", "server_id": server_id}
        except Exception as e:
            # Update last_test_success to False
            server.last_test_success = False
            await session.commit()
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

    # Check if server exists in database
    async with get_session() as session:
        result = await session.execute(select(VPSServerModel).where(VPSServerModel.id == server_id))
        server = result.scalar_one_or_none()
        if not server:
            await websocket.close(code=4004, reason="Server not found")
            return

        # Load into cache if not already there
        await load_server_to_cache(server)

    conn = None
    try:
        # Create new connection for this terminal session
        async with get_session() as session:
            result = await session.execute(select(VPSServerModel).where(VPSServerModel.id == server_id))
            server = result.scalar_one_or_none()

        credentials = SSHCredentials(
            host=server.host,
            port=server.port,
            username=server.username,
            password=server.password,
            private_key=server.private_key,
            passphrase=server.passphrase
        )
        conn = SSHConnection(credentials)
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
