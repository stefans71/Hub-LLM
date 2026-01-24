import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Chat from './Chat'
import Terminal from './Terminal'
import FileBrowser from './FileBrowser'
import ServerManager from './ServerManager'
import CodespacesManager from './CodespacesManager'
import CodeEditor from './CodeEditor'
import PreviewPanel from './PreviewPanel'
import WorkspaceTopBar from './WorkspaceTopBar'
import WorkspaceIconSidebar from './WorkspaceIconSidebar'
import WorkspaceFileExplorer from './WorkspaceFileExplorer'
import LLMDevPanel from './LLMDevPanel'
import {
  MessageSquare,
  Server,
  Terminal as TerminalIcon,
  FolderOpen,
  PanelLeftClose,
  PanelLeft,
  Cloud,
  Code
} from 'lucide-react'

/**
 * Workspace Component
 *
 * Main workspace that integrates:
 * - Workspace Top Bar (W-03): Project info, model selector, connection status
 * - AI Chat with voice
 * - SSH Terminal
 * - File Browser
 * - Server Management
 * - GitHub Codespaces
 * - Code Editor
 */
export default function Workspace({ project, model, apiKeys }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('chat') // 'chat', 'servers', 'codespaces'
  const [activeServer, setActiveServer] = useState(null)
  const [terminals, setTerminals] = useState([]) // Multiple terminals
  const [showRightPanel, setShowRightPanel] = useState(false)
  const [rightPanelContent, setRightPanelContent] = useState(null) // 'files', 'terminal', 'editor'
  const [editingFile, setEditingFile] = useState(null) // { path, content }
  const [previewUrl, setPreviewUrl] = useState('') // Codespaces preview URL
  const [previewCollapsed, setPreviewCollapsed] = useState(true)

  // W-31: Icon Sidebar state
  const [activeSidebarPanel, setActiveSidebarPanel] = useState('workspaces')
  // W-38: File Explorer state
  const [fileExplorerOpen, setFileExplorerOpen] = useState(true)

  // W-03: Workspace Top Bar state
  const [isConnected, setIsConnected] = useState(true)
  const [selectedModel, setSelectedModel] = useState(model || { name: 'Claude Opus 4.5', color: '#ef4444' })

  const handleConnectionToggle = () => {
    setIsConnected(!isConnected)
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

  const openTerminal = (server) => {
    // Check if terminal already open for this server
    if (!terminals.find(t => t.id === server.id)) {
      setTerminals([...terminals, server])
    }
    setActiveServer(server)
    setRightPanelContent('terminal')
    setShowRightPanel(true)
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

  const openFiles = (server) => {
    setActiveServer(server)
    setRightPanelContent('files')
    setShowRightPanel(true)
  }

  const openEditor = async (server, filePath) => {
    // Fetch file content
    try {
      const res = await fetch(
        `/api/ssh/servers/${server.id}/files/read?path=${encodeURIComponent(filePath)}`
      )
      if (res.ok) {
        const data = await res.json()
        setEditingFile({ path: filePath, content: data.content, serverId: server.id })
        setRightPanelContent('editor')
        setShowRightPanel(true)
      }
    } catch (err) {
      console.error('Failed to open file:', err)
    }
  }

  const saveFile = async (path, content) => {
    if (!editingFile) return
    
    const res = await fetch(`/api/ssh/servers/${editingFile.serverId}/files/write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content })
    })
    
    if (!res.ok) {
      throw new Error('Failed to save')
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* W-03: Workspace Top Bar */}
      <WorkspaceTopBar
        project={project}
        model={selectedModel}
        onModelChange={handleModelChange}
        isConnected={isConnected}
        onConnectionToggle={handleConnectionToggle}
        onExport={handleExport}
      />

      {/* W-30: Workspace Main Container */}
      <div className="flex-1 flex overflow-hidden">
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

        {/* Left side - Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab Bar */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-800/50 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
              activeTab === 'chat' 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <MessageSquare size={16} />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('servers')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
              activeTab === 'servers' 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Server size={16} />
            Servers
          </button>
          <button
            onClick={() => setActiveTab('codespaces')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
              activeTab === 'codespaces' 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Cloud size={16} />
            Codespaces
          </button>
          
          <div className="flex-1" />
          
          {/* Right panel toggle */}
          {(activeServer || editingFile) && (
            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className="p-1.5 hover:bg-gray-700 rounded transition"
              title={showRightPanel ? 'Hide panel' : 'Show panel'}
            >
              {showRightPanel ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Content area */}
          <div className={`overflow-hidden ${activeTab === 'chat' && !previewCollapsed ? 'flex-1' : 'flex-1'}`}>
            {activeTab === 'chat' && (
              <Chat
                project={project}
                model={model}
                apiKeys={apiKeys}
              />
            )}

            {activeTab === 'servers' && (
              <ServerManager
                projectId={project?.id}
                onOpenTerminal={openTerminal}
                onOpenFiles={openFiles}
              />
            )}

            {activeTab === 'codespaces' && (
              <CodespacesManager
                githubToken={apiKeys.github}
                onPreview={(url) => {
                  setPreviewUrl(url)
                  setPreviewCollapsed(false)
                }}
              />
            )}
          </div>

          {/* Preview Panel (visible in chat mode) */}
          {activeTab === 'chat' && (
            <PreviewPanel
              previewUrl={previewUrl}
              defaultCollapsed={previewCollapsed}
              onCollapsedChange={setPreviewCollapsed}
            />
          )}
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
      <LLMDevPanel project={project} />
    </div>
  )
}
