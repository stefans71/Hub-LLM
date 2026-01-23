import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard,
  Lock,
  Key,
  User,
  Palette,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

// CSS Variables matching mockup
const cssVars = {
  bgPrimary: '#0f1419',
  bgSecondary: '#1a2028',
  bgTertiary: '#242b35',
  border: '#2d3748',
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  accent: '#f97316',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#eab308',
  textPrimary: '#ffffff',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280'
}

// Sidebar Navigation Item
function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        cursor: 'pointer',
        borderRadius: '6px',
        fontSize: '13px',
        color: active ? cssVars.textPrimary : cssVars.textSecondary,
        background: active ? cssVars.bgTertiary : 'transparent',
        transition: 'all 0.15s ease'
      }}
      onMouseEnter={(e) => {
        if (!active) e.target.style.background = cssVars.bgSecondary
      }}
      onMouseLeave={(e) => {
        if (!active) e.target.style.background = 'transparent'
      }}
    >
      <Icon size={14} style={{ opacity: 0.7 }} />
      {label}
    </div>
  )
}

// Section Header
function SectionHeader({ label }) {
  return (
    <div style={{
      fontSize: '10px',
      textTransform: 'uppercase',
      color: cssVars.textMuted,
      padding: '8px 12px 4px 12px',
      marginTop: '8px'
    }}>
      {label}
    </div>
  )
}

// Profile Settings Section
function ProfileSettings({ user, getAuthHeader }) {
  const [displayName, setDisplayName] = useState('')
  const [aiAlias, setAiAlias] = useState('Claude')
  const [email, setEmail] = useState('')
  const [timezone, setTimezone] = useState('America/Los_Angeles')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  // Load user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.name || '')
      setEmail(user.email || '')
    }
    // Load AI alias from localStorage
    const savedAlias = localStorage.getItem('ai_assistant_alias')
    if (savedAlias) setAiAlias(savedAlias)

    // Load timezone from localStorage
    const savedTimezone = localStorage.getItem('user_timezone')
    if (savedTimezone) setTimezone(savedTimezone)
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // Save profile to backend
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          name: displayName,
          email: email
        })
      })

      if (!res.ok) {
        throw new Error('Failed to update profile')
      }

      // Save local preferences
      localStorage.setItem('ai_assistant_alias', aiAlias)
      localStorage.setItem('user_timezone', timezone)

      setMessage({ type: 'success', text: 'Profile saved successfully!' })
    } catch (err) {
      console.error('Failed to save profile:', err)
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (displayName) {
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  const timezones = [
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'America/Chicago', label: 'America/Chicago (CST)' },
    { value: 'America/Denver', label: 'America/Denver (MST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
    { value: 'Europe/Berlin', label: 'Europe/Berlin (CET)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
    { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (AEDT)' },
    { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZDT)' }
  ]

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Profile</h2>
      <p style={{ color: cssVars.textSecondary, fontSize: '14px', marginBottom: '24px' }}>
        Manage your profile information and preferences.
      </p>

      <div style={{
        background: cssVars.bgTertiary,
        borderRadius: '12px',
        padding: '24px'
      }}>
        {/* Avatar and Name Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={displayName || 'User'}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%'
              }}
            />
          ) : (
            <div style={{
              width: '80px',
              height: '80px',
              background: cssVars.primary,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: '600',
              color: 'white'
            }}>
              {getInitials()}
            </div>
          )}
          <div>
            <div style={{ fontSize: '20px', fontWeight: '600' }}>{displayName || 'User'}</div>
            <div style={{ color: cssVars.textSecondary }}>{email}</div>
            <div style={{ marginTop: '8px' }}>
              <span style={{
                background: cssVars.primary,
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '500'
              }}>
                {user?.subscription_tier === 'pro' ? 'PRO ACCOUNT' : 'FREE ACCOUNT'}
              </span>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Display Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '6px'
            }}>
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: cssVars.bgSecondary,
                border: `1px solid ${cssVars.border}`,
                borderRadius: '8px',
                color: cssVars.textPrimary,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* AI Assistant Alias */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '6px'
            }}>
              AI Assistant Alias
            </label>
            <input
              type="text"
              value={aiAlias}
              onChange={(e) => setAiAlias(e.target.value)}
              placeholder="e.g., Claude, Cortana, Jarvis..."
              style={{
                width: '100%',
                padding: '10px 12px',
                background: cssVars.bgSecondary,
                border: `1px solid ${cssVars.border}`,
                borderRadius: '8px',
                color: cssVars.textPrimary,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ fontSize: '12px', color: cssVars.textMuted, marginTop: '4px' }}>
              What should the AI call itself when responding?
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '6px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: cssVars.bgSecondary,
                border: `1px solid ${cssVars.border}`,
                borderRadius: '8px',
                color: cssVars.textPrimary,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Timezone */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '6px'
            }}>
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: cssVars.bgSecondary,
                border: `1px solid ${cssVars.border}`,
                borderRadius: '8px',
                color: cssVars.textPrimary,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Save Button and Message */}
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: saving ? cssVars.bgSecondary : cssVars.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Profile
              </>
            )}
          </button>

          {message && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: message.type === 'success' ? cssVars.success : cssVars.error
            }}>
              {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// API Keys Settings Section
function APIKeysSettings() {
  const [openrouterKey, setOpenrouterKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [message, setMessage] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [accountInfo, setAccountInfo] = useState(null)

  useEffect(() => {
    const savedKey = localStorage.getItem('openrouter_api_key') || localStorage.getItem('openrouter_key') || ''
    setOpenrouterKey(savedKey)
  }, [])

  const handleSave = () => {
    localStorage.setItem('openrouter_api_key', openrouterKey)
    localStorage.setItem('openrouter_key', openrouterKey) // Also save to legacy key
    setMessage({ type: 'success', text: 'API key saved successfully!' })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleRemove = () => {
    setOpenrouterKey('')
    setAccountInfo(null)
    localStorage.removeItem('openrouter_api_key')
    localStorage.removeItem('openrouter_key')
    setMessage({ type: 'success', text: 'API key removed.' })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleVerify = async () => {
    if (!openrouterKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter an API key first.' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    setVerifying(true)
    setMessage(null)
    setAccountInfo(null)

    try {
      const res = await fetch('/api/stats/verify-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-OpenRouter-Key': openrouterKey
        }
      })

      const data = await res.json()

      if (data.valid) {
        setAccountInfo(data)
        setMessage({ type: 'success', text: 'API key verified successfully!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Invalid API key' })
      }
    } catch (err) {
      console.error('Verification failed:', err)
      setMessage({ type: 'error', text: 'Failed to verify API key. Please try again.' })
    } finally {
      setVerifying(false)
    }
  }

  const maskKey = (key) => {
    if (!key || key.length < 12) return key
    return key.slice(0, 8) + '****' + key.slice(-4)
  }

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>API Keys</h2>
      <p style={{ color: cssVars.textSecondary, fontSize: '14px', marginBottom: '24px' }}>
        Connect your API keys to access different LLM providers. Keys are stored securely in your browser and never shared.
      </p>

      {/* OpenRouter Key */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        background: cssVars.bgTertiary,
        borderRadius: '12px',
        gap: '16px',
        marginBottom: '12px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'rgba(249, 115, 22, 0.2)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          🔶
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '500', marginBottom: '4px' }}>OpenRouter</div>
          <div style={{
            fontSize: '13px',
            color: openrouterKey ? cssVars.success : cssVars.textMuted
          }}>
            {openrouterKey ? `● Connected - ${maskKey(openrouterKey)}` : '○ Not connected'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {openrouterKey && (
            <button
              onClick={handleRemove}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                background: cssVars.bgSecondary,
                border: `1px solid ${cssVars.border}`,
                borderRadius: '6px',
                color: cssVars.textPrimary,
                cursor: 'pointer'
              }}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Input for OpenRouter */}
      <div style={{
        background: cssVars.bgTertiary,
        borderRadius: '12px',
        padding: '20px'
      }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '500',
          marginBottom: '8px'
        }}>
          OpenRouter API Key
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type={showKey ? 'text' : 'password'}
            value={openrouterKey}
            onChange={(e) => {
              setOpenrouterKey(e.target.value)
              setAccountInfo(null)  // Reset account info when key changes
            }}
            placeholder="sk-or-v1-..."
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '10px 12px',
              background: cssVars.bgSecondary,
              border: `1px solid ${cssVars.border}`,
              borderRadius: '8px',
              color: cssVars.textPrimary,
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button
            onClick={() => setShowKey(!showKey)}
            style={{
              padding: '10px 12px',
              background: cssVars.bgSecondary,
              border: `1px solid ${cssVars.border}`,
              borderRadius: '8px',
              color: cssVars.textPrimary,
              cursor: 'pointer'
            }}
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
          <button
            onClick={handleVerify}
            disabled={verifying}
            style={{
              padding: '10px 16px',
              background: cssVars.bgSecondary,
              border: `1px solid ${cssVars.border}`,
              borderRadius: '8px',
              color: cssVars.textPrimary,
              cursor: verifying ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {verifying ? (
              <>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              background: cssVars.primary,
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
        </div>
        <p style={{ fontSize: '12px', color: cssVars.textMuted, marginTop: '8px' }}>
          Get your key at{' '}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: cssVars.primary }}
          >
            openrouter.ai/keys
          </a>
        </p>

        {message && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: message.type === 'success' ? cssVars.success : cssVars.error,
            marginTop: '12px'
          }}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        {/* Account Info Display */}
        {accountInfo && accountInfo.valid && (
          <div style={{
            marginTop: '16px',
            padding: '16px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '8px',
            border: `1px solid ${cssVars.success}30`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
              color: cssVars.success
            }}>
              <CheckCircle size={18} />
              <span style={{ fontWeight: '600' }}>Key Verified</span>
            </div>
            <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
              {accountInfo.label && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: cssVars.textSecondary }}>Label:</span>
                  <span style={{ color: cssVars.textPrimary }}>{accountInfo.label}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: cssVars.textSecondary }}>Usage:</span>
                <span style={{ color: cssVars.textPrimary }}>
                  ${accountInfo.usage_usd?.toFixed(4) || '0.0000'}
                  {accountInfo.limit_usd && ` / $${accountInfo.limit_usd.toFixed(2)}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: cssVars.textSecondary }}>Tier:</span>
                <span style={{
                  color: accountInfo.is_free_tier ? cssVars.warning : cssVars.success,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {accountInfo.is_free_tier ? '🆓 Free Tier' : '✨ Paid Account'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info box */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '8px',
        borderLeft: `3px solid ${cssVars.primary}`
      }}>
        <div style={{ fontSize: '13px', color: cssVars.textSecondary }}>
          <strong>Note:</strong> Your API keys are stored locally in your browser and are sent directly to the providers. We never store your keys on our servers.
        </div>
      </div>
    </div>
  )
}

// Appearance Settings Section
function AppearanceSettings() {
  const [theme, setTheme] = useState('dark')
  const [compactMode, setCompactMode] = useState(false)
  const [showLineNumbers, setShowLineNumbers] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    const savedCompact = localStorage.getItem('compact_mode') === 'true'
    const savedLineNumbers = localStorage.getItem('show_line_numbers') !== 'false'

    setTheme(savedTheme)
    setCompactMode(savedCompact)
    setShowLineNumbers(savedLineNumbers)
  }, [])

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const handleToggleCompact = () => {
    const newValue = !compactMode
    setCompactMode(newValue)
    localStorage.setItem('compact_mode', newValue.toString())
  }

  const handleToggleLineNumbers = () => {
    const newValue = !showLineNumbers
    setShowLineNumbers(newValue)
    localStorage.setItem('show_line_numbers', newValue.toString())
  }

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Appearance</h2>
      <p style={{ color: cssVars.textSecondary, fontSize: '14px', marginBottom: '24px' }}>
        Customize the look and feel of HubLLM.
      </p>

      <div style={{
        background: cssVars.bgTertiary,
        borderRadius: '12px',
        padding: '24px'
      }}>
        {/* Theme Selection */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontWeight: '500', marginBottom: '12px' }}>Theme</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Dark Mode */}
            <div
              onClick={() => handleThemeChange('dark')}
              style={{
                flex: 1,
                padding: '20px',
                background: '#1a1a2e',
                border: `2px solid ${theme === 'dark' ? cssVars.primary : cssVars.border}`,
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌙</div>
              <div style={{ fontWeight: '500' }}>Dark Mode</div>
              <div style={{ fontSize: '12px', color: cssVars.textSecondary }}>
                {theme === 'dark' ? 'Active' : 'Click to activate'}
              </div>
            </div>

            {/* Light Mode */}
            <div
              onClick={() => handleThemeChange('light')}
              style={{
                flex: 1,
                padding: '20px',
                background: '#f5f5f5',
                border: `2px solid ${theme === 'light' ? cssVars.primary : cssVars.border}`,
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'center',
                color: '#333'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>☀️</div>
              <div style={{ fontWeight: '500' }}>Light Mode</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {theme === 'light' ? 'Active' : 'Click to activate'}
              </div>
            </div>

            {/* System */}
            <div
              onClick={() => handleThemeChange('system')}
              style={{
                flex: 1,
                padding: '20px',
                background: 'linear-gradient(135deg, #1a1a2e 50%, #f5f5f5 50%)',
                border: `2px solid ${theme === 'system' ? cssVars.primary : cssVars.border}`,
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>💻</div>
              <div style={{ fontWeight: '500' }}>System</div>
              <div style={{ fontSize: '12px', color: cssVars.textSecondary }}>
                {theme === 'system' ? 'Active' : 'Match OS'}
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Options */}
        <div style={{ borderTop: `1px solid ${cssVars.border}`, paddingTop: '20px' }}>
          {/* Compact Mode */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div>
              <div style={{ fontWeight: '500' }}>Compact Mode</div>
              <div style={{ fontSize: '13px', color: cssVars.textSecondary }}>
                Reduce spacing for more content
              </div>
            </div>
            <div
              onClick={handleToggleCompact}
              style={{
                width: '48px',
                height: '28px',
                background: compactMode ? cssVars.primary : cssVars.bgSecondary,
                borderRadius: '14px',
                position: 'relative',
                cursor: 'pointer',
                border: compactMode ? 'none' : `1px solid ${cssVars.border}`,
                transition: 'background 0.2s ease'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: compactMode ? '2px' : '1px',
                right: compactMode ? '2px' : 'auto',
                left: compactMode ? 'auto' : '2px',
                transition: 'all 0.2s ease'
              }} />
            </div>
          </div>

          {/* Show Line Numbers */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: '500' }}>Show Line Numbers</div>
              <div style={{ fontSize: '13px', color: cssVars.textSecondary }}>
                Display line numbers in code blocks
              </div>
            </div>
            <div
              onClick={handleToggleLineNumbers}
              style={{
                width: '48px',
                height: '28px',
                background: showLineNumbers ? cssVars.primary : cssVars.bgSecondary,
                borderRadius: '14px',
                position: 'relative',
                cursor: 'pointer',
                border: showLineNumbers ? 'none' : `1px solid ${cssVars.border}`,
                transition: 'background 0.2s ease'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: showLineNumbers ? '2px' : '1px',
                right: showLineNumbers ? '2px' : 'auto',
                left: showLineNumbers ? 'auto' : '2px',
                transition: 'all 0.2s ease'
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Settings Page
export default function Settings({ onBack }) {
  const { user, getAuthHeader } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings user={user} getAuthHeader={getAuthHeader} />
      case 'apikeys':
        return <APIKeysSettings />
      case 'appearance':
        return <AppearanceSettings />
      default:
        return <ProfileSettings user={user} getAuthHeader={getAuthHeader} />
    }
  }

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      background: cssVars.bgPrimary,
      color: cssVars.textPrimary
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: cssVars.bgSecondary,
        borderRight: `1px solid ${cssVars.border}`,
        padding: '16px 8px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <nav style={{ flex: 1 }}>
          {/* Back to Dashboard */}
          <div
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              borderRadius: '6px',
              fontSize: '13px',
              color: cssVars.textSecondary,
              marginBottom: '16px'
            }}
            onMouseEnter={(e) => e.target.style.background = cssVars.bgTertiary}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </div>

          {/* Main Section */}
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: cssVars.textMuted,
            padding: '8px 12px',
            textTransform: 'uppercase'
          }}>
            Main
          </div>
          <NavItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={false}
            onClick={onBack}
          />

          {/* Account Section */}
          <SectionHeader label="Account" />
          <NavItem
            icon={User}
            label="Profile"
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          />
          <NavItem
            icon={Key}
            label="API Keys"
            active={activeTab === 'apikeys'}
            onClick={() => setActiveTab('apikeys')}
          />
          <NavItem
            icon={Palette}
            label="Appearance"
            active={activeTab === 'appearance'}
            onClick={() => setActiveTab('appearance')}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        overflow: 'auto',
        padding: '32px'
      }}>
        <div style={{ maxWidth: '700px' }}>
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
