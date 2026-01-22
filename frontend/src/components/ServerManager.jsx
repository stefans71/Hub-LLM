import { useState, useEffect } from 'react'
import { 
  Server, 
  Plus, 
  Trash2, 
  Terminal as TerminalIcon,
  FolderOpen,
  Wifi,
  WifiOff,
  Eye,
  EyeOff
} from 'lucide-react'

/**
 * ServerManager Component
 * 
 * Manage SSH server connections - add, remove, connect.
 */
export default function ServerManager({ 
  projectId, 
  onOpenTerminal, 
  onOpenFiles 
}) {
  const [servers, setServers] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: 22,
    username: '',
    auth_type: 'password',
    password: '',
    private_key: '',
    passphrase: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    loadServers()
  }, [projectId])

  const loadServers = async () => {
    try {
      const url = projectId 
        ? `/api/ssh/servers?project_id=${projectId}`
        : '/api/ssh/servers'
      const res = await fetch(url)
      const data = await res.json()
      setServers(data)
    } catch (err) {
      console.error('Failed to load servers:', err)
    }
  }

  const addServer = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ssh/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          project_id: projectId
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to add server')
      }

      setShowAddForm(false)
      setFormData({
        name: '',
        host: '',
        port: 22,
        username: '',
        auth_type: 'password',
        password: '',
        private_key: '',
        passphrase: ''
      })
      loadServers()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const removeServer = async (serverId) => {
    if (!confirm('Remove this server?')) return

    try {
      await fetch(`/api/ssh/servers/${serverId}`, { method: 'DELETE' })
      loadServers()
    } catch (err) {
      console.error('Failed to remove server:', err)
    }
  }

  const connectServer = async (serverId) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/ssh/servers/${serverId}/connect`, {
        method: 'POST'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Connection failed')
      }

      loadServers()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const disconnectServer = async (serverId) => {
    try {
      await fetch(`/api/ssh/servers/${serverId}/disconnect`, {
        method: 'POST'
      })
      loadServers()
    } catch (err) {
      console.error('Failed to disconnect:', err)
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Server size={20} />
          Servers
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition"
        >
          <Plus size={16} />
          Add Server
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Server List */}
      <div className="space-y-2">
        {servers.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No servers configured. Add one to get started.
          </p>
        )}

        {servers.map((server) => (
          <div
            key={server.id}
            className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                server.connected ? 'bg-green-500' : 'bg-gray-500'
              }`} />
              <div>
                <div className="font-medium">{server.name}</div>
                <div className="text-sm text-gray-400">
                  {server.username}@{server.host}:{server.port}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {server.connected ? (
                <>
                  <button
                    onClick={() => onOpenTerminal(server)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition"
                    title="Open Terminal"
                  >
                    <TerminalIcon size={18} />
                  </button>
                  <button
                    onClick={() => onOpenFiles(server)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition"
                    title="Browse Files"
                  >
                    <FolderOpen size={18} />
                  </button>
                  <button
                    onClick={() => disconnectServer(server.id)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition text-yellow-500"
                    title="Disconnect"
                  >
                    <WifiOff size={18} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => connectServer(server.id)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition text-green-500"
                  title="Connect"
                >
                  <Wifi size={18} />
                </button>
              )}
              <button
                onClick={() => removeServer(server.id)}
                className="p-2 hover:bg-gray-700 rounded-lg transition text-red-400"
                title="Remove"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Server Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="font-semibold">Add Server</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 hover:bg-gray-700 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={addServer} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My VPS"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Host</label>
                  <input
                    type="text"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    placeholder="192.168.1.1 or server.com"
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Port</label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="root"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Authentication</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="auth_type"
                      value="password"
                      checked={formData.auth_type === 'password'}
                      onChange={(e) => setFormData({ ...formData, auth_type: e.target.value })}
                    />
                    Password
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="auth_type"
                      value="key"
                      checked={formData.auth_type === 'key'}
                      onChange={(e) => setFormData({ ...formData, auth_type: e.target.value })}
                    />
                    SSH Key
                  </label>
                </div>
              </div>

              {formData.auth_type === 'password' ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Private Key (PEM)</label>
                    <textarea
                      value={formData.private_key}
                      onChange={(e) => setFormData({ ...formData, private_key: e.target.value })}
                      placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                      rows={4}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Passphrase (optional)</label>
                    <input
                      type="password"
                      value={formData.passphrase}
                      onChange={(e) => setFormData({ ...formData, passphrase: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 hover:bg-gray-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Server'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
