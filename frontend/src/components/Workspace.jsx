import { useState, useEffect } from 'react'
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
export default function Workspace({ project, model, apiKeys }) {
  const navigate = useNavigate()
  const [activeServer, setActiveServer] = useState(null)
  const [terminals, setTerminals] = useState([]) // Multiple terminals
  const [showRightPanel, setShowRightPanel] = useState(false)
  const [rightPanelContent, setRightPanelContent] = useState(null) // 'files', 'terminal', 'editor'
  const [editingFile, setEditingFile] = useState(null) // { path, content }
  const [previewCollapsed, setPreviewCollapsed] = useState(true)

  // W-31: Icon Sidebar state
  const [activeSidebarPanel, setActiveSidebarPanel] = useState('workspaces')
  // W-38: File Explorer state
  const [fileExplorerOpen, setFileExplorerOpen] = useState(true)

  // W-03: Workspace Top Bar state - SSH connection status
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedModel, setSelectedModel] = useState(model || { name: 'Claude Opus 4.5', color: '#ef4444' })
  // Track the currently linked server ID (may differ from project.vps_server_id if just linked)
  const [linkedServerId, setLinkedServerId] = useState(project?.vps_server_id || null)

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

  const handleModelChange = (newModel) => {
    setSelectedModel(newModel)
  }

  const handleExport = () => {
    // TODO: Implement project export functionality
    console.log('Export project:', project?.name)
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

  const handleSelectProject = (selectedProject) => {
    // In a real implementation, this would load the selected project
    console.log('Selected project:', selectedProject)
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
        />

        {/* Left side - Main content (UI-02: Chat only, no tabs) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Main Content - Chat */}
          <div className="flex-1 flex overflow-hidden">
            {/* Chat area */}
            <div className="flex-1 overflow-hidden">
              <Chat
                project={project}
                model={model}
                apiKeys={apiKeys}
              />
            </div>

            {/* Preview Panel */}
            <PreviewPanel
              previewUrl=""
              defaultCollapsed={previewCollapsed}
              onCollapsedChange={setPreviewCollapsed}
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
      <LLMDevPanel project={project} linkedServerId={linkedServerId} />
    </div>
  )
}
