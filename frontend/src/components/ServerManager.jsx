import { useState, useEffect } from 'react'
import {
  Server,
  Plus,
  Wifi,
  WifiOff,
  ExternalLink,
  Link2,
  Unlink
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * ServerManager Component
 *
 * Shows the project's linked VPS server (from Settings > VPS Connections).
 * Does NOT duplicate the "Add Server" form - that's in Settings.
 */
export default function ServerManager({
  project,
  projectId,
  onConnectionChange,
  onServerLinked
}) {
  const navigate = useNavigate()
  const [linkedServer, setLinkedServer] = useState(null)
  const [globalServers, setGlobalServers] = useState([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)
  const [showLinkDropdown, setShowLinkDropdown] = useState(false)

  useEffect(() => {
    loadServerInfo()
  }, [project?.vps_server_id, projectId])

  const loadServerInfo = async () => {
    setLoading(true)
    try {
      // Load global servers from localStorage (same source as Settings)
      const savedServers = localStorage.getItem('vps_servers')
      const servers = savedServers ? JSON.parse(savedServers) : []
      setGlobalServers(servers)

      // Find the project's linked server
      const serverId = project?.vps_server_id
      if (serverId) {
        // First try localStorage (primary source)
        const localServer = servers.find(s => s.id === serverId)
        if (localServer) {
          setLinkedServer(localServer)
        } else {
          // Fallback: try backend API
          const res = await fetch('/api/ssh/servers')
          const backendServers = await res.json()
          const backendServer = backendServers.find(s => s.id === serverId)
          if (backendServer) {
            setLinkedServer(backendServer)
          }
        }
      }
    } catch (err) {
      console.error('Failed to load server info:', err)
    } finally {
      setLoading(false)
    }
  }

  const connectServer = async () => {
    if (!linkedServer) return
    setConnecting(true)
    setError(null)

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    try {
      // Ensure server is synced to backend first
      const backendRes = await fetch('/api/ssh/servers')
      const backendServers = await backendRes.json()
      const serverId = linkedServer.id

      if (!backendServers.find(s => s.id === serverId)) {
        // Sync to backend with the SAME ID
        await fetch('/api/ssh/servers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: serverId, // Preserve the original ID!
            name: linkedServer.name,
            host: linkedServer.host,
            port: parseInt(linkedServer.port) || 22,
            username: linkedServer.username || 'root',
            auth_type: linkedServer.privateKey ? 'key' : 'password',
            private_key: linkedServer.privateKey || null
          })
        })
      }

      const res = await fetch(`/api/ssh/servers/${serverId}/connect`, {
        method: 'POST',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Connection failed')
      }

      // Update linked server status
      const connectedServer = { ...linkedServer, connected: true }
      setLinkedServer(connectedServer)
      // Notify parent (Workspace) about connection change
      onConnectionChange?.(connectedServer, true)
      loadServerInfo()
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Connection timed out. Check if the server is reachable.')
      } else {
        setError(err.message || 'Connection failed')
      }
    } finally {
      clearTimeout(timeoutId)
      setConnecting(false)
    }
  }

  const disconnectServer = async () => {
    if (!linkedServer) return
    try {
      await fetch(`/api/ssh/servers/${linkedServer.id}/disconnect`, {
        method: 'POST'
      })
      // Update local state and notify parent
      setLinkedServer(prev => ({ ...prev, connected: false }))
      onConnectionChange?.(linkedServer, false)
      loadServerInfo()
    } catch (err) {
      console.error('Failed to disconnect:', err)
    }
  }

  const unlinkServer = async () => {
    if (!confirm('Unlink this server from the project?')) return
    // TODO: Call API to update project's vps_server_id to null
    setLinkedServer(null)
  }

  const linkServer = async (server) => {
    setLinkedServer(server)
    setShowLinkDropdown(false)
    // Notify parent to update project's vps_server_id
    onServerLinked?.(server.id)
  }

  const goToVpsSettings = () => {
    navigate('/settings')
    // Settings page should auto-navigate to VPS Connections section
    setTimeout(() => {
      const vpsSection = document.querySelector('[data-section="vps"]')
      if (vpsSection) vpsSection.click()
    }, 100)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-gray-400">
          <Server size={20} className="animate-pulse" />
          Loading server info...
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Server size={20} />
          Project Server
        </h2>
        <button
          onClick={goToVpsSettings}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition"
          title="Manage VPS connections in Settings"
        >
          <ExternalLink size={14} />
          Manage VPS
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      {linkedServer ? (
        /* Show linked server */
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 bg-gray-800/50">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Connected VPS
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${
                  linkedServer.connected || linkedServer.lastTestSuccess
                    ? 'bg-green-500'
                    : 'bg-gray-500'
                }`} />
                <div>
                  <div className="font-semibold text-lg">{linkedServer.name}</div>
                  <div className="text-sm text-gray-400 font-mono">
                    {linkedServer.username || 'root'}@{linkedServer.host}:{linkedServer.port || 22}
                  </div>
                  {linkedServer.serverInfo?.os && (
                    <div className="text-xs text-gray-500 mt-1">
                      {linkedServer.serverInfo.os}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {linkedServer.connected ? (
                  <button
                    onClick={disconnectServer}
                    className="p-2 hover:bg-gray-700 rounded-lg transition text-yellow-500"
                    title="Disconnect"
                  >
                    <WifiOff size={18} />
                  </button>
                ) : (
                  <button
                    onClick={connectServer}
                    disabled={connecting}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50"
                  >
                    <Wifi size={16} />
                    {connecting ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-900/50 border-t border-gray-700 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Linked from Settings → VPS Connections
            </span>
            <button
              onClick={unlinkServer}
              className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1"
            >
              <Unlink size={12} />
              Unlink
            </button>
          </div>
        </div>
      ) : (
        /* No server linked - show option to link one */
        <div className="bg-gray-800/50 rounded-xl border border-dashed border-gray-600 p-8 text-center">
          <Server size={40} className="mx-auto mb-4 text-gray-500" />
          <h3 className="font-medium mb-2">No VPS Linked to This Project</h3>
          <p className="text-sm text-gray-400 mb-6">
            Link a server from your VPS Connections to enable terminal access and file browsing.
          </p>

          {globalServers.length > 0 ? (
            <div className="relative inline-block">
              <button
                onClick={() => setShowLinkDropdown(!showLinkDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                <Link2 size={16} />
                Link a Server
              </button>

              {showLinkDropdown && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                  <div className="p-2 border-b border-gray-700 text-xs text-gray-400">
                    Select from VPS Connections
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {globalServers.map(server => (
                      <button
                        key={server.id}
                        onClick={() => linkServer(server)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-700 flex items-center gap-3"
                      >
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          server.lastTestSuccess ? 'bg-green-500' : 'bg-gray-500'
                        }`} />
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{server.name}</div>
                          <div className="text-xs text-gray-400 truncate">{server.host}:{server.port || 22}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-700">
                    <button
                      onClick={goToVpsSettings}
                      className="w-full px-3 py-2 text-left text-sm text-blue-400 hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Plus size={14} />
                      Add new VPS in Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={goToVpsSettings}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition mx-auto"
            >
              <Plus size={16} />
              Add VPS in Settings
            </button>
          )}
        </div>
      )}
    </div>
  )
}
