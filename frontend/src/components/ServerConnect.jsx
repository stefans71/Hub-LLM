import { useState } from 'react'
import { X, Server, Key, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function ServerConnect({ onConnect, onClose, savedServers = [] }) {
  const [mode, setMode] = useState('password') // 'password' or 'key'
  const [host, setHost] = useState('')
  const [port, setPort] = useState('22')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [saveName, setSaveName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleConnect = async () => {
    if (!host || !username) {
      setError('Host and username are required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ssh/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host,
          port: parseInt(port),
          username,
          password: mode === 'password' ? password : undefined,
          private_key: mode === 'key' ? privateKey : undefined,
          save_as: saveName || undefined
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Connection failed')
      }

      const data = await res.json()
      onConnect(data.connection_id, { host, username, port })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const connectToSaved = async (server) => {
    setHost(server.host)
    setPort(server.port.toString())
    setUsername(server.username)
    setMode(server.auth_type)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl w-full max-w-lg mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Server size={20} />
            <h2 className="text-lg font-semibold">Connect to Server</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Saved servers */}
          {savedServers.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Saved Servers</label>
              <div className="flex flex-wrap gap-2">
                {savedServers.map((server) => (
                  <button
                    key={server.id}
                    onClick={() => connectToSaved(server)}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition"
                  >
                    {server.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Host and Port */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Host</label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="192.168.1.1 or hostname.com"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium mb-1">Port</label>
              <input
                type="text"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="root"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Auth mode tabs */}
          <div>
            <label className="block text-sm font-medium mb-2">Authentication</label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setMode('password')}
                className={`flex-1 py-2 rounded-lg text-sm transition ${
                  mode === 'password'
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Password
              </button>
              <button
                onClick={() => setMode('key')}
                className={`flex-1 py-2 rounded-lg text-sm transition ${
                  mode === 'key'
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                SSH Key
              </button>
            </div>

            {mode === 'password' ? (
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-600 rounded"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            ) : (
              <textarea
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Paste your private key here (-----BEGIN OPENSSH PRIVATE KEY-----...)"
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            )}
          </div>

          {/* Save connection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Save as <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="My VPS"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 hover:bg-gray-700 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg transition flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Connect
          </button>
        </div>
      </div>
    </div>
  )
}
