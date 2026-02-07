import { useState, useEffect, useMemo } from 'react'
import { RefreshCw, Download, Info, Server } from 'lucide-react'

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

// S-43 to S-74: Anthropic Subscription Section
export default function AnthropicSubscription({ user }) {
  const [crossLLMEnabled, setCrossLLMEnabled] = useState(false)
  const [bridgeInstalled, setBridgeInstalled] = useState(false)
  const [vpsServers, setVpsServers] = useState([])

  // Read VPS servers from localStorage to determine real connection status
  useEffect(() => {
    const saved = localStorage.getItem('vps_servers')
    if (saved) {
      try { setVpsServers(JSON.parse(saved)) } catch { setVpsServers([]) }
    }
  }, [])

  // Derive connection status from VPS servers
  const connectedVps = useMemo(() => vpsServers.filter(s => s.lastTestSuccess), [vpsServers])
  const claudeCodeVps = useMemo(() => vpsServers.filter(s => s.claudeCodeDetected), [vpsServers])
  const isConnected = claudeCodeVps.length > 0
  const hasVps = connectedVps.length > 0

  const handleToggleCrossLLM = () => {
    setCrossLLMEnabled(!crossLLMEnabled)
  }

  const handleReauthenticate = () => {
    // Placeholder for re-authentication logic
    alert('Re-authenticating with Anthropic...')
  }

  const handleReinstallCLI = () => {
    // Placeholder for CLI reinstall logic
    alert('Reinstalling Claude Code CLI...')
  }

  const handleInstallBridgeScript = () => {
    // Placeholder for bridge script installation
    setBridgeInstalled(true)
    alert('Installing cross-LLM bridge script...')
  }

  return (
    <div>
      {/* S-44: Section Title */}
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        marginBottom: '8px'
      }}>
        Anthropic Subscription
      </h2>

      {/* S-45: Section Description */}
      <p style={{
        color: cssVars.textSecondary,
        fontSize: '14px',
        marginBottom: '24px'
      }}>
        Connect your Anthropic account to access Claude Code CLI and authenticate with your subscription.
      </p>

      {/* S-46: Claude Code CLI Card */}
      <div style={{
        background: cssVars.bgTertiary,
        borderRadius: '12px',
        padding: '24px',
        marginTop: '16px'
      }}>
        {/* S-47: CLI Header Container */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '20px'
        }}>
          {/* S-48: CLI Icon */}
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
🔴
          </div>

          {/* S-49: CLI Info Container */}
          <div>
            {/* S-50: CLI Title */}
            <div style={{
              fontWeight: '600',
              fontSize: '16px'
            }}>
              Claude Code CLI
            </div>
            {/* S-51: CLI Description */}
            <div style={{
              fontSize: '13px',
              color: cssVars.textSecondary
            }}>
              Command-line access to Claude for development workflows
            </div>
          </div>
        </div>

        {/* S-52: Connection Status Card */}
        <div style={{
          background: cssVars.bgSecondary,
          border: `1px solid ${cssVars.border}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* S-53: Status Indicator Dot */}
            <div style={{
              width: '12px',
              height: '12px',
              background: isConnected ? cssVars.success : hasVps ? cssVars.warning : cssVars.error,
              borderRadius: '50%'
            }} />

            <div style={{ flex: 1 }}>
              {/* S-54: Connection Status Text */}
              <div style={{ fontWeight: '500' }}>
                {isConnected ? 'Claude Code Detected' : hasVps ? 'VPS Connected — Claude Code Not Detected' : 'No VPS Connected'}
              </div>
              {/* S-55: Status Detail */}
              <div style={{
                fontSize: '12px',
                color: cssVars.textSecondary
              }}>
                {isConnected
                  ? `Claude Code found on ${claudeCodeVps.length} VPS${claudeCodeVps.length > 1 ? 'es' : ''}: ${claudeCodeVps.map(s => s.name || s.host).join(', ')}`
                  : hasVps
                    ? `${connectedVps.length} VPS connected, but Claude Code not detected. Install Claude Code on your VPS and re-test.`
                    : 'Add a VPS in VPS Connections settings to use your Anthropic Pro subscription.'
                }
              </div>
            </div>
          </div>
        </div>

        {/* S-57: CLI Status Info */}
        <div style={{
          fontSize: '13px',
          color: cssVars.textSecondary,
          marginBottom: '16px'
        }}>
          <strong>CLI Status:</strong> {isConnected ? 'Detected on VPS' : 'Not detected'} &nbsp;|&nbsp; <strong>VPS Servers:</strong> {vpsServers.length}
        </div>

        {/* S-58: CLI Action Buttons Container */}
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          {/* S-59: Re-authenticate Button */}
          <button
            onClick={handleReauthenticate}
            style={{
              padding: '10px 20px',
              background: cssVars.primary,
              color: cssVars.textPrimary,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <RefreshCw size={16} />
            Re-authenticate
          </button>

          {/* S-60: Reinstall CLI Button */}
          <button
            onClick={handleReinstallCLI}
            style={{
              padding: '10px 20px',
              background: cssVars.bgTertiary,
              color: cssVars.textPrimary,
              border: `1px solid ${cssVars.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Download size={16} />
            Reinstall CLI
          </button>
        </div>
      </div>

      {/* S-61: Cross-LLM Requests Card */}
      <div style={{
        background: cssVars.bgTertiary,
        borderRadius: '12px',
        padding: '24px',
        marginTop: '20px',
        border: `1px solid ${cssVars.border}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px'
        }}>
          {/* S-62: Cross-LLM Checkbox */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '4px'
          }}>
            <input
              type="checkbox"
              id="cross-llm-checkbox"
              checked={crossLLMEnabled}
              onChange={handleToggleCrossLLM}
              style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                accentColor: cssVars.primary
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            {/* S-63: Cross-LLM Label */}
            <label
              htmlFor="cross-llm-checkbox"
              style={{
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
                display: 'block'
              }}
            >
              Enable Cross-LLM Requests via OpenRouter
            </label>

            {/* S-64: Cross-LLM Description */}
            <div style={{
              fontSize: '13px',
              color: cssVars.textSecondary,
              marginTop: '4px'
            }}>
              Allow Claude CLI to call other LLMs (GPT, Gemini, etc.) through OpenRouter when you ask it to.
              For example: {/* S-65: Cross-LLM Code Example */}
              <code style={{
                background: cssVars.bgSecondary,
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                "Ask GPT-5.2-Codex to review this file"
              </code>
            </div>
          </div>
        </div>

        {/* S-66: Cross-LLM Options Panel (shown when enabled) */}
        {crossLLMEnabled && (
          <div style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: `1px solid ${cssVars.border}`
          }}>
            {/* S-67: OpenRouter Warning Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                background: cssVars.warning,
                borderRadius: '50%'
              }} />
              <span style={{
                fontSize: '13px',
                color: cssVars.textSecondary
              }}>
                Requires OpenRouter API key in API Keys settings
              </span>
            </div>

            {/* S-68: Bridge Script Card */}
            <div style={{
              background: cssVars.bgSecondary,
              border: `1px solid ${cssVars.border}`,
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              {/* S-69: Bridge Script Title */}
              <div style={{
                fontWeight: '500',
                marginBottom: '8px'
              }}>
🔧 Cross-LLM Bridge Script
              </div>

              {/* S-70: Bridge Script Description */}
              <div style={{
                fontSize: '13px',
                color: cssVars.textSecondary,
                marginBottom: '12px'
              }}>
                This script enables Claude CLI to route requests to other models via OpenRouter.
                Once installed, you can ask Claude to consult other AI models during your coding sessions.
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                {/* S-71: Install Bridge Script Button */}
                <button
                  onClick={handleInstallBridgeScript}
                  style={{
                    padding: '10px 20px',
                    background: cssVars.primary,
                    color: cssVars.textPrimary,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
🚀 Install Bridge Script
                </button>

                {/* S-72: Bridge Script Status */}
                <span style={{
                  fontSize: '12px',
                  color: cssVars.textMuted
                }}>
                  Status: {bridgeInstalled ? 'Installed' : 'Not installed'}
                </span>
              </div>
            </div>

            {/* S-73: Usage Tips Box */}
            <div style={{
              fontSize: '12px',
              color: cssVars.textMuted,
              padding: '12px',
              background: 'rgba(234, 179, 8, 0.1)',
              borderRadius: '8px',
              borderLeft: `3px solid ${cssVars.warning}`
            }}>
              <strong>💡 Usage:</strong> After installing, you can say things like:<br />
              • "Ask GPT-5.2-Codex to review this function"<br />
              • "Have Gemini Pro analyze this architecture"<br />
              • "Get a second opinion from GPT-4o on this approach"
            </div>
          </div>
        )}
      </div>

      {/* S-74: Subscription Note Box */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '8px',
        borderLeft: `3px solid ${cssVars.primary}`
      }}>
        <div style={{
          fontSize: '13px',
          color: cssVars.textSecondary
        }}>
          <strong>Note:</strong> Your Anthropic subscription provides unlimited access to Claude models.
          Using other LLMs via OpenRouter is a paid feature and will use your OpenRouter credits.
        </div>
      </div>
    </div>
  )
}
