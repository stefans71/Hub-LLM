import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, Key, ExternalLink, RefreshCw } from 'lucide-react'

/**
 * ModelSelector — Reusable model selector dropdown
 *
 * Extracted from WorkspaceTopBar (FEAT-21). Used by WorkspaceTopBar and CreateProject.
 *
 * Props:
 * - value: string (current model ID)
 * - onChange: (model) => void — called with { id, name, provider, color }
 * - apiKeys: { openrouter: bool, anthropic: bool }
 * - claudeCodeStatus: object (optional — for Anthropic Pro status display)
 * - isConnected: bool (optional — VPS connection state)
 * - showSubscriptionModels: bool (default true)
 * - compact: bool (default false)
 * - className: string (optional)
 * - style: object (optional)
 */

// Provider color constants
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
export const SUBSCRIPTION_MODELS = [
  { id: 'claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'anthropic', tier: 'subscription', recommended: true },
  { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'anthropic', tier: 'subscription' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', tier: 'subscription' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic', tier: 'subscription' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic', tier: 'subscription' },
]

// Popular model IDs shown by default (no search). Updated flagship models.
const POPULAR_MODEL_IDS = new Set([
  'anthropic/claude-opus-4.6',
  'anthropic/claude-sonnet-4.5',
  'openai/gpt-5.2-pro',
  'openai/gpt-5.2',
  'openai/gpt-5.2-codex',
  'openai/gpt-5.1-codex-max',
  'openai/gpt-5.1-codex',
  'openai/gpt-5.1',
  'google/gemini-3-pro-preview',
  'google/gemini-3-flash-preview',
  'meta-llama/llama-4-maverick',
  'deepseek/deepseek-chat-v3-0324',
  'deepseek/deepseek-r1',
  'mistralai/mistral-large',
  'x-ai/grok-3-beta',
  'qwen/qwen-2.5-coder-32b-instruct',
])

// Provider display names
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

export const getProviderName = (slug) => PROVIDER_NAMES[slug] || slug.charAt(0).toUpperCase() + slug.slice(1)
export const getProviderColor = (slug) => PROVIDER_COLORS[slug] || '#8b8b8b'

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

// Build the full model list: subscription models first (if enabled), then OpenRouter
const buildModelList = (openRouterModels, showSubscription) => {
  return showSubscription ? [...SUBSCRIPTION_MODELS, ...openRouterModels] : [...openRouterModels]
}

export const getModelDisplay = (modelId, modelList) => {
  if (typeof modelId === 'object' && modelId?.name) return modelId
  const model = modelList.find(m => m.id === modelId || m.name === modelId)
  if (model) {
    return { name: model.name, color: getProviderColor(model.provider), id: model.id, provider: model.provider }
  }
  return { name: modelId || 'Claude Opus 4.5', color: '#ef4444' }
}

/**
 * Parse a version number from a model ID or name for sorting.
 * Returns a numeric array for comparison, e.g. [5, 2] for "gpt-5.2"
 */
const parseVersionForSort = (model) => {
  // Try to extract version numbers from ID (more reliable)
  // Patterns: gpt-5.2, gemini-3-pro, claude-opus-4.5, llama-4-maverick
  const idStr = model.id || model.name || ''
  const match = idStr.match(/(\d+(?:\.\d+)?)/)
  if (match) {
    const parts = match[1].split('.').map(Number)
    return parts
  }
  return [0]
}

const compareVersions = (a, b) => {
  const vA = parseVersionForSort(a)
  const vB = parseVersionForSort(b)
  for (let i = 0; i < Math.max(vA.length, vB.length); i++) {
    const numA = vA[i] || 0
    const numB = vB[i] || 0
    if (numB !== numA) return numB - numA // descending
  }
  return 0
}

export default function ModelSelector({
  value,
  onChange,
  apiKeys = { openrouter: false, anthropic: false },
  claudeCodeStatus = { installed: false, version: null, checking: false, error: null },
  isConnected = false,
  showSubscriptionModels = true,
  compact = false,
  className = '',
  style = {},
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [openRouterModels, setOpenRouterModels] = useState(() => getCachedModels() || [])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [activeBillingMode, setActiveBillingMode] = useState('auto') // 'auto'|'subscription'|'openrouter'
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  const modelList = useMemo(
    () => buildModelList(openRouterModels, showSubscriptionModels),
    [openRouterModels, showSubscriptionModels]
  )

  const selectedModel = useMemo(
    () => getModelDisplay(value, showSubscriptionModels ? [...SUBSCRIPTION_MODELS, ...openRouterModels] : openRouterModels),
    [value, openRouterModels, showSubscriptionModels]
  )

  // Fetch OpenRouter models on mount (or use cache)
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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
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

  // Filter and group models — popular by default, full list when searching
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
      filtered = modelList.filter(m => m.tier === 'subscription' || m.isPopular)
    }

    // Apply billing mode filter
    if (activeBillingMode === 'subscription') {
      filtered = filtered.filter(m => m.tier === 'subscription')
    } else if (activeBillingMode === 'openrouter') {
      filtered = filtered.filter(m => m.tier !== 'subscription')
    }

    // Group by provider, subscription (anthropic) first
    const grouped = {}
    filtered.forEach(model => {
      const key = model.tier === 'subscription' ? '_subscription' : model.provider
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(model)
    })

    // Sort models within each group by version descending
    Object.keys(grouped).forEach(key => {
      if (key !== '_subscription') {
        grouped[key].sort(compareVersions)
      }
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

  const isModelAvailable = (model) => {
    if (model.tier === 'subscription') return apiKeys.anthropic
    if (model.tier === 'openrouter') return apiKeys.openrouter
    if (model.tier === 'coming_soon') return false
    return false
  }

  const getBillingLabel = (model) => {
    if (model.tier === 'subscription') {
      return apiKeys.anthropic ? 'Pro Subscription' : 'OpenRouter (paid)'
    }
    if (model.tier === 'openrouter') return 'OpenRouter (paid)'
    if (model.tier === 'coming_soon') return 'Coming Soon'
    return ''
  }

  const getBillingColor = (model) => {
    if (model.tier === 'subscription' && apiKeys.anthropic) {
      return 'var(--success)'
    }
    if (model.tier === 'coming_soon') return 'var(--text-muted)'
    return 'var(--warning, #f59e0b)'
  }

  const handleModelSelect = (modelItem) => {
    const color = getProviderColor(modelItem.provider)
    const newModel = { name: modelItem.name, color, id: modelItem.id, provider: modelItem.provider, tier: modelItem.tier }
    setDropdownOpen(false)
    setSearchFilter('')
    onChange?.(newModel)
  }

  const groupedModels = getFilteredModels()

  return (
    <div
      ref={dropdownRef}
      className={`model-selector ${className}`}
      onClick={() => setDropdownOpen(!dropdownOpen)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? '6px' : '8px',
        padding: compact ? '4px 10px' : '6px 12px',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        cursor: 'pointer',
        position: 'relative',
        ...style,
      }}
    >
      {/* Model Icon */}
      <div
        className="model-selector-icon"
        style={{
          width: compact ? '16px' : '20px',
          height: compact ? '16px' : '20px',
          background: selectedModel.color,
          borderRadius: '4px'
        }}
      />

      {/* Model Name */}
      <span style={{ fontSize: compact ? '12px' : '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
        {selectedModel.name}
      </span>

      {/* Billing source badge */}
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

      {/* Dropdown Arrow */}
      <span style={{ color: 'var(--text-secondary)', fontSize: compact ? '10px' : '12px' }}>▼</span>

      {/* Dropdown Panel */}
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
                placeholder={`Search ${modelList.length} models...`}
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

          {/* Billing mode toggle — only when subscription models are enabled */}
          {showSubscriptionModels && (
            <div style={{
              display: 'flex',
              gap: '4px',
              padding: '6px 12px',
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border)'
            }}>
              {[
                { key: 'subscription', label: 'Pro Subscription', available: apiKeys.anthropic },
                { key: 'openrouter', label: 'OpenRouter', available: apiKeys.openrouter }
              ].map(tab => {
                const isActive = activeBillingMode === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveBillingMode(prev => prev === tab.key ? 'auto' : tab.key)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '5px 8px',
                      fontSize: '11px',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                      border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: tab.available ? 'var(--success)' : 'var(--text-muted)',
                      flexShrink: 0
                    }} />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Not-set-up banner when a billing tab is selected but credentials missing */}
          {activeBillingMode === 'subscription' && !apiKeys.anthropic && (
            <div style={{
              padding: '8px 12px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              background: 'rgba(245, 158, 11, 0.08)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ color: 'var(--warning, #f59e0b)' }}>⚠</span>
              Connect a VPS with Claude Code to use Pro models
            </div>
          )}
          {activeBillingMode === 'openrouter' && !apiKeys.openrouter && (
            <div
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                color: 'var(--primary)',
                background: 'rgba(56, 189, 248, 0.08)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = '/settings?tab=apikeys'}
            >
              <Key size={12} />
              Add OpenRouter API Key to unlock models
            </div>
          )}

          {/* Popular hint or loading */}
          {!searchFilter && openRouterModels.length > 0 && activeBillingMode !== 'subscription' && (
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
                    const isSelected = selectedModel.name === model.name || selectedModel.id === model.id
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
                        {/* Billing source indicator */}
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
  )
}
