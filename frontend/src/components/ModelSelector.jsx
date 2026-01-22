import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

const POPULAR_MODELS = [
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Anthropic' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
  { id: 'openai/o1-preview', name: 'o1 Preview', provider: 'OpenAI' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini 1.5 Pro', provider: 'Google' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta' },
  { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral' },
  { id: 'mistralai/codestral', name: 'Codestral', provider: 'Mistral' },
  { id: 'deepseek/deepseek-coder', name: 'DeepSeek Coder', provider: 'DeepSeek' },
]

export default function ModelSelector({ selectedModel, onSelectModel }) {
  const [isOpen, setIsOpen] = useState(false)

  const currentModel = POPULAR_MODELS.find(m => m.id === selectedModel) || {
    id: selectedModel,
    name: selectedModel.split('/')[1] || selectedModel,
    provider: selectedModel.split('/')[0] || 'Unknown'
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
      >
        <span className="text-gray-400">{currentModel.provider}:</span>
        <span>{currentModel.name}</span>
        <ChevronDown size={16} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto">
            {/* Group by provider */}
            {['Anthropic', 'OpenAI', 'Google', 'Meta', 'Mistral', 'DeepSeek'].map(provider => {
              const models = POPULAR_MODELS.filter(m => m.provider === provider)
              if (models.length === 0) return null
              
              return (
                <div key={provider}>
                  <div className="px-3 py-2 text-xs text-gray-500 font-semibold border-b border-gray-700">
                    {provider}
                  </div>
                  {models.map(model => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSelectModel(model.id)
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-700 transition ${
                        selectedModel === model.id ? 'bg-gray-700' : ''
                      }`}
                    >
                      <span>{model.name}</span>
                      {selectedModel === model.id && (
                        <Check size={16} className="text-blue-400" />
                      )}
                    </button>
                  ))}
                </div>
              )
            })}
            
            {/* Custom model input */}
            <div className="border-t border-gray-700 p-3">
              <input
                type="text"
                placeholder="Custom model ID..."
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    onSelectModel(e.target.value)
                    setIsOpen(false)
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter any OpenRouter model ID
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
