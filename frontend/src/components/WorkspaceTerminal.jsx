import { useEffect, useRef, useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'

/**
 * WorkspaceTerminal Component (T-03)
 *
 * Connects xterm.js to the backend WebSocket terminal endpoint.
 * Used in LLMDevPanel's Terminal tab for real SSH terminal access.
 *
 * Protocol:
 * 1. Client sends: { type: 'init', cols, rows } on connect
 * 2. Client sends: { type: 'input', data } for keystrokes
 * 3. Client sends: { type: 'resize', cols, rows } on terminal resize
 * 4. Server sends: { type: 'connected', server, host }
 * 5. Server sends: { type: 'output', data }
 * 6. Server sends: { type: 'error', message }
 * 7. Server sends: { type: 'disconnected' }
 */
export default function WorkspaceTerminal({ projectId, serverId, projectSlug, className = '' }) {
  const terminalRef = useRef(null)
  const xtermRef = useRef(null)
  const wsRef = useRef(null)
  const fitAddonRef = useRef(null)
  const [status, setStatus] = useState('disconnected') // 'disconnected', 'connecting', 'connected', 'error'
  const [serverInfo, setServerInfo] = useState(null)
  const [error, setError] = useState(null)

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (!projectId && !serverId) {
      setStatus('disconnected')
      setError('No project or server ID provided')
      return
    }

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setStatus('connecting')
    setError(null)

    // Build WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const params = new URLSearchParams()
    if (projectId) params.set('projectId', projectId)
    if (serverId) params.set('serverId', serverId)
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
              xtermRef.current.writeln(`\x1b[32mConnected to ${message.server} (${message.host})\x1b[0m`)
              xtermRef.current.writeln('')
              // BUG-10: Auto-scroll to bottom
              xtermRef.current.scrollToBottom()
            }
            // FEAT-04: Auto-cd to project directory if slug provided
            if (projectSlug && ws.readyState === WebSocket.OPEN) {
              const cdCommand = `cd /root/llm-hub-projects/${projectSlug}\n`
              ws.send(JSON.stringify({ type: 'input', data: cdCommand }))
            }
            break

          case 'output':
            if (xtermRef.current && message.data) {
              xtermRef.current.write(message.data)
              // BUG-10: Auto-scroll to bottom on new output
              xtermRef.current.scrollToBottom()
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
      if (status === 'connecting' || status === 'connected') {
        setStatus('disconnected')
      }
    }

    ws.onerror = () => {
      setStatus('error')
      setError('WebSocket connection failed')
    }
  }, [projectId, serverId, status])

  // Initialize xterm.js
  useEffect(() => {
    let mounted = true

    const loadXterm = async () => {
      const { Terminal } = await import('@xterm/xterm')
      const { FitAddon } = await import('@xterm/addon-fit')
      await import('@xterm/xterm/css/xterm.css')

      if (!mounted || !terminalRef.current) return

      // Create terminal with theme matching the workspace
      const term = new Terminal({
        cursorBlink: true,
        fontSize: 13,
        fontFamily: "'Monaco', 'Consolas', 'Courier New', monospace",
        theme: {
          background: '#0f1419',
          foreground: '#c0caf5',
          cursor: '#c0caf5',
          selection: '#33467c',
          black: '#15161e',
          red: '#f7768e',
          green: '#9ece6a',
          yellow: '#e0af68',
          blue: '#7aa2f7',
          magenta: '#bb9af7',
          cyan: '#7dcfff',
          white: '#a9b1d6',
        }
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)

      xtermRef.current = term
      fitAddonRef.current = fitAddon

      // Mount terminal
      term.open(terminalRef.current)

      // Fit terminal to container
      setTimeout(() => {
        if (fitAddonRef.current && mounted) {
          fitAddonRef.current.fit()
        }
      }, 0)

      // Handle terminal input - send to WebSocket
      term.onData((data) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'input', data }))
        }
      })

      // Connect if we have an ID
      if (projectId || serverId) {
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

  // Reconnect when projectId/serverId changes
  useEffect(() => {
    if (xtermRef.current && (projectId || serverId)) {
      xtermRef.current.clear()
      connect()
    }
  }, [projectId, serverId])

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

  // Status indicator color
  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'var(--success)'
      case 'connecting': return 'var(--warning, #f59e0b)'
      case 'error': return 'var(--error)'
      default: return 'var(--text-muted)'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected': return serverInfo ? `${serverInfo.server}` : 'Connected'
      case 'connecting': return 'Connecting...'
      case 'error': return error || 'Error'
      default: return 'Disconnected'
    }
  }

  return (
    <div className={`workspace-terminal ${className}`} style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,  // BUG-10: Critical for flex height calculation
      background: 'var(--bg-primary)'
    }}>
      {/* Terminal Status Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 8px',
        background: 'var(--bg-tertiary)',
        borderBottom: '1px solid var(--border)',
        fontSize: '11px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: getStatusColor()
          }} />
          <span style={{ color: 'var(--text-secondary)' }}>{getStatusText()}</span>
        </div>

        {(status === 'disconnected' || status === 'error') && (projectId || serverId) && (
          <button
            onClick={reconnect}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              background: 'var(--primary)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '10px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={10} />
            Reconnect
          </button>
        )}
      </div>

      {/* Terminal Container */}
      <div
        ref={terminalRef}
        style={{
          flex: 1,
          minHeight: 0,  // BUG-10: Critical for flex height calculation
          padding: '8px',
          overflow: 'hidden'  // xterm handles its own scrolling
        }}
      />

      {/* Show message if no project/server */}
      {!projectId && !serverId && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-muted)',
          fontSize: '13px'
        }}>
          Select a project with a VPS connection to use the terminal
        </div>
      )}
    </div>
  )
}
