import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'

/**
 * ModelNotification Component (M-01 to M-09)
 *
 * Modal shown when user selects a model that uses a different provider.
 * Elements:
 * - M-01: Overlay
 * - M-02: Modal container
 * - M-03: Header
 * - M-04: Icon (orange)
 * - M-05: Title
 * - M-06: Body text
 * - M-07: Actions container
 * - M-08: Cancel button
 * - M-09: Confirm button
 * - MODEL-03: "Don't show again" checkbox
 */
export default function ModelNotification({
  isOpen,
  onClose,
  onConfirm,
  title = 'Using OpenRouter API Key',
  body = "You're selecting a model that will use your OpenRouter API key.",
  iconColor = 'rgba(249, 115, 22, 0.2)',
  showDontShowAgain = false,
  onDontShowAgainChange
}) {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  if (!isOpen) return null

  const handleConfirm = () => {
    if (showDontShowAgain && dontShowAgain) {
      onDontShowAgainChange?.(true)
    }
    onConfirm()
  }

  const handleCheckboxChange = (e) => {
    setDontShowAgain(e.target.checked)
  }

  return (
    <>
      {/* M-01: Overlay */}
      <div
        className="model-notification-overlay show"
        id="model-notification-overlay"
        onClick={onClose}
      />

      {/* M-02: Modal */}
      <div className="model-notification show" id="model-notification">
        {/* M-03: Header */}
        <div className="model-notification-header">
          {/* M-04: Icon */}
          <div
            className="model-notification-icon"
            id="model-notification-icon"
            style={{ background: iconColor }}
          >
            <AlertTriangle size={20} />
          </div>
          {/* M-05: Title */}
          <div className="model-notification-title" id="model-notification-title">
            {title}
          </div>
        </div>

        {/* M-06: Body */}
        <div className="model-notification-body" id="model-notification-body">
          {body}
        </div>

        {/* MODEL-03: Don't show again checkbox */}
        {showDontShowAgain && (
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            marginTop: '12px',
            marginBottom: '4px'
          }}>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={handleCheckboxChange}
              style={{
                width: '16px',
                height: '16px',
                cursor: 'pointer',
                accentColor: 'var(--primary)'
              }}
            />
            Don't show this warning again
          </label>
        )}

        {/* M-07: Actions */}
        <div className="model-notification-actions">
          {/* M-08: Cancel Button */}
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          {/* M-09: Confirm Button */}
          <button
            className="btn btn-primary"
            id="model-notification-confirm"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </>
  )
}
