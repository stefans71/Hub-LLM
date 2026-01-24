"""
Files Router - API endpoints for VPS file operations (F-01, F-03)

Provides endpoints for:
- F-01: GET /api/files - List directory contents
- F-03: GET /api/files/content - Read file content
- F-03: PUT /api/files/content - Write file content
"""
from fastapi import APIRouter, Query, HTTPException, Body
from typing import Optional
from pydantic import BaseModel

from services.ssh import SSHConnection, SSHCredentials
from routers.ssh import servers_db  # Use the same servers_db as the ssh router
from routers.projects import projects_db

router = APIRouter()

# Connection cache for this router
_file_connections: dict[str, SSHConnection] = {}


async def get_file_connection(server_id: str) -> SSHConnection:
    """Get or create an SSH connection for file operations using the correct servers_db"""
    if server_id not in servers_db:
        raise ValueError(f"Server {server_id} not found")

    # Return existing connection if available and connected
    if server_id in _file_connections:
        return _file_connections[server_id]

    # Create new connection using data from routers/ssh.py servers_db
    server = servers_db[server_id]
    credentials = SSHCredentials(
        host=server.get("host"),
        port=server.get("port", 22),
        username=server.get("username"),
        password=server.get("password"),
        private_key=server.get("private_key"),
        passphrase=server.get("passphrase")
    )

    conn = SSHConnection(credentials)
    await conn.connect()
    _file_connections[server_id] = conn
    return conn


class FileWriteRequest(BaseModel):
    """Request body for writing a file"""
    path: str
    content: str


@router.get("")
async def list_files(
    serverId: Optional[str] = Query(None, description="VPS server ID"),
    projectId: Optional[str] = Query(None, description="Project ID (will lookup VPS from project)"),
    path: str = Query("~", description="Directory path to list")
):
    """
    F-01: List files and directories at the specified path

    Returns:
        - files: List of file/directory entries
        - path: The resolved path that was listed

    Each entry contains:
        - name: File/directory name
        - path: Full path
        - is_dir: Boolean indicating if it's a directory
        - size: File size in bytes (0 for directories)
        - modified: Last modified timestamp
        - permissions: Unix permissions (octal)
    """
    # Resolve server ID
    resolved_server_id = None

    if serverId:
        resolved_server_id = serverId
    elif projectId:
        if projectId not in projects_db:
            raise HTTPException(status_code=404, detail=f"Project {projectId} not found")
        project = projects_db[projectId]
        resolved_server_id = project.vps_server_id
        if not resolved_server_id:
            raise HTTPException(status_code=400, detail="Project has no VPS server configured")
    else:
        raise HTTPException(status_code=400, detail="Either serverId or projectId is required")

    # Check server exists
    if resolved_server_id not in servers_db:
        raise HTTPException(status_code=404, detail=f"Server {resolved_server_id} not found")

    try:
        conn = await get_file_connection(resolved_server_id)

        # Handle home directory shorthand
        if path == "~":
            path = "."

        files = await conn.list_directory(path)

        return {
            "path": path,
            "files": files,
            "server_id": resolved_server_id
        }

    except PermissionError as e:
        raise HTTPException(status_code=403, detail=f"Permission denied: {str(e)}")
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"Directory not found: {path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list directory: {str(e)}")


@router.get("/content")
async def read_file(
    serverId: Optional[str] = Query(None, description="VPS server ID"),
    projectId: Optional[str] = Query(None, description="Project ID"),
    path: str = Query(..., description="File path to read")
):
    """
    F-03: Read file content from VPS

    Returns:
        - path: The file path
        - content: File content as string
        - size: File size in bytes

    Note: Binary files are not supported (will return with replacement characters)
    """
    # Resolve server ID
    resolved_server_id = None

    if serverId:
        resolved_server_id = serverId
    elif projectId:
        if projectId not in projects_db:
            raise HTTPException(status_code=404, detail=f"Project {projectId} not found")
        project = projects_db[projectId]
        resolved_server_id = project.vps_server_id
        if not resolved_server_id:
            raise HTTPException(status_code=400, detail="Project has no VPS server configured")
    else:
        raise HTTPException(status_code=400, detail="Either serverId or projectId is required")

    # Check server exists
    if resolved_server_id not in servers_db:
        raise HTTPException(status_code=404, detail=f"Server {resolved_server_id} not found")

    try:
        conn = await get_file_connection(resolved_server_id)

        # Get file info first to check if it exists and get size
        file_info = await conn.get_file_info(path)

        if file_info.get("is_dir"):
            raise HTTPException(status_code=400, detail="Cannot read a directory as file")

        # Check file size (limit to 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if file_info.get("size", 0) > max_size:
            raise HTTPException(
                status_code=413,
                detail=f"File too large ({file_info['size']} bytes). Max size is {max_size} bytes."
            )

        content = await conn.read_file(path)

        return {
            "path": path,
            "content": content,
            "size": len(content)
        }

    except PermissionError as e:
        raise HTTPException(status_code=403, detail=f"Permission denied: {str(e)}")
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"File not found: {path}")
    except Exception as e:
        if "413" in str(type(e).__name__):
            raise
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")


@router.put("/content")
async def write_file(
    serverId: Optional[str] = Query(None, description="VPS server ID"),
    projectId: Optional[str] = Query(None, description="Project ID"),
    body: FileWriteRequest = Body(...)
):
    """
    F-03: Write content to a file on VPS

    Request body:
        - path: File path to write
        - content: New file content

    Returns:
        - path: The file path
        - size: Bytes written
        - success: True if successful
    """
    # Resolve server ID
    resolved_server_id = None

    if serverId:
        resolved_server_id = serverId
    elif projectId:
        if projectId not in projects_db:
            raise HTTPException(status_code=404, detail=f"Project {projectId} not found")
        project = projects_db[projectId]
        resolved_server_id = project.vps_server_id
        if not resolved_server_id:
            raise HTTPException(status_code=400, detail="Project has no VPS server configured")
    else:
        raise HTTPException(status_code=400, detail="Either serverId or projectId is required")

    # Check server exists
    if resolved_server_id not in servers_db:
        raise HTTPException(status_code=404, detail=f"Server {resolved_server_id} not found")

    try:
        conn = await get_file_connection(resolved_server_id)
        await conn.write_file(body.path, body.content)

        return {
            "path": body.path,
            "size": len(body.content.encode("utf-8")),
            "success": True
        }

    except PermissionError as e:
        raise HTTPException(status_code=403, detail=f"Permission denied: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write file: {str(e)}")


@router.post("/mkdir")
async def create_directory(
    serverId: Optional[str] = Query(None, description="VPS server ID"),
    projectId: Optional[str] = Query(None, description="Project ID"),
    path: str = Query(..., description="Directory path to create")
):
    """Create a new directory"""
    # Resolve server ID
    resolved_server_id = None

    if serverId:
        resolved_server_id = serverId
    elif projectId:
        if projectId not in projects_db:
            raise HTTPException(status_code=404, detail=f"Project {projectId} not found")
        project = projects_db[projectId]
        resolved_server_id = project.vps_server_id
        if not resolved_server_id:
            raise HTTPException(status_code=400, detail="Project has no VPS server configured")
    else:
        raise HTTPException(status_code=400, detail="Either serverId or projectId is required")

    if resolved_server_id not in servers_db:
        raise HTTPException(status_code=404, detail=f"Server {resolved_server_id} not found")

    try:
        conn = await get_file_connection(resolved_server_id)
        await conn.create_directory(path)

        return {"path": path, "success": True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create directory: {str(e)}")


@router.delete("")
async def delete_file_or_dir(
    serverId: Optional[str] = Query(None, description="VPS server ID"),
    projectId: Optional[str] = Query(None, description="Project ID"),
    path: str = Query(..., description="File or directory path to delete"),
    is_dir: bool = Query(False, description="True if deleting a directory")
):
    """Delete a file or empty directory"""
    # Resolve server ID
    resolved_server_id = None

    if serverId:
        resolved_server_id = serverId
    elif projectId:
        if projectId not in projects_db:
            raise HTTPException(status_code=404, detail=f"Project {projectId} not found")
        project = projects_db[projectId]
        resolved_server_id = project.vps_server_id
        if not resolved_server_id:
            raise HTTPException(status_code=400, detail="Project has no VPS server configured")
    else:
        raise HTTPException(status_code=400, detail="Either serverId or projectId is required")

    if resolved_server_id not in servers_db:
        raise HTTPException(status_code=404, detail=f"Server {resolved_server_id} not found")

    try:
        conn = await get_file_connection(resolved_server_id)
        await conn.delete(path, is_dir)

        return {"path": path, "success": True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete: {str(e)}")
