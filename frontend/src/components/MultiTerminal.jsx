import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, X, RefreshCw, Terminal } from 'lucide-react'

/**
 * FEAT-09: MultiTerminal Split Panes with Color Coding
 *
 * Multiple terminal panes visible simultaneously:
 * - Desktop: Side-by-side terminal panes with draggable dividers
 * - Mobile: Horizontal tabs (unchanged from FEAT-07)
 * - Each terminal has a color for visual identification
 * - Tab header shows all terminals with colored dots
 * - Right sidebar (narrow) for terminal list + new terminal button
 */

// Available terminal colors
const TERMINAL_COLORS = [
  { name: 'Jasmine', value: '#FFD078' },
  { name: 'Green', value: '#04E434' },
  { name: 'Mint', value: '#05F7CB' },
  { name: 'Purple', value: '#A313EB' },
  { name: 'Blue', value: '#2718FD' },
  { name: 'Red', value: '#F50A0A' },
  { name: 'Orange', value: '#FA8816' },
]

// Individual terminal instance component
function TerminalInstance({ id, projectId, serverId, isActive, isSplitPane, onStatusChange, onTerminalConnected }) {
  const terminalRef = useRef(null)
  const xtermRef = useRef(null)
  const wsRef = useRef(null)
  const fitAddonRef = useRef(null)
  const hasNotifiedConnected = useRef(false) // BUG-71: once-guard for onTerminalConnected
  const [status, setStatus] = useState('disconnected')
  const [serverInfo, setServerInfo] = useState(null)
  const [cwd, setCwd] = useState(null)
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
            if (message.cwd) setCwd(message.cwd)
            // BUG-71: Notify Workspace that terminal connected (once per instance)
            if (!hasNotifiedConnected.current) {
              hasNotifiedConnected.current = true
              onTerminalConnected?.()
            }
            if (xtermRef.current) {
              const channelInfo = message.channel_id ? ` [channel ${message.channel_id.slice(0,8)}]` : ''
              const connInfo = message.connection_channels ? ` (${message.connection_channels} active)` : ''
              xtermRef.current.writeln(`\x1b[32mConnected to ${message.server} (${message.host})${channelInfo}${connInfo}\x1b[0m`)
              xtermRef.current.writeln('')
              xtermRef.current.scrollToBottom()
            }
            break

          case 'output':
            if (xtermRef.current && message.data) {
              xtermRef.current.write(message.data)
              xtermRef.current.scrollToBottom()
            }
            break

          case 'connection_status':
            // INFRA-01: Handle shared connection status changes
            // When the VPS connection status changes, all terminals sharing it are notified
            if (message.status === 'disconnected' || message.status === 'error') {
              setStatus(message.status === 'error' ? 'error' : 'disconnected')
              if (message.message) {
                setError(message.message)
              }
              if (xtermRef.current) {
                const statusText = message.status === 'error'
                  ? `\x1b[31mVPS connection error: ${message.message || 'unknown'}\x1b[0m`
                  : '\x1b[33mVPS connection lost - all terminals affected\x1b[0m'
                xtermRef.current.writeln('')
                xtermRef.current.writeln(statusText)
              }
            } else if (message.status === 'connected') {
              setStatus('connected')
              setError(null)
            } else if (message.status === 'connecting') {
              setStatus('connecting')
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

  // BUG-73: Removed reconnect-on-prop-change effect.
  // Each terminal now owns its serverId/projectId, so props won't change
  // unless the component is freshly mounted (handled by the init effect above).

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

  // In split pane mode, all terminals are visible; in tabbed mode, only active is visible
  const isVisible = isSplitPane || isActive

  return (
    <div style={{
      display: isVisible ? 'flex' : 'none',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      minHeight: 0,
      minWidth: 0,
      position: isSplitPane ? 'relative' : 'absolute',
      inset: isSplitPane ? undefined : 0,
      background: 'var(--bg-primary)',
      overflow: 'hidden'
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: getStatusColor(),
            flexShrink: 0
          }} />
          <span
            title={serverInfo?.host || ''}
            style={{ color: 'var(--text-secondary)', cursor: serverInfo?.host ? 'help' : 'default' }}
          >{getStatusText()}</span>
          {cwd && (
            <span
              title={cwd}
              style={{
                color: 'var(--text-muted)',
                marginLeft: '8px',
                fontSize: '10px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '200px'
              }}
            >
              {cwd.replace('/root/llm-hub-projects/', '~/')}
            </span>
          )}
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
          padding: '8px 8px 8px 16px',
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
export default function MultiTerminal({ projectId, serverId, projectSlug, onTerminalConnected }) {
  // FEAT-09: Terminal state now includes color and width for split panes
  // BUG-73: Each terminal owns its serverId/projectId so project switches don't kill old sessions
  const [terminals, setTerminals] = useState([
    { id: 1, name: 'bash', status: 'disconnected', color: TERMINAL_COLORS[0].value, width: 300,
      serverId: null, projectId: null }
  ])
  const [activeTerminalId, setActiveTerminalId] = useState(1)
  const [nextId, setNextId] = useState(2)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  // FEAT-09: Color picker context menu state
  const [colorPickerTerminalId, setColorPickerTerminalId] = useState(null)
  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 })

  // BUG-73: Track previous serverId/projectId to detect project switches
  const prevServerIdRef = useRef(serverId)
  const prevProjectIdRef = useRef(projectId)

  // BUG-73: One-time initialization — stamp first terminal with initial project IDs
  useEffect(() => {
    if (serverId && terminals[0]?.serverId === null) {
      setTerminals(prev => prev.map((t, i) =>
        i === 0 ? { ...t, serverId, projectId, name: projectSlug || t.name } : t
      ))
    }
  }, [serverId, projectId, projectSlug])

  // BUG-73: On project switch, add a new tab instead of reconnecting all
  useEffect(() => {
    if (serverId && (serverId !== prevServerIdRef.current || projectId !== prevProjectIdRef.current)) {
      // Skip the very first render (handled by init effect above)
      if (prevServerIdRef.current === null && prevProjectIdRef.current === null) {
        prevServerIdRef.current = serverId
        prevProjectIdRef.current = projectId
        return
      }

      const existing = terminals.find(t => t.projectId === projectId && t.serverId === serverId)
      if (existing) {
        setActiveTerminalId(existing.id)
      } else {
        const newId = Math.max(...terminals.map(t => t.id), 0) + 1
        const colorIndex = terminals.length % TERMINAL_COLORS.length
        const newTerminal = {
          id: newId,
          name: projectSlug || `bash ${newId}`,
          status: 'disconnected',
          color: TERMINAL_COLORS[colorIndex].value,
          width: 300,
          serverId,
          projectId
        }
        setTerminals(prev => [...prev, newTerminal])
        setActiveTerminalId(newId)
        setNextId(prev => Math.max(prev, newId + 1))
      }

      prevServerIdRef.current = serverId
      prevProjectIdRef.current = projectId
    }
  }, [serverId, projectId, projectSlug, terminals])

  // FEAT-09: Divider drag state - track which divider is being dragged
  const [draggingDividerId, setDraggingDividerId] = useState(null)
  // BUG-16: Track drag start position and initial width for reliable resizing
  const [dragStartX, setDragStartX] = useState(null)
  const [dragStartWidth, setDragStartWidth] = useState(null)
  const containerRef = useRef(null)

  // Track window width for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // FEAT-09: Handle divider drag for resizing terminal panes
  // BUG-16: Record start position and width for delta-based resizing
  const handleDividerMouseDown = useCallback((terminalId, e) => {
    e.preventDefault()
    setDraggingDividerId(terminalId)
    setDragStartX(e.clientX)
    const terminal = terminals.find(t => t.id === terminalId)
    setDragStartWidth(terminal?.width || 300)
  }, [terminals])

  // BUG-16: Use delta-based calculation for reliable resizing in both directions
  const handleDividerMouseMove = useCallback((e) => {
    if (!draggingDividerId || dragStartX === null || dragStartWidth === null) return

    // Calculate how far the mouse moved from the start position
    const delta = e.clientX - dragStartX
    // Add delta to the starting width (drag right = larger, drag left = smaller)
    const newWidth = dragStartWidth + delta
    // Clamp between 150px and 600px
    const clampedWidth = Math.max(150, Math.min(600, newWidth))

    setTerminals(prev => prev.map(t =>
      t.id === draggingDividerId ? { ...t, width: clampedWidth } : t
    ))
  }, [draggingDividerId, dragStartX, dragStartWidth])

  // BUG-16: Reset all drag state on mouse up
  const handleDividerMouseUp = useCallback(() => {
    setDraggingDividerId(null)
    setDragStartX(null)
    setDragStartWidth(null)
  }, [])

  useEffect(() => {
    if (draggingDividerId) {
      document.addEventListener('mousemove', handleDividerMouseMove)
      document.addEventListener('mouseup', handleDividerMouseUp)
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleDividerMouseMove)
      document.removeEventListener('mouseup', handleDividerMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [draggingDividerId, handleDividerMouseMove, handleDividerMouseUp])

  // FEAT-09: Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (colorPickerTerminalId !== null) {
        setColorPickerTerminalId(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [colorPickerTerminalId])

  const createTerminal = () => {
    // FEAT-09: New terminals get default color (cycles through colors) and width
    // BUG-73: Stamp new terminal with current project's serverId/projectId
    const colorIndex = terminals.length % TERMINAL_COLORS.length
    const newTerminal = {
      id: nextId,
      name: `bash ${nextId}`,
      status: 'disconnected',
      color: TERMINAL_COLORS[colorIndex].value,
      width: 300,
      serverId: serverId || null,
      projectId: projectId || null
    }
    setTerminals([...terminals, newTerminal])
    setActiveTerminalId(nextId)
    setNextId(nextId + 1)
  }

  // FEAT-09: Set terminal color
  const setTerminalColor = (terminalId, color) => {
    setTerminals(prev => prev.map(t =>
      t.id === terminalId ? { ...t, color } : t
    ))
    setColorPickerTerminalId(null)
  }

  // FEAT-09: Right-click handler for color picker
  const handleTerminalContextMenu = (e, terminalId) => {
    e.preventDefault()
    setColorPickerPosition({ x: e.clientX, y: e.clientY })
    setColorPickerTerminalId(terminalId)
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
              projectId={terminal.projectId || projectId}
              serverId={terminal.serverId || serverId}
              isActive={terminal.id === activeTerminalId}
              onStatusChange={handleStatusChange}
              onTerminalConnected={onTerminalConnected}
            />
          ))}
        </div>
      </div>
    )
  }

  // FEAT-09: Desktop layout with split panes, tab header, and narrow sidebar
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      overflow: 'hidden'
    }}>
      {/* FEAT-09: Tab header showing all terminals with colored dots */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '0 8px',
        gap: '2px',
        flexShrink: 0,
        minHeight: '32px'
      }}>
        {terminals.map(terminal => (
          <div
            key={terminal.id}
            onClick={() => setActiveTerminalId(terminal.id)}
            onContextMenu={(e) => handleTerminalContextMenu(e, terminal.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: activeTerminalId === terminal.id ? 'var(--bg-primary)' : 'transparent',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontSize: '12px',
              color: activeTerminalId === terminal.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: activeTerminalId === terminal.id ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: '-1px'
            }}
            title="Right-click for color options"
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: terminal.color,
              flexShrink: 0,
              boxShadow: terminal.status === 'connected' ? `0 0 4px ${terminal.color}` : 'none'
            }} />
            <span>{terminal.name}</span>
          </div>
        ))}
        <button
          onClick={createTerminal}
          disabled={terminals.length >= 6}
          style={{
            background: 'none',
            border: 'none',
            color: terminals.length >= 6 ? 'var(--text-muted)' : 'var(--text-secondary)',
            cursor: terminals.length >= 6 ? 'not-allowed' : 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            marginLeft: '4px'
          }}
          title={terminals.length >= 6 ? 'Maximum 6 terminals' : 'New terminal'}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Main content: split panes + sidebar */}
      <div ref={containerRef} style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden'
      }}>
        {/* FEAT-09: Split terminal panes */}
        <div style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: 'hidden'
        }}>
          {terminals.map((terminal, index) => (
            <div key={terminal.id} style={{ display: 'flex', flexShrink: 0 }}>
              {/* Terminal pane */}
              <div style={{
                width: `${terminal.width}px`,
                minWidth: '150px',
                maxWidth: '600px',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid var(--border)',
                position: 'relative'
              }}>
                {/* Color indicator bar at top */}
                <div style={{
                  height: '3px',
                  background: terminal.color,
                  flexShrink: 0
                }} />
                <TerminalInstance
                  id={terminal.id}
                  projectId={terminal.projectId || projectId}
                  serverId={terminal.serverId || serverId}
                  isActive={terminal.id === activeTerminalId}
                  isSplitPane={true}
                  onStatusChange={handleStatusChange}
                  onTerminalConnected={onTerminalConnected}
                />
              </div>
              {/* Draggable divider between terminals */}
              <div
                onMouseDown={(e) => handleDividerMouseDown(terminal.id, e)}
                style={{
                  width: '4px',
                  background: draggingDividerId === terminal.id ? 'var(--primary)' : 'var(--border)',
                  cursor: 'ew-resize',
                  flexShrink: 0,
                  transition: draggingDividerId === terminal.id ? 'none' : 'background 0.15s ease'
                }}
                onMouseEnter={(e) => !draggingDividerId && (e.currentTarget.style.background = 'var(--primary)')}
                onMouseLeave={(e) => !draggingDividerId && (e.currentTarget.style.background = 'var(--border)')}
              />
            </div>
          ))}
          {/* Empty space to fill remaining width */}
          <div style={{ flex: 1, background: 'var(--bg-tertiary)', minWidth: '50px' }} />
        </div>

        {/* FEAT-09: Narrow right sidebar (~120px) */}
        <div style={{
          width: '120px',
          background: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderLeft: '1px solid var(--border)'
        }}>
          {/* Sidebar header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 8px',
            borderBottom: '1px solid var(--border)',
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase'
          }}>
            <span>Terms</span>
            <button
              onClick={createTerminal}
              disabled={terminals.length >= 6}
              style={{
                background: 'none',
                border: 'none',
                color: terminals.length >= 6 ? 'var(--text-muted)' : 'var(--text-secondary)',
                cursor: terminals.length >= 6 ? 'not-allowed' : 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              title={terminals.length >= 6 ? 'Maximum 6 terminals' : 'New terminal'}
            >
              <Plus size={12} />
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
                onContextMenu={(e) => handleTerminalContextMenu(e, terminal.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px',
                  background: activeTerminalId === terminal.id ? 'var(--bg-primary)' : 'transparent',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '2px',
                  fontSize: '11px',
                  color: activeTerminalId === terminal.id ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
                title="Right-click for color options"
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: terminal.color,
                  flexShrink: 0,
                  boxShadow: terminal.status === 'connected' ? `0 0 4px ${terminal.color}` : 'none'
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
                      fontSize: '10px',
                      padding: '2px 4px',
                      flex: 1,
                      minWidth: 0,
                      width: '50px'
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
                    <X size={10} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEAT-09: Color picker popup */}
      {colorPickerTerminalId !== null && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            left: colorPickerPosition.x,
            top: colorPickerPosition.y,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000
          }}
        >
          <div style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            marginBottom: '8px',
            fontWeight: 500
          }}>
            Terminal Color
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '4px'
          }}>
            {TERMINAL_COLORS.map(color => (
              <button
                key={color.name}
                onClick={() => setTerminalColor(colorPickerTerminalId, color.value)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: color.value,
                  border: terminals.find(t => t.id === colorPickerTerminalId)?.color === color.value
                    ? '2px solid white'
                    : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
