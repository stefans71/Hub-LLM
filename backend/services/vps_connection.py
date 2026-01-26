"""
VPS Connection Manager - SSH Multiplexing Service

Manages ONE SSH connection per VPS with multiple PTY channels (like VS Code Remote).
All terminals to the same VPS share fate - if connection drops, all drop together.
"""
import asyncio
import asyncssh
from typing import Optional, Callable, AsyncGenerator
from dataclasses import dataclass, field
from enum import Enum
import uuid


class ConnectionStatus(Enum):
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    ERROR = "error"


@dataclass
class PTYChannel:
    """Represents a single PTY session on an SSH connection"""
    id: str
    process: asyncssh.SSHClientProcess
    cols: int = 80
    rows: int = 24

    async def read_output(self) -> AsyncGenerator[bytes, None]:
        """Read output from this channel's PTY"""
        try:
            while True:
                data = await self.process.stdout.read(1024)
                if not data:
                    break
                yield data
        except (asyncssh.TerminalSizeChanged, asyncssh.ChannelOpenError):
            pass
        except Exception:
            pass

    async def write_input(self, data: str):
        """Write input to this channel's PTY"""
        self.process.stdin.write(data)

    async def resize(self, cols: int, rows: int):
        """Resize this channel's terminal"""
        self.cols = cols
        self.rows = rows
        self.process.change_terminal_size(cols, rows)

    def close(self):
        """Close this channel"""
        try:
            self.process.close()
        except Exception:
            pass


@dataclass
class SSHCredentials:
    """SSH connection credentials"""
    host: str
    port: int = 22
    username: str = ""
    password: Optional[str] = None
    private_key: Optional[str] = None
    passphrase: Optional[str] = None


StatusListener = Callable[[str, ConnectionStatus, Optional[str]], None]


class VPSConnection:
    """
    Manages a single SSH connection to a VPS with multiple PTY channels.

    All channels share the same connection - if it drops, all channels drop.
    """

    def __init__(self, server_id: str, credentials: SSHCredentials):
        self.server_id = server_id
        self.credentials = credentials
        self.conn: Optional[asyncssh.SSHClientConnection] = None
        self._sftp: Optional[asyncssh.SFTPClient] = None

        # Multiple PTY channels on this connection
        self.channels: dict[str, PTYChannel] = {}

        # Connection status
        self.status = ConnectionStatus.DISCONNECTED
        self.error_message: Optional[str] = None

        # Listeners for status changes (WebSocket handlers)
        self._status_listeners: list[StatusListener] = []

        # Lock for connection operations
        self._connect_lock = asyncio.Lock()

    def add_status_listener(self, listener: StatusListener):
        """Add a listener for connection status changes"""
        self._status_listeners.append(listener)

    def remove_status_listener(self, listener: StatusListener):
        """Remove a status listener"""
        if listener in self._status_listeners:
            self._status_listeners.remove(listener)

    async def _notify_status_change(self):
        """Notify all listeners of status change"""
        for listener in self._status_listeners:
            try:
                await listener(self.server_id, self.status, self.error_message)
            except Exception:
                pass

    async def connect(self, timeout: float = 15.0) -> bool:
        """
        Establish SSH connection if not already connected.
        Thread-safe - multiple callers will wait for the same connection.
        """
        async with self._connect_lock:
            if self.conn and self.status == ConnectionStatus.CONNECTED:
                return True

            self.status = ConnectionStatus.CONNECTING
            self.error_message = None
            await self._notify_status_change()

            try:
                connect_kwargs = {
                    "host": self.credentials.host,
                    "port": self.credentials.port,
                    "username": self.credentials.username,
                    "known_hosts": None,
                }

                if self.credentials.private_key:
                    key = asyncssh.import_private_key(
                        self.credentials.private_key,
                        passphrase=self.credentials.passphrase
                    )
                    connect_kwargs["client_keys"] = [key]
                elif self.credentials.password:
                    connect_kwargs["password"] = self.credentials.password

                self.conn = await asyncio.wait_for(
                    asyncssh.connect(**connect_kwargs),
                    timeout=timeout
                )

                self.status = ConnectionStatus.CONNECTED
                await self._notify_status_change()
                return True

            except asyncio.TimeoutError:
                self.status = ConnectionStatus.ERROR
                self.error_message = f"Connection to {self.credentials.host} timed out"
                await self._notify_status_change()
                raise
            except Exception as e:
                self.status = ConnectionStatus.ERROR
                self.error_message = str(e)
                await self._notify_status_change()
                raise

    async def create_channel(self, cols: int = 80, rows: int = 24) -> PTYChannel:
        """
        Create a new PTY channel on this connection.
        If not connected, will connect first.
        """
        if not self.conn or self.status != ConnectionStatus.CONNECTED:
            await self.connect()

        channel_id = str(uuid.uuid4())

        process = await self.conn.create_process(
            term_type="xterm-256color",
            term_size=(cols, rows)
        )

        channel = PTYChannel(
            id=channel_id,
            process=process,
            cols=cols,
            rows=rows
        )

        self.channels[channel_id] = channel
        return channel

    def get_channel(self, channel_id: str) -> Optional[PTYChannel]:
        """Get an existing channel by ID"""
        return self.channels.get(channel_id)

    async def close_channel(self, channel_id: str):
        """Close a specific channel (doesn't close the connection)"""
        if channel_id in self.channels:
            self.channels[channel_id].close()
            del self.channels[channel_id]

    async def get_sftp(self) -> asyncssh.SFTPClient:
        """Get SFTP client for file operations"""
        if not self.conn or self.status != ConnectionStatus.CONNECTED:
            await self.connect()
        if not self._sftp:
            self._sftp = await self.conn.start_sftp_client()
        return self._sftp

    async def run_command(self, command: str, timeout: float = 10.0) -> tuple[str, str, int]:
        """Run a one-off command (doesn't use PTY)"""
        if not self.conn or self.status != ConnectionStatus.CONNECTED:
            await self.connect()

        try:
            result = await asyncio.wait_for(
                self.conn.run(command),
                timeout=timeout
            )
            return (
                result.stdout or "",
                result.stderr or "",
                result.exit_status or 0
            )
        except asyncio.TimeoutError:
            return ("", f"Command timed out after {timeout}s", -1)
        except Exception as e:
            return ("", str(e), -1)

    async def close(self):
        """Close the connection and all channels"""
        # Close all channels first
        for channel_id in list(self.channels.keys()):
            await self.close_channel(channel_id)

        # Close SFTP
        if self._sftp:
            self._sftp.exit()
            self._sftp = None

        # Close connection
        if self.conn:
            self.conn.close()
            self.conn = None

        self.status = ConnectionStatus.DISCONNECTED
        await self._notify_status_change()

    @property
    def is_connected(self) -> bool:
        return self.status == ConnectionStatus.CONNECTED and self.conn is not None

    @property
    def channel_count(self) -> int:
        return len(self.channels)


class VPSConnectionManager:
    """
    Singleton manager for all VPS connections.

    Ensures ONE connection per VPS with multiplexed channels.
    """

    _instance: Optional['VPSConnectionManager'] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True

        # One VPSConnection per server_id
        self._connections: dict[str, VPSConnection] = {}

        # Lock for creating connections
        self._lock = asyncio.Lock()

    async def get_connection(self, server_id: str, credentials: SSHCredentials) -> VPSConnection:
        """
        Get or create a VPS connection.

        If connection exists and is healthy, returns it.
        If connection exists but is dead, recreates it.
        If no connection, creates new one.
        """
        async with self._lock:
            if server_id in self._connections:
                conn = self._connections[server_id]
                # Check if connection is still alive
                if conn.is_connected:
                    return conn
                # Connection died, remove it
                await conn.close()
                del self._connections[server_id]

            # Create new connection
            conn = VPSConnection(server_id, credentials)
            self._connections[server_id] = conn
            return conn

    def get_existing_connection(self, server_id: str) -> Optional[VPSConnection]:
        """Get an existing connection without creating one"""
        return self._connections.get(server_id)

    async def close_connection(self, server_id: str):
        """Close a specific VPS connection (and all its channels)"""
        if server_id in self._connections:
            await self._connections[server_id].close()
            del self._connections[server_id]

    async def close_all(self):
        """Close all connections"""
        for server_id in list(self._connections.keys()):
            await self.close_connection(server_id)

    def get_status(self, server_id: str) -> tuple[ConnectionStatus, Optional[str]]:
        """Get connection status for a server"""
        if server_id not in self._connections:
            return ConnectionStatus.DISCONNECTED, None
        conn = self._connections[server_id]
        return conn.status, conn.error_message

    def get_all_statuses(self) -> dict[str, dict]:
        """Get status of all connections"""
        return {
            server_id: {
                "status": conn.status.value,
                "error": conn.error_message,
                "channels": conn.channel_count
            }
            for server_id, conn in self._connections.items()
        }


# Global singleton instance
vps_manager = VPSConnectionManager()
