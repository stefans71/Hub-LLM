import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import claudeCodeLogo from '../assets/claude-code-logo.svg'
import './LandingPage.css'

const API_URL = import.meta.env.VITE_API_URL || ''

// Password validation rules (same as AuthPage)
const passwordRules = [
  { id: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'number', label: 'One number', test: (pw) => /\d/.test(pw) },
  { id: 'special', label: 'One special character (!@#$%^&*)', test: (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw) }
]

const validatePassword = (password) => passwordRules.every(rule => rule.test(password))

// Demo models data
const DEMO_MODELS = [
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', icon: claudeCodeLogo, color: '#d97706', hasKey: true },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', icon: claudeCodeLogo, color: '#d97706', hasKey: true },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', icon: 'G', color: '#10a37f', hasKey: true },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', icon: 'G', color: '#10a37f', hasKey: true },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', icon: 'G', color: '#10a37f', hasKey: true },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', icon: 'G', color: '#4285f4', hasKey: false },
  { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'Meta', icon: 'L', color: '#0668E1', hasKey: true },
  { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'DeepSeek', icon: 'D', color: '#0ea5e9', hasKey: true },
  { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral', icon: 'M', color: '#ff7000', hasKey: false },
]

// Demo projects data
const DEMO_PROJECTS = {
  1: {
    name: 'Landing Page',
    vps: 'nyc-do-prod',
    path: '~/landing-page',
    files: [
      { name: 'src', type: 'folder', children: [
        { name: 'index.html', ext: 'html' },
        { name: 'styles.css', ext: 'css' },
        { name: 'app.js', ext: 'js' },
      ]},
      { name: 'package.json', ext: 'json' },
    ],
  },
  2: {
    name: 'API Server',
    vps: 'chi-vultr-api',
    path: '~/api-server',
    files: [
      { name: 'src', type: 'folder', children: [
        { name: 'server.js', ext: 'js' },
        { name: 'routes.js', ext: 'js' },
      ]},
      { name: 'package.json', ext: 'json' },
    ],
  },
  3: {
    name: 'Mobile App',
    vps: 'vercel-mobile',
    path: '~/mobile-app',
    files: [
      { name: 'lib', type: 'folder', children: [
        { name: 'main.dart', ext: 'default' },
      ]},
      { name: 'pubspec.yaml', ext: 'default' },
    ],
  },
}

// VPS cards data
const VPS_CARDS = [
  { id: 1, label: 'VPS', provider: 'DigitalOcean', name: 'nyc-do-prod', ip: '167.99.123.45' },
  { id: 2, label: 'VPS', provider: 'Vultr', name: 'chi-vultr-api', ip: '45.76.89.123' },
  { id: 3, label: 'VPS', provider: 'Vercel', name: 'vercel-mobile', ip: '76.76.21.98' },
]

// Initial chat messages
const INITIAL_MESSAGES = [
  { type: 'assistant', text: "Hi! I'm ready to help you build. What would you like to create?" },
  { type: 'user', text: 'Create a landing page for my Skill Building app' },
  { type: 'assistant', text: "Done! I've created index.html, styles.css, and app.js. Check your project files below." },
]

export default function LandingPage({ onSignUp }) {
  const { login, signup, error: authContextError } = useAuth()

  // State hooks
  const [selectedModel, setSelectedModel] = useState(DEMO_MODELS[0])
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false)
  const [modelSearchQuery, setModelSearchQuery] = useState('')
  const [currentProject, setCurrentProject] = useState(1)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [isTyping, setIsTyping] = useState(false)
  const [isFileExplorerOpen, setIsFileExplorerOpen] = useState(false)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [isVPSOpen, setIsVPSOpen] = useState(true)
  const [activePanelId, setActivePanelId] = useState(null)
  const [terminalLines, setTerminalLines] = useState([
    { type: 'comment', text: '# Connected to VPS' },
    { type: 'success', text: '$ ssh root@nyc-do-prod' },
    { type: 'info', text: 'Welcome to Ubuntu 22.04 LTS' },
  ])
  const [expandedFolders, setExpandedFolders] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [terminalInput, setTerminalInput] = useState('')
  const [isCursorVisible, setIsCursorVisible] = useState(true)

  // Auth state
  const [authMode, setAuthMode] = useState('login')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [oauthProviders, setOauthProviders] = useState({ github: false, google: false })
  const [formData, setFormData] = useState({ email: '', password: '', name: '' })

  // Refs
  const hubBoxRef = useRef(null)
  const travelingLightRef = useRef(null)
  const particlesRef = useRef(null)
  const chatMessagesRef = useRef(null)
  const modelSearchRef = useRef(null)
  const terminalInputRef = useRef(null)
  const modelSelectorRef = useRef(null)

  // Particles effect
  useEffect(() => {
    const container = particlesRef.current
    if (!container) return
    const particles = []
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'
      particle.style.left = Math.random() * 100 + '%'
      particle.style.animationDelay = (Math.random() * 20) + 's'
      particle.style.animationDuration = (15 + Math.random() * 10) + 's'
      container.appendChild(particle)
      particles.push(particle)
    }
    return () => {
      particles.forEach(p => p.remove())
    }
  }, [])

  // Traveling light animation
  useEffect(() => {
    const hubBox = hubBoxRef.current
    const light = travelingLightRef.current
    if (!hubBox || !light) return

    let animId
    let startTime = null
    const duration = 3000
    const borderRadius = 16

    function animate(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime

      const totalCycle = duration * 2
      const cycleProgress = (elapsed % totalCycle) / totalCycle
      let progress
      if (cycleProgress < 0.5) {
        progress = cycleProgress * 2
      } else {
        progress = 1 - ((cycleProgress - 0.5) * 2)
      }
      progress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2

      const width = hubBox.offsetWidth
      const padding = borderRadius + 10
      const travelDistance = width - (padding * 2)
      const x = padding + (progress * travelDistance)

      light.style.left = (x - 6) + 'px'
      light.style.top = '-6px'

      animId = requestAnimationFrame(animate)
    }

    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [])

  // Close model dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(e.target)) {
        setIsModelDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Fetch OAuth providers
  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const fetchProviders = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/oauth/providers`, { signal: controller.signal })
        if (res.ok) {
          const data = await res.json()
          setOauthProviders(data)
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch OAuth providers:', err)
        }
      } finally {
        clearTimeout(timeout)
      }
    }
    fetchProviders()
    return () => { clearTimeout(timeout); controller.abort() }
  }, [])

  // Auth handlers
  const handleAuthChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setAuthError('')
  }, [])

  const handleAuthSubmit = useCallback(async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    try {
      if (authMode === 'login') {
        const result = await login(formData.email, formData.password)
        if (!result.success) setAuthError(result.error || 'Login failed')
      } else {
        if (!validatePassword(formData.password)) {
          setAuthError('Password does not meet all requirements')
          setAuthLoading(false)
          return
        }
        const result = await signup(formData.email, formData.password, formData.name)
        if (!result.success) setAuthError(result.error || 'Signup failed')
      }
    } catch (err) {
      setAuthError('An unexpected error occurred')
    } finally {
      setAuthLoading(false)
    }
  }, [authMode, formData, login, signup])

  const handleOAuth = useCallback((provider) => {
    window.location.href = `${API_URL}/api/auth/oauth/${provider}`
  }, [])

  const hasOAuth = oauthProviders.github || oauthProviders.google

  // Model selector handlers
  const toggleModelDropdown = useCallback(() => {
    setIsModelDropdownOpen(prev => {
      if (!prev) {
        setTimeout(() => modelSearchRef.current?.focus(), 100)
      }
      return !prev
    })
  }, [])

  const selectModel = useCallback((id) => {
    const model = DEMO_MODELS.find(m => m.id === id)
    if (!model) return
    setSelectedModel(model)
    setModelSearchQuery('')
    setIsModelDropdownOpen(false)
    setMessages(prev => [...prev, { type: 'assistant', text: `Switched to ${model.name}. How can I help?` }])
  }, [])

  const filteredModels = DEMO_MODELS.filter(m => {
    const q = modelSearchQuery.toLowerCase()
    return m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q)
  })

  // Panel toggle
  const togglePanel = useCallback((panelId) => {
    setActivePanelId(prev => prev === panelId ? null : panelId)
  }, [])

  // File explorer
  const toggleFileExplorer = useCallback(() => {
    setIsFileExplorerOpen(prev => !prev)
  }, [])

  const handleProjectChange = useCallback((e) => {
    const projectId = parseInt(e.target.value)
    setCurrentProject(projectId)
    setExpandedFolders({})
    setSelectedFile(null)
    const project = DEMO_PROJECTS[projectId]
    setTerminalLines(prev => [
      ...prev,
      { type: 'info', text: `Switched to ${project.name}` },
      { type: 'success', text: `$ cd ${project.path}` },
    ])
  }, [])

  const toggleFolder = useCallback((path) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }))
  }, [])

  const handleSelectFile = useCallback((path) => {
    setSelectedFile(path)
  }, [])

  // Terminal
  const toggleTerminal = useCallback(() => {
    setIsTerminalOpen(prev => {
      if (!prev) {
        setTimeout(() => terminalInputRef.current?.focus(), 100)
      }
      return !prev
    })
  }, [])

  const handleTerminalKeyPress = useCallback((e) => {
    if (e.key !== 'Enter') return
    const cmd = terminalInput.trim()
    setTerminalInput('')
    if (!cmd) return

    const project = DEMO_PROJECTS[currentProject]
    const newLines = [{ type: 'success', text: `root@${project.vps}:${project.path}$ ${cmd}` }]

    if (cmd === 'ls' || cmd === 'ls -la') {
      const files = project.files.map(f => f.name).join('  ')
      newLines.push({ type: 'default', text: files })
    } else if (cmd === 'pwd') {
      newLines.push({ type: 'default', text: `/root/${project.path.replace('~/', '')}` })
    } else if (cmd.startsWith('cd ')) {
      newLines.push({ type: 'info', text: 'Changed directory' })
    } else if (cmd === 'clear') {
      setTerminalLines([])
      return
    }

    setTerminalLines(prev => [...prev, ...newLines])
  }, [terminalInput, currentProject])

  // VPS toggle
  const toggleVPS = useCallback(() => {
    setIsVPSOpen(prev => !prev)
  }, [])

  // Chat
  const sendMessage = useCallback(() => {
    const text = chatInput.trim()
    if (!text) return
    setChatInput('')
    setMessages(prev => [...prev, { type: 'user', text }])
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, { type: 'assistant', text: 'I can help with that! Check your project files for the updates.' }])
    }, 1000)
  }, [chatInput])

  const handleChatKeyPress = useCallback((e) => {
    if (e.key === 'Enter') sendMessage()
  }, [sendMessage])

  // Render file tree
  const renderTreeItems = (items, depth, parentPath = '') => {
    return items.map((item) => {
      const itemPath = parentPath ? `${parentPath}/${item.name}` : item.name
      if (item.type === 'folder') {
        const isExpanded = expandedFolders[itemPath]
        return (
          <div key={itemPath}>
            <div
              className={`tree-item${isExpanded ? ' expanded' : ''}`}
              onClick={() => toggleFolder(itemPath)}
            >
              {Array.from({ length: depth }, (_, i) => (
                <span key={i} className="indent" />
              ))}
              <span className="expand-icon">{'\u25B6'}</span>
              <svg className="file-icon folder" viewBox="0 0 24 24">
                <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
              </svg>
              <span className="file-name">{item.name}</span>
            </div>
            {isExpanded && item.children && (
              <div className="tree-children open">
                {renderTreeItems(item.children, depth + 1, itemPath)}
              </div>
            )}
          </div>
        )
      }
      return (
        <div
          key={itemPath}
          className={`tree-item${selectedFile === itemPath ? ' selected' : ''}`}
          onClick={() => handleSelectFile(itemPath)}
        >
          {Array.from({ length: depth }, (_, i) => (
            <span key={i} className="indent" />
          ))}
          <span className="expand-icon" style={{ visibility: 'hidden' }}>{'\u25B6'}</span>
          <svg className={`file-icon ${item.ext || 'default'}`} viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
          </svg>
          <span className="file-name">{item.name}</span>
        </div>
      )
    })
  }

  const project = DEMO_PROJECTS[currentProject]

  return (
    <div className="landing-page">
      {/* Floating Particles */}
      <div className="particles" ref={particlesRef} />

      {/* Header */}
      <div className="header">
        <div className="tagline">Pro Vibe-Coding</div>
        <div className="header-content">
          <div className="pipeline">
            Code <span>{'\u203A'}</span> Connect <span>{'\u203A'}</span> Deploy
          </div>
          <div className="logo">
            <span className="hub">Hub</span>
            <span className="llm">LLM</span>
            <span className="dev">.dev</span>
          </div>
          <div className="header-features">
            <div className="header-feature">
              <svg viewBox="0 0 24 24"><path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z" /></svg>
              SSH
            </div>
            <div className="header-feature">
              <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.89 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z" /></svg>
              VPS
            </div>
            <div className="header-feature">
              <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-2-1h-6v-2h6v2zM7.5 17l-1.41-1.41L8.67 13l-2.59-2.59L7.5 9l4 4-4 4z" /></svg>
              Terminal
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="main-container">
        {/* Hub Box */}
        <div className={`hub-box${activePanelId ? ' panel-open' : ''}`} ref={hubBoxRef}>
          {/* Traveling Light */}
          <div className="traveling-light" ref={travelingLightRef} />

          {/* Chat Header */}
          <div className="chat-header">
            {/* Model Selector */}
            <div
              className={`model-selector${isModelDropdownOpen ? ' open' : ''}`}
              ref={modelSelectorRef}
            >
              <button className="model-selector-btn" onClick={toggleModelDropdown}>
                <div className="model-icon" style={{ background: selectedModel.color }}>
                  {selectedModel.icon.length > 1
                    ? <img src={selectedModel.icon} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                    : selectedModel.icon}
                </div>
                <span className="model-name">{selectedModel.name}</span>
                <span className="chevron">{'\u25BC'}</span>
              </button>
              <div className="model-dropdown">
                <div className="model-search-container">
                  <input
                    type="text"
                    className="model-search"
                    ref={modelSearchRef}
                    placeholder="Search models..."
                    value={modelSearchQuery}
                    onChange={(e) => setModelSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="model-list">
                  {filteredModels.map(m => (
                    <div
                      key={m.id}
                      className={`model-option${m.id === selectedModel.id ? ' selected' : ''}`}
                      onClick={() => selectModel(m.id)}
                    >
                      <div className="model-icon" style={{ background: m.color }}>
                        {m.icon.length > 1
                          ? <img src={m.icon} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                          : m.icon}
                      </div>
                      <div className="model-info">
                        <div className="model-name">{m.name}</div>
                        <div className="model-provider">{m.provider}</div>
                      </div>
                      {m.hasKey
                        ? <span className="model-status live">{'\u25CF'} Live</span>
                        : <span className="model-status connect" onClick={(e) => { e.stopPropagation() }}>Connect API Key</span>
                      }
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Status and Menu */}
            <div className="chat-header-right">
              <div className="nav-menu">
                <button
                  className={`nav-item${activePanelId === 'about' ? ' active' : ''}`}
                  onClick={() => togglePanel('about')}
                >
                  About
                </button>
                <button
                  className={`nav-item${activePanelId === 'pricing' ? ' active' : ''}`}
                  onClick={() => togglePanel('pricing')}
                >
                  Pricing
                </button>
                <button className="nav-item" onClick={onSignUp}>Contact</button>
                <button
                  className={`nav-item cta${activePanelId === 'auth' ? ' active' : ''}`}
                  onClick={() => togglePanel('auth')}
                >
                  Sign Up
                </button>
              </div>
              <div className="chat-title">
                <span className="status-dot" />
                AI Ready
              </div>
            </div>
          </div>

          {/* About Panel */}
          <div className={`info-panel${activePanelId === 'about' ? ' open' : ''}`}>
            <div className="info-panel-content">
              <div className="info-panel-header">
                <h3>About HubLLM</h3>
                <button className="info-close" onClick={() => setActivePanelId(null)}>{'\u00D7'}</button>
              </div>
              <p>
                HubLLM is your centralized hub for vibe-coding and development. Connect all your
                services—VPS, LLM models, and subscriptions—to access hundreds of AI models from one
                place. Code faster, deploy anywhere, stay in flow.
              </p>
            </div>
          </div>

          {/* Pricing Panel */}
          <div className={`info-panel pricing-panel${activePanelId === 'pricing' ? ' open' : ''}`}>
            <div className="info-panel-content pricing-content">
              <div className="info-panel-header">
                <h3>Pricing</h3>
                <button className="info-close" onClick={() => setActivePanelId(null)}>{'\u00D7'}</button>
              </div>
              <div className="pricing-cards">
                {/* Pro Tier */}
                <div className="pricing-card featured">
                  <div className="pricing-badge">First 500 Signups</div>
                  <div className="pricing-tier">Pro</div>
                  <div className="pricing-price">
                    <span className="price-old">$9.99/mo</span>
                    <span className="price-free">FREE</span>
                    <span className="price-label">Lifetime</span>
                  </div>
                  <ul className="pricing-features">
                    <li>Unlimited VPS connections</li>
                    <li>Unlimited projects</li>
                    <li>Advanced features included</li>
                    <li>All future upgrades free</li>
                  </ul>
                  <button className="pricing-btn featured-btn" onClick={() => togglePanel('auth')}>Claim Lifetime Access</button>
                </div>

                {/* Free Tier */}
                <div className="pricing-card">
                  <div className="pricing-tier">Free</div>
                  <div className="pricing-price">
                    <span className="price-main">$0</span>
                    <span className="price-label">/month</span>
                  </div>
                  <ul className="pricing-features">
                    <li>1 VPS connection</li>
                    <li>Unlimited projects</li>
                    <li>Community support</li>
                  </ul>
                  <button className="pricing-btn" onClick={() => togglePanel('auth')}>Get Started</button>
                  <div className="pricing-note">Available after initial launch</div>
                </div>

                {/* Plus Tier */}
                <div className="pricing-card">
                  <div className="pricing-tier">Plus</div>
                  <div className="pricing-price">
                    <span className="price-main">$3.99</span>
                    <span className="price-label">/month</span>
                  </div>
                  <ul className="pricing-features">
                    <li>Unlimited VPS connections</li>
                    <li>Unlimited projects</li>
                    <li>Priority support</li>
                  </ul>
                  <button className="pricing-btn" onClick={() => togglePanel('auth')}>Subscribe</button>
                  <div className="pricing-note">Available after initial launch</div>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Panel */}
          <div className={`info-panel auth-panel${activePanelId === 'auth' ? ' open' : ''}`}>
            <div className="info-panel-content auth-content">
              <div className="info-panel-header">
                <h3>{authMode === 'login' ? 'Sign In' : 'Create Account'}</h3>
                <button className="info-close" onClick={() => setActivePanelId(null)}>{'\u00D7'}</button>
              </div>

              {/* Auth Tabs */}
              <div className="auth-tabs">
                <button
                  className={`auth-tab${authMode === 'login' ? ' active' : ''}`}
                  onClick={() => { setAuthMode('login'); setAuthError('') }}
                >
                  Sign In
                </button>
                <button
                  className={`auth-tab${authMode === 'signup' ? ' active' : ''}`}
                  onClick={() => { setAuthMode('signup'); setAuthError('') }}
                >
                  Create Account
                </button>
              </div>

              {/* Auth Error */}
              {(authError || authContextError) && (
                <div className="auth-error">
                  {authError || authContextError}
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleAuthSubmit} className="auth-form">
                {/* Name field (signup only) */}
                {authMode === 'signup' && (
                  <div className="auth-input-group">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleAuthChange}
                      placeholder="Your name"
                      className="auth-input"
                    />
                  </div>
                )}

                {/* Email field */}
                <div className="auth-input-group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleAuthChange}
                    placeholder="you@example.com"
                    required
                    className="auth-input"
                  />
                </div>

                {/* Password field */}
                <div className="auth-input-group">
                  <div className="auth-password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleAuthChange}
                      placeholder={authMode === 'signup' ? 'Create a strong password' : 'Enter password'}
                      required
                      className="auth-input"
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword(prev => !prev)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Password requirements (signup only) */}
                {authMode === 'signup' && formData.password && (
                  <div className="auth-requirements">
                    {passwordRules.map(rule => {
                      const passed = rule.test(formData.password)
                      return (
                        <span key={rule.id} className={`auth-req-item${passed ? ' passed' : ''}`}>
                          {passed ? '\u2713' : '\u2717'} {rule.label}
                        </span>
                      )
                    })}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={authLoading || (authMode === 'signup' && !validatePassword(formData.password))}
                >
                  {authLoading
                    ? (authMode === 'login' ? 'Signing in...' : 'Creating account...')
                    : (authMode === 'login' ? 'Sign In' : 'Create Account')
                  }
                </button>
              </form>

              {/* OAuth */}
              {hasOAuth && (
                <>
                  <div className="auth-divider">
                    <span>or continue with</span>
                  </div>
                  <div className="auth-oauth-buttons">
                    {oauthProviders.github && (
                      <button className="auth-oauth-btn" onClick={() => handleOAuth('github')}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        GitHub
                      </button>
                    )}
                    {oauthProviders.google && (
                      <button className="auth-oauth-btn" onClick={() => handleOAuth('google')}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Terms */}
              <p className="auth-terms">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages" ref={chatMessagesRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.type}`}>
                <div className="message-avatar">{msg.type === 'user' ? 'You' : 'AI'}</div>
                <div className="message-bubble">{msg.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="message assistant">
                <div className="message-avatar">AI</div>
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask AI to build something..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleChatKeyPress}
            />
            <button className="chat-send-btn" onClick={sendMessage}>Send</button>
          </div>

          {/* File Explorer */}
          <div
            className={`file-header${isFileExplorerOpen ? ' open' : ''}`}
            onClick={toggleFileExplorer}
          >
            <svg className="folder-icon" viewBox="0 0 24 24">
              <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
            </svg>
            Project Files
            <svg className="chevron" viewBox="0 0 24 24" width="12" height="12">
              <path d="M7 10l5 5 5-5z" fill="currentColor" />
            </svg>
          </div>

          <div className={`file-content${isFileExplorerOpen ? ' open' : ''}`}>
            <div className="project-selector">
              <label>Project:</label>
              <select
                className="project-dropdown"
                value={currentProject}
                onChange={handleProjectChange}
              >
                <option value={1}>Landing Page</option>
                <option value={2}>API Server</option>
                <option value={3}>Mobile App</option>
              </select>
            </div>
            <div className="file-tree">
              {renderTreeItems(project.files, 0)}
            </div>
          </div>

          {/* Terminal Toggle */}
          <div
            className={`terminal-toggle${isTerminalOpen ? ' open' : ''}`}
            onClick={toggleTerminal}
          >
            <svg viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-2-1h-6v-2h6v2zM7.5 17l-1.41-1.41L8.67 13l-2.59-2.59L7.5 9l4 4-4 4z" />
            </svg>
            Terminal
            <svg className="chevron" viewBox="0 0 24 24" width="10" height="10">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </div>

          {/* Terminal */}
          <div className={`terminal${isTerminalOpen ? ' open' : ''}`}>
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="red" />
                <span className="yellow" />
                <span className="green" />
              </div>
              <div className="terminal-title">root@{project.vps} — bash</div>
            </div>
            <div className="terminal-body">
              <div className="terminal-output">
                {terminalLines.map((line, i) => (
                  <span key={i}>
                    <span className={line.type}>{line.text}</span>
                    <br />
                  </span>
                ))}
              </div>
              <div className="terminal-input-line">
                <span className="terminal-prompt">root@{project.vps}:</span>
                <span className="terminal-path">{project.path}</span>
                <span className="terminal-prompt">$</span>
                <input
                  type="text"
                  className="terminal-input"
                  ref={terminalInputRef}
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyPress={handleTerminalKeyPress}
                  onFocus={() => setIsCursorVisible(false)}
                  onBlur={() => setIsCursorVisible(true)}
                />
                {isCursorVisible && <span className="cursor-blink" />}
              </div>
            </div>
          </div>
        </div>

        {/* VPS Section */}
        <div className="vps-section">
          <div
            className={`vps-toggle${isVPSOpen ? ' open' : ''}`}
            onClick={toggleVPS}
          >
            <svg viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z" />
            </svg>
            VPS Servers
            <svg className="chevron" viewBox="0 0 24 24" width="12" height="12">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </div>
        </div>
      </div>

      {/* VPS Content - outside main container */}
      <div className={`vps-content${isVPSOpen ? ' open' : ''}`}>
        <div className="vps-content-inner">
          {/* Cables */}
          <div className="cables-container">
            <svg className="cables-svg" viewBox="0 0 600 50" preserveAspectRatio="none">
              <path className={`cable${currentProject === 1 ? ' active' : ''}`} d="M 100 0 L 100 50" />
              <path className={`cable-flow${currentProject === 1 ? ' active' : ''}`} d="M 100 0 L 100 50" />
              <path className={`cable${currentProject === 2 ? ' active' : ''}`} d="M 300 0 L 300 50" />
              <path className={`cable-flow${currentProject === 2 ? ' active' : ''}`} d="M 300 0 L 300 50" />
              <path className={`cable${currentProject === 3 ? ' active' : ''}`} d="M 500 0 L 500 50" />
              <path className={`cable-flow${currentProject === 3 ? ' active' : ''}`} d="M 500 0 L 500 50" />
            </svg>
          </div>

          {/* VPS Cards */}
          <div className="vps-grid">
            {VPS_CARDS.map(vps => {
              const isActive = vps.id === currentProject
              return (
                <div key={vps.id} className={`vps-card${isActive ? ' active' : ''}`}>
                  <span className="vps-label">{vps.label}</span>
                  <span className="vps-provider">{vps.provider}</span>
                  <div className="card-port" />
                  <div className="vps-card-inner">
                    <div className="vps-name">{vps.name}</div>
                    <div className="vps-ip">{vps.ip}</div>
                    <div className="vps-status">
                      <span className="status-indicator" />
                      <span>{isActive ? 'Connected' : 'Standby'}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        Code with any LLM.<br />Deploy anywhere.<br />HubLLM.dev &copy; {new Date().getFullYear()}
      </div>
    </div>
  )
}
