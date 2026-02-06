import { useState, useRef, useEffect } from 'react'
import { Package, Search, Key, ExternalLink } from 'lucide-react'
import ModelNotification from './ModelNotification'

const API_URL = import.meta.env.VITE_API_URL || ''

/**
 * WorkspaceTopBar Component (W-03)
 *
 * UI-01 Simplified: VPS badge and connection status removed
 * - Status now shown via sidebar project dot
 * - VPS info accessible via Settings
 *
 * Contains:
 * - W-05: Project Name (left)
 * - W-09/W-10: Header Toggle Button
 * - W-11 to W-28: Model Selector with Dropdown (right)
 * - W-29: Export Button (right)
 * - FEAT-01: Smart filtering based on API keys
 */

// Provider color constants
const PROVIDER_COLORS = {
  anthropic: '#ef4444',   // Red/Orange for Anthropic
  openai: '#22c55e',      // Green for OpenAI
  google: '#4285f4',      // Blue for Google
  meta: '#0668E1',        // Blue for Meta
  mistral: '#ff7000'      // Orange for Mistral
}

// Complete model list with provider info
const MODEL_LIST = [
  // Anthropic Models (Free with subscription)
  { id: 'claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'anthropic', tier: 'subscription', recommended: true },
  { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'anthropic', tier: 'subscription' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', tier: 'subscription' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic', tier: 'subscription' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic', tier: 'subscription' },

  // OpenAI Models (OpenRouter)
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', tier: 'openrouter' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', tier: 'openrouter' },
  { id: 'gpt-5-codex', name: 'GPT-5.2 Codex', provider: 'openai', tier: 'openrouter', new: true },
  { id: 'o1-preview', name: 'o1 Preview', provider: 'openai', tier: 'openrouter' },

  // Google Models (Coming Soon)
  { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro', provider: 'google', tier: 'coming_soon' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google', tier: 'coming_soon' },

  // Meta Models (OpenRouter)
  { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', provider: 'meta', tier: 'openrouter' },
  { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'meta', tier: 'openrouter' },

  // Mistral Models (OpenRouter)
  { id: 'mistral-large', name: 'Mistral Large', provider: 'mistral', tier: 'openrouter' },
  { id: 'mixtral-8x22b', name: 'Mixtral 8x22B', provider: 'mistral', tier: 'openrouter' }
]

// Provider display names
const PROVIDER_NAMES = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  google: 'Google',
  meta: 'Meta',
  mistral: 'Mistral'
}

// Helper to convert model ID to display info
const modelDisplayMap = {
  'anthropic/claude-opus-4': { name: 'Claude Opus 4.5', color: '#ef4444' },
  'anthropic/claude-sonnet-4': { name: 'Claude Sonnet 4.5', color: '#ef4444' },
  'anthropic/claude-3.5-sonnet': { name: 'Claude 3.5 Sonnet', color: '#ef4444' },
  'anthropic/claude-3-opus': { name: 'Claude 3 Opus', color: '#ef4444' },
  'anthropic/claude-3-haiku': { name: 'Claude 3 Haiku', color: '#ef4444' },
  'openai/gpt-4o': { name: 'GPT-4o', color: '#22c55e' },
  'openai/gpt-4-turbo': { name: 'GPT-4 Turbo', color: '#22c55e' },
  'openai/gpt-5-codex': { name: 'GPT-5.2 Codex', color: '#22c55e' },
  'google/gemini-pro': { name: 'Gemini Pro', color: '#4285f4' }
}

const getModelDisplay = (modelId) => {
  if (typeof modelId === 'object' && modelId?.name) return modelId
  // Try to find in MODEL_LIST first
  const model = MODEL_LIST.find(m => m.id === modelId || m.name === modelId)
  if (model) {
    return { name: model.name, color: PROVIDER_COLORS[model.provider] || '#ef4444' }
  }
  return modelDisplayMap[modelId] || { name: 'Claude Opus 4.5', color: '#ef4444' }
}

export default function WorkspaceTopBar({
  project,
  model,
  onModelChange,
  onExport,
  linkedServerId,
  isConnected,
  onClaudeCodeStatusChange
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState(() => getModelDisplay(model))
  const [showNotification, setShowNotification] = useState(false)
  const [showBillingWarning, setShowBillingWarning] = useState(false)
  const [pendingModel, setPendingModel] = useState(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [apiKeys, setApiKeys] = useState({ openrouter: false, anthropic: false })
  const [claudeCodeStatus, setClaudeCodeStatus] = useState({ installed: false, version: null, checking: false, error: null })
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  // Check for API keys on mount and when dropdown opens
  useEffect(() => {
    const checkApiKeys = () => {
      const openrouterKey = localStorage.getItem('openrouter_api_key') || localStorage.getItem('openrouter_key')
      setApiKeys(prev => ({
        ...prev,
        openrouter: !!openrouterKey
      }))
    }
    checkApiKeys()
    // Re-check when dropdown opens in case keys were added in Settings
    if (dropdownOpen) {
      checkApiKeys()
    }
  }, [dropdownOpen])

  // Check Claude Code status when VPS is connected
  useEffect(() => {
    const checkClaudeCode = async () => {
      if (!linkedServerId || !isConnected) {
        const status = { installed: false, version: null, authenticated: false, checking: false, error: null }
        setClaudeCodeStatus(status)
        setApiKeys(prev => ({ ...prev, anthropic: false }))
        // CLAUDE-02: Notify parent of status change
        onClaudeCodeStatusChange?.(status)
        return
      }

      setClaudeCodeStatus(prev => ({ ...prev, checking: true }))

      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 15000)

        const res = await fetch(`${API_URL}/api/ssh/servers/${linkedServerId}/claude-code`, {
          signal: controller.signal
        })
        clearTimeout(timeout)

        if (res.ok) {
          const data = await res.json()
          const status = {
            installed: data.installed,
            version: data.version,
            authenticated: data.authenticated,
            checking: false,
            error: data.error
          }
          setClaudeCodeStatus(status)
          setApiKeys(prev => ({ ...prev, anthropic: data.installed && data.authenticated }))
          // CLAUDE-02: Notify parent of status change
          onClaudeCodeStatusChange?.(status)
        } else {
          const status = { installed: false, version: null, authenticated: false, checking: false, error: 'Failed to check' }
          setClaudeCodeStatus(status)
          setApiKeys(prev => ({ ...prev, anthropic: false }))
          onClaudeCodeStatusChange?.(status)
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to check Claude Code status:', err)
        }
        const status = { installed: false, version: null, authenticated: false, checking: false, error: 'Connection failed' }
        setClaudeCodeStatus(status)
        setApiKeys(prev => ({ ...prev, anthropic: false }))
        onClaudeCodeStatusChange?.(status)
      }
    }

    checkClaudeCode()
  }, [linkedServerId, isConnected, onClaudeCodeStatusChange])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
    // Reset search when dropdown closes
    if (!dropdownOpen) {
      setSearchFilter('')
    }
  }, [dropdownOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // MODEL-03: Check if current model is using Pro subscription
  const isCurrentModelPro = () => {
    const currentModelData = MODEL_LIST.find(m => m.name === selectedModel.name || m.id === selectedModel.id)
    return currentModelData?.tier === 'subscription' && apiKeys.anthropic
  }

  // MODEL-03: Check if new model will use OpenRouter (paid)
  const willUseOpenRouter = (modelItem) => {
    // OpenRouter tier models always use OpenRouter
    if (modelItem.tier === 'openrouter') return true
    // Subscription tier models use OpenRouter if Claude Code not available
    if (modelItem.tier === 'subscription' && !apiKeys.anthropic) return true
    return false
  }

  // MODEL-03: Check if user dismissed billing warning
  const shouldShowBillingWarning = () => {
    return localStorage.getItem('hide_billing_switch_warning') !== 'true'
  }

  const handleModelSelect = (modelItem) => {
    const color = PROVIDER_COLORS[modelItem.provider] || '#ef4444'
    const newModel = { name: modelItem.name, color, id: modelItem.id, provider: modelItem.provider }
    setDropdownOpen(false)
    setSearchFilter('')

    // Check if model requires API key that's not available
    if (modelItem.tier === 'openrouter' && !apiKeys.openrouter) {
      setPendingModel(newModel)
      setShowNotification(true)
      return
    }

    // MODEL-03: Detect billing source switch (Pro → OpenRouter)
    const switchingFromProToOpenRouter = isCurrentModelPro() && willUseOpenRouter(modelItem)

    if (switchingFromProToOpenRouter && shouldShowBillingWarning()) {
      setPendingModel(newModel)
      setShowBillingWarning(true)
      return
    }

    setSelectedModel(newModel)
    onModelChange?.(newModel)
  }

  // Filter and group models based on search and API key availability
  const getFilteredModels = () => {
    const filtered = MODEL_LIST.filter(model => {
      // Search filter
      if (searchFilter) {
        const search = searchFilter.toLowerCase()
        return (
          model.name.toLowerCase().includes(search) ||
          model.provider.toLowerCase().includes(search) ||
          model.id.toLowerCase().includes(search)
        )
      }
      return true
    })

    // Group by provider
    const grouped = {}
    filtered.forEach(model => {
      if (!grouped[model.provider]) {
        grouped[model.provider] = []
      }
      grouped[model.provider].push(model)
    })

    return grouped
  }

  // Check if a model is available based on tier and API keys
  const isModelAvailable = (model) => {
    if (model.tier === 'subscription') return apiKeys.anthropic  // Requires Claude Code on VPS
    if (model.tier === 'openrouter') return apiKeys.openrouter
    if (model.tier === 'coming_soon') return false
    return false
  }

  // Get billing source label for display
  const getBillingLabel = (model) => {
    if (model.tier === 'subscription') {
      // Anthropic models: Pro Subscription when Claude Code available, else OpenRouter
      return apiKeys.anthropic ? 'Pro Subscription' : 'OpenRouter (paid)'
    }
    if (model.tier === 'openrouter') {
      return 'OpenRouter (paid)'
    }
    if (model.tier === 'coming_soon') {
      return 'Coming Soon'
    }
    return ''
  }

  // Get billing source color
  const getBillingColor = (model) => {
    if (model.tier === 'subscription' && apiKeys.anthropic) {
      return 'var(--success)' // Green for Pro Subscription (free with subscription)
    }
    if (model.tier === 'coming_soon') {
      return 'var(--text-muted)'
    }
    return 'var(--warning, #f59e0b)' // Amber/yellow for paid APIs
  }

  const handleConfirmModel = () => {
    if (pendingModel) {
      setSelectedModel(pendingModel)
      onModelChange?.(pendingModel)
      setPendingModel(null)
    }
    setShowNotification(false)
  }

  const handleCancelModel = () => {
    setPendingModel(null)
    setShowNotification(false)
  }

  // MODEL-03: Billing warning handlers
  const handleConfirmBillingSwitch = () => {
    if (pendingModel) {
      setSelectedModel(pendingModel)
      onModelChange?.(pendingModel)
      setPendingModel(null)
    }
    setShowBillingWarning(false)
  }

  const handleCancelBillingSwitch = () => {
    setPendingModel(null)
    setShowBillingWarning(false)
  }

  const handleDontShowBillingWarning = (checked) => {
    if (checked) {
      localStorage.setItem('hide_billing_switch_warning', 'true')
    }
  }

  const toggleHeader = () => {
    setCollapsed(!collapsed)
  }

  // Get filtered and grouped models
  const groupedModels = getFilteredModels()

  return (
    <div
      className={`workspace-top-bar ${collapsed ? 'collapsed' : ''}`}
      style={{
        height: collapsed ? 0 : '50px',
        background: 'var(--bg-secondary)',
        borderBottom: collapsed ? 'none' : '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: collapsed ? 0 : '0 16px',
        gap: '16px',
        flexShrink: 0,
        position: 'relative',
        zIndex: 100,
        overflow: 'visible',
        transition: 'height 0.2s ease, padding 0.2s ease'
      }}
    >
      {/* W-05: Project Name (left side) */}
      {!collapsed && (
        <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
          {project?.name || 'Untitled Project'}
        </span>
      )}

      {/* W-09/W-10: Header Toggle Button */}
      <div
        className="header-toggle-container"
        style={{
          position: 'absolute',
          bottom: collapsed ? '-20px' : '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 101
        }}
      >
        <button
          className="header-toggle"
          onClick={toggleHeader}
          title={collapsed ? 'Expand header' : 'Collapse header'}
          style={{
            width: '40px',
            height: '20px',
            background: 'var(--primary)',
            border: 'none',
            borderRadius: '0 0 8px 8px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            flexShrink: 0
          }}
        >
          {collapsed ? '▼' : '▲'}
        </button>
      </div>

      {/* W-11 to W-28: Model Selector */}
      {!collapsed && (
        <div
          ref={dropdownRef}
          className="model-selector"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          {/* W-12: Model Icon */}
          <div
            className="model-selector-icon"
            style={{
              width: '20px',
              height: '20px',
              background: selectedModel.color,
              borderRadius: '4px'
            }}
          ></div>

          {/* W-13: Model Name */}
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
            {selectedModel.name}
          </span>

          {/* MODEL-02: Billing source badge */}
          {(() => {
            const currentModelData = MODEL_LIST.find(m => m.name === selectedModel.name || m.id === selectedModel.id)
            if (!currentModelData) return null
            const isProSub = currentModelData.tier === 'subscription' && apiKeys.anthropic
            return (
              <span style={{
                fontSize: '9px',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 500,
                background: isProSub ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: isProSub ? 'var(--success)' : 'var(--warning, #f59e0b)',
                whiteSpace: 'nowrap'
              }}>
                {isProSub ? 'PRO' : 'PAID'}
              </span>
            )
          })()}

          {/* W-14: Dropdown Arrow */}
          <span style={{ color: 'var(--text-secondary)' }}>▼</span>

          {/* W-15 to W-28: Model Dropdown with FEAT-01 Smart Filtering */}
          {dropdownOpen && (
            <div
              className="model-dropdown"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                minWidth: '300px',
                maxHeight: '400px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                marginTop: '4px',
                overflow: 'hidden',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div style={{
                padding: '8px 12px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-tertiary)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px'
                }}>
                  <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search models... (e.g., claude, gpt)"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                  />
                  {searchFilter && (
                    <button
                      onClick={() => setSearchFilter('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '2px',
                        fontSize: '12px'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Model List */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {Object.keys(groupedModels).length === 0 ? (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '13px'
                  }}>
                    No models found for "{searchFilter}"
                  </div>
                ) : (
                  Object.entries(groupedModels).map(([provider, models]) => (
                    <div key={provider}>
                      {/* Provider Header */}
                      <div style={{
                        padding: '8px 12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        background: 'var(--bg-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '2px',
                            background: PROVIDER_COLORS[provider]
                          }} />
                          {PROVIDER_NAMES[provider]}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 400,
                          color: provider === 'anthropic' ? (
                            claudeCodeStatus.checking ? 'var(--text-muted)' :
                            apiKeys.anthropic ? 'var(--success)' : 'var(--text-muted)'
                          ) : (
                            models[0]?.tier === 'openrouter' && apiKeys.openrouter ? 'var(--success)' : 'var(--text-muted)'
                          )
                        }}>
                          {provider === 'anthropic' ? (
                            claudeCodeStatus.checking ? '⏳ Checking...' :
                            !isConnected ? '○ Connect VPS' :
                            claudeCodeStatus.installed && claudeCodeStatus.authenticated ? '✓ Claude Code Ready' :
                            claudeCodeStatus.installed ? '⚠ Not Authenticated' :
                            '⚠ Install Claude Code'
                          ) : (
                            models[0]?.tier === 'openrouter' ? (apiKeys.openrouter ? '✓ API Key Added' : '🔑 Requires API Key') :
                            models[0]?.tier === 'coming_soon' ? '🔜 Coming Soon' : ''
                          )}
                        </span>
                      </div>

                      {/* Install Claude Code link for Anthropic when not installed */}
                      {provider === 'anthropic' && isConnected && !claudeCodeStatus.installed && !claudeCodeStatus.checking && (
                        <div
                          style={{
                            padding: '8px 12px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'var(--bg-secondary)'
                          }}
                          onClick={() => window.open('https://docs.anthropic.com/en/docs/claude-code', '_blank')}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                        >
                          <ExternalLink size={12} />
                          Install Claude Code on VPS →
                        </div>
                      )}

                      {/* Model Items */}
                      {models.map((model) => {
                        const available = isModelAvailable(model)
                        const isSelected = selectedModel.name === model.name
                        const billingLabel = getBillingLabel(model)
                        const billingColor = getBillingColor(model)
                        return (
                          <div
                            key={model.id}
                            className={`model-dropdown-item ${isSelected ? 'active' : ''} ${!available ? 'disabled' : ''}`}
                            onClick={() => available && handleModelSelect(model)}
                            style={{
                              padding: '10px 12px',
                              fontSize: '13px',
                              cursor: available ? 'pointer' : 'not-allowed',
                              color: available ? 'var(--text-primary)' : 'var(--text-muted)',
                              background: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              opacity: available ? 1 : 0.5,
                              transition: 'background 0.15s ease'
                            }}
                            onMouseEnter={(e) => available && (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                            onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = 'transparent')}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: PROVIDER_COLORS[model.provider]
                              }} />
                              {model.name}
                              {model.recommended && (
                                <span style={{
                                  fontSize: '9px',
                                  background: 'var(--primary)',
                                  color: 'white',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 600
                                }}>
                                  RECOMMENDED
                                </span>
                              )}
                              {model.new && (
                                <span style={{
                                  fontSize: '9px',
                                  background: 'var(--success)',
                                  color: 'white',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 600
                                }}>
                                  NEW
                                </span>
                              )}
                            </span>
                            {/* MODEL-02: Billing source indicator */}
                            <span style={{
                              fontSize: '10px',
                              color: billingColor,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {!available && model.tier === 'openrouter' && (
                                <Key size={10} style={{ color: 'var(--text-muted)' }} />
                              )}
                              {billingLabel}
                            </span>
                          </div>
                        )
                      })}

                      {/* Add API Key Link for OpenRouter section */}
                      {provider !== 'anthropic' && models[0]?.tier === 'openrouter' && !apiKeys.openrouter && (
                        <div
                          style={{
                            padding: '8px 12px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            borderTop: '1px solid var(--border)'
                          }}
                          onClick={() => window.location.href = '/settings?tab=apikeys'}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Key size={12} />
                          Add OpenRouter API Key to unlock
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer with API Key Status */}
              <div style={{
                padding: '8px 12px',
                borderTop: '1px solid var(--border)',
                background: 'var(--bg-tertiary)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>
                  {apiKeys.openrouter ? (
                    <span style={{ color: 'var(--success)' }}>✓ OpenRouter connected</span>
                  ) : (
                    <span>🔑 OpenRouter API key not set</span>
                  )}
                </span>
                <span
                  style={{ color: 'var(--primary)', cursor: 'pointer' }}
                  onClick={() => window.location.href = '/settings?tab=apikeys'}
                >
                  Manage Keys →
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* W-29: Export Button */}
      {!collapsed && (
        <button
          className="export-btn"
          onClick={onExport}
          style={{
            padding: '8px 16px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginLeft: 'auto'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
        >
          <Package size={14} />
          Export Project
        </button>
      )}

      {/* M-01 to M-09: Model Notification Modal */}
      <ModelNotification
        isOpen={showNotification}
        onClose={handleCancelModel}
        onConfirm={handleConfirmModel}
        title="Using OpenRouter API Key"
        body={`You're selecting ${pendingModel?.name || 'a model'} that will use your OpenRouter API key. Make sure you have configured your API key in Settings.`}
      />

      {/* MODEL-03: Billing Switch Warning Modal */}
      <ModelNotification
        isOpen={showBillingWarning}
        onClose={handleCancelBillingSwitch}
        onConfirm={handleConfirmBillingSwitch}
        title="Switching to Paid API"
        body={`You are switching from Pro Subscription to OpenRouter, which bills per API call. ${pendingModel?.name || 'This model'} will be charged to your OpenRouter account.`}
        iconColor="rgba(245, 158, 11, 0.2)"
        showDontShowAgain={true}
        onDontShowAgainChange={handleDontShowBillingWarning}
      />
    </div>
  )
}
