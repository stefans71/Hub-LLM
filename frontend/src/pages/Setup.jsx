import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  Key,
  Server,
  Sparkles,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react'

// CSS Variables matching the project style
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
  textPrimary: '#ffffff',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280'
}

// Step indicator component
function StepIndicator({ steps, currentStep }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginBottom: '32px'
    }}>
      {steps.map((step, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 600,
            background: index < currentStep ? cssVars.success
              : index === currentStep ? cssVars.primary
              : cssVars.bgTertiary,
            color: index <= currentStep ? '#fff' : cssVars.textMuted,
            transition: 'all 0.3s ease'
          }}>
            {index < currentStep ? <CheckCircle size={16} /> : index + 1}
          </div>
          {index < steps.length - 1 && (
            <div style={{
              width: '60px',
              height: '2px',
              background: index < currentStep ? cssVars.success : cssVars.bgTertiary,
              transition: 'all 0.3s ease'
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

// Path selection card
function PathCard({ icon: Icon, title, description, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '24px',
        background: selected ? `${cssVars.primary}15` : cssVars.bgSecondary,
        border: `2px solid ${selected ? cssVars.primary : cssVars.border}`,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        flex: 1,
        minWidth: '240px'
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.borderColor = cssVars.textMuted
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.borderColor = cssVars.border
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: selected ? cssVars.primary : cssVars.bgTertiary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}>
          <Icon size={24} style={{ color: selected ? '#fff' : cssVars.textSecondary }} />
        </div>
        <div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: cssVars.textPrimary,
            marginBottom: '4px'
          }}>{title}</h3>
        </div>
      </div>
      <p style={{
        fontSize: '14px',
        color: cssVars.textSecondary,
        lineHeight: 1.5
      }}>{description}</p>
    </div>
  )
}

// Step 1: Choose Path
function ChoosePathStep({ path, setPath, onNext }) {
  return (
    <div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 700,
        color: cssVars.textPrimary,
        textAlign: 'center',
        marginBottom: '8px'
      }}>
        Welcome to HubLLM
      </h2>
      <p style={{
        fontSize: '14px',
        color: cssVars.textSecondary,
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        How would you like to connect to AI models?
      </p>

      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '32px'
      }}>
        <PathCard
          icon={Key}
          title="OpenRouter API Key"
          description="Use your OpenRouter API key to access multiple AI models including Claude, GPT-4, and more. Pay per API call."
          selected={path === 'openrouter'}
          onClick={() => setPath('openrouter')}
        />
        <PathCard
          icon={Sparkles}
          title="Anthropic Pro Subscription"
          description="Connect to a VPS with Claude Code installed. Use your Anthropic Pro subscription for unlimited Claude access."
          selected={path === 'anthropic'}
          onClick={() => setPath('anthropic')}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={onNext}
          disabled={!path}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: path ? cssVars.primary : cssVars.bgTertiary,
            color: path ? '#fff' : cssVars.textMuted,
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: path ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease'
          }}
        >
          Continue
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

// Step 2a: OpenRouter Setup
function OpenRouterStep({ onBack, onComplete }) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState(null)
  const [validated, setValidated] = useState(false)

  // Load existing key
  useEffect(() => {
    const savedKey = localStorage.getItem('openrouter_key')
    if (savedKey) {
      setApiKey(savedKey)
      setValidated(true)
    }
  }, [])

  const validateKey = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your OpenRouter API key')
      return
    }

    setValidating(true)
    setError(null)

    try {
      // Validate by calling OpenRouter API
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      const res = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin
        },
        signal: controller.signal
      })

      clearTimeout(timeout)

      if (!res.ok) {
        throw new Error('Invalid API key')
      }

      // Save key to localStorage
      localStorage.setItem('openrouter_key', apiKey)
      setValidated(true)
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.')
      } else {
        setError(err.message || 'Failed to validate API key')
      }
    } finally {
      setValidating(false)
    }
  }

  return (
    <div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 700,
        color: cssVars.textPrimary,
        textAlign: 'center',
        marginBottom: '8px'
      }}>
        Connect OpenRouter
      </h2>
      <p style={{
        fontSize: '14px',
        color: cssVars.textSecondary,
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        Enter your OpenRouter API key to access AI models
      </p>

      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <label style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: 600,
          color: cssVars.textSecondary,
          textTransform: 'uppercase',
          marginBottom: '8px'
        }}>
          API Key
        </label>
        <div style={{ position: 'relative', marginBottom: '8px' }}>
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); setValidated(false); setError(null) }}
            placeholder="sk-or-v1-..."
            style={{
              width: '100%',
              padding: '12px 48px 12px 12px',
              background: cssVars.bgSecondary,
              border: `1px solid ${error ? cssVars.error : validated ? cssVars.success : cssVars.border}`,
              borderRadius: '8px',
              color: cssVars.textPrimary,
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <button
            onClick={() => setShowKey(!showKey)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: cssVars.textMuted,
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <a
          href="https://openrouter.ai/keys"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            color: cssVars.primary,
            textDecoration: 'none',
            marginBottom: '16px'
          }}
        >
          Get your API key from OpenRouter
          <ExternalLink size={12} />
        </a>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            background: `${cssVars.error}15`,
            border: `1px solid ${cssVars.error}50`,
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} style={{ color: cssVars.error }} />
            <span style={{ fontSize: '14px', color: cssVars.error }}>{error}</span>
          </div>
        )}

        {validated && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            background: `${cssVars.success}15`,
            border: `1px solid ${cssVars.success}50`,
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <CheckCircle size={16} style={{ color: cssVars.success }} />
            <span style={{ fontSize: '14px', color: cssVars.success }}>API key validated successfully!</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: cssVars.bgTertiary,
              color: cssVars.textSecondary,
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          {!validated ? (
            <button
              onClick={validateKey}
              disabled={validating || !apiKey.trim()}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: apiKey.trim() ? cssVars.primary : cssVars.bgTertiary,
                color: apiKey.trim() ? '#fff' : cssVars.textMuted,
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: apiKey.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease'
              }}
            >
              {validating && <Loader2 size={16} className="animate-spin" />}
              {validating ? 'Validating...' : 'Validate Key'}
            </button>
          ) : (
            <button
              onClick={onComplete}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: cssVars.success,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Complete Setup
              <CheckCircle size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Step 2b: Anthropic Pro / VPS Setup
function AnthropicStep({ onBack, onComplete }) {
  const [host, setHost] = useState('')
  const [port, setPort] = useState('22')
  const [username, setUsername] = useState('')
  const [authMode, setAuthMode] = useState('password')
  const [password, setPassword] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)
  const [connected, setConnected] = useState(false)
  const [claudeCodeDetected, setClaudeCodeDetected] = useState(false)
  const [serverInfo, setServerInfo] = useState(null)

  const connectVPS = async () => {
    if (!host || !username) {
      setError('Host and username are required')
      return
    }

    // Validate auth credentials
    if (authMode === 'password' && !password) {
      setError('Password is required')
      return
    }
    if (authMode === 'key' && !privateKey) {
      setError('SSH private key is required')
      return
    }

    setConnecting(true)
    setError(null)

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)

      // BUG-17: Use correct endpoint /api/ssh/test (not /api/vps/test)
      const res = await fetch('/api/ssh/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host,
          port: parseInt(port) || 22,
          username,
          password: authMode === 'password' ? password : null,
          private_key: authMode === 'key' ? privateKey : null
        }),
        signal: controller.signal
      })

      clearTimeout(timeout)

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.message || 'Connection failed')
      }

      setConnected(true)
      setServerInfo(data.server_info)

      // BUG-17: Save VPS to localStorage after successful test
      const savedServers = localStorage.getItem('vps_servers')
      const servers = savedServers ? JSON.parse(savedServers) : []

      const newServerId = `vps_${Date.now()}`
      const newServer = {
        id: newServerId,
        name: data.server_info?.hostname || host,
        host,
        port: port || '22',
        username,
        auth_type: authMode,
        password: authMode === 'password' ? password : '',
        privateKey: authMode === 'key' ? privateKey : '',
        lastTestSuccess: true,
        serverInfo: data.server_info || null,
        createdAt: new Date().toISOString()
      }

      servers.push(newServer)
      localStorage.setItem('vps_servers', JSON.stringify(servers))

      // Check for Claude Code (would need to call detection endpoint)
      // For now, we'll leave this as false and let the workspace detect it
      setClaudeCodeDetected(false)
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Connection timed out. Please check your VPS settings.')
      } else {
        setError(err.message || 'Failed to connect to VPS')
      }
    } finally {
      setConnecting(false)
    }
  }

  const saveVPSConfig = async () => {
    // VPS is already saved to localStorage in connectVPS()
    // Just complete the setup
    onComplete()
  }

  return (
    <div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 700,
        color: cssVars.textPrimary,
        textAlign: 'center',
        marginBottom: '8px'
      }}>
        Connect Your VPS
      </h2>
      <p style={{
        fontSize: '14px',
        color: cssVars.textSecondary,
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        Connect to a VPS with Claude Code installed to use your Anthropic Pro subscription
      </p>

      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        {!connected ? (
          <>
            {/* Host and Port */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: cssVars.textSecondary,
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}>Host</label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="192.168.1.1 or hostname.com"
                  style={{
                    width: '100%',
                    padding: '12px',
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
              <div style={{ width: '80px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: cssVars.textSecondary,
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}>Port</label>
                <input
                  type="text"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
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
            </div>

            {/* Username */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: cssVars.textSecondary,
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="root"
                style={{
                  width: '100%',
                  padding: '12px',
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

            {/* Auth Mode Toggle */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: cssVars.textSecondary,
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>Authentication</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button
                  onClick={() => setAuthMode('password')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: authMode === 'password' ? cssVars.primary : cssVars.bgTertiary,
                    color: authMode === 'password' ? '#fff' : cssVars.textSecondary,
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Password
                </button>
                <button
                  onClick={() => setAuthMode('key')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: authMode === 'key' ? cssVars.primary : cssVars.bgTertiary,
                    color: authMode === 'key' ? '#fff' : cssVars.textSecondary,
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  SSH Key
                </button>
              </div>

              {authMode === 'password' ? (
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    style={{
                      width: '100%',
                      padding: '12px 48px 12px 12px',
                      background: cssVars.bgSecondary,
                      border: `1px solid ${cssVars.border}`,
                      borderRadius: '8px',
                      color: cssVars.textPrimary,
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: cssVars.textMuted,
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              ) : (
                <textarea
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder={`-----BEGIN RSA PRIVATE KEY-----
...your key content...
-----END RSA PRIVATE KEY-----`}
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '12px',
                    background: cssVars.bgSecondary,
                    border: `1px solid ${cssVars.border}`,
                    borderRadius: '8px',
                    color: cssVars.textPrimary,
                    fontSize: '11px',
                    fontFamily: 'Monaco, Consolas, monospace',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    whiteSpace: 'pre'
                  }}
                />
              )}
            </div>
          </>
        ) : (
          <>
            {/* Connected state */}
            <div style={{
              padding: '16px',
              background: `${cssVars.success}15`,
              border: `1px solid ${cssVars.success}50`,
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CheckCircle size={20} style={{ color: cssVars.success }} />
                <span style={{ fontSize: '15px', fontWeight: 600, color: cssVars.success }}>
                  Connected to {host}
                </span>
              </div>
              {serverInfo?.os && (
                <p style={{ fontSize: '13px', color: cssVars.textSecondary, margin: 0 }}>
                  {serverInfo.os}
                </p>
              )}
            </div>

            {/* Claude Code status */}
            <div style={{
              padding: '16px',
              background: claudeCodeDetected ? `${cssVars.success}15` : `${cssVars.accent}15`,
              border: `1px solid ${claudeCodeDetected ? cssVars.success : cssVars.accent}50`,
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              {claudeCodeDetected ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} style={{ color: cssVars.success }} />
                  <span style={{ fontSize: '14px', color: cssVars.success }}>
                    Claude Code detected and ready!
                  </span>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <AlertCircle size={20} style={{ color: cssVars.accent }} />
                    <span style={{ fontSize: '14px', color: cssVars.accent }}>
                      Claude Code not detected
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: cssVars.textSecondary, margin: '0 0 12px 0' }}>
                    Install Claude Code on your VPS to use your Anthropic Pro subscription.
                  </p>
                  <a
                    href="https://docs.anthropic.com/claude-code/getting-started"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                      color: cssVars.primary,
                      textDecoration: 'none'
                    }}
                  >
                    View installation guide
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </>
        )}

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            background: `${cssVars.error}15`,
            border: `1px solid ${cssVars.error}50`,
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} style={{ color: cssVars.error }} />
            <span style={{ fontSize: '14px', color: cssVars.error }}>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: cssVars.bgTertiary,
              color: cssVars.textSecondary,
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          {!connected ? (
            <button
              onClick={connectVPS}
              disabled={connecting || !host || !username}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: (host && username) ? cssVars.primary : cssVars.bgTertiary,
                color: (host && username) ? '#fff' : cssVars.textMuted,
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: (host && username) ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease'
              }}
            >
              {connecting && <Loader2 size={16} className="animate-spin" />}
              {connecting ? 'Connecting...' : 'Test Connection'}
            </button>
          ) : (
            <button
              onClick={saveVPSConfig}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: cssVars.success,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Complete Setup
              <CheckCircle size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Setup component
export default function Setup({ onComplete }) {
  const { user, getAuthHeader } = useAuth()
  const [step, setStep] = useState(0)
  const [path, setPath] = useState(null)
  const [completing, setCompleting] = useState(false)

  const steps = ['Choose Path', 'Configure', 'Done']

  const handleComplete = async () => {
    setCompleting(true)
    try {
      // Mark setup as complete on backend
      const res = await fetch('/api/auth/me/setup-complete', {
        method: 'POST',
        headers: {
          ...getAuthHeader()
        }
      })

      if (!res.ok) {
        throw new Error('Failed to complete setup')
      }

      // Call the onComplete callback to navigate away
      onComplete()
    } catch (err) {
      console.error('Failed to complete setup:', err)
      // Still complete locally
      onComplete()
    } finally {
      setCompleting(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <ChoosePathStep
            path={path}
            setPath={setPath}
            onNext={() => setStep(1)}
          />
        )
      case 1:
        if (path === 'openrouter') {
          return (
            <OpenRouterStep
              onBack={() => setStep(0)}
              onComplete={handleComplete}
            />
          )
        } else {
          return (
            <AnthropicStep
              onBack={() => setStep(0)}
              onComplete={handleComplete}
            />
          )
        }
      default:
        return null
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: cssVars.bgPrimary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '640px',
        padding: '40px',
        background: cssVars.bgSecondary,
        borderRadius: '16px',
        border: `1px solid ${cssVars.border}`
      }}>
        <StepIndicator steps={steps} currentStep={step} />
        {renderStep()}

        {/* Skip option */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: `1px solid ${cssVars.border}`
        }}>
          <button
            onClick={handleComplete}
            disabled={completing}
            style={{
              background: 'none',
              border: 'none',
              color: cssVars.textMuted,
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {completing ? 'Finishing...' : 'Skip for now'}
          </button>
        </div>
      </div>
    </div>
  )
}
