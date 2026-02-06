"""
Claude Code SSH Service - Routes chat through Claude Code on VPS

Runs the `claude` CLI command on a connected VPS via SSH and streams
the response back. This allows using Claude Pro subscription instead
of OpenRouter API credits.
"""
import asyncio
import json
from typing import AsyncGenerator, Optional
from services.ssh import get_connection, servers_cache


class ClaudeCodeSSHService:
    """
    Service that runs Claude Code CLI on a VPS via SSH.

    Claude Code CLI supports:
    - `claude -p "prompt"` - Direct prompt mode (non-interactive)
    - `claude --output-format stream-json` - Stream JSON output for parsing
    - `claude --no-cwd` - Don't change to project directory
    """

    def __init__(self, server_id: str):
        self.server_id = server_id

    async def chat(
        self,
        messages: list[dict],
        model: str = "claude-sonnet-4",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        stream: bool = True
    ) -> AsyncGenerator[str, None]:
        """
        Send chat to Claude Code on VPS and stream response.

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model name (used for display, Claude Code uses its configured model)
            temperature: Temperature setting (Claude Code may ignore this)
            max_tokens: Max tokens (passed to Claude Code)
            stream: Whether to stream (always True for this service)

        Returns:
            AsyncGenerator yielding text chunks from Claude Code response
        """
        if self.server_id not in servers_cache:
            raise ValueError(f"Server {self.server_id} not found. Connect to VPS first.")

        # Get SSH connection
        conn = await get_connection(self.server_id)

        # Build the prompt from messages
        # Claude Code expects a single prompt, so we format the conversation
        prompt = self._format_messages(messages)

        # Escape the prompt for shell
        escaped_prompt = prompt.replace("'", "'\"'\"'")

        # Build claude command
        # Using -p for prompt mode, --output-format stream-json for streaming JSON
        # Fallback to plain text if stream-json not supported
        cmd = f"claude -p '{escaped_prompt}' --max-tokens {max_tokens}"

        # Return the streaming generator (matches OpenRouterService interface)
        return self._stream_chat(conn, cmd)

    async def _stream_chat(self, conn, cmd: str) -> AsyncGenerator[str, None]:
        """Internal async generator that streams output from Claude Code."""
        async for chunk in self._stream_command(conn, cmd):
            yield chunk

    def _format_messages(self, messages: list[dict]) -> str:
        """
        Format message history into a single prompt for Claude Code.

        For a simple approach, we just use the last user message.
        For multi-turn, we format as a conversation.
        """
        if not messages:
            return ""

        # If single message, just return its content
        if len(messages) == 1:
            return self._extract_content(messages[0])

        # For multi-turn, format as conversation
        # Claude Code maintains its own context, so we primarily send the last message
        # But include recent context for better responses
        formatted_parts = []

        # Include last few messages for context (Claude Code handles the rest)
        recent_messages = messages[-5:]  # Last 5 messages for context

        for msg in recent_messages[:-1]:  # All except last
            role = msg.get('role', 'user')
            content = self._extract_content(msg)
            if role == 'user':
                formatted_parts.append(f"User: {content}")
            elif role == 'assistant':
                formatted_parts.append(f"Assistant: {content}")
            elif role == 'system':
                formatted_parts.append(f"System: {content}")

        # Add the current message
        last_msg = recent_messages[-1]
        content = self._extract_content(last_msg)

        if formatted_parts:
            # Include context
            context = "\n\n".join(formatted_parts)
            return f"Previous conversation:\n{context}\n\nNow respond to: {content}"
        else:
            return content

    def _extract_content(self, message: dict) -> str:
        """Extract text content from a message (handles multimodal)."""
        content = message.get('content', '')

        if isinstance(content, str):
            return content

        # Handle multimodal content (array format)
        if isinstance(content, list):
            text_parts = []
            for part in content:
                if isinstance(part, dict) and part.get('type') == 'text':
                    text_parts.append(part.get('text', ''))
            return ' '.join(text_parts)

        return str(content)

    async def _stream_command(self, conn, cmd: str) -> AsyncGenerator[str, None]:
        """
        Run a command on the VPS and stream its stdout.

        Uses asyncssh to run the command and yield output as it arrives.
        """
        try:
            # Create a process for the command
            if not conn.conn:
                await conn.connect()

            # Run the command and stream output
            process = await conn.conn.create_process(cmd)

            # Read stdout in chunks and yield
            buffer = ""
            try:
                while True:
                    # Read a chunk (non-blocking with small timeout)
                    try:
                        chunk = await asyncio.wait_for(
                            process.stdout.read(1024),
                            timeout=60.0  # 60 second timeout per chunk
                        )
                    except asyncio.TimeoutError:
                        # If no output for 60 seconds, check if process is still running
                        if process.is_closing():
                            break
                        continue

                    if not chunk:
                        break

                    # Decode and yield the chunk
                    text = chunk if isinstance(chunk, str) else chunk.decode('utf-8', errors='replace')

                    # Try to parse as stream-json format
                    # Claude Code stream-json format: {"type": "content", "content": "text"}
                    buffer += text

                    # Try to extract complete JSON lines
                    while '\n' in buffer:
                        line, buffer = buffer.split('\n', 1)
                        line = line.strip()
                        if not line:
                            continue

                        # Try to parse as JSON
                        try:
                            data = json.loads(line)
                            if data.get('type') == 'content':
                                yield data.get('content', '')
                            elif data.get('type') == 'text':
                                yield data.get('text', '')
                            elif data.get('type') == 'result':
                                # Final result
                                yield data.get('result', '')
                            # Skip other message types (thinking, tool_use, etc.)
                        except json.JSONDecodeError:
                            # Not JSON, yield as plain text
                            yield line

            except Exception as e:
                # If streaming fails, try to get any remaining output
                remaining = buffer.strip()
                if remaining:
                    yield remaining

            finally:
                # Close the process
                try:
                    process.close()
                    await process.wait_closed()
                except Exception:
                    pass

        except Exception as e:
            raise RuntimeError(f"Failed to run Claude Code on VPS: {str(e)}")


async def check_claude_code_available(server_id: str) -> bool:
    """
    Quick check if Claude Code is available and authenticated on the server.
    Returns True if claude command exists and is authenticated.
    """
    try:
        conn = await get_connection(server_id)
        stdout, stderr, exit_code = await conn.run_command("which claude && claude --version")
        return exit_code == 0 and bool(stdout.strip())
    except Exception:
        return False
