import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard,
  Settings,
  Folder,
  FileText,
  Archive,
  Plus,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  LogOut,
  User,
  RefreshCw
} from 'lucide-react'

// UI-03: Get status dot color and title for a project
function getProjectStatusDot(project, serverStatuses) {
  if (!project.vps_server_id) {
    return { color: '#6b7280', title: 'No VPS connected' }
  }

  const status = serverStatuses[project.vps_server_id]
  if (!status) {
    return { color: '#6b7280', title: 'VPS not found' }
  }

  if (status.error) {
    return { color: '#ef4444', title: `VPS Error: ${status.error}` }
  }

  if (status.connected) {
    return { color: '#22c55e', title: 'VPS connected' }
  }

  return { color: '#6b7280', title: 'VPS not connected' }
}

// Workspace Item Component
function WorkspaceItem({ workspace, projects, isExpanded, onToggle, onSelectProject, activeProjectId, serverStatuses, onReconnect, reconnectingServers }) {
  const hasProjects = projects && projects.length > 0

  return (
    <div>
      <div
        className="workspace-item flex items-center gap-2 px-2 py-1.5 text-gray-300 hover:bg-[#242b35] rounded cursor-pointer text-sm"
        onClick={() => hasProjects && onToggle()}
      >
        <Folder size={16} className="flex-shrink-0 text-gray-400" />
        <span className="flex-1 truncate">{workspace}</span>
        {hasProjects && (
          <span className="text-[10px] text-gray-500">
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        )}
      </div>
      {isExpanded && hasProjects && (
        <div className="ml-2 border-l border-[#2d3748] pl-2">
          {projects.map((project) => {
            const statusDot = getProjectStatusDot(project, serverStatuses)
            const isReconnecting = reconnectingServers?.has(project.vps_server_id)
            const canReconnect = project.vps_server_id && statusDot.color !== '#22c55e' && !isReconnecting

            return (
              <div
                key={project.id}
                className={`project-item flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition ${
                  activeProjectId === project.id
                    ? 'bg-[#3b82f6]/20 text-[#3b82f6]'
                    : 'text-gray-400 hover:bg-[#242b35] hover:text-gray-200'
                }`}
                onClick={() => onSelectProject(project)}
              >
                {/* INFRA-02/BUG-26: Clickable status dot for reconnection - larger hit area */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (canReconnect) {
                      onReconnect(project.vps_server_id)
                    }
                  }}
                  style={{
                    width: '16px',
                    height: '16px',
                    padding: '4px',
                    border: 'none',
                    background: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    cursor: canReconnect ? 'pointer' : 'default',
                    marginLeft: '-4px'
                  }}
                  title={isReconnecting ? 'Reconnecting...' : (canReconnect ? 'Click to reconnect VPS' : statusDot.title)}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: isReconnecting ? '#f59e0b' : statusDot.color,
                      boxShadow: statusDot.color === '#22c55e' ? '0 0 4px rgba(34, 197, 94, 0.5)' : 'none',
                      animation: isReconnecting ? 'pulse 1s ease-in-out infinite' : 'none',
                      transition: 'background-color 0.2s, transform 0.15s',
                      transform: canReconnect ? 'scale(1)' : 'scale(1)'
                    }}
                    className={canReconnect ? 'hover-scale' : ''}
                  />
                </button>
                <FileText size={14} className="flex-shrink-0 opacity-60" />
                <span className="truncate" title={project.name}>{project.name}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function DashboardSidebar({
  projects,
  activeProject,
  onSelectProject,
  onNavigate,
  onCreateProject,
  currentView,
  onLogout
}) {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedWorkspaces, setExpandedWorkspaces] = useState({ Default: true })
  const [showUserMenu, setShowUserMenu] = useState(false)
  // UI-03: VPS connection status per server
  const [serverStatuses, setServerStatuses] = useState({})
  // INFRA-02: Track which servers are being reconnected
  const [reconnectingServers, setReconnectingServers] = useState(new Set())

  // UI-03: Load VPS server connection statuses
  useEffect(() => {
    const loadServerStatuses = async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      try {
        const res = await fetch('/api/ssh/servers', {
          signal: controller.signal
        })
        clearTimeout(timeout)

        if (res.ok) {
          const servers = await res.json()
          const statuses = {}
          servers.forEach(server => {
            statuses[server.id] = {
              connected: server.connected || false,
              error: server.error || null
            }
          })
          setServerStatuses(statuses)
        }
      } catch (err) {
        clearTimeout(timeout)
        if (err.name !== 'AbortError') {
          console.error('Failed to load server statuses:', err)
        }
      }
    }

    loadServerStatuses()
    // Poll server statuses every 10 seconds
    const interval = setInterval(loadServerStatuses, 10000)
    return () => clearInterval(interval)
  }, [])

  // INFRA-02: Reconnect a single VPS
  const reconnectServer = async (serverId) => {
    if (reconnectingServers.has(serverId)) return

    setReconnectingServers(prev => new Set([...prev, serverId]))

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 20000) // 20s timeout for connection

      const res = await fetch(`/api/ssh/servers/${serverId}/connect`, {
        method: 'POST',
        signal: controller.signal
      })
      clearTimeout(timeout)

      if (res.ok) {
        // Update status immediately
        setServerStatuses(prev => ({
          ...prev,
          [serverId]: { connected: true, error: null }
        }))
      } else {
        const data = await res.json().catch(() => ({}))
        setServerStatuses(prev => ({
          ...prev,
          [serverId]: { connected: false, error: data.detail || 'Connection failed' }
        }))
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Reconnect failed:', err)
        setServerStatuses(prev => ({
          ...prev,
          [serverId]: { connected: false, error: err.message }
        }))
      }
    } finally {
      setReconnectingServers(prev => {
        const next = new Set(prev)
        next.delete(serverId)
        return next
      })
    }
  }

  // INFRA-02: Get all disconnected VPS server IDs
  const getDisconnectedServerIds = () => {
    const serverIds = new Set()
    projects.forEach(project => {
      if (project.vps_server_id) {
        const status = serverStatuses[project.vps_server_id]
        if (!status?.connected) {
          serverIds.add(project.vps_server_id)
        }
      }
    })
    return serverIds
  }

  // INFRA-02: Reconnect all disconnected VPSes
  const reconnectAll = async () => {
    const disconnectedIds = getDisconnectedServerIds()
    for (const serverId of disconnectedIds) {
      reconnectServer(serverId) // Fire and forget - they run in parallel
    }
  }

  const hasDisconnectedServers = getDisconnectedServerIds().size > 0

  const handleLogout = async () => {
    await logout()
    if (onLogout) onLogout()
  }

  // Group projects by workspace
  const groupedProjects = projects.reduce((acc, project) => {
    const workspace = project.workspace || 'Default'
    if (!acc[workspace]) {
      acc[workspace] = []
    }
    acc[workspace].push(project)
    return acc
  }, {})

  // Ensure we have at least the default workspace and Archives
  const workspaces = Object.keys(groupedProjects)
  if (!workspaces.includes('Default')) {
    groupedProjects['Default'] = []
  }

  const toggleWorkspace = (workspace) => {
    setExpandedWorkspaces(prev => ({
      ...prev,
      [workspace]: !prev[workspace]
    }))
  }

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  if (collapsed) {
    return (
      <aside className="w-12 bg-[#1a2028] border-r border-[#2d3748] flex flex-col items-center py-4 flex-shrink-0">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 hover:bg-[#242b35] rounded transition text-gray-400 hover:text-white"
          title="Expand Sidebar"
        >
          <ChevronRight size={16} />
        </button>
      </aside>
    )
  }

  return (
    <aside className="w-64 bg-[#1a2028] border-r border-[#2d3748] flex flex-col flex-shrink-0">
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        {/* Main Section */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
            Main
          </div>
          <div
            className={`nav-item flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
              currentView === 'dashboard'
                ? 'bg-[#3b82f6]/20 text-[#3b82f6]'
                : 'text-gray-300 hover:bg-[#242b35]'
            }`}
            onClick={() => onNavigate?.('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span className="text-sm font-medium">Dashboard</span>
          </div>
          <div
            className={`nav-item flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
              currentView === 'settings'
                ? 'bg-[#3b82f6]/20 text-[#3b82f6]'
                : 'text-gray-300 hover:bg-[#242b35]'
            }`}
            onClick={() => onNavigate?.('settings')}
          >
            <Settings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </div>
        </div>

        {/* Workspaces Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Workspaces
            </span>
            <div className="flex items-center gap-1">
              {/* INFRA-02: Reconnect All button */}
              {hasDisconnectedServers && (
                <button
                  onClick={reconnectAll}
                  className="w-5 h-5 hover:bg-[#242b35] rounded flex items-center justify-center transition text-gray-400 hover:text-green-400"
                  title="Reconnect all VPSes"
                  disabled={reconnectingServers.size > 0}
                >
                  <RefreshCw size={12} className={reconnectingServers.size > 0 ? 'animate-spin' : ''} />
                </button>
              )}
              <button
                onClick={onCreateProject}
                className="w-5 h-5 bg-[#3b82f6] hover:bg-[#2563eb] rounded flex items-center justify-center transition"
                title="Create Project"
              >
                <Plus size={12} className="text-white" strokeWidth={3} />
              </button>
              <button
                onClick={() => setCollapsed(true)}
                className="w-5 h-5 hover:bg-[#242b35] rounded flex items-center justify-center transition text-gray-400 hover:text-white"
                title="Collapse Sidebar"
              >
                <ChevronLeft size={14} />
              </button>
            </div>
          </div>

          {/* Workspace Tree */}
          <div className="space-y-1">
            {Object.entries(groupedProjects).map(([workspace, workspaceProjects]) => (
              <WorkspaceItem
                key={workspace}
                workspace={workspace}
                projects={workspaceProjects}
                isExpanded={expandedWorkspaces[workspace]}
                onToggle={() => toggleWorkspace(workspace)}
                onSelectProject={(project) => {
                  onSelectProject?.(project)
                  onNavigate?.('workspace', project)
                }}
                activeProjectId={activeProject?.id}
                serverStatuses={serverStatuses}
                onReconnect={reconnectServer}
                reconnectingServers={reconnectingServers}
              />
            ))}

            {/* Archives - always show */}
            <div className="workspace-item flex items-center gap-2 px-2 py-1.5 text-gray-500 hover:bg-[#242b35] rounded cursor-pointer text-sm">
              <Archive size={16} className="flex-shrink-0 opacity-60" />
              <span className="truncate">Archives</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[#2d3748]">
        {/* New Project Button */}
        <button
          onClick={onCreateProject}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] rounded-lg transition text-sm font-medium mb-3"
        >
          <Plus size={16} />
          New Project
        </button>

        {/* User Profile with Menu */}
        <div className="relative">
          <div
            className="flex items-center gap-3 p-2 hover:bg-[#242b35] rounded-lg cursor-pointer transition"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name || user.email}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#3b82f6] flex items-center justify-center text-xs font-medium">
                {getUserInitials()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {user?.name || 'User'}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.email || 'Pro Account'}
              </div>
            </div>
            <ChevronDown size={16} className={`text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </div>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#242b35] rounded-lg shadow-lg border border-[#2d3748] z-20 overflow-hidden">
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    onNavigate?.('settings')
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-gray-300 hover:bg-[#2d3748] transition"
                >
                  <User size={16} />
                  <span className="text-sm">Profile & Settings</span>
                </button>
                <div className="border-t border-[#2d3748]" />
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    handleLogout()
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-red-400 hover:bg-[#2d3748] transition"
                >
                  <LogOut size={16} />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
