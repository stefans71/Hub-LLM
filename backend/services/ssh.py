"""
SSH Service - Terminal and SFTP file operations

Handles SSH connections to remote servers (VPS, Codespaces, etc.)
"""
import asyncio
import asyncssh
from typing import Optional, AsyncGenerator
from dataclasses import dataclass


@dataclass
class SSHCredentials:
    host: str
    port: int = 22
    username: str = ""
    password: Optional[str] = None
    private_key: Optional[str] = None  # PEM format
    passphrase: Optional[str] = None


class SSHConnection:
    """Manages a single SSH connection with terminal and SFTP"""
    
    def __init__(self, credentials: SSHCredentials):
        self.credentials = credentials
        self.conn: Optional[asyncssh.SSHClientConnection] = None
        self.process: Optional[asyncssh.SSHClientProcess] = None
        self._sftp: Optional[asyncssh.SFTPClient] = None
    
    async def connect(self) -> bool:
        """Establish SSH connection"""
        try:
            connect_kwargs = {
                "host": self.credentials.host,
                "port": self.credentials.port,
                "username": self.credentials.username,
                "known_hosts": None,  # TODO: Add known_hosts verification in production
            }
            
            if self.credentials.private_key:
                # Load private key from PEM string
                key = asyncssh.import_private_key(
                    self.credentials.private_key,
                    passphrase=self.credentials.passphrase
                )
                connect_kwargs["client_keys"] = [key]
            elif self.credentials.password:
                connect_kwargs["password"] = self.credentials.password
            
            self.conn = await asyncssh.connect(**connect_kwargs)
            return True
        except Exception as e:
            print(f"SSH connection failed: {e}")
            raise
    
    async def start_shell(self) -> asyncssh.SSHClientProcess:
        """Start an interactive shell session"""
        if not self.conn:
            await self.connect()
        
        self.process = await self.conn.create_process(
            term_type="xterm-256color",
            term_size=(120, 40)
        )
        return self.process
    
    async def read_output(self) -> AsyncGenerator[bytes, None]:
        """Read output from the shell"""
        if not self.process:
            raise RuntimeError("Shell not started")
        
        try:
            while True:
                data = await self.process.stdout.read(1024)
                if not data:
                    break
                yield data
        except asyncssh.TerminalSizeChanged:
            pass
    
    async def write_input(self, data: str):
        """Write input to the shell"""
        if not self.process:
            raise RuntimeError("Shell not started")
        self.process.stdin.write(data)
    
    async def resize_terminal(self, cols: int, rows: int):
        """Resize the terminal"""
        if self.process:
            self.process.change_terminal_size(cols, rows)
    
    async def get_sftp(self) -> asyncssh.SFTPClient:
        """Get SFTP client for file operations"""
        if not self.conn:
            await self.connect()
        if not self._sftp:
            self._sftp = await self.conn.start_sftp_client()
        return self._sftp
    
    async def list_directory(self, path: str = ".") -> list[dict]:
        """List files in a directory"""
        sftp = await self.get_sftp()
        files = []
        
        try:
            for entry in await sftp.readdir(path):
                stat = entry.attrs
                files.append({
                    "name": entry.filename,
                    "path": f"{path}/{entry.filename}".replace("//", "/"),
                    "is_dir": stat.type == asyncssh.FILEXFER_TYPE_DIRECTORY,
                    "size": stat.size or 0,
                    "modified": stat.mtime,
                    "permissions": stat.permissions
                })
        except Exception as e:
            print(f"Error listing directory: {e}")
            raise
        
        # Sort: directories first, then by name
        files.sort(key=lambda x: (not x["is_dir"], x["name"].lower()))
        return files
    
    async def read_file(self, path: str) -> str:
        """Read file contents"""
        sftp = await self.get_sftp()
        async with sftp.open(path, "r") as f:
            content = await f.read()
            return content.decode("utf-8", errors="replace")
    
    async def write_file(self, path: str, content: str):
        """Write file contents"""
        sftp = await self.get_sftp()
        async with sftp.open(path, "w") as f:
            await f.write(content.encode("utf-8"))
    
    async def delete_file(self, path: str):
        """Delete a file"""
        sftp = await self.get_sftp()
        await sftp.remove(path)
    
    async def delete_directory(self, path: str):
        """Delete a directory"""
        sftp = await self.get_sftp()
        await sftp.rmdir(path)
    
    async def create_directory(self, path: str):
        """Create a directory"""
        sftp = await self.get_sftp()
        await sftp.mkdir(path)
    
    async def rename(self, old_path: str, new_path: str):
        """Rename/move a file or directory"""
        sftp = await self.get_sftp()
        await sftp.rename(old_path, new_path)
    
    async def get_file_info(self, path: str) -> dict:
        """Get file/directory info"""
        sftp = await self.get_sftp()
        stat = await sftp.stat(path)
        return {
            "path": path,
            "is_dir": stat.type == asyncssh.FILEXFER_TYPE_DIRECTORY,
            "size": stat.size,
            "modified": stat.mtime,
            "permissions": stat.permissions
        }
    
    async def delete(self, path: str, is_dir: bool = False):
        """Delete a file or directory"""
        if is_dir:
            await self.delete_directory(path)
        else:
            await self.delete_file(path)

    async def create_terminal(self, cols: int = 80, rows: int = 24):
        """Create an interactive terminal (alias for start_shell with size)"""
        if not self.conn:
            await self.connect()

        self.process = await self.conn.create_process(
            term_type="xterm-256color",
            term_size=(cols, rows)
        )
        return self.process

    async def send_input(self, data: str):
        """Send input to the terminal (alias for write_input)"""
        await self.write_input(data)

    async def disconnect(self):
        """Disconnect (alias for close)"""
        await self.close()

    async def close(self):
        """Close the connection"""
        if self.process:
            self.process.close()
        if self._sftp:
            self._sftp.exit()
        if self.conn:
            self.conn.close()


# Connection manager for multiple servers
class SSHManager:
    """Manages multiple SSH connections"""
    
    def __init__(self):
        self.connections: dict[str, SSHConnection] = {}
    
    async def connect(self, server_id: str, credentials: SSHCredentials) -> SSHConnection:
        """Create or get an SSH connection"""
        if server_id in self.connections:
            return self.connections[server_id]
        
        conn = SSHConnection(credentials)
        await conn.connect()
        self.connections[server_id] = conn
        return conn
    
    def get(self, server_id: str) -> Optional[SSHConnection]:
        """Get an existing connection"""
        return self.connections.get(server_id)
    
    async def disconnect(self, server_id: str):
        """Disconnect a server"""
        if server_id in self.connections:
            await self.connections[server_id].close()
            del self.connections[server_id]
    
    async def disconnect_all(self):
        """Disconnect all servers"""
        for conn in self.connections.values():
            await conn.close()
        self.connections.clear()


# Global manager instance
ssh_manager = SSHManager()


# ============ Unified Server Storage ============
# Single source of truth for all server data (in-memory, replace with DB later)
# Used by: routers/ssh.py, routers/servers.py, routers/files.py, routers/terminal.py

servers_db: dict[str, dict] = {}
"""
Server data structure:
{
    "name": str,
    "host": str,
    "port": int,
    "username": str,
    "auth_type": str,  # "password" or "key"
    "password": Optional[str],
    "private_key": Optional[str],
    "passphrase": Optional[str],
    "project_id": Optional[str],
    "created_at": Optional[datetime]
}
"""

# Active connections cache (separate from SSHManager for backward compat)
_connections: dict[str, SSHConnection] = {}


async def get_connection(server_id: str) -> SSHConnection:
    """Get or create an SSH connection for a server"""
    if server_id not in servers_db:
        raise ValueError(f"Server {server_id} not found")

    # Return existing connection if available
    if server_id in _connections:
        return _connections[server_id]

    # Create new connection from dict-based server data
    server = servers_db[server_id]
    credentials = SSHCredentials(
        host=server["host"],
        port=server["port"],
        username=server["username"],
        password=server.get("password"),
        private_key=server.get("private_key"),
        passphrase=server.get("passphrase")
    )

    conn = SSHConnection(credentials)
    await conn.connect()
    _connections[server_id] = conn
    return conn


async def close_connection(server_id: str):
    """Close an SSH connection for a server"""
    if server_id in _connections:
        await _connections[server_id].close()
        del _connections[server_id]
