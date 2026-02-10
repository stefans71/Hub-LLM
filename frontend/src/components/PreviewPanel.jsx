import { useState, useRef, useEffect } from 'react'
import {
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  BookOpen
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
  width = 400,
  onUrlChange,
  dragging = false
}) {
  const [deviceMode, setDeviceMode] = useState('fit') // 'phone', 'tablet', 'desktop', 'fit'
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeUrl, setActiveUrl] = useState(previewUrl || '')
  const [inputUrl, setInputUrl] = useState(previewUrl || '')
  // FEAT-63: Full-bleed for ALL content in Fit mode (not just /docs/).
  // Phone/tablet/desktop modes get centered device frame.
  const isFullBleed = deviceMode === 'fit'
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
    // BUG-55: Notify parent when URL changes (for welcome page persistence)
    onUrlChange?.(normalized)
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
      {/* Drag overlay — prevents iframe from stealing mouse events during resize */}
      {dragging && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 10,
          cursor: 'col-resize'
        }} />
      )}

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
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
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
                fontFamily: 'inherit',
                transition: 'border-color 0.15s ease'
              }}
            />

            {/* Actions */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button
                onClick={() => { const url = previewUrl || '/docs/index.html'; setActiveUrl(url); setInputUrl(url) }}
                title="Open documentation"
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '4px 10px', background: 'transparent',
                  border: '1px solid var(--border)', borderRadius: '4px',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                  fontSize: '11px', fontFamily: 'inherit'
                }}
              >
                <BookOpen size={13} />
                <span>Docs</span>
              </button>
              <button
                onClick={handleOpenInNewTab}
                disabled={!activeUrl}
                title="Open in new tab for Chrome DevTools"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  background: activeUrl ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                  border: activeUrl ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid transparent',
                  borderRadius: '4px',
                  color: activeUrl ? '#38bdf8' : 'var(--text-muted)',
                  cursor: activeUrl ? 'pointer' : 'not-allowed',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  opacity: activeUrl ? 1 : 0.5,
                  whiteSpace: 'nowrap'
                }}
              >
                <ExternalLink size={13} />
                <span>Open in Browser</span>
              </button>
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
            justifyContent: isFullBleed ? 'stretch' : 'center',
            alignItems: isFullBleed ? 'stretch' : 'flex-start',
            padding: isFullBleed ? 0 : '16px',
            overflow: 'auto',
            background: 'var(--bg-tertiary)'
          }}>
            <div
              style={{
                background: isFullBleed ? 'transparent' : 'white',
                borderRadius: isFullBleed ? 0 : '8px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: isFullBleed ? 0 : '400px',
                boxShadow: isFullBleed ? 'none' : '0 4px 20px rgba(0,0,0,0.3)',
                flexShrink: 0,
                overflow: isFullBleed ? 'auto' : 'hidden',
                transition: 'width 0.2s ease',
                ...getFrameStyles(),
                ...(isFullBleed ? { height: '100%' } : {})
              }}
            >
              <iframe
                ref={iframeRef}
                src={activeUrl || previewUrl || '/docs/index.html'}
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

