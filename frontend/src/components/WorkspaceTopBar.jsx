import { useState, useRef, useEffect } from 'react'
import { Package, ChevronUp, ChevronDown } from 'lucide-react'

/**
 * WorkspaceTopBar Component (W-03)
 *
 * Contains:
 * - W-04: Project Info Container (W-05: Project Name, W-06: Location Badge)
 * - W-07: Divider
 * - W-08: Connection Status
 * - W-09/W-10: Header Toggle Button
 * - W-11 to W-28: Model Selector with Dropdown
 * - W-29: Export Button
 */
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
  return modelDisplayMap[modelId] || { name: 'Claude Opus 4.5', color: '#ef4444' }
}

export default function WorkspaceTopBar({
  project,
  model,
  onModelChange,
  isConnected = true,
  onConnectionToggle,
  onExport
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState(() => getModelDisplay(model))
  const dropdownRef = useRef(null)

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

  const handleModelSelect = (name, color) => {
    const newModel = { name, color }
    setSelectedModel(newModel)
    setDropdownOpen(false)
    onModelChange?.(newModel)
  }

  const toggleHeader = () => {
    setCollapsed(!collapsed)
  }

  // Determine location type from project
  const getLocationType = () => {
    if (!project) return { type: 'local', label: 'Local', icon: null }
    if (project.vps) return { type: 'vps', label: `VPS: ${project.vps.name} (${project.vps.ip})`, icon: 'server' }
    if (project.github) return { type: 'github', label: `GitHub: ${project.github}`, icon: 'github' }
    return { type: 'local', label: 'Local', icon: null }
  }

  const location = getLocationType()

  // Model options organized by provider
  const modelOptions = [
    {
      section: 'Anthropic (Subscription)',
      models: [
        { name: 'Claude Opus 4.5', color: '#ef4444' },
        { name: 'Claude Sonnet 4.5', color: '#ef4444' },
        { name: 'Claude 3.5 Sonnet', color: '#ef4444' },
        { name: 'Claude 3 Opus', color: '#ef4444' },
        { name: 'Claude 3 Haiku', color: '#ef4444' }
      ]
    },
    {
      section: 'OpenRouter (API Key Required)',
      models: [
        { name: 'GPT-4o', color: '#22c55e', paid: true },
        { name: 'GPT-4 Turbo', color: '#22c55e', paid: true },
        { name: 'GPT-5.2 Codex', color: '#22c55e', paid: true }
      ],
      addKeyLink: true
    },
    {
      section: 'Google (Coming Soon)',
      models: [
        { name: 'Gemini Pro', color: '#4285f4', disabled: true, comingSoon: true }
      ]
    }
  ]

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
        overflow: collapsed ? 'visible' : 'hidden',
        transition: 'height 0.2s ease, padding 0.2s ease'
      }}
    >
      {/* W-04: Project Info Container */}
      {!collapsed && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* W-05: Project Name */}
            <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
              {project?.name || 'Untitled Project'}
            </span>

            {/* W-06: Location Badge */}
            <span
              className={`workspace-location ${location.type}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                background: location.type === 'vps' ? 'rgba(139, 92, 246, 0.2)' :
                           location.type === 'github' ? 'rgba(59, 130, 246, 0.2)' :
                           'rgba(34, 197, 94, 0.2)',
                color: location.type === 'vps' ? '#a78bfa' :
                       location.type === 'github' ? 'var(--primary)' :
                       'var(--success)'
              }}
            >
              {location.type === 'vps' && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                  <line x1="6" y1="6" x2="6.01" y2="6"></line>
                  <line x1="6" y1="18" x2="6.01" y2="18"></line>
                </svg>
              )}
              {location.label}
            </span>
          </div>

          {/* W-07: Divider */}
          <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>

          {/* W-08: Connection Status */}
          <div
            className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}
            onClick={onConnectionToggle}
            title={isConnected ? 'Click to disconnect' : 'Click to reconnect'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              background: isConnected ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: isConnected ? 'var(--success)' : 'var(--error)'
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'currentColor'
            }}></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </>
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

          {/* W-14: Dropdown Arrow */}
          <span style={{ color: 'var(--text-secondary)' }}>▼</span>

          {/* W-15 to W-28: Model Dropdown */}
          {dropdownOpen && (
            <div
              className="model-dropdown"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                minWidth: '220px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                marginTop: '4px',
                overflow: 'hidden',
                zIndex: 1000
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {modelOptions.map((group, groupIdx) => (
                <div key={groupIdx}>
                  {/* Section Header */}
                  <div style={{
                    padding: '8px 12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    background: 'var(--bg-tertiary)'
                  }}>
                    {group.section}
                  </div>

                  {/* Model Options */}
                  {group.models.map((m, idx) => (
                    <div
                      key={idx}
                      className={`model-dropdown-item ${selectedModel.name === m.name ? 'active' : ''} ${m.disabled ? 'disabled' : ''}`}
                      onClick={() => !m.disabled && handleModelSelect(m.name, m.color)}
                      style={{
                        padding: '8px 12px',
                        fontSize: '13px',
                        cursor: m.disabled ? 'not-allowed' : 'pointer',
                        color: m.paid ? 'var(--text-muted)' : m.disabled ? 'var(--text-muted)' : 'var(--text-primary)',
                        background: selectedModel.name === m.name ? 'var(--bg-tertiary)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => !m.disabled && (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                      onMouseLeave={(e) => selectedModel.name !== m.name && (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>{m.name}{m.comingSoon ? ' — Coming Soon' : ''}</span>
                      {m.paid && (
                        <span style={{
                          fontSize: '10px',
                          background: 'var(--warning, #f97316)',
                          color: '#000',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          Paid
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Add API Key Link */}
                  {group.addKeyLink && (
                    <div
                      style={{
                        padding: '8px 12px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        color: 'var(--primary)'
                      }}
                      onClick={() => window.location.href = '/settings'}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      🔑 Add OpenRouter API Key...
                    </div>
                  )}
                </div>
              ))}
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
    </div>
  )
}
