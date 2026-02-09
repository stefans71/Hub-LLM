import { useState, useEffect, useRef, useCallback } from 'react'
import MultiTerminal from './MultiTerminal'
import CodeEditor from './CodeEditor'

/**
 * LLM-Dev Bottom Panel (W-88 to W-124)
 *
 * A collapsible development panel that includes:
 * - W-88: Header with toggle, tabs, and status
 * - W-89-90: Panel toggle with arrow
 * - W-91-95: Tab buttons (Terminal, Docker, Logs, Project Context)
 * - W-96: Status bar (server, tokens, encoding)
 * - W-97: Content area (hidden when collapsed)
 * - W-98-100: File explorer with tree and open editors
 * - W-101-104: Editor area with tabs and code content
 * - W-105-108: Terminal area with tabs and output
 * - W-109: Docker tab content
 * - W-110: Logs tab content
 * - W-111: Project Context tab content
 */
export default function LLMDevPanel({ project, linkedServerId, onEditorReady, onTerminalConnected }) {
  // Use linkedServerId if provided (freshly linked), otherwise fall back to project's vps_server_id
  const serverId = linkedServerId || project?.vps_server_id
  const [isExpanded, setIsExpanded] = useState(false)
  const [panelHeight, setPanelHeight] = useState(350)
  const [isDragging, setIsDragging] = useState(false)
  const panelRef = useRef(null)
  const dragHandleRef = useRef(null)
  const [activeTab, setActiveTab] = useState('terminal')
  const [activeFile, setActiveFile] = useState(null)
  const [activeTerminalTab, setActiveTerminalTab] = useState('terminal')
  const [serverInfo, setServerInfo] = useState(null)
  // FEAT-03: Removed fileTree, currentPath, loading (were for Explorer)
  const [openEditors, setOpenEditors] = useState([])
  const [codeContent, setCodeContent] = useState('')

  // Fetch VPS server info when project changes
  useEffect(() => {
    if (serverId) {
      fetchServerInfo(serverId)
    } else {
      setServerInfo(null)
    }
  }, [serverId])

  const fetchServerInfo = async (serverId) => {
    try {
      // First check localStorage (primary source of truth for VPS servers)
      const savedServers = localStorage.getItem('vps_servers')
      if (savedServers) {
        const localServers = JSON.parse(savedServers)
        const localServer = localServers.find(s => s.id === serverId)
        if (localServer) {
          setServerInfo(localServer)

          // Sync to backend if not already there (needed for terminal WebSocket)
          try {
            const backendRes = await fetch('/api/ssh/servers')
            const backendServers = await backendRes.json()
            if (!backendServers.find(s => s.id === serverId)) {
              // Server not in backend, sync it with the SAME ID
              await fetch('/api/ssh/servers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: serverId, // Preserve the original ID!
                  name: localServer.name,
                  host: localServer.host,
                  port: parseInt(localServer.port) || 22,
                  username: localServer.username || 'root',
                  auth_type: localServer.privateKey ? 'key' : 'password',
                  private_key: localServer.privateKey || null
                })
              })
            }
          } catch (syncErr) {
            console.error('Failed to sync server to backend:', syncErr)
          }
          return
        }
      }

      // Fallback: try backend API
      const res = await fetch('/api/ssh/servers')
      const servers = await res.json()
      const server = servers.find(s => s.id === serverId)
      if (server) {
        setServerInfo(server)
      }
    } catch (err) {
      console.error('Failed to fetch server info:', err)
    }
  }

  // FEAT-03: Removed fetchFiles (was for Explorer)

  const openFile = async (filePath) => {
    if (!serverId) return
    try {
      const res = await fetch(`/api/files/content?serverId=${encodeURIComponent(serverId)}&path=${encodeURIComponent(filePath)}`)
      if (res.ok) {
        const data = await res.json()
        setCodeContent(data.content)
        const fileName = filePath.split('/').pop()
        setActiveFile(fileName)
        // BUG-52: Use functional update to avoid stale closure
        setOpenEditors(prev => {
          const exists = prev.find(e => e.path === filePath)
          if (!exists) {
            return [...prev, { name: fileName, path: filePath, active: true }].map(e => ({
              ...e,
              active: e.path === filePath
            }))
          }
          return prev.map(e => ({ ...e, active: e.path === filePath }))
        })
      }
    } catch (err) {
      console.error('Failed to open file:', err)
    }
  }

  // FEAT-03: Removed navigateToFolder (was for Explorer)

  // Coming Soon placeholder for unimplemented tabs
  const ComingSoonPlaceholder = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: '120px',
      color: 'var(--text-muted)',
      fontSize: '13px',
      gap: '8px'
    }}>
      <span style={{ fontSize: '24px', opacity: 0.4 }}>🚧</span>
      <span>Coming Soon</span>
    </div>
  )

  // Drag resize handlers - simplified since we have a dedicated drag handle

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return

    const windowHeight = window.innerHeight
    const newHeight = windowHeight - e.clientY

    // Clamp height between 100px and 80% of window
    const minHeight = 100
    const maxHeight = windowHeight * 0.8
    const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight))

    setPanelHeight(clampedHeight)
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)

    // Collapse if height is below threshold
    if (panelHeight < 80) {
      setIsExpanded(false)
      setPanelHeight(350)
    }
  }, [panelHeight])

  // Native mousedown listener on drag handle (more reliable than React synthetic events)
  useEffect(() => {
    const handle = dragHandleRef.current
    if (!handle) return

    const onMouseDown = (e) => {
      e.preventDefault()
      setIsDragging(true)
      setIsExpanded(true)
    }

    handle.addEventListener('mousedown', onMouseDown)
    return () => handle.removeEventListener('mousedown', onMouseDown)
  }, [])

  // Global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ns-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const togglePanel = () => {
    setIsExpanded(!isExpanded)
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
  }

  const getFileIcon = (filename, isFolder = false) => {
    if (isFolder) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#e8a838' }}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    }

    const ext = filename.split('.').pop()
    let color = '#9ca3af'
    if (['js', 'jsx'].includes(ext)) color = '#f7df1e'
    if (['ts', 'tsx'].includes(ext)) color = '#3178c6'
    if (['json'].includes(ext)) color = '#cb3837'
    if (['md'].includes(ext)) color = '#519aba'

    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
    )
  }

  // Terminal Tab Icon
  const TerminalIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
  )

  // Docker Tab Icon
  const DockerIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '4px', color: '#2496ed' }}>
      <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.186m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.185.185v1.888c0 .102.084.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288z"/>
    </svg>
  )

  // Logs Tab Icon
  const LogsIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  )

  // Project Context Tab Icon
  const ContextIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  )

  // FEAT-06: Editor Tab Icon
  const EditorIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  )

  // FEAT-06: Expose openFile function to parent for sidebar integration
  useEffect(() => {
    if (onEditorReady) {
      onEditorReady({
        openFile: (filePath, fileServerId) => {
          // Use provided serverId or fall back to panel's serverId
          const targetServerId = fileServerId || serverId
          if (!targetServerId) return

          // Switch to editor tab and open file
          setActiveTab('editor')
          setIsExpanded(true)

          // Fetch and display file
          fetch(`/api/files/content?serverId=${encodeURIComponent(targetServerId)}&path=${encodeURIComponent(filePath)}`)
            .then(res => res.ok ? res.json() : Promise.reject('Failed to load file'))
            .then(data => {
              setCodeContent(data.content)
              const fileName = filePath.split('/').pop()
              setActiveFile(fileName)
              // BUG-14: Use functional update to avoid stale closure for openEditors
              setOpenEditors(prev => {
                const exists = prev.find(e => e.path === filePath)
                if (!exists) {
                  return [...prev, { name: fileName, path: filePath, active: true }].map(e => ({
                    ...e,
                    active: e.path === filePath
                  }))
                } else {
                  return prev.map(e => ({ ...e, active: e.path === filePath }))
                }
              })
            })
            .catch(err => console.error('Failed to open file:', err))
        }
      })
    }
  }, [onEditorReady, serverId])

  return (
    <div
      ref={panelRef}
      className="llm-dev-panel"
      style={{
        height: isExpanded ? `${panelHeight}px` : '48px',
        minHeight: '48px',
        background: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,  // CRITICAL: Don't let flex parent crush this panel
        transition: isDragging ? 'none' : 'height 0.2s ease',
        position: 'relative'
      }}
    >
      {/* Drag Handle - Orange bar at top */}
      <div
        ref={dragHandleRef}
        className="llm-dev-drag-handle"
        style={{
          height: '8px',
          background: isDragging ? 'var(--primary)' : 'var(--accent)',
          cursor: 'ns-resize',
          flexShrink: 0,
          transition: 'background 0.15s ease',
          touchAction: 'none'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary)'}
        onMouseLeave={(e) => !isDragging && (e.currentTarget.style.background = 'var(--accent)')}
      />
      {/* W-88: LLM-Dev Header */}
      <div
        className="llm-dev-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          height: '40px',
          userSelect: 'none',
          flexShrink: 0
        }}
      >
        {/* W-89-90: Dev Panel Toggle */}
        <div
          className="llm-dev-toggle"
          onClick={togglePanel}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--accent)',
            cursor: 'pointer'
          }}
        >
          <span id="dev-panel-arrow" style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▲
          </span>
          LLM-Dev
        </div>

        {/* W-91: Dev Tabs */}
        <div
          className="llm-dev-tabs"
          style={{
            display: 'flex',
            gap: '2px',
            marginLeft: '24px'
          }}
        >
          {[
            { key: 'terminal', label: 'Terminal', Icon: TerminalIcon },
            { key: 'editor', label: 'Editor', Icon: EditorIcon },
            { key: 'docker', label: 'Docker', Icon: DockerIcon },
            { key: 'logs', label: 'Logs', Icon: LogsIcon },
            { key: 'prompt', label: 'Project Context', Icon: ContextIcon },
          ].map(({ key, label, Icon }) => {
            const isActive = activeTab === key
            return (
              <button
                key={key}
                className={isActive ? 'active' : ''}
                onClick={(e) => { e.stopPropagation(); handleTabClick(key); }}
                style={{
                  padding: '5px 14px',
                  background: isActive ? 'var(--bg-primary)' : 'transparent',
                  border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
                  borderBottom: isActive ? '1px solid var(--bg-primary)' : '1px solid transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  borderRadius: '6px 6px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transform: 'perspective(4px) rotateX(0.5deg)',
                  transformOrigin: 'bottom'
                }}
              >
                <Icon />
                {label}
              </button>
            )
          })}
        </div>

      </div>

      {/* W-97: Dev Panel Content */}
      {/* BUG-15: Always render content (keep terminals mounted), hide with CSS when collapsed */}
      <div
        className="llm-dev-content"
        style={{
          flex: 1,
          width: '100%',           // BUG-12: Explicit width constraint
          minWidth: 0,             // BUG-12: Allow shrinking in flex context
          display: isExpanded ? 'flex' : 'none',  // BUG-15: Hide instead of unmount
          background: 'var(--bg-primary)',
          overflow: 'hidden',
          minHeight: 0
        }}
      >
          {/* FEAT-07: Terminal Tab Content - Multiple Terminals */}
          {activeTab === 'terminal' && (
            <div
              style={{
                flex: 1,
                width: '100%',           // BUG-12: Explicit width for xterm fit calculation
                minWidth: 0,             // BUG-12: Allow flex shrink below content width
                minHeight: 0,            // BUG-10: Critical for flex height calculation
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* FEAT-07: Multiple Terminal Tabs */}
              <MultiTerminal
                projectId={project?.id}
                serverId={serverId}
                projectSlug={project?.slug}
                onTerminalConnected={onTerminalConnected}
              />
            </div>
          )}

          {/* FEAT-06: Editor Tab Content */}
          {activeTab === 'editor' && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* Editor Tabs Bar */}
              <div
                style={{
                  display: 'flex',
                  background: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border)',
                  minHeight: '36px'
                }}
              >
                {openEditors.length === 0 && (
                  <div style={{ padding: '8px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Click a file in the sidebar to open it here
                  </div>
                )}
                {openEditors.map((editor, index) => (
                  <div
                    key={index}
                    onClick={() => openFile(editor.path)}
                    style={{
                      padding: '8px 12px',
                      fontSize: '12px',
                      color: editor.active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      background: editor.active ? 'var(--bg-primary)' : 'transparent',
                      borderRight: '1px solid var(--border)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {getFileIcon(editor.name)}
                    <span>{editor.name}</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        const newEditors = openEditors.filter((_, i) => i !== index)
                        setOpenEditors(newEditors)
                        if (editor.active && newEditors.length > 0) {
                          setActiveFile(newEditors[0].name)
                          openFile(newEditors[0].path)
                        } else if (newEditors.length === 0) {
                          setActiveFile(null)
                          setCodeContent('')
                        }
                      }}
                      style={{
                        opacity: 0.5,
                        fontSize: '10px',
                        padding: '2px',
                        borderRadius: '3px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      ✕
                    </span>
                  </div>
                ))}
              </div>

              {/* BUG-52: Monaco CodeEditor replaces DIY regex highlighter */}
              <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                {codeContent ? (
                  <CodeEditor
                    path={openEditors.find(e => e.active)?.path || activeFile || 'file.txt'}
                    content={codeContent}
                    readOnly={true}
                  />
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'var(--text-muted)'
                  }}>
                    <EditorIcon />
                    <div style={{ marginTop: '12px' }}>Select a file from the sidebar to view</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* W-109: Docker Tab Content */}
          {activeTab === 'docker' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '120px',
              color: 'var(--text-muted)',
              fontSize: '13px',
              gap: '8px'
            }}>
              <span style={{
                fontSize: '32px',
                animation: 'docker-swim 3s ease-in-out infinite'
              }}>🐳</span>
              <span>Coming Soon</span>
            </div>
          )}

          {/* W-110: Logs Tab Content */}
          {activeTab === 'logs' && <ComingSoonPlaceholder />}

          {/* W-111: Project Context Tab Content */}
          {activeTab === 'prompt' && <ComingSoonPlaceholder />}
        </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes docker-swim {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(8px, -4px) rotate(2deg); }
          50% { transform: translate(0, -8px) rotate(0deg); }
          75% { transform: translate(-8px, -4px) rotate(-2deg); }
        }
      `}</style>
    </div>
  )
}
