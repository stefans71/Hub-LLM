import { useEffect, useRef, useState, useCallback } from 'react'
import { Plus, Mic, Send, Terminal as TerminalIcon, RefreshCw } from 'lucide-react'

/**
 * ClaudeCodeTerminalChat Component (CLAUDE-02-REWORK)
 *
 * Phase 1: Terminal-based chat for Claude Code on VPS.
 * Shows xterm.js in the chat area when Anthropic model + Claude Code authenticated.
 * Auto-runs `claude` command on connect, wires chat input to terminal stdin.
 *
 * Protocol:
 * 1. Connect to VPS via WebSocket terminal
 * 2. Auto-run `claude` to start interactive Claude Code session
 * 3. User types in chat input → sends to terminal stdin
 * 4. Terminal output displays in chat area
 */
export default function ClaudeCodeTerminalChat({ project, serverId, projectSlug }) {
  const terminalRef = useRef(null)
  const xtermRef = useRef(null)
  const wsRef = useRef(null)
  const fitAddonRef = useRef(null)
  const [status, setStatus] = useState('disconnected') // 'disconnected', 'connecting', 'connected', 'error', 'claude_starting', 'claude_ready'
  const [serverInfo, setServerInfo] = useState(null)
  const [error, setError] = useState(null)
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const inputRef = useRef(null)
  const claudeStartedRef = useRef(false)

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (!serverId) {
      setStatus('disconnected')
      setError('No VPS connected')
      return
    }

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setStatus('connecting')
    setError(null)
    claudeStartedRef.current = false

    // Build WebSocket URL - use serverId directly
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const params = new URLSearchParams()
    params.set('serverId', serverId)
    const wsUrl = `${protocol}//${window.location.host}/api/terminal/ws?${params.toString()}`

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      // Send init message with terminal size
      const cols = xtermRef.current?.cols || 80
      const rows = xtermRef.current?.rows || 24
      ws.send(JSON.stringify({ type: 'init', cols, rows }))
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)

        switch (message.type) {
          case 'connected':
            setStatus('connected')
            setServerInfo({ server: message.server, host: message.host })
            if (xtermRef.current) {
              xtermRef.current.writeln(`\x1b[32mConnected to ${message.server}\x1b[0m`)
              xtermRef.current.writeln('\x1b[90mStarting Claude Code session...\x1b[0m')
              xtermRef.current.writeln('')
              xtermRef.current.scrollToBottom()
            }
            // Auto-start Claude Code after connection
            startClaudeCode()
            break

          case 'output':
            if (xtermRef.current && message.data) {
              xtermRef.current.write(message.data)
              xtermRef.current.scrollToBottom()

              // Detect when Claude Code is ready (shows the > prompt)
              if (!claudeStartedRef.current && message.data.includes('>')) {
                claudeStartedRef.current = true
                setStatus('claude_ready')
              }
            }
            break

          case 'error':
            setStatus('error')
            setError(message.message)
            if (xtermRef.current) {
              xtermRef.current.writeln(`\x1b[31mError: ${message.message}\x1b[0m`)
            }
            break

          case 'disconnected':
            setStatus('disconnected')
            if (xtermRef.current) {
              xtermRef.current.writeln('')
              xtermRef.current.writeln('\x1b[33mConnection closed\x1b[0m')
            }
            break
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err)
      }
    }

    ws.onclose = () => {
      if (status === 'connecting' || status === 'connected' || status === 'claude_ready') {
        setStatus('disconnected')
      }
    }

    ws.onerror = () => {
      setStatus('error')
      setError('WebSocket connection failed')
    }
  }, [serverId, status])

  // Start Claude Code interactive session
  const startClaudeCode = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setStatus('claude_starting')

      // First cd to project directory if slug provided, then start claude
      let command = ''
      if (projectSlug) {
        command = `cd /root/llm-hub-projects/${projectSlug} && claude\n`
      } else {
        command = 'claude\n'
      }

      wsRef.current.send(JSON.stringify({ type: 'input', data: command }))
    }
  }, [projectSlug])

  // Send message to Claude Code via terminal
  const sendMessage = useCallback(() => {
    if (!input.trim() || status !== 'claude_ready') return

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Send the message followed by newline to Claude Code's stdin
      wsRef.current.send(JSON.stringify({ type: 'input', data: input + '\n' }))
      setInput('')
    }
  }, [input, status])

  // Initialize xterm.js
  useEffect(() => {
    let mounted = true

    const loadXterm = async () => {
      const { Terminal } = await import('@xterm/xterm')
      const { FitAddon } = await import('@xterm/addon-fit')
      await import('@xterm/xterm/css/xterm.css')

      if (!mounted || !terminalRef.current) return

      // Create terminal with chat-friendly theme
      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: "'Monaco', 'Consolas', 'Courier New', monospace",
        theme: {
          background: '#0a0a0f', // Match chat background
          foreground: '#e4e4e7',
          cursor: '#e4e4e7',
          selection: '#33467c',
          black: '#15161e',
          red: '#f7768e',
          green: '#9ece6a',
          yellow: '#e0af68',
          blue: '#7aa2f7',
          magenta: '#bb9af7',
          cyan: '#7dcfff',
          white: '#a9b1d6',
        },
        scrollback: 5000,
        convertEol: true,
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)

      xtermRef.current = term
      fitAddonRef.current = fitAddon

      // Mount terminal
      term.open(terminalRef.current)

      // Fit terminal to container
      requestAnimationFrame(() => {
        if (fitAddonRef.current && mounted) {
          fitAddonRef.current.fit()
        }
      })

      // BUG-18 FIX: Handle terminal keyboard input - send to WebSocket
      term.onData((data) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'input', data }))
        }
      })

      // Focus terminal for keyboard input
      term.focus()

      // Connect if we have serverId
      if (serverId) {
        connect()
      }
    }

    loadXterm()

    // Cleanup
    return () => {
      mounted = false
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      if (xtermRef.current) {
        xtermRef.current.dispose()
        xtermRef.current = null
      }
    }
  }, []) // Only run once on mount

  // Reconnect when serverId changes
  useEffect(() => {
    if (xtermRef.current && serverId) {
      xtermRef.current.clear()
      connect()
    }
  }, [serverId])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (fitAddonRef.current && xtermRef.current) {
        fitAddonRef.current.fit()

        // Send resize to server
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'resize',
            cols: xtermRef.current.cols,
            rows: xtermRef.current.rows
          }))
        }
      }
    }

    // Use ResizeObserver for more reliable resize detection
    const resizeObserver = new ResizeObserver(() => {
      handleResize()
    })

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const reconnect = () => {
    if (xtermRef.current) {
      xtermRef.current.clear()
      xtermRef.current.writeln('\x1b[33mReconnecting...\x1b[0m')
    }
    connect()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      sendMessage()
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const toggleMic = () => {
    setIsRecording(!isRecording)
    // Voice input placeholder
  }

  // Status indicator
  const getStatusInfo = () => {
    switch (status) {
      case 'claude_ready':
        return { color: '#9ece6a', text: 'Claude Code Ready' }
      case 'claude_starting':
        return { color: '#e0af68', text: 'Starting Claude Code...' }
      case 'connected':
        return { color: '#7aa2f7', text: 'Connected' }
      case 'connecting':
        return { color: '#e0af68', text: 'Connecting...' }
      case 'error':
        return { color: '#f7768e', text: error || 'Error' }
      default:
        return { color: '#6b7280', text: 'Disconnected' }
    }
  }

  const statusInfo = getStatusInfo()

  // BUG-18 FIX: Focus terminal when clicked
  const handleTerminalClick = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.focus()
    }
  }, [])

  return (
    <div className="chat-panel claude-code-terminal-chat">
      {/* Status Header */}
      <div className="claude-code-status-bar">
        <div className="claude-code-status-left">
          <TerminalIcon size={14} />
          <span
            className="claude-code-status-dot"
            style={{ backgroundColor: statusInfo.color }}
          />
          <span className="claude-code-status-text">{statusInfo.text}</span>
          {serverInfo && (
            <span className="claude-code-server-name">• {serverInfo.server}</span>
          )}
        </div>
        {(status === 'disconnected' || status === 'error') && serverId && (
          <button className="claude-code-reconnect-btn" onClick={reconnect}>
            <RefreshCw size={12} />
            Reconnect
          </button>
        )}
      </div>

      {/* Terminal Display Area (replaces chat-messages) */}
      {/* BUG-18 FIX: Click to focus terminal for keyboard input */}
      <div
        ref={terminalRef}
        className="claude-code-terminal-area"
        onClick={handleTerminalClick}
      />

      {/* Chat Input Area (same as regular Chat) */}
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          {/* Plus Button - disabled in terminal mode */}
          <button className="plus-btn" disabled title="Files not supported in terminal mode">
            <Plus size={18} />
          </button>

          {/* Chat Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={status === 'claude_ready' ? 'Ask Claude Code...' : 'Waiting for Claude Code...'}
            disabled={status !== 'claude_ready'}
          />

          {/* Mic Button */}
          <button
            className={`mic-btn ${isRecording ? 'recording' : ''}`}
            onClick={toggleMic}
            title="Voice input (Whisper)"
            disabled={status !== 'claude_ready'}
          >
            <Mic size={18} />
          </button>

          {/* Send Button */}
          <button
            className="send-btn"
            onClick={sendMessage}
            disabled={!input.trim() || status !== 'claude_ready'}
          >
            <Send size={18} />
          </button>
        </div>

        {/* Input Hint */}
        <div className="chat-input-hint">
          {status === 'claude_ready'
            ? 'Click terminal to type directly • Or use input box below'
            : 'Connecting to Claude Code on VPS...'}
        </div>
      </div>
    </div>
  )
}
