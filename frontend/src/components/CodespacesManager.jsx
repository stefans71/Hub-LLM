import { useState, useEffect } from 'react'
import { 
  Cloud, 
  Play, 
  Square, 
  Trash2, 
  ExternalLink,
  RefreshCw,
  Plus,
  GitBranch,
  Cpu,
  Loader2
} from 'lucide-react'

/**
 * CodespacesManager Component
 * 
 * Manage GitHub Codespaces - list, start, stop, open in browser.
 */
export default function CodespacesManager({ githubToken, onOpenInBrowser }) {
  const [codespaces, setCodespaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState({}) // Track loading per codespace

  useEffect(() => {
    if (githubToken) {
      loadCodespaces()
    }
  }, [githubToken])

  const loadCodespaces = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/github/codespaces', {
        headers: { 'X-GitHub-Token': githubToken }
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to load codespaces')
      }
      
      const data = await res.json()
      setCodespaces(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const startCodespace = async (name) => {
    setActionLoading({ ...actionLoading, [name]: 'starting' })
    
    try {
      const res = await fetch(`/api/github/codespaces/${name}/start`, {
        method: 'POST',
        headers: { 'X-GitHub-Token': githubToken }
      })
      
      if (!res.ok) {
        throw new Error('Failed to start codespace')
      }
      
      // Poll for status update
      setTimeout(loadCodespaces, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading({ ...actionLoading, [name]: null })
    }
  }

  const stopCodespace = async (name) => {
    setActionLoading({ ...actionLoading, [name]: 'stopping' })
    
    try {
      const res = await fetch(`/api/github/codespaces/${name}/stop`, {
        method: 'POST',
        headers: { 'X-GitHub-Token': githubToken }
      })
      
      if (!res.ok) {
        throw new Error('Failed to stop codespace')
      }
      
      setTimeout(loadCodespaces, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading({ ...actionLoading, [name]: null })
    }
  }

  const deleteCodespace = async (name) => {
    if (!confirm(`Delete codespace "${name}"? This cannot be undone.`)) return
    
    setActionLoading({ ...actionLoading, [name]: 'deleting' })
    
    try {
      const res = await fetch(`/api/github/codespaces/${name}`, {
        method: 'DELETE',
        headers: { 'X-GitHub-Token': githubToken }
      })
      
      if (!res.ok) {
        throw new Error('Failed to delete codespace')
      }
      
      loadCodespaces()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading({ ...actionLoading, [name]: null })
    }
  }

  const getStateColor = (state) => {
    switch (state.toLowerCase()) {
      case 'available': return 'bg-green-500'
      case 'shutdown': return 'bg-gray-500'
      case 'starting': return 'bg-yellow-500 animate-pulse'
      case 'stopping': return 'bg-yellow-500 animate-pulse'
      default: return 'bg-gray-500'
    }
  }

  const getStateText = (state) => {
    switch (state.toLowerCase()) {
      case 'available': return 'Running'
      case 'shutdown': return 'Stopped'
      default: return state
    }
  }

  if (!githubToken) {
    return (
      <div className="p-8 text-center">
        <Cloud size={48} className="mx-auto mb-4 text-gray-500" />
        <h3 className="text-lg font-medium mb-2">Connect GitHub</h3>
        <p className="text-gray-400 mb-4">
          Add your GitHub token in Settings to manage Codespaces
        </p>
        <a
          href="https://github.com/settings/tokens/new?scopes=codespace,repo"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-400 hover:underline"
        >
          Create a token with codespace scope
          <ExternalLink size={14} />
        </a>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Cloud size={20} />
          Codespaces
        </h2>
        <button
          onClick={loadCodespaces}
          disabled={loading}
          className="p-2 hover:bg-gray-700 rounded-lg transition"
          title="Refresh"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && codespaces.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin" size={24} />
        </div>
      )}

      {!loading && codespaces.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No codespaces found</p>
          <a
            href="https://github.com/codespaces/new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            <Plus size={16} />
            Create Codespace
          </a>
        </div>
      )}

      <div className="space-y-3">
        {codespaces.map((cs) => (
          <div
            key={cs.name}
            className="p-4 bg-gray-800 rounded-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${getStateColor(cs.state)}`} />
                  <h3 className="font-medium truncate">{cs.display_name}</h3>
                  <span className="text-xs text-gray-500">
                    {getStateText(cs.state)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <GitBranch size={14} />
                    {cs.repository}
                  </span>
                  <span className="flex items-center gap-1">
                    <Cpu size={14} />
                    {cs.machine_type}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 ml-4">
                {cs.state.toLowerCase() === 'available' ? (
                  <>
                    <a
                      href={cs.web_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-700 rounded-lg transition text-blue-400"
                      title="Open in browser"
                    >
                      <ExternalLink size={18} />
                    </a>
                    <button
                      onClick={() => stopCodespace(cs.name)}
                      disabled={actionLoading[cs.name]}
                      className="p-2 hover:bg-gray-700 rounded-lg transition text-yellow-500"
                      title="Stop"
                    >
                      {actionLoading[cs.name] === 'stopping' ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => startCodespace(cs.name)}
                    disabled={actionLoading[cs.name]}
                    className="p-2 hover:bg-gray-700 rounded-lg transition text-green-500"
                    title="Start"
                  >
                    {actionLoading[cs.name] === 'starting' ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Play size={18} />
                    )}
                  </button>
                )}
                
                <button
                  onClick={() => deleteCodespace(cs.name)}
                  disabled={actionLoading[cs.name]}
                  className="p-2 hover:bg-gray-700 rounded-lg transition text-red-400"
                  title="Delete"
                >
                  {actionLoading[cs.name] === 'deleting' ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Help text */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg text-sm text-gray-400">
        <p className="font-medium text-gray-300 mb-2">💡 Tip: SSH into Codespaces</p>
        <p>
          To SSH into a Codespace from HubLLM, you'll need to set up SSH forwarding
          using the GitHub CLI:
        </p>
        <code className="block mt-2 p-2 bg-gray-900 rounded text-xs">
          gh codespace ssh -c {'<codespace-name>'}
        </code>
        <p className="mt-2">
          Or open in VS Code and use the integrated terminal.
        </p>
      </div>
    </div>
  )
}
