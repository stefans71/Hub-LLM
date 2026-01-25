import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, X, RefreshCw, Terminal } from 'lucide-react'

/**
 * FEAT-07: MultiTerminal Component
 *
 * Manages multiple terminal instances within the Terminal tab.
 * - Desktop (>768px): Right sidebar showing terminal list with + button
 * - Mobile (<768px): Horizontal sub-tabs below main LLM-Dev tabs
 * - Each terminal maintains its own SSH session to VPS
 */

// Individual terminal instance component
function TerminalInstance({ id, projectId, serverId, projectSlug, isActive, onStatusChange }) {
  const terminalRef = useRef(null)
  const xtermRef = useRef(null)
  const wsRef = useRef(null)
  const fitAddonRef = useRef(null)
  const [status, setStatus] = useState('disconnected')
  const [serverInfo, setServerInfo] = useState(null)
  const [error, setError] = useState(null)

  // Notify parent of status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(id, status)
    }
  }, [id, status, onStatusChange])

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

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const params = new URLSearchParams()
    if (projectId) params.set('projectId', projectId)
    if (serverId) params.set('serverId', serverId)
    const wsUrl = `${protocol}//${window.location.host}/api/terminal/ws?${params.toString()}`

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
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
              xtermRef.current.scrollToBottom()
            }
            // Auto-cd to project directory
            if (projectSlug && ws.readyState === WebSocket.OPEN) {
              const cdCommand = `cd /root/llm-hub-projects/${projectSlug}\n`
              ws.send(JSON.stringify({ type: 'input', data: cdCommand }))
            }
            break

          case 'output':
            if (xtermRef.current && message.data) {
              xtermRef.current.write(message.data)
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
  }, [projectId, serverId, projectSlug, status])

  // Initialize xterm.js
  useEffect(() => {
    let mounted = true

    const loadXterm = async () => {
      const { Terminal } = await import('@xterm/xterm')
      const { FitAddon } = await import('@xterm/addon-fit')
      await import('@xterm/xterm/css/xterm.css')

      if (!mounted || !terminalRef.current) return

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 13,
        fontFamily: "'Monaco', 'Consolas', 'Courier New', monospace",
        scrollback: 5000,
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

      term.open(terminalRef.current)

      // BUG-12 FIX: Use requestAnimationFrame to ensure container is fully rendered,
      // then fit with a secondary delayed fit as fallback
      const doFit = () => {
        if (fitAddonRef.current && mounted && terminalRef.current) {
          // Only fit if container has valid dimensions
          const rect = terminalRef.current.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0) {
            fitAddonRef.current.fit()
          }
        }
      }

      requestAnimationFrame(() => {
        doFit()
        // Secondary fit after layout settles
        setTimeout(doFit, 100)
      })

      term.onData((data) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'input', data }))
        }
      })

      if (projectId || serverId) {
        connect()
      }
    }

    loadXterm()

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
  }, [])

  // Reconnect when IDs change
  useEffect(() => {
    if (xtermRef.current && (projectId || serverId)) {
      xtermRef.current.clear()
      connect()
    }
  }, [projectId, serverId])

  // Handle resize - refit when becoming active or container resizes
  useEffect(() => {
    const handleResize = () => {
      if (fitAddonRef.current && xtermRef.current && isActive && terminalRef.current) {
        // BUG-12: Only fit if container has valid dimensions
        const rect = terminalRef.current.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          fitAddonRef.current.fit()

          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'resize',
              cols: xtermRef.current.cols,
              rows: xtermRef.current.rows
            }))
          }
        }
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      // Debounce resize events with requestAnimationFrame
      requestAnimationFrame(handleResize)
    })

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current)
    }

    window.addEventListener('resize', handleResize)

    // Refit when becoming active
    if (isActive) {
      setTimeout(handleResize, 50)
    }

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [isActive])

  const reconnect = () => {
    if (xtermRef.current) {
      xtermRef.current.clear()
      xtermRef.current.writeln('\x1b[33mReconnecting...\x1b[0m')
    }
    connect()
  }

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
    <div style={{
      display: isActive ? 'flex' : 'none',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      minHeight: 0,
      minWidth: 0,
      position: 'absolute',
      inset: 0,
      background: 'var(--bg-primary)'
      // Note: removed overflow:hidden to allow xterm scrollbar interaction
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

      {/* Terminal Container - fills available space, xterm handles scrollbar */}
      <div
        ref={terminalRef}
        className="xterm-container"
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          padding: '8px',
          boxSizing: 'border-box'
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

// Main MultiTerminal component
export default function MultiTerminal({ projectId, serverId, projectSlug }) {
  const [terminals, setTerminals] = useState([
    { id: 1, name: 'bash', status: 'disconnected' }
  ])
  const [activeTerminalId, setActiveTerminalId] = useState(1)
  const [nextId, setNextId] = useState(2)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  // Draggable sidebar state - default 200px, range 140-400px
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false)
  const dividerRef = useRef(null)

  // Track window width for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Native mousedown on divider (more reliable than React synthetic events)
  useEffect(() => {
    const divider = dividerRef.current
    if (!divider) return

    const onMouseDown = (e) => {
      e.preventDefault()
      setIsDraggingSidebar(true)
    }

    divider.addEventListener('mousedown', onMouseDown)
    return () => divider.removeEventListener('mousedown', onMouseDown)
  }, [])

  // Global mouse events for sidebar dragging
  const handleSidebarMouseMove = useCallback((e) => {
    if (!isDraggingSidebar) return

    // Calculate new width based on mouse position from right edge
    const containerRect = dividerRef.current?.parentElement?.getBoundingClientRect()
    if (!containerRect) return

    const newWidth = containerRect.right - e.clientX
    // Clamp between 140px and 400px
    setSidebarWidth(Math.max(140, Math.min(400, newWidth)))
  }, [isDraggingSidebar])

  const handleSidebarMouseUp = useCallback(() => {
    setIsDraggingSidebar(false)
  }, [])

  useEffect(() => {
    if (isDraggingSidebar) {
      document.addEventListener('mousemove', handleSidebarMouseMove)
      document.addEventListener('mouseup', handleSidebarMouseUp)
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleSidebarMouseMove)
      document.removeEventListener('mouseup', handleSidebarMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDraggingSidebar, handleSidebarMouseMove, handleSidebarMouseUp])

  const createTerminal = () => {
    const newTerminal = {
      id: nextId,
      name: 'bash',
      status: 'disconnected'
    }
    setTerminals([...terminals, newTerminal])
    setActiveTerminalId(nextId)
    setNextId(nextId + 1)
  }

  const closeTerminal = (id) => {
    if (terminals.length === 1) return // Keep at least one terminal

    const newTerminals = terminals.filter(t => t.id !== id)
    setTerminals(newTerminals)

    // Switch to another terminal if closing the active one
    if (activeTerminalId === id) {
      setActiveTerminalId(newTerminals[newTerminals.length - 1].id)
    }
  }

  const handleStatusChange = useCallback((id, status) => {
    setTerminals(prev => prev.map(t =>
      t.id === id ? { ...t, status } : t
    ))
  }, [])

  const startRename = (id, currentName) => {
    setEditingId(id)
    setEditName(currentName)
  }

  const finishRename = () => {
    if (editingId && editName.trim()) {
      setTerminals(prev => prev.map(t =>
        t.id === editingId ? { ...t, name: editName.trim() } : t
      ))
    }
    setEditingId(null)
    setEditName('')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'var(--success)'
      case 'connecting': return 'var(--warning, #f59e0b)'
      case 'error': return 'var(--error)'
      default: return 'var(--text-muted)'
    }
  }

  // Mobile layout: horizontal tabs at top
  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0
      }}>
        {/* Horizontal terminal tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          padding: '4px 8px',
          gap: '4px',
          flexShrink: 0,
          overflowX: 'auto'
        }}>
          {terminals.map(terminal => (
            <div
              key={terminal.id}
              onClick={() => setActiveTerminalId(terminal.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                background: activeTerminalId === terminal.id ? 'var(--bg-primary)' : 'transparent',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                color: activeTerminalId === terminal.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: getStatusColor(terminal.status),
                flexShrink: 0
              }} />
              {editingId === terminal.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={finishRename}
                  onKeyDown={(e) => e.key === 'Enter' && finishRename()}
                  autoFocus
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--primary)',
                    borderRadius: '3px',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                    padding: '2px 4px',
                    width: '60px'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span onDoubleClick={() => startRename(terminal.id, terminal.name)}>
                  {terminal.name}
                </span>
              )}
              {terminals.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); closeTerminal(terminal.id); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '10px'
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={createTerminal}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="New terminal"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Terminal instances - position:relative needed for absolute children */}
        <div style={{ flex: 1, minHeight: 0, minWidth: 0, width: '100%', position: 'relative' }}>
          {terminals.map(terminal => (
            <TerminalInstance
              key={terminal.id}
              id={terminal.id}
              projectId={projectId}
              serverId={serverId}
              projectSlug={projectSlug}
              isActive={terminal.id === activeTerminalId}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      </div>
    )
  }

  // Desktop layout: right sidebar with draggable divider
  return (
    <div style={{
      display: 'flex',
      height: '100%',
      minHeight: 0,
      overflow: 'hidden'
    }}>
      {/* Terminal instances - position:relative needed for absolute children */}
      <div style={{ flex: 1, minHeight: 0, minWidth: 0, position: 'relative' }}>
        {terminals.map(terminal => (
          <TerminalInstance
            key={terminal.id}
            id={terminal.id}
            projectId={projectId}
            serverId={serverId}
            projectSlug={projectSlug}
            isActive={terminal.id === activeTerminalId}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {/* Draggable divider */}
      <div
        ref={dividerRef}
        style={{
          width: '4px',
          background: isDraggingSidebar ? 'var(--primary)' : 'var(--border)',
          cursor: 'ew-resize',
          flexShrink: 0,
          transition: isDraggingSidebar ? 'none' : 'background 0.15s ease'
        }}
        onMouseEnter={(e) => !isDraggingSidebar && (e.currentTarget.style.background = 'var(--primary)')}
        onMouseLeave={(e) => !isDraggingSidebar && (e.currentTarget.style.background = 'var(--border)')}
      />

      {/* Right sidebar - terminal list */}
      <div style={{
        width: `${sidebarWidth}px`,
        background: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: isDraggingSidebar ? 'none' : 'width 0.1s ease'
      }}>
        {/* Sidebar header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderBottom: '1px solid var(--border)',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase'
        }}>
          <span>Terminals</span>
          <button
            onClick={createTerminal}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="New terminal"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Terminal list */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '4px'
        }}>
          {terminals.map(terminal => (
            <div
              key={terminal.id}
              onClick={() => setActiveTerminalId(terminal.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px',
                background: activeTerminalId === terminal.id ? 'var(--bg-primary)' : 'transparent',
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '2px',
                fontSize: '12px',
                color: activeTerminalId === terminal.id ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: getStatusColor(terminal.status),
                flexShrink: 0
              }} />
              <Terminal size={12} style={{ flexShrink: 0, opacity: 0.7 }} />
              {editingId === terminal.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={finishRename}
                  onKeyDown={(e) => e.key === 'Enter' && finishRename()}
                  autoFocus
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--primary)',
                    borderRadius: '3px',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                    padding: '2px 4px',
                    flex: 1,
                    minWidth: 0
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  onDoubleClick={() => startRename(terminal.id, terminal.name)}
                  title={terminal.name}
                >
                  {terminal.name}
                </span>
              )}
              {terminals.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); closeTerminal(terminal.id); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: 0.5
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                  title="Close terminal"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
