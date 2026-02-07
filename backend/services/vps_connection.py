"""
VPS Connection Manager - SSH Multiplexing Service

Manages ONE SSH connection per VPS with multiple PTY channels (like VS Code Remote).
All terminals to the same VPS share fate - if connection drops, all drop together.
"""
import asyncio
import asyncssh
import logging
import time
from typing import Optional, Callable, AsyncGenerator
from dataclasses import dataclass, field
from enum import Enum
import uuid

logger = logging.getLogger(__name__)


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

        # Last activity timestamp for idle detection
        self.last_activity: float = time.time()

    def touch(self):
        """Update last activity timestamp"""
        self.last_activity = time.time()

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
                logger.info(f"Already connected to {self.server_id}")
                return True

            logger.info(f"Connecting to {self.credentials.host}:{self.credentials.port} as {self.credentials.username}")
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
                    logger.info(f"Using private key authentication (key length: {len(self.credentials.private_key)})")
                    key = asyncssh.import_private_key(
                        self.credentials.private_key,
                        passphrase=self.credentials.passphrase
                    )
                    connect_kwargs["client_keys"] = [key]
                elif self.credentials.password:
                    logger.info("Using password authentication")
                    connect_kwargs["password"] = self.credentials.password
                else:
                    logger.warning("No authentication method provided!")

                self.conn = await asyncio.wait_for(
                    asyncssh.connect(**connect_kwargs),
                    timeout=timeout
                )

                logger.info(f"SSH connection established to {self.credentials.host}")
                self.status = ConnectionStatus.CONNECTED
                self.touch()
                await self._notify_status_change()
                return True

            except asyncio.TimeoutError:
                logger.error(f"Connection timeout to {self.credentials.host}")
                self.status = ConnectionStatus.ERROR
                self.error_message = f"Connection to {self.credentials.host} timed out"
                await self._notify_status_change()
                raise
            except Exception as e:
                logger.error(f"Connection failed: {type(e).__name__}: {e}")
                self.status = ConnectionStatus.ERROR
                self.error_message = str(e)
                await self._notify_status_change()
                raise

    async def create_channel(self, cols: int = 80, rows: int = 24) -> PTYChannel:
        """
        Create a new PTY channel on this connection.
        If not connected, will connect first.
        """
        logger.info(f"Creating channel on {self.server_id}, current status: {self.status}, conn: {self.conn is not None}")

        if not self.conn or self.status != ConnectionStatus.CONNECTED:
            logger.info(f"Not connected, calling connect() for {self.server_id}")
            await self.connect()

        channel_id = str(uuid.uuid4())
        logger.info(f"Creating PTY process for channel {channel_id[:8]}")

        try:
            process = await self.conn.create_process(
                term_type="xterm-256color",
                term_size=(cols, rows)
            )
            logger.info(f"PTY process created successfully for {channel_id[:8]}")
        except asyncssh.ChannelOpenError as e:
            logger.warning(f"ChannelOpenError: {e}, attempting reconnect")
            # Connection might be stale - mark as disconnected and retry
            self.status = ConnectionStatus.DISCONNECTED
            self.conn = None
            await self._notify_status_change()
            # Reconnect and try again
            await self.connect()
            process = await self.conn.create_process(
                term_type="xterm-256color",
                term_size=(cols, rows)
            )
        except Exception as e:
            logger.error(f"Failed to create PTY: {type(e).__name__}: {e}")
            # Mark connection as failed
            self.status = ConnectionStatus.ERROR
            self.error_message = f"Failed to create terminal: {str(e)}"
            await self._notify_status_change()
            raise

        channel = PTYChannel(
            id=channel_id,
            process=process,
            cols=cols,
            rows=rows
        )

        self.channels[channel_id] = channel
        self.touch()
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

        self.touch()
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

        # Lock for creating connections (lazy init to avoid event loop issues)
        self._lock: Optional[asyncio.Lock] = None

        # Idle timeout in seconds (default 2 hours)
        self.idle_timeout: int = 7200

        # Background task for idle checking
        self._idle_checker_task: Optional[asyncio.Task] = None

    def _get_lock(self) -> asyncio.Lock:
        """Get or create the lock (lazy init for event loop compatibility)"""
        if self._lock is None:
            self._lock = asyncio.Lock()
        return self._lock

    async def get_connection(self, server_id: str, credentials: SSHCredentials) -> VPSConnection:
        """
        Get or create a VPS connection.

        If connection exists and is healthy, returns it.
        If connection exists but is dead, recreates it.
        If no connection, creates new one.
        """
        async with self._get_lock():
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

    def start_idle_checker(self):
        """Start the background idle connection checker (call from app lifespan)"""
        if self._idle_checker_task is None or self._idle_checker_task.done():
            self._idle_checker_task = asyncio.create_task(self._idle_check_loop())
            logger.info(f"Idle connection checker started (timeout={self.idle_timeout}s, check every 300s)")

    def stop_idle_checker(self):
        """Stop the background idle connection checker"""
        if self._idle_checker_task and not self._idle_checker_task.done():
            self._idle_checker_task.cancel()
            self._idle_checker_task = None
            logger.info("Idle connection checker stopped")

    async def _idle_check_loop(self):
        """Background loop that closes idle connections every 5 minutes"""
        try:
            while True:
                await asyncio.sleep(300)  # Check every 5 minutes
                await self._close_idle_connections()
        except asyncio.CancelledError:
            pass

    async def _close_idle_connections(self):
        """Close any connections that have been idle longer than idle_timeout"""
        now = time.time()
        to_close = []

        for server_id, conn in self._connections.items():
            if conn.status == ConnectionStatus.CONNECTED:
                idle_seconds = now - conn.last_activity
                if idle_seconds > self.idle_timeout:
                    logger.info(
                        f"Closing idle connection {server_id} "
                        f"(idle {idle_seconds:.0f}s > {self.idle_timeout}s)"
                    )
                    to_close.append(server_id)

        for server_id in to_close:
            await self.close_connection(server_id)


# Global singleton instance
vps_manager = VPSConnectionManager()
