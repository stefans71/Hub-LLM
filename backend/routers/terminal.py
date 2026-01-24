"""
Terminal Router - WebSocket endpoint for workspace terminal connections

Provides /api/terminal/ws endpoint that:
- Accepts projectId or serverId query params
- Looks up VPS credentials from project if projectId given
- Creates SSH terminal session
- Handles bidirectional communication
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
import asyncio

from services.ssh import SSHConnection, SSHCredentials, servers_db, ServerCredentials
from routers.projects import projects_db

router = APIRouter()


# Track active terminal sessions
_terminal_sessions: dict[str, SSHConnection] = {}


@router.websocket("/ws")
async def terminal_websocket(
    websocket: WebSocket,
    projectId: Optional[str] = Query(None),
    serverId: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for interactive terminal

    Query params:
        - projectId: Project ID (will look up vps_server_id from project)
        - serverId: Direct server ID

    Client messages:
        {"type": "init", "cols": 80, "rows": 24}  # Required first message
        {"type": "input", "data": "ls -la\n"}
        {"type": "resize", "cols": 120, "rows": 40}

    Server messages:
        {"type": "connected", "server": "hostname"}
        {"type": "output", "data": "..."}
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
        if projectId in projects_db:
            project = projects_db[projectId]
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

    # Get server credentials
    if resolved_server_id not in servers_db:
        await websocket.send_json({
            "type": "error",
            "message": f"Server {resolved_server_id} not found"
        })
        await websocket.close(code=4004)
        return

    server = servers_db[resolved_server_id]
    server_name = server.name if hasattr(server, 'name') else server.get('name', server.host if hasattr(server, 'host') else 'Unknown')

    # Build credentials from server data
    if isinstance(server, ServerCredentials):
        credentials = SSHCredentials(
            host=server.host,
            port=server.port,
            username=server.username,
            password=server.password,
            private_key=server.private_key
        )
        server_host = server.host
    else:
        # Dict-style storage from ssh.py router
        credentials = SSHCredentials(
            host=server.get("host"),
            port=server.get("port", 22),
            username=server.get("username"),
            password=server.get("password"),
            private_key=server.get("private_key"),
            passphrase=server.get("passphrase")
        )
        server_host = server.get("host")

    # Create SSH connection
    conn = SSHConnection(credentials)
    session_id = f"{resolved_server_id}:{id(websocket)}"

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

        # Connect to SSH server
        try:
            await asyncio.wait_for(conn.connect(), timeout=15.0)
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

        # Start interactive shell
        await conn.create_terminal(cols, rows)
        _terminal_sessions[session_id] = conn

        # Notify client of successful connection
        await websocket.send_json({
            "type": "connected",
            "server": server_name,
            "host": server_host
        })

        # Handle bidirectional communication
        async def read_from_terminal():
            """Read SSH output and send to WebSocket"""
            try:
                async for data in conn.read_output():
                    if isinstance(data, bytes):
                        data = data.decode("utf-8", errors="replace")
                    await websocket.send_json({
                        "type": "output",
                        "data": data
                    })
            except Exception as e:
                # Connection closed or error
                pass

        async def write_to_terminal():
            """Read WebSocket messages and send to SSH"""
            try:
                while True:
                    msg = await websocket.receive_json()
                    msg_type = msg.get("type")

                    if msg_type == "input":
                        await conn.send_input(msg.get("data", ""))

                    elif msg_type == "resize":
                        await conn.resize_terminal(
                            msg.get("cols", 80),
                            msg.get("rows", 24)
                        )
            except WebSocketDisconnect:
                pass
            except Exception as e:
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
        # Cleanup
        if session_id in _terminal_sessions:
            del _terminal_sessions[session_id]
        try:
            await conn.disconnect()
        except:
            pass
        try:
            await websocket.send_json({"type": "disconnected"})
        except:
            pass


@router.get("/status")
async def terminal_status():
    """Get status of active terminal sessions"""
    return {
        "active_sessions": len(_terminal_sessions),
        "sessions": list(_terminal_sessions.keys())
    }
