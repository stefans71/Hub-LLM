import { useState, useRef, useEffect } from 'react'
import {
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  ExternalLink,
  RefreshCw,
  ChevronLeft
} from 'lucide-react'

/**
 * PreviewPanel Component
 *
 * Displays a preview iframe for Codespaces or other web previews.
 * Features:
 * - Collapsible panel
 * - Device viewport switching (phone, tablet, desktop, fit)
 * - Toolbar with URL, refresh, and open in new tab
 */
export default function PreviewPanel({
  previewUrl = '',
  collapsed = true,
  onCollapsedChange,
  width = 400
}) {
  const [deviceMode, setDeviceMode] = useState('fit') // 'phone', 'tablet', 'desktop', 'fit'
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeUrl, setActiveUrl] = useState(previewUrl || '')
  const [inputUrl, setInputUrl] = useState(previewUrl || '')
  const iframeRef = useRef(null)

  // Sync from prop when parent sets a URL (e.g., Codespaces)
  useEffect(() => {
    if (previewUrl) {
      setActiveUrl(previewUrl)
      setInputUrl(previewUrl)
    }
  }, [previewUrl])

  const handleToggle = () => {
    onCollapsedChange?.(!collapsed)
  }

  const handleNavigate = (url) => {
    let normalized = url.trim()
    if (!normalized) return
    // Add https:// if no protocol specified
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized
    }
    setActiveUrl(normalized)
    setInputUrl(normalized)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    if (iframeRef.current) {
      // eslint-disable-next-line no-self-assign
      iframeRef.current.src = iframeRef.current.src
    }
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleOpenInNewTab = () => {
    if (activeUrl) {
      window.open(activeUrl, '_blank')
    }
  }

  const getFrameStyles = () => {
    switch (deviceMode) {
      case 'phone':
        return { width: '375px', minWidth: '375px', maxWidth: '375px' }
      case 'tablet':
        return { width: '768px', minWidth: '768px', maxWidth: '768px' }
      case 'desktop':
        return { width: '1280px', minWidth: '1280px', maxWidth: '1280px' }
      default: // fit
        return { width: '100%', maxWidth: '100%' }
    }
  }

  const getDeviceLabel = () => {
    switch (deviceMode) {
      case 'phone': return '375px'
      case 'tablet': return '768px'
      case 'desktop': return '1280px'
      default: return 'Fit'
    }
  }

  return (
    <div
      className="preview-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-secondary)',
        position: 'relative',
        overflow: 'hidden',
        flex: 'none',
        ...(collapsed ? {
          width: '60px',
          minWidth: '60px',
          maxWidth: '60px'
        } : {
          width: `${width}px`,
          minWidth: '200px'
        })
      }}
    >
      {/* Collapsed state - vertical "Live Preview" label */}
      {collapsed && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '16px 8px',
          gap: '8px'
        }}>
          <span style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}>
            Live Preview
          </span>
          <button
            onClick={handleToggle}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '8px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronLeft size={14} />
          </button>
        </div>
      )}

      {/* Expanded state */}
      {!collapsed && (
        <>
          {/* Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderBottom: '1px solid var(--border)'
          }}>
            {/* Device icons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              paddingRight: '8px',
              borderRight: '1px solid var(--border)',
              marginRight: '8px'
            }}>
              <DeviceButton
                icon={<Smartphone size={16} />}
                title="Phone (375px)"
                active={deviceMode === 'phone'}
                onClick={() => setDeviceMode('phone')}
              />
              <DeviceButton
                icon={<Tablet size={16} />}
                title="Tablet (768px)"
                active={deviceMode === 'tablet'}
                onClick={() => setDeviceMode('tablet')}
              />
              <DeviceButton
                icon={<Monitor size={16} />}
                title="Desktop (1280px)"
                active={deviceMode === 'desktop'}
                onClick={() => setDeviceMode('desktop')}
              />
              <DeviceButton
                icon={<Maximize2 size={16} />}
                title="Fit to panel"
                active={deviceMode === 'fit'}
                onClick={() => setDeviceMode('fit')}
              />
              <span style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                marginLeft: '4px'
              }}>
                {getDeviceLabel()}
              </span>
            </div>

            {/* Traffic light dots */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />
            </div>

            {/* URL bar */}
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleNavigate(inputUrl)
                }
              }}
              placeholder="Enter URL and press Enter..."
              style={{
                flex: 1,
                padding: '4px 8px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontSize: '12px',
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />

            {/* Actions */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <ActionButton
                icon={<ExternalLink size={14} />}
                title="Open in new tab"
                onClick={handleOpenInNewTab}
                disabled={!activeUrl}
              />
              <ActionButton
                icon={<RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />}
                title="Refresh"
                onClick={handleRefresh}
              />
            </div>
          </div>

          {/* Preview frame container */}
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '16px',
            overflow: 'auto',
            background: 'var(--bg-tertiary)'
          }}>
            <div
              style={{
                background: 'white',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '400px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                flexShrink: 0,
                overflow: 'hidden',
                transition: 'width 0.2s ease',
                ...getFrameStyles()
              }}
            >
              {activeUrl ? (
                <iframe
                  ref={iframeRef}
                  src={activeUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    flex: 1,
                    minHeight: '400px',
                    opacity: isRefreshing ? 0.5 : 1,
                    transition: 'opacity 0.3s'
                  }}
                  title="Live Preview"
                />
              ) : (
                <DemoPreview />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Device button component
function DeviceButton({ icon, title, active, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '4px 8px',
        background: active ? 'var(--primary)' : (hovered ? 'var(--bg-tertiary)' : 'transparent'),
        border: 'none',
        color: active ? 'white' : (hovered ? 'var(--text-primary)' : 'var(--text-secondary)'),
        cursor: 'pointer',
        borderRadius: '4px',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {icon}
    </button>
  )
}

// Action button component
function ActionButton({ icon, title, onClick, disabled }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '6px',
        background: hovered && !disabled ? 'var(--bg-tertiary)' : 'transparent',
        border: 'none',
        color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1
      }}
    >
      {icon}
    </button>
  )
}

// Demo preview content when no URL is provided
function DemoPreview() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      color: '#1a1a1a',
      textAlign: 'center',
      flex: 1,
      minHeight: '400px'
    }}>
      {/* Logo placeholder */}
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        marginBottom: '24px'
      }} />

      <h1 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '12px'
      }}>
        Build faster with{' '}
        <span style={{
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          AI
        </span>
      </h1>

      <p style={{
        color: '#6b7280',
        maxWidth: '400px',
        marginBottom: '32px',
        fontSize: '16px',
        lineHeight: 1.6
      }}>
        The ultimate workspace for developers looking to integrate LLMs into their production environment seamlessly.
      </p>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button style={{
          padding: '12px 24px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          Get Started
        </button>
        <button style={{
          padding: '12px 24px',
          background: 'transparent',
          color: '#374151',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          Documentation
        </button>
      </div>
    </div>
  )
}
