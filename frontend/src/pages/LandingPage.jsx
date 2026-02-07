import { useState, useEffect, useRef, useCallback } from 'react'
import './LandingPage.css'

// Demo models data
const DEMO_MODELS = [
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', icon: 'C', color: '#d97706', hasKey: true },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', icon: 'C', color: '#d97706', hasKey: true },
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
        <div className="hub-box" ref={hubBoxRef}>
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
                  {selectedModel.icon}
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
                      <div className="model-icon" style={{ background: m.color }}>{m.icon}</div>
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
                <button className="nav-item cta" onClick={onSignUp}>Sign Up</button>
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
                  <button className="pricing-btn featured-btn" onClick={onSignUp}>Claim Lifetime Access</button>
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
                  <button className="pricing-btn" onClick={onSignUp}>Get Started</button>
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
                  <button className="pricing-btn" onClick={onSignUp}>Subscribe</button>
                  <div className="pricing-note">Available after initial launch</div>
                </div>
              </div>
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
          <div className="file-explorer">
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
        HubLLM.dev — Code with any LLM. Deploy anywhere.
      </div>
    </div>
  )
}
