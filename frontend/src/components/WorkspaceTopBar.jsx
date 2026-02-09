import { useState, useEffect, useCallback } from 'react'
import { Package } from 'lucide-react'
import ModelNotification from './ModelNotification'
import ModelSelector from './ModelSelector'

const API_URL = import.meta.env.VITE_API_URL || ''

/**
 * WorkspaceTopBar Component (W-03)
 *
 * Contains:
 * - W-05: Project Name (left)
 * - W-09/W-10: Header Toggle Button
 * - W-11 to W-28: Model Selector (extracted to ModelSelector.jsx)
 * - W-29: Export Button (right)
 * - MODEL-03: Billing switch warning
 */

export default function WorkspaceTopBar({
  project,
  model,
  onModelChange,
  onExport,
  linkedServerId,
  isConnected,
  onClaudeCodeStatusChange,
  retryTrigger
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [showBillingWarning, setShowBillingWarning] = useState(false)
  const [pendingModel, setPendingModel] = useState(null)
  const [apiKeys, setApiKeys] = useState({ openrouter: false, anthropic: false })
  const [claudeCodeStatus, setClaudeCodeStatus] = useState({ installed: false, version: null, checking: false, error: null })
  const [selectedModelValue, setSelectedModelValue] = useState(model)

  // Check for API keys on mount
  useEffect(() => {
    const openrouterKey = localStorage.getItem('openrouter_api_key') || localStorage.getItem('openrouter_key')
    setApiKeys(prev => ({ ...prev, openrouter: !!openrouterKey }))
  }, [])

  // Check Claude Code status when VPS is connected
  useEffect(() => {
    let retryCount = 0
    const maxRetries = 3
    let retryTimeout = null
    let cancelled = false

    const applyStatus = (status) => {
      if (cancelled) return
      setClaudeCodeStatus(status)
      setApiKeys(prev => ({ ...prev, anthropic: status.installed && status.authenticated }))
      onClaudeCodeStatusChange?.(status)
    }

    const checkClaudeCode = async () => {
      if (!linkedServerId || !isConnected) {
        applyStatus({ installed: false, version: null, authenticated: false, checking: false, error: null })
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
          applyStatus(status)

          // Retry if not authenticated but connected
          if (!data.authenticated && retryCount < maxRetries && !cancelled) {
            retryCount++
            retryTimeout = setTimeout(checkClaudeCode, 3000)
          }
        } else {
          applyStatus({ installed: false, version: null, authenticated: false, checking: false, error: 'Failed to check' })
          if (retryCount < maxRetries && !cancelled) {
            retryCount++
            retryTimeout = setTimeout(checkClaudeCode, 3000)
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to check Claude Code status:', err)
        }
        applyStatus({ installed: false, version: null, authenticated: false, checking: false, error: 'Connection failed' })
        if (retryCount < maxRetries && !cancelled) {
          retryCount++
          retryTimeout = setTimeout(checkClaudeCode, 3000)
        }
      }
    }

    checkClaudeCode()
    return () => {
      cancelled = true
      if (retryTimeout) clearTimeout(retryTimeout)
    }
  }, [linkedServerId, isConnected, onClaudeCodeStatusChange, retryTrigger])

  // Re-check API keys periodically (in case user adds key in Settings)
  const refreshApiKeys = useCallback(() => {
    const openrouterKey = localStorage.getItem('openrouter_api_key') || localStorage.getItem('openrouter_key')
    setApiKeys(prev => ({ ...prev, openrouter: !!openrouterKey }))
  }, [])

  // MODEL-03: Check if current model is using Pro subscription
  const isCurrentModelPro = useCallback(() => {
    // Check if current model is a subscription model and Claude Code is available
    const subIds = ['claude-opus-4.5', 'claude-sonnet-4.5', 'claude-3.5-sonnet', 'claude-3-opus', 'claude-3-haiku']
    const currentId = typeof selectedModelValue === 'object' ? selectedModelValue?.id : selectedModelValue
    return subIds.includes(currentId) && apiKeys.anthropic
  }, [selectedModelValue, apiKeys.anthropic])

  // MODEL-03: Check if new model will use OpenRouter (paid)
  const willUseOpenRouter = useCallback((newModel) => {
    const subIds = ['claude-opus-4.5', 'claude-sonnet-4.5', 'claude-3.5-sonnet', 'claude-3-opus', 'claude-3-haiku']
    if (subIds.includes(newModel.id) && apiKeys.anthropic) return false
    return true
  }, [apiKeys.anthropic])

  const shouldShowBillingWarning = () => {
    return localStorage.getItem('hide_billing_switch_warning') !== 'true'
  }

  // Handle model change from ModelSelector — intercept for billing warnings
  const handleModelChange = useCallback((newModel) => {
    // Re-check API keys in case they changed
    refreshApiKeys()

    // Check if model requires API key that's not available
    const openrouterKey = localStorage.getItem('openrouter_api_key') || localStorage.getItem('openrouter_key')
    const subIds = ['claude-opus-4.5', 'claude-sonnet-4.5', 'claude-3.5-sonnet', 'claude-3-opus', 'claude-3-haiku']
    const isSubModel = subIds.includes(newModel.id)

    if (!isSubModel && !openrouterKey) {
      setPendingModel(newModel)
      setShowNotification(true)
      return
    }

    // MODEL-03: Detect billing source switch (Pro → OpenRouter)
    if (isCurrentModelPro() && willUseOpenRouter(newModel) && shouldShowBillingWarning()) {
      setPendingModel(newModel)
      setShowBillingWarning(true)
      return
    }

    setSelectedModelValue(newModel.id || newModel)
    onModelChange?.(newModel)
  }, [isCurrentModelPro, willUseOpenRouter, onModelChange, refreshApiKeys])

  const handleConfirmModel = () => {
    if (pendingModel) {
      setSelectedModelValue(pendingModel.id || pendingModel)
      onModelChange?.(pendingModel)
      setPendingModel(null)
    }
    setShowNotification(false)
  }

  const handleCancelModel = () => {
    setPendingModel(null)
    setShowNotification(false)
  }

  const handleConfirmBillingSwitch = () => {
    if (pendingModel) {
      setSelectedModelValue(pendingModel.id || pendingModel)
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

      {/* W-11 to W-28: Model Selector or Claude Code badge */}
      {!collapsed && (
        isConnected && claudeCodeStatus?.installed ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 14px',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '8px'
          }}>
            <span style={{ color: '#10b981', fontSize: '10px' }}>●</span>
            <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>Claude Code</span>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#10b981',
              background: 'rgba(16,185,129,0.15)',
              padding: '2px 8px',
              borderRadius: '4px',
              letterSpacing: '0.5px'
            }}>PRO</span>
          </div>
        ) : (
          <ModelSelector
            value={selectedModelValue}
            onChange={handleModelChange}
            apiKeys={apiKeys}
            claudeCodeStatus={claudeCodeStatus}
            isConnected={isConnected}
          />
        )
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
