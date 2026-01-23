import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useVoice } from '../components/VoiceInput'
import {
  ChevronRight, ChevronDown, Upload, Mic, MicOff, Send, X, Plus,
  Cloud, Server, Check, Sparkles, Zap, ExternalLink, Loader,
  FileText, Shield, CheckSquare, Wrench, Database,
  MessageSquare, FolderOpen
} from 'lucide-react'

// CSS Variables matching the mockup
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
  textMuted: '#6b7280',
}

// Reusable Input component
const Input = ({ label, placeholder, value, onChange, style }) => (
  <div style={style}>
    <label style={{
      display: 'block',
      fontSize: '12px',
      fontWeight: 600,
      color: cssVars.textSecondary,
      textTransform: 'uppercase',
      marginBottom: '8px'
    }}>{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
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
)

// Reusable Select component
const Select = ({ label, options, value, onChange, style }) => (
  <div style={style}>
    <label style={{
      display: 'block',
      fontSize: '12px',
      fontWeight: 600,
      color: cssVars.textSecondary,
      textTransform: 'uppercase',
      marginBottom: '8px'
    }}>{label}</label>
    <select
      value={value}
      onChange={onChange}
      style={{
        width: '100%',
        padding: '10px 12px',
        background: cssVars.bgSecondary,
        border: `1px solid ${cssVars.border}`,
        borderRadius: '8px',
        color: cssVars.textPrimary,
        fontSize: '14px',
        outline: 'none',
        cursor: 'pointer',
        boxSizing: 'border-box'
      }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
)

// Reusable Textarea component
const Textarea = ({ label, placeholder, value, onChange, style, minHeight = '100px' }) => (
  <div style={style}>
    <label style={{
      display: 'block',
      fontSize: '12px',
      fontWeight: 600,
      color: cssVars.textSecondary,
      textTransform: 'uppercase',
      marginBottom: '8px'
    }}>{label}</label>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%',
        minHeight,
        padding: '10px 12px',
        background: cssVars.bgSecondary,
        border: `1px solid ${cssVars.border}`,
        borderRadius: '8px',
        color: cssVars.textPrimary,
        fontSize: '13px',
        lineHeight: 1.5,
        outline: 'none',
        resize: 'vertical',
        fontFamily: 'inherit',
        boxSizing: 'border-box'
      }}
    />
  </div>
)

// Step Header component
const StepHeader = ({ number, title, badge }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
    <div style={{
      width: '28px',
      height: '28px',
      background: cssVars.primary,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 600,
      color: 'white'
    }}>{number}</div>
    <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{title}</h2>
    {badge && (
      <span style={{
        fontSize: '10px',
        background: 'rgba(34, 197, 94, 0.2)',
        color: cssVars.success,
        padding: '2px 8px',
        borderRadius: '4px'
      }}>{badge}</span>
    )}
  </div>
)

// Settings Panel wrapper
const SettingsPanel = ({ children }) => (
  <div style={{
    background: cssVars.bgSecondary,
    border: `1px solid ${cssVars.border}`,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px'
  }}>
    {children}
  </div>
)

// Button component
const Button = ({ children, variant = 'primary', onClick, style, disabled }) => {
  const baseStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.5 : 1,
    ...style
  }

  const variants = {
    primary: {
      background: cssVars.primary,
      color: 'white',
    },
    secondary: {
      background: cssVars.bgTertiary,
      color: cssVars.textPrimary,
      border: `1px solid ${cssVars.border}`
    },
    accent: {
      background: 'linear-gradient(135deg, #D97757 0%, #C4694A 100%)',
      color: 'white',
      boxShadow: '0 2px 8px rgba(217, 119, 87, 0.3)'
    },
    github: {
      background: '#24292e',
      color: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    },
    success: {
      background: cssVars.success,
      color: 'white',
      boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...baseStyle, ...variants[variant] }}
    >
      {children}
    </button>
  )
}

// AI Chat Message component
const ChatMessage = ({ message, isUser }) => (
  <div style={{
    display: 'flex',
    justifyContent: isUser ? 'flex-end' : 'flex-start',
    gap: '10px',
    marginBottom: '16px'
  }}>
    {!isUser && (
      <div style={{
        width: '28px',
        height: '28px',
        background: 'linear-gradient(135deg, #D97757 0%, #C4694A 100%)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: 'white'
      }}>
        <Sparkles size={14} />
      </div>
    )}
    <div style={{
      flex: isUser ? undefined : 1,
      maxWidth: isUser ? '80%' : undefined,
      background: isUser ? cssVars.primary : cssVars.bgTertiary,
      color: 'white',
      borderRadius: '8px',
      padding: isUser ? '10px 14px' : '12px',
      fontSize: '13px',
      lineHeight: 1.5
    }}>
      {message}
    </div>
  </div>
)

// Agent Item component
const AgentItem = ({ name, description, icon: Icon, color, checked, onChange, onEdit, isGlobal }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    borderRadius: '6px',
    opacity: checked ? 1 : 0.5
  }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
    />
    <div style={{
      width: '24px',
      height: '24px',
      background: `rgba(${color}, 0.15)`,
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Icon size={14} style={{ color: `rgb(${color})` }} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '12px', fontWeight: 500 }}>{name}</div>
      <div style={{ fontSize: '10px', color: cssVars.textMuted }}>{description}</div>
    </div>
    {isGlobal && onEdit && (
      <span
        onClick={onEdit}
        style={{ fontSize: '10px', color: cssVars.primary, cursor: 'pointer' }}
      >
        Edit Global →
      </span>
    )}
  </div>
)

// MCP Server Item component
const MCPServerItem = ({ name, status, icon: Icon, color, checked, onChange, onEdit, isGlobal }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    borderRadius: '6px',
    opacity: checked ? 1 : 0.5
  }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
    />
    <div style={{
      width: '24px',
      height: '24px',
      background: color,
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Icon size={14} style={{ color: 'white' }} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '12px', fontWeight: 500 }}>{name}</div>
      <div style={{
        fontSize: '10px',
        color: status === 'connected' ? cssVars.success : cssVars.textMuted
      }}>
        {status === 'connected' ? '● Connected' : '○ Not configured'}
      </div>
    </div>
    {isGlobal && onEdit && (
      <span
        onClick={onEdit}
        style={{ fontSize: '10px', color: cssVars.primary, cursor: 'pointer' }}
      >
        Edit Global →
      </span>
    )}
  </div>
)

export default function CreateProject({ onCancel, onCreateProject }) {
  const { getAuthHeader } = useAuth()
  const fileInputRef = useRef(null)
  const agentsCheckboxRef = useRef(null)
  const mcpCheckboxRef = useRef(null)

  // Form state
  const [formData, setFormData] = useState({
    workspace: 'customers',
    projectName: '',
    projectBrief: '',
    connectionType: 'github',
    githubConnected: false,
    githubUser: null,
    githubToken: null,
    selectedRepo: '',
    vpsServerId: '',
    vpsIp: '',
    vpsPort: '22',
    vpsKey: '',
    techStack: '',
    codeStandards: '',
    context: '',
    selectedAgents: ['code-reviewer', 'security-audit', 'test-writer'],
    selectedMCP: ['github', 'slack']
  })

  // GitHub repos state
  const [githubRepos, setGithubRepos] = useState([])
  const [loadingRepos, setLoadingRepos] = useState(false)

  // Create new repo state
  const [showCreateRepoForm, setShowCreateRepoForm] = useState(false)
  const [newRepoName, setNewRepoName] = useState('')
  const [creatingRepo, setCreatingRepo] = useState(false)
  const [createRepoError, setCreateRepoError] = useState('')

  // UI state
  const [showAIChat, setShowAIChat] = useState(false)
  const [showVPSFields, setShowVPSFields] = useState(false)
  const [showAgentHelp, setShowAgentHelp] = useState(false)
  const [showMCPHelp, setShowMCPHelp] = useState(false)
  const [showGlobalAgents, setShowGlobalAgents] = useState(true)
  const [showGlobalMCP, setShowGlobalMCP] = useState(true)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [contextGenerated, setContextGenerated] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState(null)

  // VPS test connection state
  const [testingVps, setTestingVps] = useState(false)
  const [vpsTestResult, setVpsTestResult] = useState(null) // { success: bool, message: string, server_info: {} }

  // Voice input for AI chat
  const { isListening, transcript, toggleListening, isSupported: voiceSupported } = useVoice()

  // Watch for voice transcription results and append to chat input
  useEffect(() => {
    if (transcript) {
      setChatInput(prev => prev + (prev ? ' ' : '') + transcript)
    }
  }, [transcript])

  // Available global agents
  const globalAgents = [
    { id: 'code-reviewer', name: 'code-reviewer', description: 'Reviews code for quality and best practices', icon: FileText, color: '59, 130, 246' },
    { id: 'security-audit', name: 'security-audit', description: 'Scans for vulnerabilities', icon: Shield, color: '239, 68, 68' },
    { id: 'test-writer', name: 'test-writer', description: 'Generates unit and integration tests', icon: CheckSquare, color: '34, 197, 94' },
  ]

  // Available global MCP servers
  const globalMCPServers = [
    { id: 'github', name: 'GitHub', status: 'connected', icon: () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ), color: 'rgba(36, 41, 46, 0.8)' },
    { id: 'slack', name: 'Slack', status: 'connected', icon: MessageSquare, color: 'rgba(74, 21, 75, 0.8)' },
    { id: 'google-drive', name: 'Google Drive', status: 'not-connected', icon: FolderOpen, color: 'rgba(66, 133, 244, 0.2)' },
  ]

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, projectBrief: event.target.result }))
        setUploadedFileName(file.name)
      }
      reader.readAsText(file)
    }
  }

  const handleTestVps = async () => {
    // Validate required fields
    if (!formData.vpsIp.trim()) {
      setVpsTestResult({ success: false, message: 'Please enter an IP address' })
      return
    }

    setTestingVps(true)
    setVpsTestResult(null)

    try {
      const response = await fetch('/api/ssh/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          host: formData.vpsIp.trim(),
          port: parseInt(formData.vpsPort) || 22,
          username: 'root', // Default username, could be made configurable
          private_key: formData.vpsKey.trim() || null
        })
      })

      const data = await response.json()
      setVpsTestResult(data)
    } catch (error) {
      setVpsTestResult({
        success: false,
        message: `Request failed: ${error.message}`
      })
    } finally {
      setTestingVps(false)
    }
  }

  const handleStartAIDefinition = async () => {
    if (!formData.projectBrief.trim()) return

    setShowAIChat(true)
    setIsGenerating(true)
    setChatMessages([])

    try {
      // Get API key from localStorage (BYOK model)
      const apiKey = localStorage.getItem('openrouter_key')

      const headers = {
        'Content-Type': 'application/json'
      }
      if (apiKey) {
        headers['X-OpenRouter-Key'] = apiKey
      }

      const res = await fetch('/api/ai/expand-brief', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          brief: formData.projectBrief,
          model: 'anthropic/claude-sonnet-4',
          provider: 'openrouter'
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || 'Failed to analyze brief')
      }

      const data = await res.json()

      // Update form with AI-generated context
      if (data.tech_stack || data.standards) {
        setFormData(prev => ({
          ...prev,
          techStack: data.tech_stack || prev.techStack,
          codeStandards: data.standards || prev.codeStandards,
          context: data.context || prev.context
        }))
        setContextGenerated(true)
      }

      // Add AI analysis as chat message
      setChatMessages([{
        role: 'assistant',
        content: data.analysis || `I've analyzed your project brief. Here's what I recommend:

**Tech Stack:** ${data.tech_stack || 'Not specified'}
**Standards:** ${data.standards || 'Not specified'}

Feel free to ask me any follow-up questions to refine these recommendations.`
      }])

    } catch (err) {
      console.error('AI analysis error:', err)
      setChatMessages([{
        role: 'assistant',
        content: `I couldn't analyze the brief automatically. ${err.message}

Please make sure you have an OpenRouter API key configured in Settings > API Keys.

In the meantime, I can help you think through your project. What would you like to build?`
      }])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = chatInput
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])

    setIsGenerating(true)

    try {
      const apiKey = localStorage.getItem('openrouter_key')

      const headers = {
        'Content-Type': 'application/json'
      }
      if (apiKey) {
        headers['X-OpenRouter-Key'] = apiKey
      }

      // Build message history for context
      const messages = [...chatMessages, { role: 'user', content: userMessage }]

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: messages,
          brief: formData.projectBrief,
          project_context: {
            tech_stack: formData.techStack,
            standards: formData.codeStandards,
            context: formData.context
          },
          model: 'anthropic/claude-sonnet-4',
          provider: 'openrouter'
        })
      })

      if (!res.ok) {
        throw new Error('Failed to get response')
      }

      // Handle streaming response
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      // Add placeholder for streaming message
      setChatMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                assistantMessage += parsed.content
                // Update the last message in real-time
                setChatMessages(prev => {
                  const newMessages = [...prev]
                  newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: assistantMessage
                  }
                  return newMessages
                })
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Check if AI response contains context updates
      if (assistantMessage.includes('```json')) {
        try {
          const jsonMatch = assistantMessage.match(/```json\s*([\s\S]*?)\s*```/)
          if (jsonMatch) {
            const updateData = JSON.parse(jsonMatch[1])
            if (updateData.update) {
              setFormData(prev => ({
                ...prev,
                techStack: updateData.update.tech_stack || prev.techStack,
                codeStandards: updateData.update.standards || prev.codeStandards,
                context: updateData.update.context || prev.context
              }))
              setContextGenerated(true)
            }
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }

    } catch (err) {
      console.error('Chat error:', err)
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your API key in Settings > API Keys.'
      }])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateContext = async () => {
    if (!formData.projectBrief.trim()) {
      alert('Please enter a project brief first')
      return
    }

    setIsGenerating(true)

    try {
      const apiKey = localStorage.getItem('openrouter_key')

      const headers = {
        'Content-Type': 'application/json'
      }
      if (apiKey) {
        headers['X-OpenRouter-Key'] = apiKey
      }

      const res = await fetch('/api/ai/expand-brief', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          brief: formData.projectBrief,
          model: 'anthropic/claude-sonnet-4',
          provider: 'openrouter'
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || 'Failed to generate context')
      }

      const data = await res.json()

      setFormData(prev => ({
        ...prev,
        techStack: data.tech_stack || prev.techStack,
        codeStandards: data.standards || prev.codeStandards,
        context: data.context || prev.context
      }))
      setContextGenerated(true)

    } catch (err) {
      console.error('Generate context error:', err)
      alert(`Failed to generate context: ${err.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // Fetch GitHub repositories using the token
  const fetchGitHubRepos = async (token) => {
    setLoadingRepos(true)
    try {
      const res = await fetch('/api/github/repos?per_page=50', {
        headers: {
          'X-GitHub-Token': token
        }
      })

      if (!res.ok) {
        throw new Error('Failed to fetch repositories')
      }

      const repos = await res.json()
      setGithubRepos(repos)
    } catch (err) {
      console.error('Error fetching repos:', err)
      setGithubRepos([])
    } finally {
      setLoadingRepos(false)
    }
  }

  const handleConnectGitHub = () => {
    // Open GitHub OAuth flow in popup mode
    const width = 600
    const height = 700
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      '/api/auth/oauth/github?mode=popup',
      'github-oauth',
      `width=${width},height=${height},left=${left},top=${top}`
    )

    // Listen for OAuth completion
    const handleMessage = (event) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return

      if (event.data?.type === 'oauth-success' && event.data?.provider === 'github') {
        const githubToken = event.data.github_token
        setFormData(prev => ({
          ...prev,
          githubConnected: true,
          githubUser: event.data.user,
          githubToken: githubToken
        }))
        // Fetch repositories after successful connection
        if (githubToken) {
          fetchGitHubRepos(githubToken)
        }
        window.removeEventListener('message', handleMessage)
      } else if (event.data?.type === 'oauth-error') {
        console.error('GitHub OAuth error:', event.data.error)
        window.removeEventListener('message', handleMessage)
      }
    }
    window.addEventListener('message', handleMessage)
  }

  const handleToggleAgent = (agentId) => {
    setFormData(prev => ({
      ...prev,
      selectedAgents: prev.selectedAgents.includes(agentId)
        ? prev.selectedAgents.filter(id => id !== agentId)
        : [...prev.selectedAgents, agentId]
    }))
  }

  const handleToggleMCP = (mcpId) => {
    setFormData(prev => ({
      ...prev,
      selectedMCP: prev.selectedMCP.includes(mcpId)
        ? prev.selectedMCP.filter(id => id !== mcpId)
        : [...prev.selectedMCP, mcpId]
    }))
  }

  const handleToggleAllAgents = (checked) => {
    setFormData(prev => ({
      ...prev,
      selectedAgents: checked ? globalAgents.map(a => a.id) : []
    }))
  }

  const handleToggleAllMCP = (checked) => {
    setFormData(prev => ({
      ...prev,
      selectedMCP: checked ? globalMCPServers.filter(s => s.status === 'connected').map(s => s.id) : []
    }))
  }

  // Handle creating a new GitHub repository
  const handleCreateRepo = async () => {
    if (!newRepoName.trim()) {
      setCreateRepoError('Please enter a repository name')
      return
    }

    // Validate repo name (only alphanumeric, hyphens, underscores)
    const validName = /^[a-zA-Z0-9._-]+$/.test(newRepoName)
    if (!validName) {
      setCreateRepoError('Repository name can only contain letters, numbers, hyphens, underscores, and periods')
      return
    }

    setCreatingRepo(true)
    setCreateRepoError('')

    try {
      const res = await fetch('/api/github/repos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-GitHub-Token': formData.githubToken
        },
        body: JSON.stringify({
          name: newRepoName,
          description: formData.projectName ? `Repository for ${formData.projectName}` : '',
          private: false
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || 'Failed to create repository')
      }

      const newRepo = await res.json()

      // Add the new repo to the list and select it
      setGithubRepos(prev => [newRepo, ...prev])
      setFormData(prev => ({
        ...prev,
        selectedRepo: newRepo.full_name
      }))

      // Reset form state
      setShowCreateRepoForm(false)
      setNewRepoName('')
    } catch (err) {
      console.error('Create repo error:', err)
      setCreateRepoError(err.message)
    } finally {
      setCreatingRepo(false)
    }
  }

  // Handle repo selection change
  const handleRepoChange = (e) => {
    const value = e.target.value
    if (value === '__create_new__') {
      setShowCreateRepoForm(true)
      setFormData(prev => ({ ...prev, selectedRepo: '' }))
    } else {
      setShowCreateRepoForm(false)
      setFormData(prev => ({ ...prev, selectedRepo: value }))
    }
  }

  // State for project creation
  const [creatingProject, setCreatingProject] = useState(false)
  const [createProjectError, setCreateProjectError] = useState('')

  const handleCreateProject = async () => {
    // Validate required fields
    if (!formData.projectName.trim()) {
      setCreateProjectError('Please enter a project name')
      return
    }

    setCreatingProject(true)
    setCreateProjectError('')

    try {
      const res = await fetch('/api/projects/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          name: formData.projectName.trim(),
          brief: formData.projectBrief.trim() || null,
          workspace: formData.workspace,
          connection_type: formData.connectionType,
          github_repo: formData.selectedRepo || null,
          vps_server_id: formData.vpsServerId || null,
          context: {
            tech_stack: formData.techStack.trim() || null,
            standards: formData.codeStandards.trim() || null,
            additional: formData.context?.trim() || null
          },
          agent_ids: formData.selectedAgents,
          mcp_server_ids: formData.selectedMCP
        })
      })

      if (res.ok) {
        const project = await res.json()
        onCreateProject?.(project)
      } else {
        const error = await res.json()
        setCreateProjectError(error.detail || 'Failed to create project')
      }
    } catch (err) {
      console.error('Failed to create project:', err)
      setCreateProjectError(`Network error: ${err.message}`)
    } finally {
      setCreatingProject(false)
    }
  }

  const allAgentsSelected = formData.selectedAgents.length === globalAgents.length
  const someAgentsSelected = formData.selectedAgents.length > 0 && formData.selectedAgents.length < globalAgents.length
  const connectedMCPServers = globalMCPServers.filter(s => s.status === 'connected')
  const allMCPSelected = formData.selectedMCP.length === connectedMCPServers.length
  const someMCPSelected = formData.selectedMCP.length > 0 && formData.selectedMCP.length < connectedMCPServers.length

  // Set indeterminate state for agents master checkbox
  useEffect(() => {
    if (agentsCheckboxRef.current) {
      agentsCheckboxRef.current.indeterminate = someAgentsSelected
    }
  }, [someAgentsSelected])

  // Set indeterminate state for MCP master checkbox
  useEffect(() => {
    if (mcpCheckboxRef.current) {
      mcpCheckboxRef.current.indeterminate = someMCPSelected
    }
  }, [someMCPSelected])

  return (
    <div style={{
      background: cssVars.bgPrimary,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      color: cssVars.textPrimary
    }}>
      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Create New Project</h1>
          <p style={{ color: cssVars.textSecondary, marginBottom: '32px' }}>
            Follow the steps to configure your environment and AI models.
          </p>

          {/* Step 1: Project Details */}
          <SettingsPanel>
            <StepHeader number={1} title="Project Details" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <Select
                label="Workspace"
                value={formData.workspace}
                onChange={handleInputChange('workspace')}
                options={[
                  { value: 'customers', label: 'Customers' },
                  { value: 'personal', label: 'Personal' },
                  { value: 'new', label: '+ Create New Workspace...' }
                ]}
              />
              <Input
                label="Project Name"
                placeholder="e.g. Family Calendar App"
                value={formData.projectName}
                onChange={handleInputChange('projectName')}
              />
            </div>

            {/* Project Brief */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: cssVars.textSecondary,
                  textTransform: 'uppercase'
                }}>Project Brief</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {uploadedFileName && (
                    <span style={{
                      fontSize: '11px',
                      color: cssVars.success,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Check size={12} /> {uploadedFileName}
                    </span>
                  )}
                  <label
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      fontSize: '11px',
                      color: cssVars.primary,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Upload size={12} /> {uploadedFileName ? 'Change file' : 'Upload .md file'}
                  </label>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.txt"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>

              <textarea
                value={formData.projectBrief}
                onChange={handleInputChange('projectBrief')}
                placeholder={`Describe what you want to build in plain language...

Examples:
• I want to build a calendar app for my family
• Build a reservation booking system for my restaurant
• Help me research and plan my trip to Italy
• Create a simple inventory tracker for my small business`}
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '10px 12px',
                  background: cssVars.bgSecondary,
                  border: `1px solid ${cssVars.border}`,
                  borderRadius: '8px',
                  color: cssVars.textPrimary,
                  fontSize: '13px',
                  lineHeight: 1.5,
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <Button variant="accent" onClick={handleStartAIDefinition}>
                  <Sparkles size={16} />
                  Define Project with AI
                </Button>
              </div>

              {/* AI Chat Panel */}
              {showAIChat && (
                <div style={{
                  marginTop: '16px',
                  background: cssVars.bgSecondary,
                  borderRadius: '12px',
                  border: `1px solid ${cssVars.border}`,
                  overflow: 'hidden'
                }}>
                  {/* Chat Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: cssVars.bgTertiary,
                    borderBottom: `1px solid ${cssVars.border}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, #D97757 0%, #C4694A 100%)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>Project Definition Assistant</div>
                        <div style={{ fontSize: '11px', color: cssVars.textMuted }}>Claude is helping define your project</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '10px', color: cssVars.success, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', background: cssVars.success, borderRadius: '50%' }} />
                        Active
                      </div>
                      <button
                        onClick={() => setShowAIChat(false)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: cssVars.textMuted,
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div style={{ height: '280px', overflowY: 'auto', padding: '16px' }}>
                    {chatMessages.map((msg, idx) => (
                      <ChatMessage
                        key={idx}
                        message={msg.content}
                        isUser={msg.role === 'user'}
                      />
                    ))}
                    {isGenerating && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          background: 'linear-gradient(135deg, #D97757 0%, #C4694A 100%)',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          <Sparkles size={14} />
                        </div>
                        <div style={{
                          background: cssVars.bgTertiary,
                          borderRadius: '8px',
                          padding: '12px',
                          fontSize: '13px',
                          color: cssVars.textMuted
                        }}>
                          Thinking...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div style={{
                    padding: '12px 16px',
                    borderTop: `1px solid ${cssVars.border}`,
                    background: cssVars.bgTertiary
                  }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                          placeholder="Ask follow-up questions..."
                          style={{
                            width: '100%',
                            padding: '10px 36px 10px 12px',
                            background: cssVars.bgSecondary,
                            border: `1px solid ${cssVars.border}`,
                            borderRadius: '8px',
                            color: cssVars.textPrimary,
                            fontSize: '13px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                        <button
                          onClick={toggleListening}
                          disabled={!voiceSupported}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: isListening ? cssVars.error : 'none',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px',
                            cursor: voiceSupported ? 'pointer' : 'not-allowed',
                            color: isListening ? 'white' : (voiceSupported ? cssVars.textMuted : cssVars.border),
                            animation: isListening ? 'pulse 1s ease-in-out infinite' : 'none',
                            transition: 'all 0.2s ease'
                          }}
                          title={!voiceSupported ? 'Voice input not supported in this browser' : (isListening ? 'Stop recording' : 'Start voice input')}
                        >
                          {voiceSupported ? <Mic size={16} /> : <MicOff size={16} />}
                        </button>
                      </div>
                      <Button variant="primary" onClick={handleSendChatMessage} style={{ padding: '8px 14px' }}>
                        <Send size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div style={{
                    display: 'flex',
                    padding: '12px 16px',
                    gap: '8px',
                    borderTop: `1px solid ${cssVars.border}`,
                    background: cssVars.bgSecondary
                  }}>
                    <Button
                      variant="primary"
                      onClick={handleGenerateContext}
                      disabled={isGenerating}
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Zap size={14} />
                      Generate Project Context
                    </Button>
                    <Button variant="secondary">Ask More</Button>
                  </div>
                </div>
              )}
            </div>
          </SettingsPanel>

          {/* Step 2: Connection Source */}
          <SettingsPanel>
            <StepHeader number={2} title="Connection Source" />

            {/* GitHub Card - Primary */}
            <div style={{
              background: cssVars.bgTertiary,
              border: `2px solid ${cssVars.primary}`,
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '16px',
                background: cssVars.success,
                color: 'white',
                padding: '3px 10px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 600
              }}>RECOMMENDED</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(34, 197, 94, 0.15)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Cloud size={26} style={{ color: cssVars.success }} />
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 600 }}>Free Cloud Hosting</div>
                  <div style={{ fontSize: '13px', color: cssVars.textSecondary }}>Powered by GitHub</div>
                </div>
              </div>

              <p style={{ fontSize: '14px', color: cssVars.textSecondary, marginBottom: '20px', lineHeight: 1.5 }}>
                Get free cloud hosting, storage, and preview environments. Your code stays in your GitHub account.
              </p>

              <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {['60 hrs/mo free compute', '15GB storage', 'You own your code'].map(benefit => (
                  <div key={benefit} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <Check size={16} style={{ color: cssVars.success }} />
                    {benefit}
                  </div>
                ))}
              </div>

              {!formData.githubConnected ? (
                <div style={{
                  padding: '24px',
                  background: cssVars.bgPrimary,
                  borderRadius: '10px',
                  border: `1px solid ${cssVars.border}`,
                  textAlign: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <Button variant="github" onClick={handleConnectGitHub}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      Sign in with GitHub
                    </Button>
                    <span style={{ color: cssVars.textMuted, fontSize: '13px' }}>or</span>
                    <a
                      href="https://github.com/signup"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: cssVars.success,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textDecoration: 'none',
                        boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
                      }}
                    >
                      Create Free Account
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '16px',
                  background: cssVars.bgPrimary,
                  borderRadius: '10px',
                  border: `1px solid ${cssVars.border}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <img
                      src={formData.githubUser?.avatar_url || 'https://github.com/identicons/jasonlong.png'}
                      style={{ width: '44px', height: '44px', borderRadius: '10px' }}
                      alt="GitHub avatar"
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>
                        {formData.githubUser?.login || 'alex-engineer'}
                      </div>
                      <div style={{ fontSize: '12px', color: cssVars.textSecondary }}>GitHub Personal Account</div>
                    </div>
                    <span style={{
                      background: cssVars.success,
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600
                    }}>CONNECTED</span>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: cssVars.textSecondary,
                      textTransform: 'uppercase',
                      marginBottom: '8px'
                    }}>Repository</label>
                    <select
                      value={showCreateRepoForm ? '__create_new__' : formData.selectedRepo}
                      onChange={handleRepoChange}
                      disabled={loadingRepos || creatingRepo}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: cssVars.bgSecondary,
                        border: `1px solid ${cssVars.border}`,
                        borderRadius: '8px',
                        color: cssVars.textPrimary,
                        fontSize: '14px',
                        outline: 'none',
                        cursor: loadingRepos ? 'wait' : 'pointer',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="__create_new__">➕ Create new repository</option>
                      {loadingRepos ? (
                        <option disabled>Loading repositories...</option>
                      ) : (
                        githubRepos.map(repo => (
                          <option key={repo.id || repo.full_name} value={repo.full_name}>
                            {repo.full_name}
                          </option>
                        ))
                      )}
                    </select>
                    {loadingRepos && (
                      <div style={{ fontSize: '11px', color: cssVars.textMuted, marginTop: '4px' }}>
                        Loading your repositories...
                      </div>
                    )}

                    {/* Create New Repository Form */}
                    {showCreateRepoForm && (
                      <div style={{
                        marginTop: '12px',
                        padding: '16px',
                        background: cssVars.bgTertiary,
                        borderRadius: '8px',
                        border: `1px solid ${cssVars.border}`
                      }}>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: cssVars.textSecondary,
                          textTransform: 'uppercase',
                          marginBottom: '8px'
                        }}>New Repository Name</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            value={newRepoName}
                            onChange={(e) => {
                              setNewRepoName(e.target.value)
                              setCreateRepoError('')
                            }}
                            placeholder="my-new-project"
                            disabled={creatingRepo}
                            style={{
                              flex: 1,
                              padding: '10px 12px',
                              background: cssVars.bgSecondary,
                              border: `1px solid ${createRepoError ? cssVars.error : cssVars.border}`,
                              borderRadius: '8px',
                              color: cssVars.textPrimary,
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateRepo()}
                          />
                          <Button
                            variant="success"
                            onClick={handleCreateRepo}
                            disabled={creatingRepo || !newRepoName.trim()}
                          >
                            {creatingRepo ? (
                              <>
                                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                                Creating...
                              </>
                            ) : (
                              <>
                                <Plus size={14} />
                                Create
                              </>
                            )}
                          </Button>
                        </div>
                        {createRepoError && (
                          <div style={{
                            marginTop: '8px',
                            fontSize: '12px',
                            color: cssVars.error
                          }}>
                            {createRepoError}
                          </div>
                        )}
                        <div style={{
                          marginTop: '8px',
                          fontSize: '11px',
                          color: cssVars.textMuted
                        }}>
                          Will be created as: {formData.githubUser?.login || 'user'}/{newRepoName || 'repository-name'}
                        </div>
                      </div>
                    )}
                  </div>

                  {formData.selectedRepo ? (
                    <div style={{
                      marginTop: '16px',
                      padding: '12px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: cssVars.success,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Check size={16} />
                      Ready! Code will be pushed to <strong>{formData.selectedRepo}</strong>. Preview via Codespaces.
                    </div>
                  ) : (
                    <div style={{
                      marginTop: '16px',
                      padding: '12px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: cssVars.primary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Check size={16} />
                      Select a repository above, or create a new one for this project.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* VPS Card - Collapsible */}
            <div
              id="vps-card"
              style={{
                background: cssVars.bgTertiary,
                border: `1px solid ${showVPSFields ? cssVars.primary : cssVars.border}`,
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                boxShadow: showVPSFields ? '0 4px 16px rgba(0, 0, 0, 0.15)' : 'none'
              }}
            >
              <div
                onClick={() => setShowVPSFields(!showVPSFields)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!showVPSFields) {
                    e.currentTarget.parentElement.style.borderColor = cssVars.primary
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showVPSFields) {
                    e.currentTarget.parentElement.style.borderColor = cssVars.border
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Server size={22} style={{ color: cssVars.primary }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600 }}>Connect to VPS</div>
                    <div style={{ fontSize: '12px', color: cssVars.textMuted }}>Advanced - For power users with their own servers</div>
                  </div>
                </div>
                <div style={{ color: cssVars.textMuted, transition: 'transform 0.2s', transform: showVPSFields ? 'rotate(180deg)' : 'none' }}>
                  <ChevronDown size={20} />
                </div>
              </div>

              {showVPSFields && (
                <div style={{
                  padding: '0 20px 20px 20px',
                  borderTop: `1px solid ${cssVars.border}`
                }}>
                  <div style={{ paddingTop: '16px' }}>
                    <Select
                      label="Select Server"
                      value={formData.vpsServerId}
                      onChange={handleInputChange('vpsServerId')}
                      options={[
                        { value: '', label: '+ Add New VPS' },
                        { value: 'prod-01', label: 'prod-01 (192.168.1.104)' },
                        { value: 'staging-01', label: 'staging-01 (192.168.1.105)' }
                      ]}
                      style={{ marginBottom: '12px' }}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <Input
                        label="IP Address"
                        placeholder="0.0.0.0"
                        value={formData.vpsIp}
                        onChange={handleInputChange('vpsIp')}
                      />
                      <Input
                        label="Port"
                        placeholder="22"
                        value={formData.vpsPort}
                        onChange={handleInputChange('vpsPort')}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: cssVars.textSecondary,
                          textTransform: 'uppercase'
                        }}>SSH Private Key</label>
                        <a href="#" style={{ color: cssVars.primary, fontSize: '12px', textDecoration: 'none' }}>
                          ℹ️ Help finding key
                        </a>
                      </div>
                      <textarea
                        value={formData.vpsKey}
                        onChange={handleInputChange('vpsKey')}
                        placeholder={`-----BEGIN RSA PRIVATE KEY-----
...`}
                        style={{
                          width: '100%',
                          minHeight: '80px',
                          padding: '10px 12px',
                          background: cssVars.bgSecondary,
                          border: `1px solid ${cssVars.border}`,
                          borderRadius: '8px',
                          color: cssVars.textPrimary,
                          fontSize: '11px',
                          fontFamily: 'Monaco, Consolas, monospace',
                          outline: 'none',
                          resize: 'vertical',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="secondary"
                          onClick={handleTestVps}
                          disabled={testingVps || !formData.vpsIp.trim()}
                        >
                          {testingVps ? (
                            <>
                              <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                              Testing...
                            </>
                          ) : (
                            <>
                              <Zap size={14} />
                              Test Connection
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Test result display */}
                      {vpsTestResult && (
                        <div style={{
                          padding: '12px',
                          borderRadius: '8px',
                          background: vpsTestResult.success
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                          border: `1px solid ${vpsTestResult.success ? cssVars.success : cssVars.error}`
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: vpsTestResult.server_info ? '8px' : 0
                          }}>
                            {vpsTestResult.success ? (
                              <Check size={16} style={{ color: cssVars.success }} />
                            ) : (
                              <X size={16} style={{ color: cssVars.error }} />
                            )}
                            <span style={{
                              fontSize: '13px',
                              color: vpsTestResult.success ? cssVars.success : cssVars.error,
                              fontWeight: 500
                            }}>
                              {vpsTestResult.message}
                            </span>
                          </div>

                          {/* Server info on success */}
                          {vpsTestResult.success && vpsTestResult.server_info && (
                            <div style={{
                              fontSize: '11px',
                              color: cssVars.textSecondary,
                              marginTop: '8px',
                              paddingTop: '8px',
                              borderTop: `1px solid ${cssVars.border}`,
                              fontFamily: 'Monaco, Consolas, monospace'
                            }}>
                              <div style={{ marginBottom: '4px' }}>
                                <span style={{ color: cssVars.textMuted }}>Host:</span>{' '}
                                {vpsTestResult.server_info.hostname || formData.vpsIp}
                              </div>
                              <div style={{ marginBottom: '4px' }}>
                                <span style={{ color: cssVars.textMuted }}>User:</span>{' '}
                                {vpsTestResult.server_info.user || 'root'}
                              </div>
                              {vpsTestResult.server_info.os && (
                                <div>
                                  <span style={{ color: cssVars.textMuted }}>OS:</span>{' '}
                                  {vpsTestResult.server_info.os}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SettingsPanel>

          {/* Step 3: Project Context */}
          <SettingsPanel>
            <StepHeader number={3} title="Project Context" badge={contextGenerated ? '✓ Generated from Brief' : null} />

            <p style={{ fontSize: '12px', color: cssVars.textSecondary, marginBottom: '16px' }}>
              This will be auto-converted to CLAUDE.md, AGENTS.md, or system prompts based on your LLM.
            </p>

            <Input
              label="Tech Stack"
              placeholder="e.g., Node.js, Express, PostgreSQL, Redis"
              value={formData.techStack}
              onChange={handleInputChange('techStack')}
              style={{ marginBottom: '16px' }}
            />

            <Textarea
              label="Code Standards"
              placeholder="e.g., TypeScript strict mode, async/await patterns, JSDoc comments..."
              value={formData.codeStandards}
              onChange={handleInputChange('codeStandards')}
              minHeight="70px"
              style={{ marginBottom: '16px' }}
            />

            <div style={{
              padding: '10px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '11px', color: cssVars.textSecondary }}>
                After creating, use <code style={{
                  background: cssVars.bgTertiary,
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>/init</code> in chat to auto-detect more context from your codebase.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Button variant="secondary" onClick={handleGenerateContext} disabled={isGenerating}>
                  <Sparkles size={14} />
                  Auto-Gen
                </Button>
                <div style={{ fontSize: '10px', color: cssVars.textMuted, marginTop: '4px', paddingLeft: '4px' }}>
                  Pulls from Project Brief above
                </div>
              </div>
            </div>
          </SettingsPanel>

          {/* Step 4: Project Agents */}
          <SettingsPanel>
            <StepHeader number={4} title="Project Agents" />

            {/* What are Agents? */}
            <div style={{ marginBottom: '16px' }}>
              <div
                onClick={() => setShowAgentHelp(!showAgentHelp)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '6px 0' }}
              >
                <span style={{
                  fontSize: '10px',
                  color: cssVars.textMuted,
                  transition: 'transform 0.2s',
                  transform: showAgentHelp ? 'rotate(90deg)' : 'none'
                }}>▶</span>
                <span style={{ fontSize: '12px', color: cssVars.primary }}>What are Agents?</span>
              </div>
              {showAgentHelp && (
                <div style={{
                  background: cssVars.bgPrimary,
                  border: `1px solid ${cssVars.border}`,
                  borderRadius: '8px',
                  padding: '16px',
                  marginTop: '8px'
                }}>
                  <p style={{ fontSize: '12px', color: cssVars.textSecondary, marginBottom: '12px' }}>
                    <strong>Agents</strong> are specialized AI assistants. Invoke with{' '}
                    <code style={{ background: cssVars.bgTertiary, padding: '2px 6px', borderRadius: '4px' }}>@agent-name</code> in chat.
                  </p>
                </div>
              )}
            </div>

            {/* Global Agents */}
            <div style={{ background: cssVars.bgTertiary, borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px' }}>
                <input
                  ref={agentsCheckboxRef}
                  type="checkbox"
                  checked={allAgentsSelected}
                  onChange={(e) => handleToggleAllAgents(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div
                  style={{ flex: 1, cursor: 'pointer' }}
                  onClick={() => setShowGlobalAgents(!showGlobalAgents)}
                >
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>Use Global Agents</div>
                  <div style={{ fontSize: '11px', color: cssVars.textMuted }}>
                    {formData.selectedAgents.length} agents selected
                  </div>
                </div>
                <span
                  onClick={() => setShowGlobalAgents(!showGlobalAgents)}
                  style={{
                    fontSize: '12px',
                    color: cssVars.textMuted,
                    transition: 'transform 0.2s',
                    cursor: 'pointer',
                    transform: showGlobalAgents ? 'none' : 'rotate(-90deg)'
                  }}
                >▼</span>
              </div>

              {showGlobalAgents && (
                <div style={{ borderTop: `1px solid ${cssVars.border}`, padding: '8px' }}>
                  {globalAgents.map(agent => (
                    <AgentItem
                      key={agent.id}
                      {...agent}
                      checked={formData.selectedAgents.includes(agent.id)}
                      onChange={() => handleToggleAgent(agent.id)}
                      isGlobal={true}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Project-specific agents */}
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: cssVars.textSecondary,
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>Project-Specific Agents</div>

            <div style={{
              background: cssVars.bgTertiary,
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: 'rgba(249, 115, 22, 0.15)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Wrench size={14} style={{ color: cssVars.accent }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 500 }}>api-designer</div>
                  <div style={{ fontSize: '10px', color: cssVars.textMuted }}>Designs REST API endpoints</div>
                </div>
                <span style={{ fontSize: '10px', color: cssVars.primary, cursor: 'pointer' }}>
                  <Plus size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Add to Global
                </span>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: cssVars.textMuted,
                  cursor: 'pointer',
                  fontSize: '12px'
                }}>✕</button>
              </div>
            </div>

            <Button variant="secondary" style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={14} /> Add Project Agent
            </Button>
          </SettingsPanel>

          {/* Step 5: MCP Servers */}
          <SettingsPanel>
            <StepHeader number={5} title="MCP Servers" />

            {/* What is MCP? */}
            <div style={{ marginBottom: '16px' }}>
              <div
                onClick={() => setShowMCPHelp(!showMCPHelp)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '6px 0' }}
              >
                <span style={{
                  fontSize: '10px',
                  color: cssVars.textMuted,
                  transition: 'transform 0.2s',
                  transform: showMCPHelp ? 'rotate(90deg)' : 'none'
                }}>▶</span>
                <span style={{ fontSize: '12px', color: cssVars.primary }}>What is MCP?</span>
              </div>
              {showMCPHelp && (
                <div style={{
                  background: cssVars.bgPrimary,
                  border: `1px solid ${cssVars.border}`,
                  borderRadius: '8px',
                  padding: '16px',
                  marginTop: '8px'
                }}>
                  <p style={{ fontSize: '12px', color: cssVars.textSecondary, marginBottom: '12px' }}>
                    <strong>MCP</strong> connects AI to external tools (databases, APIs, services). Works with any LLM.
                  </p>
                </div>
              )}
            </div>

            {/* Global MCP Servers */}
            <div style={{ background: cssVars.bgTertiary, borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px' }}>
                <input
                  ref={mcpCheckboxRef}
                  type="checkbox"
                  checked={allMCPSelected}
                  onChange={(e) => handleToggleAllMCP(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div
                  style={{ flex: 1, cursor: 'pointer' }}
                  onClick={() => setShowGlobalMCP(!showGlobalMCP)}
                >
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>Use Global MCP Servers</div>
                  <div style={{ fontSize: '11px', color: cssVars.textMuted }}>
                    {formData.selectedMCP.length} of {connectedMCPServers.length} connected servers selected
                  </div>
                </div>
                <span
                  onClick={() => setShowGlobalMCP(!showGlobalMCP)}
                  style={{
                    fontSize: '12px',
                    color: cssVars.textMuted,
                    transition: 'transform 0.2s',
                    cursor: 'pointer',
                    transform: showGlobalMCP ? 'none' : 'rotate(-90deg)'
                  }}
                >▼</span>
              </div>

              {showGlobalMCP && (
                <div style={{ borderTop: `1px solid ${cssVars.border}`, padding: '8px' }}>
                  {globalMCPServers.map(server => (
                    <MCPServerItem
                      key={server.id}
                      {...server}
                      checked={formData.selectedMCP.includes(server.id)}
                      onChange={() => handleToggleMCP(server.id)}
                      isGlobal={true}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Project-specific MCP */}
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: cssVars.textSecondary,
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>Project-Specific Servers</div>

            <div style={{
              background: cssVars.bgTertiary,
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: 'rgba(51, 103, 145, 0.2)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Database size={14} style={{ color: '#336791' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 500 }}>PostgreSQL</div>
                  <div style={{ fontSize: '10px', color: cssVars.success }}>● Ready to connect</div>
                </div>
                <span style={{ fontSize: '10px', color: cssVars.primary, cursor: 'pointer' }}>
                  <Plus size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Add to Global
                </span>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: cssVars.textMuted,
                  cursor: 'pointer',
                  fontSize: '12px'
                }}>✕</button>
              </div>
            </div>

            <Button variant="secondary" style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={14} /> Add MCP Server
            </Button>
          </SettingsPanel>
        </div>
      </div>

      {/* Fixed Action Bar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        borderTop: `1px solid ${cssVars.border}`,
        background: cssVars.bgSecondary,
        flexShrink: 0
      }}>
        {/* Error message */}
        {createProjectError && (
          <div style={{
            padding: '12px 24px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderBottom: `1px solid ${cssVars.error}`,
            color: cssVars.error,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <X size={16} />
            {createProjectError}
          </div>
        )}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '16px 24px'
        }}>
          <Button variant="secondary" onClick={onCancel} disabled={creatingProject}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateProject}
            disabled={!formData.projectName.trim() || creatingProject}
            style={{
              animation: formData.projectName && !creatingProject ? 'pulse 2s infinite' : 'none'
            }}
          >
            {creatingProject ? (
              <>
                <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                Creating...
              </>
            ) : (
              <>
                Create Project
                <ChevronRight size={14} />
              </>
            )}
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
        }
      `}</style>
    </div>
  )
}
