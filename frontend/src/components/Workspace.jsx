import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Chat from './Chat'
import Terminal from './Terminal'
import FileBrowser from './FileBrowser'
import CodeEditor from './CodeEditor'
import PreviewPanel from './PreviewPanel'
import WorkspaceTopBar from './WorkspaceTopBar'
import WorkspaceIconSidebar from './WorkspaceIconSidebar'
import WorkspaceFileExplorer from './WorkspaceFileExplorer'
import LLMDevPanel from './LLMDevPanel'
import ExportModal from './ExportModal'
import {
  Terminal as TerminalIcon,
  FolderOpen,
  PanelLeftClose,
  PanelLeft,
  Code
} from 'lucide-react'

/**
 * Workspace Component
 *
 * UI-02: Simplified - Servers and Codespaces tabs removed
 * - Server config now in Settings page
 * - Codespaces config now in Settings page
 *
 * Main workspace that integrates:
 * - Workspace Top Bar (W-03): Project info, model selector
 * - AI Chat (main area)
 * - LLM-Dev Panel (Terminal, Editor, Docker, Logs)
 * - File Explorer (left sidebar)
 */
export default function Workspace({ project, model, apiKeys, onProjectChange, enhanceWithAI }) {
  const navigate = useNavigate()
  const [activeServer, setActiveServer] = useState(null)
  const [terminals, setTerminals] = useState([]) // Multiple terminals
  const [showRightPanel, setShowRightPanel] = useState(false)
  const [rightPanelContent, setRightPanelContent] = useState(null) // 'files', 'terminal', 'editor'
  const [editingFile, setEditingFile] = useState(null) // { path, content }
  // FEAT-37: Auto-load welcome page on first project open
  // BUG-55: Flag set when user navigates away, not on mount
  const isFirstVisit = project?.id && !localStorage.getItem(`welcomed_${project.id}`)
  const getPreviewUrl = () => {
    if (project?.id) return `/api/projects/${project.id}/getting-started`
    return '/docs/welcome.html'
  }
  const [welcomeUrl] = useState(getPreviewUrl)
  const [previewCollapsed, setPreviewCollapsed] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const welcomeUrlRef = useRef(welcomeUrl)
  const handlePreviewUrlChange = useCallback((newUrl) => {
    // Set welcomed flag when user navigates away from the welcome page
    if (welcomeUrlRef.current && project?.id && newUrl !== welcomeUrlRef.current) {
      localStorage.setItem(`welcomed_${project.id}`, '1')
    }
  }, [project?.id])
  // FEAT-38: Preview panel drag resize
  const [previewWidth, setPreviewWidth] = useState(400)
  const [previewDragging, setPreviewDragging] = useState(false)
  const previewDragStartX = useRef(null)
  const previewDragStartWidth = useRef(null)
  const chatPreviewContainerRef = useRef(null)

  // W-31: Icon Sidebar state
  const [activeSidebarPanel, setActiveSidebarPanel] = useState('workspaces')
  // W-38: File Explorer state
  const [fileExplorerOpen, setFileExplorerOpen] = useState(true)

  // W-03: Workspace Top Bar state - SSH connection status
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  // CLAUDE-02: Track Claude Code status for chat routing
  const [claudeCodeStatus, setClaudeCodeStatus] = useState({ installed: false, authenticated: false })
  // BUG-63: Manual retry trigger for Claude Code detection
  const [retryTrigger, setRetryTrigger] = useState(0)
  // MODEL-01: Initialize from project's saved model, fallback to prop, then default
  const [selectedModel, setSelectedModel] = useState(() => {
    if (project?.selected_model) return project.selected_model
    if (model) return model
    // Check for last used model in localStorage
    const lastModel = localStorage.getItem('last_used_model')
    if (lastModel) {
      try { return JSON.parse(lastModel) } catch {}
    }
    return { name: 'Claude Opus 4.5', color: '#ef4444', id: 'claude-opus-4.5', provider: 'anthropic' }
  })
  // Track the currently linked server ID (may differ from project.vps_server_id if just linked)
  const [linkedServerId, setLinkedServerId] = useState(project?.vps_server_id || null)

  // FEAT-10: Track Claude processing state for project dot pulse animation
  const [isClaudeProcessing, setIsClaudeProcessing] = useState(false)

  // FEAT-06: Reference to LLMDevPanel editor API
  const editorApiRef = useRef(null)

  // FEAT-06: Handler for when editor is ready (memoized to prevent unnecessary useEffect re-runs)
  const handleEditorReady = useCallback((api) => {
    editorApiRef.current = api
  }, [])

  // BUG-68: Memoized SSH reconnect callback (setState functions are stable)
  const handleSshReconnected = useCallback(() => {
    setIsConnected(true)
    setRetryTrigger(prev => prev + 1)
  }, [])

  // BUG-71: Terminal connected → notify Workspace so chat area unblocks
  const handleTerminalConnected = useCallback(() => {
    setIsConnected(true)
  }, [])

  // FEAT-06: Handler for when a file is selected in the sidebar
  const handleFileSelect = (file, serverId) => {
    if (editorApiRef.current?.openFile) {
      editorApiRef.current.openFile(file.path || file.relativePath, serverId)
    }
  }

  // MODEL-01: Load model when project changes
  useEffect(() => {
    if (project?.selected_model) {
      setSelectedModel(project.selected_model)
    }
  }, [project?.id, project?.selected_model])

  // BUG-21: Update linkedServerId when project changes (critical for page refresh)
  useEffect(() => {
    if (project?.vps_server_id) {
      setLinkedServerId(project.vps_server_id)
    } else {
      setLinkedServerId(null)
    }
  }, [project?.id, project?.vps_server_id])

  // Check initial connection status when project changes - auto-connect if VPS was verified
  useEffect(() => {
    if (project?.vps_server_id) {
      checkAndAutoConnect()
    } else {
      setIsConnected(false)
    }
  }, [project?.vps_server_id])

  const checkAndAutoConnect = async () => {
    if (!project?.vps_server_id) return

    const serverId = project.vps_server_id

    try {
      // Check if already connected in backend
      const res = await fetch('/api/ssh/servers')
      const backendServers = await res.json()
      const backendServer = backendServers.find(s => s.id === serverId)

      if (backendServer?.connected) {
        setIsConnected(true)
        return
      }

      // Not connected - check localStorage for server details
      const savedServers = localStorage.getItem('vps_servers')
      const localServers = savedServers ? JSON.parse(savedServers) : []
      const localServer = localServers.find(s => s.id === serverId)

      if (!localServer) {
        // Server not found in localStorage, can't auto-connect
        setIsConnected(false)
        return
      }

      // Server was verified during project creation (lastTestSuccess flag)
      // Auto-connect to provide seamless experience
      if (localServer.lastTestSuccess) {
        setIsConnecting(true)

        try {
          // Sync to backend if needed
          if (!backendServer) {
            await fetch('/api/ssh/servers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: serverId,
                name: localServer.name,
                host: localServer.host,
                port: parseInt(localServer.port) || 22,
                username: localServer.username || 'root',
                auth_type: localServer.privateKey ? 'key' : 'password',
                private_key: localServer.privateKey || null
              })
            })
          }

          // Auto-connect with timeout
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 15000)

          const connectRes = await fetch(`/api/ssh/servers/${serverId}/connect`, {
            method: 'POST',
            signal: controller.signal
          })
          clearTimeout(timeoutId)

          if (connectRes.ok) {
            setIsConnected(true)
          } else {
            setIsConnected(false)
          }
        } catch (err) {
          console.error('Auto-connect failed:', err)
          setIsConnected(false)
        } finally {
          setIsConnecting(false)
        }
      } else {
        setIsConnected(false)
      }
    } catch (err) {
      console.error('Failed to check connection status:', err)
      setIsConnected(false)
    }
  }

  const handleConnectionToggle = async () => {
    if (!project?.vps_server_id) return

    setIsConnecting(true)
    try {
      // Get server from localStorage (same source as Settings)
      const savedServers = localStorage.getItem('vps_servers')
      const servers = savedServers ? JSON.parse(savedServers) : []
      const localServer = servers.find(s => s.id === project.vps_server_id)

      if (!localServer) {
        console.error('Server not found in localStorage')
        return
      }

      // Ensure server is synced to backend
      const backendRes = await fetch('/api/ssh/servers')
      const backendServers = await backendRes.json()
      const serverId = project.vps_server_id

      if (!backendServers.find(s => s.id === serverId)) {
        // Sync to backend with the SAME ID
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

      if (isConnected) {
        // Disconnect
        await fetch(`/api/ssh/servers/${serverId}/disconnect`, { method: 'POST' })
        setIsConnected(false)
      } else {
        // Connect with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)

        const res = await fetch(`/api/ssh/servers/${serverId}/connect`, {
          method: 'POST',
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        if (res.ok) {
          setIsConnected(true)
        } else {
          const data = await res.json()
          throw new Error(data.detail || 'Connection failed')
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        alert('Connection timed out. Check if the server is reachable.')
      } else {
        alert(err.message || 'Connection failed')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  // MODEL-01: Save model to project and localStorage
  const handleModelChange = async (newModel) => {
    setSelectedModel(newModel)

    // Save to localStorage as last used model (for new projects)
    localStorage.setItem('last_used_model', JSON.stringify(newModel))

    // Save to project if we have a project
    if (project?.id) {
      try {
        const res = await fetch(`/api/projects/${project.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selected_model: newModel })
        })
        if (!res.ok) {
          console.error('Failed to save model to project')
        }
      } catch (err) {
        console.error('Failed to save model to project:', err)
      }
    }
  }

  const handleExport = () => {
    setShowExportModal(true)
  }

  // W-31: Icon Sidebar handlers
  const handleSidebarPanelChange = (panel) => {
    if (panel === 'workspaces') {
      // Toggle file explorer when clicking workspaces icon
      setFileExplorerOpen(!fileExplorerOpen)
      setActiveSidebarPanel(fileExplorerOpen ? null : 'workspaces')
    } else {
      setActiveSidebarPanel(activeSidebarPanel === panel ? null : panel)
    }
  }

  const handleSidebarNavigate = (view) => {
    if (view === 'create-project') {
      navigate('/create-project')
    } else if (view === 'settings') {
      navigate('/settings')
    }
  }

  // W-38: File Explorer handlers
  const handleFileExplorerToggle = () => {
    setFileExplorerOpen(!fileExplorerOpen)
    if (fileExplorerOpen) {
      setActiveSidebarPanel(null)
    } else {
      setActiveSidebarPanel('workspaces')
    }
  }

  // FEAT-38: Preview panel drag resize handlers
  const handlePreviewDragStart = useCallback((e) => {
    e.preventDefault()
    previewDragStartX.current = e.clientX
    previewDragStartWidth.current = previewWidth
    setPreviewDragging(true)
  }, [previewWidth])

  const handlePreviewDragMove = useCallback((e) => {
    if (!previewDragging || previewDragStartX.current === null) return
    const containerWidth = chatPreviewContainerRef.current?.offsetWidth || 1200
    const minChatWidth = 300
    const maxWidth = Math.min(containerWidth * 0.8, containerWidth - minChatWidth)
    // Dragging left = preview grows (negative clientX delta = larger width)
    const delta = previewDragStartX.current - e.clientX
    const newWidth = Math.max(200, Math.min(maxWidth, previewDragStartWidth.current + delta))
    setPreviewWidth(newWidth)
  }, [previewDragging])

  const handlePreviewDragEnd = useCallback(() => {
    setPreviewDragging(false)
    previewDragStartX.current = null
    previewDragStartWidth.current = null
  }, [])

  useEffect(() => {
    if (previewDragging) {
      document.addEventListener('mousemove', handlePreviewDragMove)
      document.addEventListener('mouseup', handlePreviewDragEnd)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }
    return () => {
      document.removeEventListener('mousemove', handlePreviewDragMove)
      document.removeEventListener('mouseup', handlePreviewDragEnd)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [previewDragging, handlePreviewDragMove, handlePreviewDragEnd])

  const handlePreviewDividerDoubleClick = useCallback(() => {
    setPreviewCollapsed(prev => !prev)
  }, [])

  // BUG-25: Handle project selection from file explorer
  const handleSelectProject = (selectedProject) => {
    if (onProjectChange && selectedProject.id !== project?.id) {
      onProjectChange(selectedProject)
    }
  }

  const closeTerminal = (serverId) => {
    setTerminals(terminals.filter(t => t.id !== serverId))
    if (activeServer?.id === serverId) {
      setActiveServer(terminals[0] || null)
    }
    if (terminals.length <= 1) {
      setShowRightPanel(false)
    }
  }

  const openEditor = async (server, filePath) => {
    // Fetch file content via F-03 API
    try {
      const res = await fetch(
        `/api/files/content?serverId=${encodeURIComponent(server.id)}&path=${encodeURIComponent(filePath)}`
      )
      if (res.ok) {
        const data = await res.json()
        setEditingFile({ path: filePath, content: data.content, serverId: server.id })
        setRightPanelContent('editor')
        setShowRightPanel(true)
      } else {
        const error = await res.json()
        console.error('Failed to open file:', error.detail)
      }
    } catch (err) {
      console.error('Failed to open file:', err)
    }
  }

  const saveFile = async (path, content) => {
    if (!editingFile) return

    const res = await fetch(
      `/api/files/content?serverId=${encodeURIComponent(editingFile.serverId)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, content })
      }
    )

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || 'Failed to save')
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full" style={{ background: 'var(--bg-primary)' }}>
      {/* W-03: Workspace Top Bar (UI-01: Simplified - VPS badge & connection status removed) */}
      <WorkspaceTopBar
        project={project}
        model={selectedModel}
        onModelChange={handleModelChange}
        onExport={handleExport}
        linkedServerId={linkedServerId}
        isConnected={isConnected}
        onClaudeCodeStatusChange={setClaudeCodeStatus}
        retryTrigger={retryTrigger}
      />

      {/* W-30: Workspace Main Container - min-h-0 allows shrinking for LLM-Dev panel */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* W-31: Icon Sidebar */}
        <WorkspaceIconSidebar
          activePanel={activeSidebarPanel}
          onPanelChange={handleSidebarPanelChange}
          onNavigate={handleSidebarNavigate}
        />

        {/* W-38: File Explorer Panel */}
        <WorkspaceFileExplorer
          isOpen={fileExplorerOpen}
          onToggle={handleFileExplorerToggle}
          currentProject={project}
          onSelectProject={handleSelectProject}
          onFileSelect={handleFileSelect}
          isClaudeProcessing={isClaudeProcessing}
          onSshReconnected={handleSshReconnected}
        />

        {/* Left side - Main content (UI-02: Chat only, no tabs) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Main Content - Chat + Preview */}
          <div ref={chatPreviewContainerRef} className="flex-1 flex overflow-hidden">
            {/* Chat area */}
            <div className="flex-1 overflow-hidden" style={{ minWidth: '300px' }}>
              <Chat
                project={project}
                model={selectedModel}
                apiKeys={apiKeys}
                serverId={linkedServerId}
                claudeCodeStatus={claudeCodeStatus}
                onProcessingChange={setIsClaudeProcessing}
                enhanceWithAI={enhanceWithAI}
                onRetryConnection={() => setRetryTrigger(prev => prev + 1)}
              />
            </div>

            {/* FEAT-38: Draggable divider between chat and preview */}
            <div
              onMouseDown={handlePreviewDragStart}
              onDoubleClick={handlePreviewDividerDoubleClick}
              style={{
                width: '6px',
                flexShrink: 0,
                cursor: 'col-resize',
                background: previewDragging ? 'var(--primary)' : 'var(--border)',
                transition: previewDragging ? 'none' : 'background 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 5
              }}
              onMouseEnter={(e) => { if (!previewDragging) e.currentTarget.style.background = 'var(--primary)' }}
              onMouseLeave={(e) => { if (!previewDragging) e.currentTarget.style.background = 'var(--border)' }}
              title="Drag to resize preview. Double-click to toggle."
            >
              {/* Visual grip dots */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                opacity: 0.5
              }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: '2px', height: '2px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                ))}
              </div>
            </div>

            {/* Preview Panel */}
            <PreviewPanel
              previewUrl={welcomeUrl}
              collapsed={previewCollapsed}
              onCollapsedChange={setPreviewCollapsed}
              width={previewWidth}
              onUrlChange={handlePreviewUrlChange}
              dragging={previewDragging}
            />
          </div>
        </div>

      {/* Right Panel - Terminal, Files, or Editor */}
      {showRightPanel && (activeServer || editingFile) && (
        <div className="w-1/2 border-l border-gray-700 flex flex-col bg-gray-900">
          {/* Panel tabs */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-800/50 border-b border-gray-700">
            {activeServer && (
              <>
                <button
                  onClick={() => setRightPanelContent('terminal')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
                    rightPanelContent === 'terminal' 
                      ? 'bg-gray-700 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <TerminalIcon size={16} />
                  Terminal
                </button>
                <button
                  onClick={() => setRightPanelContent('files')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
                    rightPanelContent === 'files' 
                      ? 'bg-gray-700 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <FolderOpen size={16} />
                  Files
                </button>
              </>
            )}
            {editingFile && (
              <button
                onClick={() => setRightPanelContent('editor')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
                  rightPanelContent === 'editor' 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Code size={16} />
                Editor
              </button>
            )}
            
            {/* Server selector if multiple terminals */}
            {terminals.length > 1 && rightPanelContent !== 'editor' && (
              <select
                value={activeServer?.id || ''}
                onChange={(e) => {
                  const server = terminals.find(t => t.id === e.target.value)
                  if (server) setActiveServer(server)
                }}
                className="ml-2 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
              >
                {terminals.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            {rightPanelContent === 'terminal' && activeServer && (
              <Terminal
                serverId={activeServer.id}
                serverName={activeServer.name}
                onClose={() => closeTerminal(activeServer.id)}
              />
            )}
            
            {rightPanelContent === 'files' && activeServer && (
              <FileBrowser
                serverId={activeServer.id}
                serverName={activeServer.name}
              />
            )}
            
            {rightPanelContent === 'editor' && editingFile && (
              <CodeEditor
                path={editingFile.path}
                content={editingFile.content}
                onSave={saveFile}
                onClose={() => {
                  setEditingFile(null)
                  setRightPanelContent('files')
                }}
              />
            )}
          </div>
        </div>
      )}
      </div>

      {/* W-88: LLM-Dev Bottom Panel */}
      <LLMDevPanel project={project} linkedServerId={linkedServerId} onEditorReady={handleEditorReady} onTerminalConnected={handleTerminalConnected} />

      {/* FEAT-51: Export Project Modal */}
      <ExportModal
        project={project}
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  )
}
