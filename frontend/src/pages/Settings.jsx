import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AnthropicSubscription from '../components/AnthropicSubscription'
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
  AlertCircle,
  Plug,
  Database,
  Link2,
  Settings as SettingsIcon,
  X,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  LogOut,
  Bot,
  FileText,
  Shield,
  FlaskConical,
  Server,
  Monitor,
  Eye,
  EyeOff,
  Mic,
  Book
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
function ProfileSettings({ user, getAuthHeader, onLogout }) {
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

      {/* Sign Out Section */}
      <div style={{
        background: cssVars.bgTertiary,
        borderRadius: '12px',
        padding: '24px',
        marginTop: '24px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Sign Out</h3>
        <p style={{ color: cssVars.textSecondary, fontSize: '14px', marginBottom: '16px' }}>
          Sign out of your account on this device. You can sign back in at any time.
        </p>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'transparent',
            color: cssVars.error,
            border: `1px solid ${cssVars.error}`,
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = cssVars.error
            e.target.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent'
            e.target.style.color = cssVars.error
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  )
}

// Default Model Settings Section (S-97 to S-106)
function DefaultModelSettings() {
  const [selectedModel, setSelectedModel] = useState('claude-opus-4.5')
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const savedModel = localStorage.getItem('default_model') || 'claude-opus-4.5'
    setSelectedModel(savedModel)
  }, [])

  const handleSave = () => {
    localStorage.setItem('default_model', selectedModel)
    setMessage({ type: 'success', text: 'Default model saved successfully!' })
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div>
      {/* S-98: Section Title */}
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Default Model</h2>

      {/* S-99: Section Description */}
      <p style={{ color: cssVars.textSecondary, fontSize: '14px', marginBottom: '24px' }}>
        Choose the default AI model for new projects. Your Anthropic subscription provides access to all Claude models. Other models require OpenRouter.
      </p>

      {/* S-100: Model Select Group */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {/* S-101: Model Select Dropdown */}
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 12px',
            background: cssVars.bgTertiary,
            border: `1px solid ${cssVars.border}`,
            borderRadius: '8px',
            color: cssVars.textPrimary,
            fontSize: '14px',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          {/* S-102: Anthropic Option Group */}
          <optgroup label="Anthropic (Subscription - Included)" style={{ background: cssVars.bgSecondary }}>
            <option value="claude-opus-4.5">Claude Opus 4.5</option>
            <option value="claude-sonnet-4.5">Claude Sonnet 4.5</option>
            <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
            <option value="claude-3-opus">Claude 3 Opus</option>
            <option value="claude-3-haiku">Claude 3 Haiku</option>
          </optgroup>

          {/* S-103: OpenRouter Option Group */}
          <optgroup label="OpenRouter (Paid - Requires API Key)" style={{ background: cssVars.bgSecondary }}>
            <option value="gpt-4o">GPT-4o</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="gpt-5.2-codex">GPT-5.2 Codex</option>
          </optgroup>

          {/* S-104: Google Option Group */}
          <optgroup label="Google (Coming Soon)" style={{ background: cssVars.bgSecondary }}>
            <option value="gemini-pro" disabled>Gemini Pro — Coming Soon</option>
          </optgroup>
        </select>

        {/* S-105: Save Model Button */}
        <button
          onClick={handleSave}
          style={{
            padding: '10px 20px',
            background: cssVars.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = cssVars.primaryHover}
          onMouseLeave={(e) => e.target.style.background = cssVars.primary}
        >
          Save
        </button>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px',
          background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          borderRadius: '8px',
          marginBottom: '16px',
          color: message.type === 'success' ? cssVars.success : cssVars.error,
          fontSize: '13px'
        }}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* S-106: Model Tip Box */}
      <div style={{
        padding: '12px',
        background: 'rgba(234, 179, 8, 0.1)',
        borderRadius: '8px',
        borderLeft: `3px solid ${cssVars.warning}`
      }}>
        <div style={{ fontSize: '13px', color: cssVars.textSecondary }}>
          <strong>💡 Tip:</strong> Claude models are free with your Anthropic subscription. OpenRouter models use your API credits and are billed separately.
        </div>
      </div>
    </div>
  )
}

// Voice Input Settings Section (S-164 to S-170)
function VoiceSettings() {
  const [voiceEnabled, setVoiceEnabled] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('voice_input_enabled') === 'true'
    setVoiceEnabled(saved)
  }, [])

  const handleToggle = () => {
    const newValue = !voiceEnabled
    setVoiceEnabled(newValue)
    localStorage.setItem('voice_input_enabled', String(newValue))
  }

  return (
    <div>
      {/* S-165: Section Title */}
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Voice Input (Whisper)</h2>

      {/* S-166: Section Description */}
      <p style={{ color: cssVars.textSecondary, fontSize: '14px', marginBottom: '24px' }}>
        Enable voice-to-text for prompts using OpenAI Whisper.
      </p>

      {/* S-167: Voice Toggle Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        background: cssVars.bgTertiary,
        borderRadius: '8px'
      }}>
        <div>
          {/* S-168: Voice Toggle Label */}
          <div style={{ fontWeight: '500' }}>Enable Voice Input</div>
          {/* S-169: Voice Toggle Description */}
          <div style={{ fontSize: '13px', color: cssVars.textSecondary }}>
            Use microphone to speak your prompts
          </div>
        </div>

        {/* S-170: Voice Toggle */}
        <div
          onClick={handleToggle}
          style={{
            width: '48px',
            height: '28px',
            background: voiceEnabled ? cssVars.primary : cssVars.border,
            borderRadius: '14px',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}
        >
          <div style={{
            width: '24px',
            height: '24px',
            background: 'white',
            borderRadius: '50%',
            position: 'absolute',
            top: '2px',
            right: voiceEnabled ? '2px' : 'auto',
            left: voiceEnabled ? 'auto' : '2px',
            transition: 'all 0.2s ease'
          }} />
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

// MCP Server Type Icons
const MCPTypeIcon = ({ type, size = 24, color }) => {
  switch (type) {
    case 'database':
      return <Database size={size} style={{ color: color || cssVars.primary }} />
    case 'api':
      return <Link2 size={size} style={{ color: color || cssVars.textSecondary }} />
    case 'custom':
      return <SettingsIcon size={size} style={{ color: color || cssVars.textSecondary }} />
    default:
      return <Plug size={size} style={{ color: color || cssVars.textSecondary }} />
  }
}

// Database type icons/emojis
const dbTypeEmojis = {
  postgres: '🐘',
  mysql: '🐬',
  mongodb: '🍃',
  redis: '🔴',
  sqlite: '📦'
}

// Service icons/emojis
const serviceEmojis = {
  github: '🐙',
  slack: '💬',
  gdrive: '📁',
  notion: '📓',
  jira: '📋',
  linear: '📐'
}

// MCP Server Modal (M-63 to M-91)
function MCPModal({ show, onClose, onSave, editServer }) {
  const [serverType, setServerType] = useState('database')
  const [dbType, setDbType] = useState('postgres')
  const [connectionString, setConnectionString] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [accessLevel, setAccessLevel] = useState('readonly')
  const [service, setService] = useState('github')
  const [apiToken, setApiToken] = useState('')
  const [customCommand, setCustomCommand] = useState('')
  const [customArgs, setCustomArgs] = useState('')
  const [customName, setCustomName] = useState('')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState(null)

  // Test connection handler
  const handleTestConnection = () => {
    setTesting(true)
    setError(null)
    // Simulate connection test
    setTimeout(() => {
      setTesting(false)
      // For demo, show success or failure randomly
      if (Math.random() > 0.3) {
        alert('Connection successful!')
      } else {
        setError('Connection failed. Please check your credentials.')
      }
    }, 1500)
  }

  // OAuth handler
  const handleOAuth = () => {
    alert(`OAuth connection for ${service} would open in a new window`)
  }

  // Reset form when modal opens/closes or editServer changes
  useEffect(() => {
    if (show && editServer) {
      setServerType(editServer.type)
      if (editServer.type === 'database') {
        setDbType(editServer.dbType || 'postgres')
        setConnectionString(editServer.connectionString || '')
        setDisplayName(editServer.name || '')
        setAccessLevel(editServer.accessLevel || 'readonly')
      } else if (editServer.type === 'api') {
        setService(editServer.service || 'github')
        setApiToken(editServer.apiToken || '')
      } else if (editServer.type === 'custom') {
        setCustomCommand(editServer.command || '')
        setCustomArgs(editServer.args || '')
        setCustomName(editServer.name || '')
      }
    } else if (show) {
      // Reset to defaults for new server
      setServerType('database')
      setDbType('postgres')
      setConnectionString('')
      setDisplayName('')
      setAccessLevel('readonly')
      setService('github')
      setApiToken('')
      setCustomCommand('')
      setCustomArgs('')
      setCustomName('')
      setError(null)
    }
  }, [show, editServer])

  const handleSave = () => {
    setError(null)

    let server = {
      id: editServer?.id || Date.now().toString(),
      type: serverType,
      connected: false,
      createdAt: editServer?.createdAt || new Date().toISOString()
    }

    if (serverType === 'database') {
      if (!displayName.trim()) {
        setError('Display name is required')
        return
      }
      if (!connectionString.trim()) {
        setError('Connection string is required')
        return
      }
      server = {
        ...server,
        name: displayName.trim(),
        dbType,
        connectionString: connectionString.trim(),
        accessLevel,
        icon: dbTypeEmojis[dbType] || '🗄️'
      }
    } else if (serverType === 'api') {
      if (!apiToken.trim()) {
        setError('API token is required')
        return
      }
      server = {
        ...server,
        name: service.charAt(0).toUpperCase() + service.slice(1),
        service,
        apiToken: apiToken.trim(),
        icon: serviceEmojis[service] || '🔗',
        connected: true
      }
    } else if (serverType === 'custom') {
      if (!customName.trim()) {
        setError('Display name is required')
        return
      }
      if (!customCommand.trim()) {
        setError('Server command is required')
        return
      }
      server = {
        ...server,
        name: customName.trim(),
        command: customCommand.trim(),
        args: customArgs.trim(),
        icon: '⚙️'
      }
    }

    setSaving(true)
    setTimeout(() => {
      onSave(server)
      setSaving(false)
      onClose()
    }, 300)
  }

  if (!show) return null

  return (
    <>
      {/* M-63: Overlay */}
      <div
        id="mcp-modal-overlay"
        className="modal-overlay"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000
        }}
      />
      {/* M-64: Modal */}
      <div
        id="mcp-modal"
        className="modal"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: cssVars.bgSecondary,
          borderRadius: '16px',
          width: '500px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          zIndex: 1001,
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
        {/* M-65: Header */}
        <div className="modal-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: `1px solid ${cssVars.border}`
        }}>
          {/* M-66: Title */}
          <h3 id="mcp-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            {editServer ? 'Edit MCP Server' : 'Add MCP Server'}
          </h3>
          {/* M-67: Close */}
          <button
            className="modal-close"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: cssVars.textSecondary,
              cursor: 'pointer',
              padding: '4px',
              fontSize: '16px'
            }}
          >
            ✕
          </button>
        </div>

        {/* M-68: Body */}
        <div className="modal-body" style={{ padding: '24px' }}>
          {/* M-69: Server Type Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: cssVars.textSecondary,
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}>
              Server Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {/* M-70: Database */}
              <div
                onClick={() => setServerType('database')}
                className={`mcp-type-option${serverType === 'database' ? ' selected' : ''}`}
                style={{
                  padding: '12px',
                  background: cssVars.bgTertiary,
                  border: `2px solid ${serverType === 'database' ? cssVars.primary : cssVars.border}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <div style={{ width: '32px', height: '32px', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={24} style={{ color: serverType === 'database' ? cssVars.primary : cssVars.textSecondary }} />
                </div>
                <div style={{ fontSize: '11px', fontWeight: '500' }}>Database</div>
              </div>
              {/* M-71: API/Service */}
              <div
                onClick={() => setServerType('api')}
                className={`mcp-type-option${serverType === 'api' ? ' selected' : ''}`}
                style={{
                  padding: '12px',
                  background: cssVars.bgTertiary,
                  border: `2px solid ${serverType === 'api' ? cssVars.primary : cssVars.border}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <div style={{ width: '32px', height: '32px', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Link2 size={24} style={{ color: serverType === 'api' ? cssVars.primary : cssVars.textSecondary }} />
                </div>
                <div style={{ fontSize: '11px', fontWeight: '500' }}>API/Service</div>
              </div>
              {/* M-72: Custom */}
              <div
                onClick={() => setServerType('custom')}
                className={`mcp-type-option${serverType === 'custom' ? ' selected' : ''}`}
                style={{
                  padding: '12px',
                  background: cssVars.bgTertiary,
                  border: `2px solid ${serverType === 'custom' ? cssVars.primary : cssVars.border}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <div style={{ width: '32px', height: '32px', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SettingsIcon size={24} style={{ color: serverType === 'custom' ? cssVars.primary : cssVars.textSecondary }} />
                </div>
                <div style={{ fontSize: '11px', fontWeight: '500' }}>Custom</div>
              </div>
            </div>
          </div>

          {/* M-73: Database Options */}
          <div id="mcp-database-options" style={{ display: serverType === 'database' ? 'block' : 'none' }}>
            {/* M-74: Database Type Select */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: cssVars.textSecondary,
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                Database Type
              </label>
              <select
                id="mcp-db-type"
                className="model-select"
                value={dbType}
                onChange={(e) => setDbType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: cssVars.bgTertiary,
                  border: `1px solid ${cssVars.border}`,
                  borderRadius: '8px',
                  color: cssVars.textPrimary,
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="postgres">🐘 PostgreSQL</option>
                <option value="mysql">🐬 MySQL</option>
                <option value="mongodb">🍃 MongoDB</option>
                <option value="redis">🔴 Redis</option>
                <option value="sqlite">📦 SQLite</option>
              </select>
            </div>

            {/* M-75: Connection String Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: cssVars.textSecondary,
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                Connection String
              </label>
              <input
                type="text"
                id="mcp-connection"
                className="model-select"
                value={connectionString}
                onChange={(e) => setConnectionString(e.target.value)}
                placeholder="postgresql://user:password@localhost:5432/dbname"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: cssVars.bgTertiary,
                  border: `1px solid ${cssVars.border}`,
                  borderRadius: '8px',
                  color: cssVars.textPrimary,
                  fontSize: '12px',
                  fontFamily: 'Monaco, Consolas, monospace',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* M-76: Name/Access Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {/* M-77: Display Name Input */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: cssVars.textSecondary,
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}>
                  Display Name
                </label>
                <input
                  type="text"
                  id="mcp-name"
                  className="model-select"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Production DB"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: cssVars.bgTertiary,
                    border: `1px solid ${cssVars.border}`,
                    borderRadius: '8px',
                    color: cssVars.textPrimary,
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              {/* M-78: Access Level Select */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: cssVars.textSecondary,
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}>
                  Access Level
                </label>
                <select
                  id="mcp-access"
                  className="model-select"
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: cssVars.bgTertiary,
                    border: `1px solid ${cssVars.border}`,
                    borderRadius: '8px',
                    color: cssVars.textPrimary,
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="readonly">Read-only (safer)</option>
                  <option value="readwrite">Read & Write</option>
                </select>
              </div>
            </div>
          </div>

          {/* M-79: API/Service Options */}
          <div id="mcp-api-options" style={{ display: serverType === 'api' ? 'block' : 'none' }}>
            {/* M-80: Service Select */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: cssVars.textSecondary,
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                Service
              </label>
              <select
                id="mcp-service"
                className="model-select"
                value={service}
                onChange={(e) => setService(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: cssVars.bgTertiary,
                  border: `1px solid ${cssVars.border}`,
                  borderRadius: '8px',
                  color: cssVars.textPrimary,
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="github">🐙 GitHub</option>
                <option value="slack">💬 Slack</option>
                <option value="gdrive">📁 Google Drive</option>
                <option value="notion">📓 Notion</option>
                <option value="jira">📋 Jira</option>
                <option value="linear">📐 Linear</option>
              </select>
            </div>

            {/* M-81: API Token Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: cssVars.textSecondary,
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                API Token / OAuth
              </label>
              <input
                type="password"
                id="mcp-token"
                className="model-select"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Enter API token or click Connect to OAuth"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: cssVars.bgTertiary,
                  border: `1px solid ${cssVars.border}`,
                  borderRadius: '8px',
                  color: cssVars.textPrimary,
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {/* M-82: OAuth Connect Button */}
              <button
                className="btn btn-secondary"
                onClick={handleOAuth}
                style={{
                  marginTop: '8px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  background: cssVars.bgSecondary,
                  border: `1px solid ${cssVars.border}`,
                  borderRadius: '8px',
                  color: cssVars.textPrimary,
                  cursor: 'pointer'
                }}
              >
                🔗 Connect with OAuth
              </button>
            </div>
          </div>

          {/* M-83: Custom Options */}
          <div id="mcp-custom-options" style={{ display: serverType === 'custom' ? 'block' : 'none' }}>
            {/* M-84: Server Command Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: cssVars.textSecondary,
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                Server Command
              </label>
              <input
                type="text"
                id="mcp-command"
                className="model-select"
                value={customCommand}
                onChange={(e) => setCustomCommand(e.target.value)}
                placeholder="npx @modelcontextprotocol/server-filesystem"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: cssVars.bgTertiary,
                  border: `1px solid ${cssVars.border}`,
                  borderRadius: '8px',
                  color: cssVars.textPrimary,
                  fontSize: '12px',
                  fontFamily: 'Monaco, Consolas, monospace',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* M-85: Arguments Textarea */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: cssVars.textSecondary,
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                Arguments (JSON)
              </label>
              <textarea
                id="mcp-args"
                className="model-select"
                value={customArgs}
                onChange={(e) => setCustomArgs(e.target.value)}
                placeholder='["--directory", "/path/to/files"]'
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '10px 12px',
                  background: cssVars.bgTertiary,
                  border: `1px solid ${cssVars.border}`,
                  borderRadius: '8px',
                  color: cssVars.textPrimary,
                  fontSize: '12px',
                  fontFamily: 'Monaco, Consolas, monospace',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* M-86: Custom Name Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: cssVars.textSecondary,
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                Display Name
              </label>
              <input
                type="text"
                id="mcp-custom-name"
                className="model-select"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. File System Access"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: cssVars.bgTertiary,
                  border: `1px solid ${cssVars.border}`,
                  borderRadius: '8px',
                  color: cssVars.textPrimary,
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* M-87: Security Warning Box */}
          <div style={{
            padding: '12px',
            background: 'rgba(249, 115, 22, 0.1)',
            border: `1px solid ${cssVars.accent}`,
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '12px', color: cssVars.accent }}>
              <strong>⚠️ Security Note:</strong> MCP servers have direct access to your data. Only connect to trusted sources and use read-only access when possible.
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${cssVars.error}`,
              borderRadius: '8px',
              color: cssVars.error,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        {/* M-88: Footer */}
        <div className="modal-footer" style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderTop: `1px solid ${cssVars.border}`,
          background: cssVars.bgTertiary
        }}>
          {/* M-89: Cancel Button */}
          <button
            className="btn btn-secondary"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: cssVars.bgSecondary,
              border: `1px solid ${cssVars.border}`,
              borderRadius: '8px',
              color: cssVars.textPrimary,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* M-90: Test Connection Button */}
            <button
              className="btn btn-secondary"
              onClick={handleTestConnection}
              disabled={testing}
              style={{
                padding: '10px 20px',
                background: cssVars.bgSecondary,
                border: `1px solid ${cssVars.border}`,
                borderRadius: '8px',
                color: cssVars.textPrimary,
                fontSize: '14px',
                cursor: testing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {testing ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Testing...
                </>
              ) : (
                '⚡ Test Connection'
              )}
            </button>
            {/* M-91: Save Button */}
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '10px 20px',
                background: cssVars.primary,
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <span id="mcp-save-text">{editServer ? 'Save Changes' : 'Add Server'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// Global MCP Servers Settings Section
function GlobalMCPSettings() {
  const [servers, setServers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingServer, setEditingServer] = useState(null)
  const [showHelp, setShowHelp] = useState(false)

  // Load servers from localStorage
  useEffect(() => {
    const savedServers = localStorage.getItem('mcp_servers')
    if (savedServers) {
      try {
        setServers(JSON.parse(savedServers))
      } catch (e) {
        console.error('Failed to parse MCP servers:', e)
      }
    }
  }, [])

  // Save servers to localStorage
  const saveServers = (newServers) => {
    setServers(newServers)
    localStorage.setItem('mcp_servers', JSON.stringify(newServers))
  }

  const handleAddServer = (server) => {
    if (editingServer) {
      // Update existing
      const updated = servers.map(s => s.id === server.id ? server : s)
      saveServers(updated)
    } else {
      // Add new
      saveServers([...servers, server])
    }
    setEditingServer(null)
  }

  const handleEditServer = (server) => {
    setEditingServer(server)
    setShowModal(true)
  }

  const handleDeleteServer = (serverId) => {
    if (window.confirm('Are you sure you want to remove this MCP server?')) {
      saveServers(servers.filter(s => s.id !== serverId))
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'database': return 'Database'
      case 'api': return 'API Service'
      case 'custom': return 'Custom'
      default: return type
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Global MCP Servers</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <span
              style={{ fontSize: '18px', cursor: 'pointer' }}
              title="MCP servers use context tokens"
            >
              ⚠️
            </span>
          </div>
        </div>
      </div>
      <p style={{ color: cssVars.textSecondary, fontSize: '14px', marginBottom: '24px' }}>
        MCP (Model Context Protocol) servers connect AI to external tools and data sources. These are available across all projects.
      </p>

      {/* What is MCP? Help Section */}
      <div style={{ marginBottom: '20px' }}>
        <div
          onClick={() => setShowHelp(!showHelp)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '8px 0'
          }}
        >
          <span style={{
            fontSize: '10px',
            color: cssVars.textMuted,
            transition: 'transform 0.2s',
            transform: showHelp ? 'rotate(90deg)' : 'rotate(0deg)'
          }}>
            ▶
          </span>
          <span style={{ fontSize: '13px', color: cssVars.primary }}>What is MCP? How does it work?</span>
        </div>
        {showHelp && (
          <div style={{
            background: cssVars.bgPrimary,
            border: `1px solid ${cssVars.border}`,
            borderRadius: '12px',
            padding: '20px',
            marginTop: '8px'
          }}>
            <p style={{ margin: '0 0 16px 0', lineHeight: '1.6' }}>
              <strong>MCP (Model Context Protocol)</strong> is a universal standard that connects AI assistants to external tools and data sources. It works with Claude, ChatGPT, Codex, and more.
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              padding: '16px',
              background: cssVars.bgSecondary,
              borderRadius: '8px',
              margin: '16px 0'
            }}>
              <span style={{ background: 'rgba(59, 130, 246, 0.2)', border: `1px solid ${cssVars.primary}`, padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>🤖 AI</span>
              <span style={{ color: cssVars.textMuted }}>→</span>
              <span style={{ background: 'rgba(168, 85, 247, 0.2)', border: '1px solid #a855f7', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>🔌 MCP</span>
              <span style={{ color: cssVars.textMuted }}>→</span>
              <span style={{ background: 'rgba(34, 197, 94, 0.2)', border: `1px solid ${cssVars.success}`, padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>🗄️ Data</span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: cssVars.textSecondary }}>
              With PostgreSQL MCP connected, you can ask: "Show me all users who signed up last week" and the AI can query your database directly.
            </p>
          </div>
        )}
      </div>

      {/* Server List Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <span style={{ fontWeight: '500' }}>Connected MCP Servers</span>
        <button
          onClick={() => {
            setEditingServer(null)
            setShowModal(true)
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: cssVars.primary,
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          Add Server
        </button>
      </div>

      {/* Server List */}
      <div style={{
        background: cssVars.bgTertiary,
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        {servers.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: cssVars.textMuted
          }}>
            <Plug size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>No MCP servers configured</div>
            <div style={{ fontSize: '12px' }}>Click "Add Server" to connect your first MCP server</div>
          </div>
        ) : (
          servers.map((server, index) => (
            <div
              key={server.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: index < servers.length - 1 ? `1px solid ${cssVars.border}` : 'none',
                gap: '16px'
              }}
            >
              {/* Icon */}
              <div style={{
                width: '44px',
                height: '44px',
                background: cssVars.bgSecondary,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                {server.icon || '🔌'}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>{server.name}</div>
                <div style={{ fontSize: '12px', color: cssVars.textMuted }}>
                  {getTypeLabel(server.type)}
                  {server.dbType && ` • ${server.dbType.toUpperCase()}`}
                  {server.service && ` • ${server.service}`}
                  {server.accessLevel && ` • ${server.accessLevel === 'readonly' ? 'Read-only' : 'Read/Write'}`}
                </div>
              </div>

              {/* Status */}
              <div style={{
                fontSize: '12px',
                color: server.connected ? cssVars.success : cssVars.textMuted,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {server.connected ? '● Connected' : '○ Not tested'}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleEditServer(server)}
                  style={{
                    padding: '6px 12px',
                    background: cssVars.bgSecondary,
                    border: `1px solid ${cssVars.border}`,
                    borderRadius: '6px',
                    color: cssVars.textPrimary,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Edit2 size={12} />
                  Configure
                </button>
                <button
                  onClick={() => handleDeleteServer(server.id)}
                  style={{
                    padding: '6px 8px',
                    background: cssVars.bgSecondary,
                    border: `1px solid ${cssVars.border}`,
                    borderRadius: '6px',
                    color: cssVars.error,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '8px',
        borderLeft: `3px solid ${cssVars.primary}`
      }}>
        <div style={{ fontSize: '12px', color: cssVars.textSecondary }}>
          <strong>🔌 Universal Standard:</strong> MCP is supported by Claude, OpenAI Codex, and most modern AI tools. Servers configured here work with any LLM you use in your projects.
        </div>
      </div>

      {/* Modal */}
      <MCPModal
        show={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingServer(null)
        }}
        onSave={handleAddServer}
        editServer={editingServer}
      />
    </div>
  )
}

// Agent Icon options
// Agent icons matching mockup exactly (M-22 to M-29)
const agentIcons = ['🔧', '📋', '🔒', '🧪', '📝', '🗄️', '🎨', '⚡']

// Default agents (used in CreateProject)
const defaultAgents = [
  { id: 'code-reviewer', name: 'code-reviewer', icon: '📋', description: 'Reviews code for quality, security, and best practices. Provides actionable feedback.', model: 'sonnet', tools: 'readonly', enabled: true },
  { id: 'security-audit', name: 'security-audit', icon: '🔒', description: 'Scans code for vulnerabilities, checks dependencies, and suggests security improvements.', model: 'opus', tools: 'readonly', enabled: true },
  { id: 'test-writer', name: 'test-writer', icon: '🧪', description: 'Generates unit tests, integration tests, and test fixtures based on your code.', model: 'sonnet', tools: 'all', enabled: true }
]

// Default skills matching mockup
const defaultSkills = [
  { id: 'doc-generator', name: 'doc-generator', icon: '📝', description: 'Generates documentation from code including README, API docs, and inline comments.', iconBg: 'rgba(168, 85, 247, 0.2)' },
  { id: 'data-analysis', name: 'data-analysis', icon: '📊', description: 'Analyzes data files, generates reports, and creates visualizations.', iconBg: 'rgba(249, 115, 22, 0.2)' },
  { id: 'frontend-design', name: 'frontend-design', icon: '🎨', description: 'Creates UI components, layouts, and responsive designs following best practices.', iconBg: 'rgba(59, 130, 246, 0.2)' }
]

// Agent Modal for creating/editing agents
function AgentModal({ show, onClose, onSave, editAgent }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🔧')
  const [description, setDescription] = useState('')
  const [model, setModel] = useState('sonnet')
  const [tools, setTools] = useState('readonly')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Reset form when modal opens/closes or editAgent changes
  useEffect(() => {
    if (show && editAgent) {
      setName(editAgent.name || '')
      setIcon(editAgent.icon || '🔧')
      setDescription(editAgent.description || '')
      setModel(editAgent.model || 'sonnet')
      setTools(editAgent.tools || 'readonly')
      setSystemPrompt(editAgent.systemPrompt || '')
    } else if (show) {
      // Reset to defaults for new agent
      setName('')
      setIcon('🔧')
      setDescription('')
      setModel('sonnet')
      setTools('readonly')
      setSystemPrompt('')
      setError(null)
    }
  }, [show, editAgent])

  const handleSave = () => {
    setError(null)

    // Validate name
    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-')
    if (!cleanName) {
      setError('Agent name is required')
      return
    }
    if (cleanName.length < 2) {
      setError('Agent name must be at least 2 characters')
      return
    }

    // Validate description
    if (!description.trim()) {
      setError('Description is required')
      return
    }

    const agent = {
      id: editAgent?.id || `agent-${Date.now()}`,
      name: cleanName,
      icon,
      description: description.trim(),
      model,
      tools,
      systemPrompt: systemPrompt.trim(),
      enabled: editAgent?.enabled !== undefined ? editAgent.enabled : true,
      createdAt: editAgent?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setSaving(true)
    setTimeout(() => {
      onSave(agent)
      setSaving(false)
      onClose()
    }, 300)
  }

  if (!show) return null

  return (
    <>
      {/* Overlay - M-10 */}
      <div
        id="agent-modal-overlay"
        className="modal-overlay"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000
        }}
      />
      {/* Modal - M-11 */}
      <div
        id="agent-modal"
        className="modal"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: cssVars.bgSecondary,
          borderRadius: '16px',
          width: '520px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          zIndex: 1001,
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}
      >
        {/* Header - M-12 */}
        <div className="modal-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: `1px solid ${cssVars.border}`
        }}>
          <h3 id="agent-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            {editAgent ? 'Edit Agent' : 'Create New Agent'}
          </h3>
          <button
            className="modal-close"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: cssVars.textSecondary,
              cursor: 'pointer',
              padding: '4px',
              fontSize: '18px',
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>

        {/* Body - M-15 */}
        <div className="modal-body" style={{ padding: '24px' }}>
          {/* Agent Name - M-16 to M-19 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: cssVars.textSecondary,
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Agent Name
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: cssVars.textMuted, fontSize: '16px' }}>@</span>
              <input
                type="text"
                id="agent-name"
                className="model-select"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. api-designer"
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: cssVars.bgTertiary,
                  border: `1px solid ${cssVars.border}`,
                  borderRadius: '8px',
                  color: cssVars.textPrimary,
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ fontSize: '11px', color: cssVars.textMuted, marginTop: '4px' }}>
              Invoke with @agent-name in chat
            </div>
          </div>

          {/* Icon Picker - M-20 to M-29 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: cssVars.textSecondary,
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Icon
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {agentIcons.map((emoji) => (
                <button
                  key={emoji}
                  className={`icon-picker${icon === emoji ? ' selected' : ''}`}
                  onClick={() => setIcon(emoji)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: `2px solid ${icon === emoji ? cssVars.primary : cssVars.border}`,
                    background: cssVars.bgTertiary,
                    fontSize: '18px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Description - M-30 to M-32 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: cssVars.textSecondary,
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Description
            </label>
            <input
              type="text"
              id="agent-description"
              className="model-select"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Designs REST API endpoints following best practices"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: cssVars.bgTertiary,
                border: `1px solid ${cssVars.border}`,
                borderRadius: '8px',
                color: cssVars.textPrimary,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Model and Tools Row - M-33 to M-37 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: cssVars.textSecondary,
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                Model
              </label>
              <select
                id="agent-model"
                className="model-select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: cssVars.bgTertiary,
                  border: `1px solid ${cssVars.border}`,
                  borderRadius: '8px',
                  color: cssVars.textPrimary,
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="sonnet">Claude Sonnet 4.5 (Fast)</option>
                <option value="opus">Claude Opus 4.5 (Powerful)</option>
                <option value="haiku">Claude Haiku 4.5 (Quick)</option>
              </select>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: cssVars.textSecondary,
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                Tools Access
              </label>
              <select
                id="agent-tools"
                className="model-select"
                value={tools}
                onChange={(e) => setTools(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: cssVars.bgTertiary,
                  border: `1px solid ${cssVars.border}`,
                  borderRadius: '8px',
                  color: cssVars.textPrimary,
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="readonly">Read-only (safer)</option>
                <option value="all">All tools (can edit files)</option>
                <option value="none">No tools (chat only)</option>
              </select>
            </div>
          </div>

          {/* System Prompt - M-38 to M-40 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: cssVars.textSecondary,
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              System Prompt (Optional)
            </label>
            <textarea
              id="agent-prompt"
              className="model-select"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder={`Custom instructions for this agent...

Example: You are an expert API designer. When asked to design endpoints, always consider REST best practices, proper HTTP methods, and clear naming conventions.`}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '10px 12px',
                background: cssVars.bgTertiary,
                border: `1px solid ${cssVars.border}`,
                borderRadius: '8px',
                color: cssVars.textPrimary,
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Tip - M-41 */}
          <div style={{
            padding: '12px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '12px', color: cssVars.textSecondary }}>
              <strong>💡 Tip:</strong> This agent will be auto-converted to the correct format (CLAUDE.md agents, Codex skills, or system prompts) based on which LLM you use in each project.
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${cssVars.error}`,
              borderRadius: '8px',
              color: cssVars.error,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Footer - M-42 to M-44 */}
        <div className="modal-footer" style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderTop: `1px solid ${cssVars.border}`,
          background: cssVars.bgTertiary
        }}>
          <button
            className="btn btn-secondary"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: cssVars.bgSecondary,
              border: `1px solid ${cssVars.border}`,
              borderRadius: '8px',
              color: cssVars.textPrimary,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '10px 20px',
              background: cssVars.primary,
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {saving ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Saving...
              </>
            ) : (
              <span id="agent-save-text">{editAgent ? 'Save Changes' : 'Create Agent'}</span>
            )}
          </button>
        </div>
      </div>
    </>
  )
}

// Global Agents Settings Section
function GlobalAgentsSettings() {
  const [agents, setAgents] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingAgent, setEditingAgent] = useState(null)
  const [showHelp, setShowHelp] = useState(false)

  // Load agents from localStorage or use defaults
  useEffect(() => {
    const savedAgents = localStorage.getItem('global_agents')
    if (savedAgents) {
      try {
        setAgents(JSON.parse(savedAgents))
      } catch (e) {
        console.error('Failed to parse global agents:', e)
        setAgents(defaultAgents)
      }
    } else {
      // Initialize with default agents
      setAgents(defaultAgents)
      localStorage.setItem('global_agents', JSON.stringify(defaultAgents))
    }
  }, [])

  // Save agents to localStorage
  const saveAgents = (newAgents) => {
    setAgents(newAgents)
    localStorage.setItem('global_agents', JSON.stringify(newAgents))
  }

  const handleAddAgent = (agent) => {
    if (editingAgent) {
      // Update existing
      const updated = agents.map(a => a.id === agent.id ? agent : a)
      saveAgents(updated)
    } else {
      // Add new
      saveAgents([...agents, agent])
    }
    setEditingAgent(null)
  }

  const handleEditAgent = (agent) => {
    setEditingAgent(agent)
    setShowModal(true)
  }

  const handleDeleteAgent = (agentId) => {
    if (window.confirm('Are you sure you want to remove this agent?')) {
      saveAgents(agents.filter(a => a.id !== agentId))
    }
  }

  const handleToggleAgent = (agentId) => {
    const updated = agents.map(a =>
      a.id === agentId ? { ...a, enabled: !a.enabled } : a
    )
    saveAgents(updated)
  }

  const getToolsLabel = (tools) => {
    switch (tools) {
      case 'readonly': return 'Read-only tools'
      case 'all': return 'All tools'
      case 'none': return 'No tools'
      default: return tools
    }
  }

  const getModelLabel = (model) => {
    switch (model) {
      case 'sonnet': return 'Sonnet'
      case 'opus': return 'Opus'
      case 'haiku': return 'Haiku'
      default: return model
    }
  }

  // Get icon background color based on agent type
  const getIconBgColor = (agent) => {
    if (agent.name.includes('security') || agent.name.includes('audit')) {
      return 'rgba(239, 68, 68, 0.2)'
    }
    if (agent.name.includes('test') || agent.name.includes('writer')) {
      return 'rgba(34, 197, 94, 0.2)'
    }
    return 'rgba(59, 130, 246, 0.2)'
  }

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Global Agents</h2>
      <p style={{ color: cssVars.textSecondary, fontSize: '14px', marginBottom: '24px' }}>
        Define reusable agents available across all your projects. These are automatically inherited by new projects.
      </p>

      {/* What are Agents? Help Section */}
      <div style={{ marginBottom: '20px' }}>
        <div
          onClick={() => setShowHelp(!showHelp)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '8px 0'
          }}
        >
          <span style={{
            fontSize: '10px',
            color: cssVars.textMuted,
            transition: 'transform 0.2s',
            transform: showHelp ? 'rotate(90deg)' : 'rotate(0deg)'
          }}>
            ▶
          </span>
          <span style={{ fontSize: '13px', color: cssVars.primary }}>What are Agents? How do they work?</span>
        </div>
        {showHelp && (
          <div style={{
            background: cssVars.bgPrimary,
            border: `1px solid ${cssVars.border}`,
            borderRadius: '12px',
            padding: '20px',
            marginTop: '8px'
          }}>
            <p style={{ margin: '0 0 16px 0', lineHeight: '1.6', fontSize: '13px', color: cssVars.textSecondary }}>
              <strong style={{ color: cssVars.textPrimary }}>Agents</strong> are specialized AI assistants with defined roles, capabilities, and constraints. They can be invoked by name to handle specific tasks.
            </p>
            {/* Diagram */}
            <div style={{
              background: cssVars.bgTertiary,
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px'
            }}>
              <div style={{ textAlign: 'center', fontSize: '11px', color: cssVars.textMuted, marginBottom: '12px' }}>
                HOW AGENTS WORK
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                fontSize: '12px'
              }}>
                <div style={{
                  background: cssVars.primary,
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>👤</div>
                  <div>You</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: cssVars.textMuted }}>
                  <div>@agent-name</div>
                  <div>→→→</div>
                </div>
                <div style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: `2px solid ${cssVars.primary}`,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>🤖</div>
                  <div>Agent</div>
                  <div style={{ fontSize: '9px', color: cssVars.textMuted, marginTop: '4px' }}>
                    Custom Role<br/>+ Tools<br/>+ Model
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: cssVars.textMuted }}>
                  <div>performs</div>
                  <div>→→→</div>
                </div>
                <div style={{
                  background: cssVars.bgSecondary,
                  border: `1px solid ${cssVars.border}`,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>⚡</div>
                  <div>Task</div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: cssVars.textSecondary, lineHeight: '1.6' }}>
              <strong style={{ color: cssVars.textPrimary }}>Example Usage:</strong><br/>
              <code style={{
                background: cssVars.bgTertiary,
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'inline-block',
                margin: '8px 0'
              }}>
                @code-reviewer check src/api/users.js
              </code>
              <br/><br/>
              <strong style={{ color: cssVars.textPrimary }}>Agent Components:</strong>
              <ul style={{ margin: '8px 0 0 20px' }}>
                <li><strong>Name:</strong> How you invoke it (e.g., @code-reviewer)</li>
                <li><strong>Description:</strong> What it does</li>
                <li><strong>Tools:</strong> What capabilities it has (read-only, file edit, etc.)</li>
                <li><strong>Model:</strong> Which LLM powers it (Opus for complex, Sonnet for fast)</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Agent List Card */}
      <div style={{
        background: cssVars.bgTertiary,
        borderRadius: '12px',
        padding: '20px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <span style={{ fontWeight: '500' }}>Your Global Agents</span>
          <button
            onClick={() => {
              setEditingAgent(null)
              setShowModal(true)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: cssVars.primary,
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            Create Agent
          </button>
        </div>

        {/* Agent List */}
        {agents.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: cssVars.textMuted
          }}>
            <Bot size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>No agents configured</div>
            <div style={{ fontSize: '12px' }}>Click "Create Agent" to add your first agent</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {agents.map((agent) => (
              <div
                key={agent.id}
                style={{
                  background: cssVars.bgSecondary,
                  border: `1px solid ${cssVars.border}`,
                  borderRadius: '8px',
                  padding: '16px',
                  opacity: agent.enabled ? 1 : 0.6
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {/* Icon */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: getIconBgColor(agent),
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    {agent.icon || '🤖'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500' }}>{agent.name}</div>
                    <div style={{
                      fontSize: '13px',
                      color: cssVars.textSecondary,
                      marginTop: '2px'
                    }}>
                      {agent.description}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <span style={{
                        fontSize: '11px',
                        background: cssVars.bgTertiary,
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {getToolsLabel(agent.tools)}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        background: cssVars.bgTertiary,
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        Model: {getModelLabel(agent.model)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Enable Toggle */}
                    <div
                      onClick={() => handleToggleAgent(agent.id)}
                      style={{
                        width: '36px',
                        height: '20px',
                        background: agent.enabled ? cssVars.success : cssVars.bgTertiary,
                        borderRadius: '10px',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <div style={{
                        width: '16px',
                        height: '16px',
                        background: 'white',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        right: agent.enabled ? '2px' : 'auto',
                        left: agent.enabled ? 'auto' : '2px',
                        transition: 'all 0.2s ease'
                      }} />
                    </div>
                    <button
                      onClick={() => handleEditAgent(agent)}
                      style={{
                        padding: '6px 12px',
                        background: cssVars.bgTertiary,
                        border: `1px solid ${cssVars.border}`,
                        borderRadius: '6px',
                        color: cssVars.textPrimary,
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAgent(agent.id)}
                      style={{
                        padding: '6px 12px',
                        background: cssVars.bgTertiary,
                        border: `1px solid ${cssVars.border}`,
                        borderRadius: '6px',
                        color: cssVars.textPrimary,
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tip Box */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '8px',
        borderLeft: `3px solid ${cssVars.primary}`
      }}>
        <div style={{ fontSize: '13px', color: cssVars.textSecondary }}>
          <strong>Tip:</strong> Global agents are automatically converted to the correct format (CLAUDE.md agents, Codex skills, or system prompts) based on which LLM you use in each project.
        </div>
      </div>

      {/* Modal */}
      <AgentModal
        show={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingAgent(null)
        }}
        onSave={handleAddAgent}
        editAgent={editingAgent}
      />
    </div>
  )
}

// Global Skills Settings Section
function GlobalSkillsSettings() {
  const [skills, setSkills] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingSkill, setEditingSkill] = useState(null)

  // Load skills from localStorage or use defaults
  useEffect(() => {
    const savedSkills = localStorage.getItem('global_skills')
    if (savedSkills) {
      try {
        setSkills(JSON.parse(savedSkills))
      } catch (e) {
        console.error('Failed to parse global skills:', e)
        setSkills(defaultSkills)
      }
    } else {
      // Initialize with default skills
      setSkills(defaultSkills)
      localStorage.setItem('global_skills', JSON.stringify(defaultSkills))
    }
  }, [])

  // Save skills to localStorage
  const saveSkills = (newSkills) => {
    setSkills(newSkills)
    localStorage.setItem('global_skills', JSON.stringify(newSkills))
  }

  const handleAddSkill = (skill) => {
    if (editingSkill) {
      // Update existing
      const updated = skills.map(s => s.id === skill.id ? skill : s)
      saveSkills(updated)
    } else {
      // Add new
      saveSkills([...skills, skill])
    }
    setEditingSkill(null)
  }

  const handleEditSkill = (skill) => {
    setEditingSkill(skill)
    setShowModal(true)
  }

  const handleDeleteSkill = (skillId) => {
    if (window.confirm('Are you sure you want to remove this skill?')) {
      saveSkills(skills.filter(s => s.id !== skillId))
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Global Skills</h2>
      <p style={{ color: cssVars.textSecondary, fontSize: '14px', marginBottom: '24px' }}>
        Skills are reusable task modules that teach the AI specific workflows. These are available across all projects.
      </p>

      {/* Skills List Card */}
      <div style={{
        background: cssVars.bgTertiary,
        borderRadius: '12px',
        padding: '20px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <span style={{ fontWeight: '500' }}>Your Global Skills</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{
                padding: '8px 16px',
                background: cssVars.bgSecondary,
                border: `1px solid ${cssVars.border}`,
                borderRadius: '8px',
                color: cssVars.textPrimary,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Browse Registry
            </button>
            <button
              onClick={() => {
                setEditingSkill(null)
                setShowModal(true)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: cssVars.primary,
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              + Create Skill
            </button>
          </div>
        </div>

        {/* Skills List */}
        {skills.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: cssVars.textMuted
          }}>
            <Book size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>No skills configured</div>
            <div style={{ fontSize: '12px' }}>Click "Create Skill" to add your first skill</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {skills.map((skill, index) => (
              <div
                key={skill.id}
                style={{
                  background: cssVars.bgSecondary,
                  border: `1px solid ${cssVars.border}`,
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: index === skills.length - 1 ? '0' : undefined
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {/* Icon */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: skill.iconBg || 'rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    {skill.icon || '📚'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500' }}>{skill.name}</div>
                    <div style={{
                      fontSize: '13px',
                      color: cssVars.textSecondary,
                      marginTop: '2px'
                    }}>
                      {skill.description}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <span style={{
                        fontSize: '11px',
                        background: 'rgba(34, 197, 94, 0.2)',
                        color: cssVars.success,
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        Installed
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEditSkill(skill)}
                      style={{
                        padding: '6px 12px',
                        background: cssVars.bgTertiary,
                        border: `1px solid ${cssVars.border}`,
                        borderRadius: '6px',
                        color: cssVars.textPrimary,
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Configure
                    </button>
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      style={{
                        padding: '6px 12px',
                        background: cssVars.bgTertiary,
                        border: `1px solid ${cssVars.border}`,
                        borderRadius: '6px',
                        color: cssVars.textPrimary,
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skill Modal */}
      <SkillModal
        show={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingSkill(null)
        }}
        onSave={handleAddSkill}
        editSkill={editingSkill}
      />
    </div>
  )
}

// Skill Modal for creating/editing skills
function SkillModal({ show, onClose, onSave, editSkill }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📚')
  const [description, setDescription] = useState('')
  const [iconBg, setIconBg] = useState('rgba(59, 130, 246, 0.2)')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Icon background color options
  const iconBgOptions = [
    { value: 'rgba(59, 130, 246, 0.2)', label: 'Blue', color: '#3b82f6' },
    { value: 'rgba(168, 85, 247, 0.2)', label: 'Purple', color: '#a855f7' },
    { value: 'rgba(249, 115, 22, 0.2)', label: 'Orange', color: '#f97316' },
    { value: 'rgba(34, 197, 94, 0.2)', label: 'Green', color: '#22c55e' },
    { value: 'rgba(239, 68, 68, 0.2)', label: 'Red', color: '#ef4444' }
  ]

  // Reset form when modal opens/closes or editSkill changes
  useEffect(() => {
    if (show && editSkill) {
      setName(editSkill.name || '')
      setIcon(editSkill.icon || '📚')
      setDescription(editSkill.description || '')
      setIconBg(editSkill.iconBg || 'rgba(59, 130, 246, 0.2)')
    } else if (show) {
      // Reset to defaults for new skill
      setName('')
      setIcon('📚')
      setDescription('')
      setIconBg('rgba(59, 130, 246, 0.2)')
      setError(null)
    }
  }, [show, editSkill])

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Skill name is required')
      return
    }
    if (!description.trim()) {
      setError('Description is required')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const skill = {
        id: editSkill?.id || name.toLowerCase().replace(/\s+/g, '-'),
        name: name.trim(),
        icon,
        description: description.trim(),
        iconBg
      }
      onSave(skill)
      onClose()
    } catch (err) {
      console.error('Failed to save skill:', err)
      setError('Failed to save skill')
    } finally {
      setSaving(false)
    }
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: cssVars.bgSecondary,
        borderRadius: '12px',
        width: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: `1px solid ${cssVars.border}`
        }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>
            {editSkill ? 'Configure Skill' : 'Create Skill'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: cssVars.textSecondary,
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${cssVars.error}`,
              borderRadius: '8px',
              marginBottom: '16px',
              color: cssVars.error,
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          {/* Icon and Name Row */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            {/* Icon Picker */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                marginBottom: '6px'
              }}>
                Icon
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                style={{
                  width: '60px',
                  padding: '12px',
                  background: cssVars.bgTertiary,
                  border: `1px solid ${cssVars.border}`,
                  borderRadius: '8px',
                  color: cssVars.textPrimary,
                  fontSize: '24px',
                  textAlign: 'center'
                }}
              />
            </div>

            {/* Name */}
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                marginBottom: '6px'
              }}>
                Skill Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., doc-generator"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: cssVars.bgTertiary,
                  border: `1px solid ${cssVars.border}`,
                  borderRadius: '8px',
                  color: cssVars.textPrimary,
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Icon Background Color */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '6px'
            }}>
              Icon Color
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {iconBgOptions.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => setIconBg(opt.value)}
                  style={{
                    width: '32px',
                    height: '32px',
                    background: opt.value,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: iconBg === opt.value ? `2px solid ${opt.color}` : '2px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {iconBg === opt.value && (
                    <CheckCircle size={16} color={opt.color} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '6px'
            }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this skill do?"
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                background: cssVars.bgTertiary,
                border: `1px solid ${cssVars.border}`,
                borderRadius: '8px',
                color: cssVars.textPrimary,
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '16px 24px',
          borderTop: `1px solid ${cssVars.border}`
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: cssVars.bgTertiary,
              border: `1px solid ${cssVars.border}`,
              borderRadius: '8px',
              color: cssVars.textPrimary,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '10px 20px',
              background: cssVars.primary,
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? 'Saving...' : (editSkill ? 'Save Changes' : 'Create Skill')}
          </button>
        </div>
      </div>
    </div>
  )
}

// VPS Connection Modal
function VPSModal({ show, onClose, onSave, editServer }) {
  const [name, setName] = useState('')
  const [host, setHost] = useState('')
  const [port, setPort] = useState('22')
  const [username, setUsername] = useState('root')
  const [privateKey, setPrivateKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [error, setError] = useState(null)

  // Reset form when modal opens/closes or editServer changes
  useEffect(() => {
    if (show && editServer) {
      setName(editServer.name || '')
      setHost(editServer.host || '')
      setPort(editServer.port || '22')
      setUsername(editServer.username || 'root')
      setPrivateKey(editServer.privateKey || '')
      setTestResult(editServer.lastTestSuccess ? { success: true, message: 'Previously connected successfully' } : null)
    } else if (show) {
      // Reset to defaults for new server
      setName('')
      setHost('')
      setPort('22')
      setUsername('root')
      setPrivateKey('')
      setShowKey(false)
      setTestResult(null)
      setError(null)
    }
  }, [show, editServer])

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    setError(null)

    try {
      const res = await fetch('/api/ssh/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: host.trim(),
          port: parseInt(port) || 22,
          username: username.trim() || 'root',
          private_key: privateKey.trim() || null
        })
      })

      const data = await res.json()
      setTestResult(data)
    } catch (err) {
      setTestResult({ success: false, message: 'Failed to test connection. Network error.' })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = () => {
    setError(null)

    // Validate
    if (!name.trim()) {
      setError('Server name is required')
      return
    }
    if (!host.trim()) {
      setError('Host/IP is required')
      return
    }

    setSaving(true)

    const server = {
      id: editServer?.id || `vps-${Date.now()}`,
      name: name.trim(),
      host: host.trim(),
      port: port || '22',
      username: username.trim() || 'root',
      privateKey: privateKey.trim(),
      lastTestSuccess: testResult?.success || false,
      lastTestTime: testResult?.success ? new Date().toISOString() : editServer?.lastTestTime,
      serverInfo: testResult?.server_info || editServer?.serverInfo
    }

    onSave(server)
    setSaving(false)
    onClose()
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: cssVars.bgSecondary,
        borderRadius: '16px',
        width: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        border: `1px solid ${cssVars.border}`
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: `1px solid ${cssVars.border}`
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            {editServer ? 'Edit VPS Connection' : 'Add VPS Connection'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: cssVars.textMuted,
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${cssVars.error}`,
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: cssVars.error,
              fontSize: '13px'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Server Name */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                Server Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Production Server, Dev VPS"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: cssVars.bgTertiary,
                  border: `1px solid ${cssVars.border}`,
                  borderRadius: '8px',
                  color: cssVars.textPrimary,
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ fontSize: '11px', color: cssVars.textMuted, marginTop: '4px' }}>
                A friendly name to identify this server
              </div>
            </div>

            {/* Host and Port */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                  Host / IP Address
                </label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="e.g., 192.168.1.100 or server.example.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: cssVars.bgTertiary,
                    border: `1px solid ${cssVars.border}`,
                    borderRadius: '8px',
                    color: cssVars.textPrimary,
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                  Port
                </label>
                <input
                  type="text"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="22"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: cssVars.bgTertiary,
                    border: `1px solid ${cssVars.border}`,
                    borderRadius: '8px',
                    color: cssVars.textPrimary,
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="root"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: cssVars.bgTertiary,
                  border: `1px solid ${cssVars.border}`,
                  borderRadius: '8px',
                  color: cssVars.textPrimary,
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* SSH Private Key */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                SSH Private Key
              </label>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----"
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    paddingRight: '40px',
                    background: cssVars.bgTertiary,
                    border: `1px solid ${cssVars.border}`,
                    borderRadius: '8px',
                    color: showKey ? cssVars.textPrimary : 'transparent',
                    textShadow: showKey ? 'none' : '0 0 8px rgba(255,255,255,0.5)',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: cssVars.textMuted,
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div style={{ fontSize: '11px', color: cssVars.textMuted, marginTop: '4px' }}>
                Paste your private key or leave empty to use password authentication
              </div>
            </div>
          </div>

          {/* Test Connection Button */}
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={handleTest}
              disabled={testing || !host.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: cssVars.bgTertiary,
                border: `1px solid ${cssVars.border}`,
                borderRadius: '8px',
                color: cssVars.textPrimary,
                fontSize: '13px',
                cursor: testing || !host.trim() ? 'not-allowed' : 'pointer',
                opacity: testing || !host.trim() ? 0.5 : 1
              }}
            >
              {testing ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Monitor size={16} />
              )}
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            {/* Test Result */}
            {testResult && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                background: testResult.success
                  ? 'rgba(34, 197, 94, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${testResult.success ? cssVars.success : cssVars.error}`,
                borderRadius: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: testResult.success ? cssVars.success : cssVars.error,
                  fontSize: '13px'
                }}>
                  {testResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {testResult.message}
                </div>
                {testResult.success && testResult.server_info && (
                  <div style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: cssVars.textSecondary,
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: '4px 12px'
                  }}>
                    <span>Hostname:</span>
                    <span>{testResult.server_info.hostname}</span>
                    <span>User:</span>
                    <span>{testResult.server_info.user}</span>
                    {testResult.server_info.os && (
                      <>
                        <span>OS:</span>
                        <span>{testResult.server_info.os}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(234, 179, 8, 0.1)',
            borderRadius: '8px',
            borderLeft: `3px solid ${cssVars.warning}`,
            display: 'flex',
            gap: '8px'
          }}>
            <AlertTriangle size={16} style={{ color: cssVars.warning, flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '12px', color: cssVars.textSecondary }}>
              <strong style={{ color: cssVars.warning }}>Security Note:</strong> Your SSH key is stored locally in your browser and never sent to our servers. Only the connection parameters are used when you work with this VPS.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '16px 24px',
          borderTop: `1px solid ${cssVars.border}`,
          background: cssVars.bgTertiary
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: `1px solid ${cssVars.border}`,
              borderRadius: '8px',
              color: cssVars.textPrimary,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || !host.trim()}
            style={{
              padding: '10px 20px',
              background: cssVars.primary,
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: saving || !name.trim() || !host.trim() ? 'not-allowed' : 'pointer',
              opacity: saving || !name.trim() || !host.trim() ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            {editServer ? 'Save Changes' : 'Add Server'}
          </button>
        </div>
      </div>
    </div>
  )
}

// VPS Connections Settings Section
function VPSConnectionsSettings() {
  const [servers, setServers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingServer, setEditingServer] = useState(null)
  const [showHelp, setShowHelp] = useState(false)

  // Load servers from localStorage
  useEffect(() => {
    const savedServers = localStorage.getItem('vps_servers')
    if (savedServers) {
      try {
        setServers(JSON.parse(savedServers))
      } catch (e) {
        console.error('Failed to parse VPS servers:', e)
      }
    }
  }, [])

  // Save servers to localStorage
  const saveServers = (newServers) => {
    setServers(newServers)
    localStorage.setItem('vps_servers', JSON.stringify(newServers))
  }

  const handleAddServer = (server) => {
    if (editingServer) {
      // Update existing
      const updated = servers.map(s => s.id === server.id ? server : s)
      saveServers(updated)
    } else {
      // Add new
      saveServers([...servers, server])
    }
    setEditingServer(null)
  }

  const handleEditServer = (server) => {
    setEditingServer(server)
    setShowModal(true)
  }

  const handleDeleteServer = (serverId) => {
    if (window.confirm('Are you sure you want to remove this VPS connection?')) {
      saveServers(servers.filter(s => s.id !== serverId))
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>VPS Connections</h2>
      </div>
      <p style={{ color: cssVars.textSecondary, fontSize: '14px', marginBottom: '24px' }}>
        Manage your VPS/remote server connections. These servers are available when creating new projects.
      </p>

      {/* What is VPS? Help Section */}
      <div style={{ marginBottom: '20px' }}>
        <div
          onClick={() => setShowHelp(!showHelp)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '8px 0'
          }}
        >
          <span style={{
            fontSize: '10px',
            color: cssVars.textMuted,
            transition: 'transform 0.2s',
            transform: showHelp ? 'rotate(90deg)' : 'rotate(0deg)'
          }}>
            ▶
          </span>
          <span style={{ fontSize: '13px', color: cssVars.primary }}>How does VPS connection work?</span>
        </div>
        {showHelp && (
          <div style={{
            background: cssVars.bgPrimary,
            border: `1px solid ${cssVars.border}`,
            borderRadius: '12px',
            padding: '20px',
            marginTop: '8px'
          }}>
            <p style={{ margin: '0 0 16px 0', lineHeight: '1.6' }}>
              <strong>VPS Connections</strong> allow HubLLM to connect directly to your remote servers via SSH. This enables:
            </p>
            <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>Direct file access and editing on your server</li>
              <li>Running terminal commands remotely</li>
              <li>AI-assisted server management and deployment</li>
              <li>Secure connection using SSH keys</li>
            </ul>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              padding: '16px',
              background: cssVars.bgSecondary,
              borderRadius: '8px'
            }}>
              <span style={{ background: 'rgba(59, 130, 246, 0.2)', border: `1px solid ${cssVars.primary}`, padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>💻 HubLLM</span>
              <span style={{ color: cssVars.textMuted }}>→</span>
              <span style={{ background: 'rgba(168, 85, 247, 0.2)', border: '1px solid #a855f7', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>🔐 SSH</span>
              <span style={{ color: cssVars.textMuted }}>→</span>
              <span style={{ background: 'rgba(34, 197, 94, 0.2)', border: `1px solid ${cssVars.success}`, padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>🖥️ VPS</span>
            </div>
          </div>
        )}
      </div>

      {/* Server List Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <span style={{ fontWeight: '500' }}>Your VPS Servers</span>
        <button
          onClick={() => {
            setEditingServer(null)
            setShowModal(true)
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: cssVars.primary,
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          Add VPS Connection
        </button>
      </div>

      {/* Server List */}
      <div style={{
        background: cssVars.bgTertiary,
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        {servers.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: cssVars.textMuted
          }}>
            <Server size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>No VPS connections configured</div>
            <div style={{ fontSize: '12px' }}>Click "Add VPS Connection" to add your first server</div>
          </div>
        ) : (
          servers.map((server, index) => (
            <div
              key={server.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: index < servers.length - 1 ? `1px solid ${cssVars.border}` : 'none',
                gap: '16px'
              }}
            >
              {/* Icon */}
              <div style={{
                width: '44px',
                height: '44px',
                background: cssVars.bgSecondary,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Server size={22} style={{ color: cssVars.primary }} />
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>{server.name}</div>
                <div style={{ fontSize: '12px', color: cssVars.textMuted }}>
                  {server.username}@{server.host}:{server.port}
                </div>
              </div>

              {/* Status */}
              <div style={{
                fontSize: '12px',
                color: server.lastTestSuccess ? cssVars.success : cssVars.textMuted,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {server.lastTestSuccess ? '● Connected' : '○ Not tested'}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleEditServer(server)}
                  style={{
                    padding: '6px 12px',
                    background: cssVars.bgSecondary,
                    border: `1px solid ${cssVars.border}`,
                    borderRadius: '6px',
                    color: cssVars.textPrimary,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Edit2 size={12} />
                  Configure
                </button>
                <button
                  onClick={() => handleDeleteServer(server.id)}
                  style={{
                    padding: '6px 8px',
                    background: cssVars.bgSecondary,
                    border: `1px solid ${cssVars.border}`,
                    borderRadius: '6px',
                    color: cssVars.error,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '8px',
        borderLeft: `3px solid ${cssVars.primary}`
      }}>
        <div style={{ fontSize: '12px', color: cssVars.textSecondary }}>
          <strong>🔒 Security:</strong> Your SSH keys are stored locally in your browser only. We never store or transmit your private keys to any server.
        </div>
      </div>

      {/* Modal */}
      <VPSModal
        show={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingServer(null)
        }}
        onSave={handleAddServer}
        editServer={editingServer}
      />
    </div>
  )
}

// Main Settings Page
export default function Settings({ onBack, onLogout }) {
  const { user, getAuthHeader, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('subscription')

  const handleLogout = async () => {
    await logout()
    if (onLogout) onLogout()
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'subscription':
        return <AnthropicSubscription user={user} />
      case 'model':
        return <DefaultModelSettings />
      case 'voice':
        return <VoiceSettings />
      case 'profile':
        return <ProfileSettings user={user} getAuthHeader={getAuthHeader} onLogout={handleLogout} />
      case 'apikeys':
        return <APIKeysSettings />
      case 'appearance':
        return <AppearanceSettings />
      case 'agents':
        return <GlobalAgentsSettings />
      case 'skills':
        return <GlobalSkillsSettings />
      case 'mcp':
        return <GlobalMCPSettings />
      case 'vps':
        return <VPSConnectionsSettings />
      default:
        return <AnthropicSubscription user={user} />
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
            icon={Lock}
            label="Anthropic Subscription"
            active={activeTab === 'subscription'}
            onClick={() => setActiveTab('subscription')}
          />
          <NavItem
            icon={Monitor}
            label="Default Model"
            active={activeTab === 'model'}
            onClick={() => setActiveTab('model')}
          />
          <NavItem
            icon={Mic}
            label="Voice Input"
            active={activeTab === 'voice'}
            onClick={() => setActiveTab('voice')}
          />
          <NavItem
            icon={Key}
            label="API Keys"
            active={activeTab === 'apikeys'}
            onClick={() => setActiveTab('apikeys')}
          />
          <NavItem
            icon={User}
            label="Profile"
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          />
          <NavItem
            icon={Palette}
            label="Appearance"
            active={activeTab === 'appearance'}
            onClick={() => setActiveTab('appearance')}
          />

          {/* Integrations Section */}
          <SectionHeader label="Integrations" />
          <NavItem
            icon={Bot}
            label="Global Agents"
            active={activeTab === 'agents'}
            onClick={() => setActiveTab('agents')}
          />
          <NavItem
            icon={Book}
            label="Skills"
            active={activeTab === 'skills'}
            onClick={() => setActiveTab('skills')}
          />
          <NavItem
            icon={Plug}
            label="MCP Servers"
            active={activeTab === 'mcp'}
            onClick={() => setActiveTab('mcp')}
          />
          <NavItem
            icon={Server}
            label="VPS Connections"
            active={activeTab === 'vps'}
            onClick={() => setActiveTab('vps')}
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
