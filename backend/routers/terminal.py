"""
Terminal Router - WebSocket endpoint for workspace terminal connections

Provides /api/terminal/ws endpoint that:
- Accepts projectId or serverId query params
- Looks up VPS credentials from project if projectId given
- Uses multiplexed SSH connection (one per VPS, multiple PTY channels)
- Handles bidirectional communication
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
from sqlalchemy import select
import asyncio

from services.vps_connection import (
    vps_manager,
    VPSConnection,
    PTYChannel,
    SSHCredentials,
    ConnectionStatus
)
from services.ssh import servers_cache, load_server_to_cache
from models import VPSServer as VPSServerModel, Project as ProjectModel, async_session

router = APIRouter()


# Track active terminal sessions (channel_id -> websocket info)
_terminal_sessions: dict[str, dict] = {}


@router.websocket("/ws")
async def terminal_websocket(
    websocket: WebSocket,
    projectId: Optional[str] = Query(None),
    serverId: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for interactive terminal

    Uses multiplexed SSH - ONE connection per VPS with multiple PTY channels.
    All terminals to the same VPS share fate (if connection drops, all drop).

    Query params:
        - projectId: Project ID (will look up vps_server_id from project)
        - serverId: Direct server ID

    Client messages:
        {"type": "init", "cols": 80, "rows": 24}  # Required first message
        {"type": "input", "data": "ls -la\n"}
        {"type": "resize", "cols": 120, "rows": 40}

    Server messages:
        {"type": "connected", "server": "hostname", "channel_id": "..."}
        {"type": "output", "data": "..."}
        {"type": "connection_status", "status": "connected|disconnected|error", "message": "..."}
        {"type": "error", "message": "..."}
        {"type": "disconnected"}
    """
    await websocket.accept()

    # Resolve server ID
    resolved_server_id = None
    server_name = "Unknown"

    if serverId:
        resolved_server_id = serverId
    elif projectId:
        # Look up project to get its vps_server_id
        async with async_session() as session:
            result = await session.execute(select(ProjectModel).where(ProjectModel.id == projectId))
            project = result.scalar_one_or_none()
            if project:
                resolved_server_id = project.vps_server_id
                server_name = project.name
            else:
                await websocket.send_json({
                    "type": "error",
                    "message": f"Project {projectId} not found"
                })
                await websocket.close(code=4004)
                return
    else:
        await websocket.send_json({
            "type": "error",
            "message": "Either projectId or serverId query param required"
        })
        await websocket.close(code=4000)
        return

    if not resolved_server_id:
        await websocket.send_json({
            "type": "error",
            "message": "No VPS server configured for this project"
        })
        await websocket.close(code=4004)
        return

    # Get server from database
    async with async_session() as session:
        result = await session.execute(select(VPSServerModel).where(VPSServerModel.id == resolved_server_id))
        server_model = result.scalar_one_or_none()
        if not server_model:
            await websocket.send_json({
                "type": "error",
                "message": f"Server {resolved_server_id} not found"
            })
            await websocket.close(code=4004)
            return

        # Load into cache
        await load_server_to_cache(server_model)

    server = servers_cache[resolved_server_id]
    server_name = server.get('name', server.get('host', 'Unknown'))
    server_host = server.get("host")

    # Build credentials from cached server data
    credentials = SSHCredentials(
        host=server.get("host"),
        port=server.get("port", 22),
        username=server.get("username"),
        password=server.get("password"),
        private_key=server.get("private_key"),
        passphrase=server.get("passphrase")
    )

    # Variables for cleanup
    vps_conn: Optional[VPSConnection] = None
    channel: Optional[PTYChannel] = None
    status_listener = None

    try:
        # Wait for init message with terminal size
        try:
            init_msg = await asyncio.wait_for(websocket.receive_json(), timeout=10.0)
            cols = init_msg.get("cols", 80)
            rows = init_msg.get("rows", 24)
        except asyncio.TimeoutError:
            await websocket.send_json({
                "type": "error",
                "message": "Timeout waiting for init message"
            })
            await websocket.close(code=4008)
            return

        # Get or create multiplexed VPS connection
        vps_conn = await vps_manager.get_connection(resolved_server_id, credentials)

        # Status listener - broadcasts connection status changes to this WebSocket
        async def on_status_change(server_id: str, status: ConnectionStatus, error_msg: Optional[str]):
            try:
                await websocket.send_json({
                    "type": "connection_status",
                    "server_id": server_id,
                    "status": status.value,
                    "message": error_msg
                })
            except Exception:
                pass

        status_listener = on_status_change
        vps_conn.add_status_listener(status_listener)

        # Connect if not already connected (multiplexed - reuses existing connection)
        try:
            await vps_conn.connect(timeout=15.0)
        except asyncio.TimeoutError:
            await websocket.send_json({
                "type": "error",
                "message": f"SSH connection to {server_host} timed out"
            })
            await websocket.close(code=4008)
            return
        except Exception as e:
            await websocket.send_json({
                "type": "error",
                "message": f"SSH connection failed: {str(e)}"
            })
            await websocket.close(code=4003)
            return

        # Create a NEW PTY channel on the existing connection
        channel = await vps_conn.create_channel(cols, rows)
        session_id = channel.id

        # Track session
        _terminal_sessions[session_id] = {
            "server_id": resolved_server_id,
            "channel_id": channel.id,
            "websocket_id": id(websocket)
        }

        # Notify client of successful connection
        await websocket.send_json({
            "type": "connected",
            "server": server_name,
            "host": server_host,
            "channel_id": channel.id,
            "connection_channels": vps_conn.channel_count
        })

        # Handle bidirectional communication
        async def read_from_terminal():
            """Read PTY channel output and send to WebSocket"""
            try:
                async for data in channel.read_output():
                    if isinstance(data, bytes):
                        data = data.decode("utf-8", errors="replace")
                    await websocket.send_json({
                        "type": "output",
                        "data": data
                    })
            except Exception:
                # Channel closed or error
                pass

        async def write_to_terminal():
            """Read WebSocket messages and send to PTY channel"""
            try:
                while True:
                    msg = await websocket.receive_json()
                    msg_type = msg.get("type")

                    if msg_type == "input":
                        await channel.write_input(msg.get("data", ""))
                        vps_conn.touch()

                    elif msg_type == "resize":
                        await channel.resize(
                            msg.get("cols", 80),
                            msg.get("rows", 24)
                        )
            except WebSocketDisconnect:
                pass
            except Exception:
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
            await websocket.send_json({
                "type": "error",
                "message": str(e)
            })
        except:
            pass
    finally:
        # Cleanup - close the CHANNEL, not the connection
        # Other terminals on this VPS keep working
        if channel:
            session_id = channel.id
            if session_id in _terminal_sessions:
                del _terminal_sessions[session_id]
            if vps_conn:
                await vps_conn.close_channel(channel.id)

        # Remove status listener
        if vps_conn and status_listener:
            vps_conn.remove_status_listener(status_listener)

        try:
            await websocket.send_json({"type": "disconnected"})
        except:
            pass


@router.get("/status")
async def terminal_status():
    """Get status of active terminal sessions and VPS connections"""
    return {
        "active_sessions": len(_terminal_sessions),
        "sessions": list(_terminal_sessions.keys()),
        "connections": vps_manager.get_all_statuses()
    }


@router.get("/connections/{server_id}")
async def get_connection_status(server_id: str):
    """Get status of a specific VPS connection"""
    status, error = vps_manager.get_status(server_id)
    conn = vps_manager.get_existing_connection(server_id)
    return {
        "server_id": server_id,
        "status": status.value,
        "error": error,
        "channel_count": conn.channel_count if conn else 0
    }
