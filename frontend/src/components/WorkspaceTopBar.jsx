import { useState, useRef, useEffect, useMemo } from 'react'
import { Package, Search, Key, ExternalLink, RefreshCw } from 'lucide-react'
import ModelNotification from './ModelNotification'

const API_URL = import.meta.env.VITE_API_URL || ''

/**
 * WorkspaceTopBar Component (W-03)
 *
 * MODEL-04: Dynamic model list from OpenRouter API
 * - Anthropic subscription models hardcoded at top (route through Claude Code on VPS)
 * - OpenRouter models fetched from public API, cached 24h in localStorage
 * - Shows ~20 popular models by default, full list when searching
 *
 * Contains:
 * - W-05: Project Name (left)
 * - W-09/W-10: Header Toggle Button
 * - W-11 to W-28: Model Selector with Dropdown (right)
 * - W-29: Export Button (right)
 * - FEAT-01: Smart filtering based on API keys
 */

// Provider color constants — extended dynamically for new providers
const PROVIDER_COLORS = {
  anthropic: '#ef4444',
  openai: '#22c55e',
  google: '#4285f4',
  'meta-llama': '#0668E1',
  mistralai: '#ff7000',
  deepseek: '#4a9eff',
  cohere: '#39594d',
  'x-ai': '#1d9bf0',
  perplexity: '#20b8cd',
  qwen: '#6c5ce7',
}

// Anthropic models that route through Claude Code on VPS (subscription tier)
const SUBSCRIPTION_MODELS = [
  { id: 'claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'anthropic', tier: 'subscription', recommended: true },
  { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'anthropic', tier: 'subscription' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', tier: 'subscription' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic', tier: 'subscription' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic', tier: 'subscription' },
]

// Popular model IDs shown by default (no search). Curated top ~20.
const POPULAR_MODEL_IDS = new Set([
  'anthropic/claude-opus-4.6',
  'anthropic/claude-sonnet-4.5',
  'anthropic/claude-3.5-sonnet',
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'openai/o1',
  'openai/o1-mini',
  'openai/o3-mini',
  'openai/gpt-5.2',
  'google/gemini-2.5-pro-preview',
  'google/gemini-2.0-flash-001',
  'meta-llama/llama-4-maverick',
  'meta-llama/llama-3.3-70b-instruct',
  'deepseek/deepseek-chat-v3-0324',
  'deepseek/deepseek-r1',
  'mistralai/mistral-large',
  'x-ai/grok-3-beta',
  'qwen/qwen-2.5-coder-32b-instruct',
  'cohere/command-r-plus',
  'perplexity/sonar-pro',
])

// Provider display names — capitalize fallback for unknown providers
const PROVIDER_NAMES = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  google: 'Google',
  'meta-llama': 'Meta',
  mistralai: 'Mistral',
  deepseek: 'DeepSeek',
  cohere: 'Cohere',
  'x-ai': 'xAI',
  perplexity: 'Perplexity',
  qwen: 'Qwen',
}

const getProviderName = (slug) => PROVIDER_NAMES[slug] || slug.charAt(0).toUpperCase() + slug.slice(1)
const getProviderColor = (slug) => PROVIDER_COLORS[slug] || '#8b8b8b'

// Parse OpenRouter API response into our model format
const parseOpenRouterModels = (data) => {
  if (!data?.data) return []
  return data.data
    .filter(m => m.id && m.name)
    .map(m => {
      const slashIdx = m.id.indexOf('/')
      const provider = slashIdx > 0 ? m.id.substring(0, slashIdx) : 'unknown'
      return {
        id: m.id,
        name: m.name,
        provider,
        tier: 'openrouter',
        context_length: m.context_length,
        isPopular: POPULAR_MODEL_IDS.has(m.id),
      }
    })
}

// localStorage cache keys
const CACHE_KEY = 'openrouter_models'
const CACHE_TS_KEY = 'openrouter_models_fetched'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

const getCachedModels = () => {
  try {
    const ts = localStorage.getItem(CACHE_TS_KEY)
    if (ts && Date.now() - Number(ts) < CACHE_TTL) {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) return JSON.parse(cached)
    }
  } catch { /* ignore corrupt cache */ }
  return null
}

const setCachedModels = (models) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(models))
    localStorage.setItem(CACHE_TS_KEY, String(Date.now()))
  } catch { /* localStorage full — silently fail */ }
}

// Build the full model list: subscription models first, then OpenRouter
const buildModelList = (openRouterModels) => {
  return [...SUBSCRIPTION_MODELS, ...openRouterModels]
}

const getModelDisplay = (modelId, modelList) => {
  if (typeof modelId === 'object' && modelId?.name) return modelId
  const model = modelList.find(m => m.id === modelId || m.name === modelId)
  if (model) {
    return { name: model.name, color: getProviderColor(model.provider), id: model.id, provider: model.provider }
  }
  return { name: modelId || 'Claude Opus 4.5', color: '#ef4444' }
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
  const [showNotification, setShowNotification] = useState(false)
  const [showBillingWarning, setShowBillingWarning] = useState(false)
  const [pendingModel, setPendingModel] = useState(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [apiKeys, setApiKeys] = useState({ openrouter: false, anthropic: false })
  const [claudeCodeStatus, setClaudeCodeStatus] = useState({ installed: false, version: null, checking: false, error: null })
  const [openRouterModels, setOpenRouterModels] = useState(() => getCachedModels() || [])
  const [modelsLoading, setModelsLoading] = useState(false)
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  // MODEL-04: Merged model list — subscription + OpenRouter
  const modelList = useMemo(() => buildModelList(openRouterModels), [openRouterModels])
  const [selectedModel, setSelectedModel] = useState(() => getModelDisplay(model, SUBSCRIPTION_MODELS))

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

  // MODEL-04: Fetch OpenRouter models on mount (or use cache)
  useEffect(() => {
    const cached = getCachedModels()
    if (cached) {
      setOpenRouterModels(cached)
      return
    }
    fetchOpenRouterModels()
  }, [])

  const fetchOpenRouterModels = async (force = false) => {
    if (!force) {
      const cached = getCachedModels()
      if (cached) {
        setOpenRouterModels(cached)
        return
      }
    }
    setModelsLoading(true)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const res = await fetch('https://openrouter.ai/api/v1/models', { signal: controller.signal })
      clearTimeout(timeout)
      if (res.ok) {
        const data = await res.json()
        const parsed = parseOpenRouterModels(data)
        setOpenRouterModels(parsed)
        setCachedModels(parsed)
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to fetch OpenRouter models:', err)
      }
    } finally {
      setModelsLoading(false)
    }
  }

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
    const currentModelData = modelList.find(m => m.name === selectedModel.name || m.id === selectedModel.id)
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
    const color = getProviderColor(modelItem.provider)
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

  // MODEL-04: Filter and group models — popular by default, full list when searching
  const getFilteredModels = () => {
    let filtered
    if (searchFilter) {
      const search = searchFilter.toLowerCase()
      filtered = modelList.filter(m =>
        m.name.toLowerCase().includes(search) ||
        m.provider.toLowerCase().includes(search) ||
        m.id.toLowerCase().includes(search)
      )
    } else {
      // No search: subscription models + popular OpenRouter models
      filtered = modelList.filter(m => m.tier === 'subscription' || m.isPopular)
    }

    // Group by provider, subscription (anthropic) first
    const grouped = {}
    filtered.forEach(model => {
      const key = model.tier === 'subscription' ? '_subscription' : model.provider
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(model)
    })

    // Ensure subscription group comes first
    const ordered = {}
    if (grouped._subscription) {
      ordered._subscription = grouped._subscription
    }
    Object.keys(grouped).sort().forEach(key => {
      if (key !== '_subscription') ordered[key] = grouped[key]
    })

    return ordered
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
            const currentModelData = modelList.find(m => m.name === selectedModel.name || m.id === selectedModel.id)
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
                    placeholder={`Search ${openRouterModels.length + SUBSCRIPTION_MODELS.length} models...`}
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

              {/* Popular hint or loading */}
              {!searchFilter && openRouterModels.length > 0 && (
                <div style={{
                  padding: '4px 12px',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  background: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border)'
                }}>
                  Showing popular models. Type to search all {openRouterModels.length}.
                </div>
              )}
              {modelsLoading && (
                <div style={{
                  padding: '4px 12px',
                  fontSize: '10px',
                  color: 'var(--primary)',
                  background: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border)'
                }}>
                  Loading models from OpenRouter...
                </div>
              )}

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
                  Object.entries(groupedModels).map(([groupKey, models]) => {
                    const isSubscription = groupKey === '_subscription'
                    const providerSlug = isSubscription ? 'anthropic' : groupKey
                    return (
                    <div key={groupKey}>
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
                            background: getProviderColor(providerSlug)
                          }} />
                          {isSubscription ? 'Anthropic (Pro)' : getProviderName(providerSlug)}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 400,
                          color: isSubscription ? (
                            claudeCodeStatus.checking ? 'var(--text-muted)' :
                            apiKeys.anthropic ? 'var(--success)' : 'var(--text-muted)'
                          ) : (
                            apiKeys.openrouter ? 'var(--success)' : 'var(--text-muted)'
                          )
                        }}>
                          {isSubscription ? (
                            claudeCodeStatus.checking ? '⏳ Checking...' :
                            !isConnected ? '○ Connect VPS' :
                            claudeCodeStatus.installed && claudeCodeStatus.authenticated ? '✓ Claude Code Ready' :
                            claudeCodeStatus.installed ? '⚠ Not Authenticated' :
                            '⚠ Install Claude Code'
                          ) : (
                            apiKeys.openrouter ? '✓ API Key Added' : '🔑 Requires API Key'
                          )}
                        </span>
                      </div>

                      {/* Install Claude Code link for Anthropic when not installed */}
                      {isSubscription && isConnected && !claudeCodeStatus.installed && !claudeCodeStatus.checking && (
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
                                background: getProviderColor(model.provider)
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
                      {!isSubscription && !apiKeys.openrouter && (
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
                    )
                  })
                )}
              </div>

              {/* Footer with model count, refresh, and API key status */}
              <div style={{
                padding: '8px 12px',
                borderTop: '1px solid var(--border)',
                background: 'var(--bg-tertiary)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {apiKeys.openrouter ? (
                    <span style={{ color: 'var(--success)' }}>✓ OpenRouter</span>
                  ) : (
                    <span>🔑 No API key</span>
                  )}
                  <span style={{ color: 'var(--text-muted)' }}>
                    · {openRouterModels.length} models
                  </span>
                  <button
                    onClick={() => fetchOpenRouterModels(true)}
                    title="Refresh model list"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <RefreshCw size={11} style={modelsLoading ? { animation: 'spin 1s linear infinite' } : {}} />
                  </button>
                </span>
                <span
                  style={{ color: 'var(--primary)', cursor: 'pointer', whiteSpace: 'nowrap' }}
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
