import { useState } from 'react'
import { X, Eye, EyeOff, ExternalLink } from 'lucide-react'

export default function SettingsModal({ apiKeys, onSave, onClose }) {
  const [keys, setKeys] = useState(apiKeys)
  const [showKeys, setShowKeys] = useState({
    openrouter: false,
    claude: false,
    github: false
  })

  const handleSave = () => {
    onSave(keys)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-800">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* OpenRouter API Key */}
          <div>
            <label className="block text-sm font-medium mb-2">
              OpenRouter API Key
            </label>
            <div className="relative">
              <input
                type={showKeys.openrouter ? 'text' : 'password'}
                value={keys.openrouter || ''}
                onChange={(e) => setKeys({ ...keys, openrouter: e.target.value })}
                placeholder="sk-or-..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => setShowKeys({ ...showKeys, openrouter: !showKeys.openrouter })}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-600 rounded"
              >
                {showKeys.openrouter ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              Get your key at{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline inline-flex items-center gap-0.5"
              >
                openrouter.ai <ExternalLink size={12} />
              </a>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Access Claude, GPT-4, Gemini, Llama, and 100+ models
            </p>
          </div>

          {/* Direct Claude API Key (optional) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Claude API Key <span className="text-gray-500">(optional)</span>
            </label>
            <div className="relative">
              <input
                type={showKeys.claude ? 'text' : 'password'}
                value={keys.claude || ''}
                onChange={(e) => setKeys({ ...keys, claude: e.target.value })}
                placeholder="sk-ant-..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => setShowKeys({ ...showKeys, claude: !showKeys.claude })}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-600 rounded"
              >
                {showKeys.claude ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              Get your key at{' '}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline inline-flex items-center gap-0.5"
              >
                console.anthropic.com <ExternalLink size={12} />
              </a>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              For Claude Max subscribers who want to use their subscription directly
            </p>
          </div>

          {/* GitHub Token for Codespaces */}
          <div>
            <label className="block text-sm font-medium mb-2">
              GitHub Token <span className="text-gray-500">(for Codespaces)</span>
            </label>
            <div className="relative">
              <input
                type={showKeys.github ? 'text' : 'password'}
                value={keys.github || ''}
                onChange={(e) => setKeys({ ...keys, github: e.target.value })}
                placeholder="ghp_..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => setShowKeys({ ...showKeys, github: !showKeys.github })}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-600 rounded"
              >
                {showKeys.github ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              Create a token with{' '}
              <a
                href="https://github.com/settings/tokens/new?scopes=codespace,repo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline inline-flex items-center gap-0.5"
              >
                codespace + repo scopes <ExternalLink size={12} />
              </a>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Manage your GitHub Codespaces from HubLLM
            </p>
          </div>

          {/* Info box */}
          <div className="bg-gray-700/50 rounded-lg p-4 text-sm">
            <h3 className="font-medium mb-2">🔐 Your keys are stored locally</h3>
            <p className="text-gray-400">
              API keys are saved in your browser's local storage and sent directly
              to the providers. We never store your keys on our servers.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-700 sticky bottom-0 bg-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 hover:bg-gray-700 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
