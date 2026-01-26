import { useEffect, useRef, useState, useCallback } from 'react'
import { Plus, Mic, Send, Terminal as TerminalIcon, RefreshCw, MessageSquare, Sparkles } from 'lucide-react'

/**
 * ClaudeCodeTerminalChat Component (CLAUDE-02-REWORK + PHASE-2)
 *
 * Phase 1: Terminal-based chat for Claude Code on VPS.
 * Phase 2: Chat bubble rendering for Claude Code output.
 *
 * Shows xterm.js in the chat area when Anthropic model + Claude Code authenticated.
 * Auto-runs `claude` command on connect, wires chat input to terminal stdin.
 * Parses output to render as chat bubbles (user messages right, Claude left).
 *
 * Protocol:
 * 1. Connect to VPS via WebSocket terminal
 * 2. Auto-run `claude` to start interactive Claude Code session
 * 3. User types in chat input → sends to terminal stdin
 * 4. Terminal output displays in chat area (raw or bubbles)
 */

// PHASE-2: Strip ANSI escape codes from text
const stripAnsi = (text) => {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '')
}

// PHASE-2: Parse a chunk of output to extract messages
// Returns { userInput: string|null, claudeResponse: string|null, remaining: string }
const parseOutputChunk = (buffer) => {
  // Look for the `> ` prompt pattern that indicates user input
  // User input is what appears after `> ` until newline
  const promptRegex = /^> (.+)$/m
  const match = buffer.match(promptRegex)

  if (match) {
    const promptIndex = match.index
    const userInput = match[1].trim()

    // Everything before the prompt could be Claude's response
    const beforePrompt = buffer.slice(0, promptIndex).trim()
    // Everything after the user input line is remaining
    const afterUserLine = buffer.slice(promptIndex + match[0].length).trim()

    return {
      claudeResponse: beforePrompt || null,
      userInput: userInput || null,
      remaining: afterUserLine
    }
  }

  return { userInput: null, claudeResponse: null, remaining: buffer }
}

// PHASE-2: Chat Bubble Component
function ChatBubble({ message, isUser }) {
  const bubbleStyle = {
    display: 'flex',
    flexDirection: isUser ? 'row-reverse' : 'row',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '16px',
    maxWidth: '100%'
  }

  const avatarStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: isUser ? '#3b82f6' : '#bb9af7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  }

  const contentStyle = {
    maxWidth: '80%',
    padding: '12px 16px',
    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
    background: isUser ? '#3b82f6' : '#1e1e2e',
    color: '#e4e4e7',
    fontSize: '14px',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }

  // Simple markdown-like rendering for code blocks
  const renderContent = (text) => {
    // Handle code blocks ```...```
    const parts = text.split(/(```[\s\S]*?```)/g)

    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        // Extract language and code
        const lines = part.slice(3, -3).split('\n')
        const lang = lines[0] || ''
        const code = lines.slice(1).join('\n') || lines[0]

        return (
          <pre key={i} style={{
            background: '#0a0a0f',
            padding: '12px',
            borderRadius: '8px',
            marginTop: i > 0 ? '8px' : 0,
            marginBottom: '8px',
            overflow: 'auto',
            fontSize: '13px',
            fontFamily: "'Monaco', 'Consolas', monospace"
          }}>
            {lang && <div style={{ color: '#6b7280', marginBottom: '4px', fontSize: '11px' }}>{lang}</div>}
            <code>{code}</code>
          </pre>
        )
      }

      // Handle inline code `...`
      const inlineParts = part.split(/(`[^`]+`)/g)
      return inlineParts.map((inlinePart, j) => {
        if (inlinePart.startsWith('`') && inlinePart.endsWith('`')) {
          return (
            <code key={`${i}-${j}`} style={{
              background: '#0a0a0f',
              padding: '2px 6px',
              borderRadius: '4px',
              fontFamily: "'Monaco', 'Consolas', monospace",
              fontSize: '13px'
            }}>
              {inlinePart.slice(1, -1)}
            </code>
          )
        }
        return <span key={`${i}-${j}`}>{inlinePart}</span>
      })
    })
  }

  return (
    <div style={bubbleStyle}>
      <div style={avatarStyle}>
        {isUser ? (
          <span style={{ fontSize: '14px' }}>U</span>
        ) : (
          <Sparkles size={16} color="#fff" />
        )}
      </div>
      <div style={contentStyle}>
        {renderContent(message.content)}
      </div>
    </div>
  )
}
export default function ClaudeCodeTerminalChat({ project, serverId, projectSlug }) {
  const terminalRef = useRef(null)
  const xtermRef = useRef(null)
  const wsRef = useRef(null)
  const fitAddonRef = useRef(null)
  const [status, setStatus] = useState('disconnected') // 'disconnected', 'connecting', 'connected', 'error', 'claude_starting', 'claude_ready'
  const [serverInfo, setServerInfo] = useState(null)
  const [error, setError] = useState(null)
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const inputRef = useRef(null)
  const claudeStartedRef = useRef(false)

  // BUG-22: Resize handle state (delta-based drag pattern)
  const [terminalWidth, setTerminalWidth] = useState(800) // Default width
  const [isDragging, setIsDragging] = useState(false)
  const dragStartXRef = useRef(null)
  const dragStartWidthRef = useRef(null)
  const resizeHandleRef = useRef(null)

  // PHASE-2: Chat bubble rendering state
  const [viewMode, setViewMode] = useState('bubbles') // 'bubbles' | 'terminal'
  const [chatMessages, setChatMessages] = useState([])
  const outputBufferRef = useRef('')
  const messagesEndRef = useRef(null)
  const lastUserInputRef = useRef(null) // Track last user input to avoid duplicates

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (!serverId) {
      setStatus('disconnected')
      setError('No VPS connected')
      return
    }

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setStatus('connecting')
    setError(null)
    claudeStartedRef.current = false

    // Build WebSocket URL - use serverId directly
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const params = new URLSearchParams()
    params.set('serverId', serverId)
    const wsUrl = `${protocol}//${window.location.host}/api/terminal/ws?${params.toString()}`

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      // Send init message with terminal size
      const cols = xtermRef.current?.cols || 80
      const rows = xtermRef.current?.rows || 24
      ws.send(JSON.stringify({ type: 'init', cols, rows }))
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)

        switch (message.type) {
          case 'connected':
            setStatus('connected')
            setServerInfo({ server: message.server, host: message.host })
            if (xtermRef.current) {
              xtermRef.current.writeln(`\x1b[32mConnected to ${message.server}\x1b[0m`)
              xtermRef.current.writeln('\x1b[90mStarting Claude Code session...\x1b[0m')
              xtermRef.current.writeln('')
              xtermRef.current.scrollToBottom()
            }
            // Auto-start Claude Code after connection
            startClaudeCode()
            break

          case 'output':
            if (xtermRef.current && message.data) {
              xtermRef.current.write(message.data)
              xtermRef.current.scrollToBottom()

              // Detect when Claude Code is ready for input
              // Strip ANSI codes first, then check for prompt patterns
              if (!claudeStartedRef.current) {
                const cleanData = stripAnsi(message.data)
                // Check for various Claude Code prompt patterns
                const hasPrompt = cleanData.includes('>') ||
                                  cleanData.includes('❯') ||
                                  cleanData.includes('?') // Claude often asks questions
                if (hasPrompt) {
                  claudeStartedRef.current = true
                  setStatus('claude_ready')
                }
              }

              // PHASE-2: Parse output for chat bubbles
              if (claudeStartedRef.current) {
                // Strip ANSI codes and append to buffer
                const cleanData = stripAnsi(message.data)
                outputBufferRef.current += cleanData

                // Simple approach: accumulate response and update in real-time
                const buffer = outputBufferRef.current

                // Check if buffer contains a prompt line (indicates response complete)
                // Look for standalone `> ` at start of a line (the input prompt)
                const lines = buffer.split('\n')
                const lastNonEmptyLine = [...lines].reverse().find(l => l.trim().length > 0)
                const hasPromptAtEnd = lastNonEmptyLine?.trim() === '>' ||
                                       lastNonEmptyLine?.trim().startsWith('> ')

                // Filter out prompt lines, user echo, and Claude Code UI elements
                const responseLines = lines.filter(line => {
                  const trimmed = line.trim()
                  // Skip empty lines, prompt lines, and echoed user input
                  if (trimmed === '' || trimmed === '>') return false
                  if (trimmed.startsWith('> ')) return false
                  // Skip lines that match the last user input (echo)
                  if (lastUserInputRef.current && trimmed === lastUserInputRef.current) return false

                  // Skip Claude Code status bar and UI elements
                  // Status bar contains model names, project info, token counts
                  const lowerLine = trimmed.toLowerCase()
                  if (lowerLine.includes('opus') && (lowerLine.includes('4') || lowerLine.includes('claude'))) return false
                  if (lowerLine.includes('sonnet') && (lowerLine.includes('3') || lowerLine.includes('4') || lowerLine.includes('claude'))) return false
                  if (lowerLine.includes('haiku') && lowerLine.includes('claude')) return false
                  // Skip token count lines (e.g., "123 tokens", "~500 tokens")
                  if (/\d+\s*(tokens?|tk)/i.test(trimmed)) return false
                  // Skip cost lines (e.g., "$0.05", "cost:")
                  if (/\$\d+\.\d+/.test(trimmed) || lowerLine.includes('cost:')) return false
                  // Skip path lines from cd command
                  if (trimmed.startsWith('/root/') || trimmed.includes('llm-hub-projects')) return false
                  // Skip command echo (cd ... && claude)
                  if (trimmed.includes('&& claude') || trimmed.startsWith('cd /')) return false
                  // Skip status indicators and progress
                  if (lowerLine.includes('thinking') || lowerLine.includes('processing')) return false
                  // Skip lines that are just special characters or dividers
                  if (/^[-=_*~]+$/.test(trimmed)) return false
                  // Skip very short lines that look like UI fragments (< 3 chars, not punctuation continuation)
                  if (trimmed.length < 3 && !/^[.!?]$/.test(trimmed)) return false

                  return true
                })

                const responseText = responseLines.join('\n').trim()

                // Update or add assistant message if we have response content
                if (responseText.length > 0) {
                  setChatMessages(prev => {
                    const updated = [...prev]
                    // Find last assistant message to update, or add new one
                    const lastIdx = updated.length - 1
                    if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                      // Update existing assistant message
                      updated[lastIdx] = { role: 'assistant', content: responseText }
                    } else {
                      // Add new assistant message
                      updated.push({ role: 'assistant', content: responseText })
                    }
                    return updated
                  })
                }

                // Clear buffer when we see the next prompt (response complete)
                if (hasPromptAtEnd) {
                  outputBufferRef.current = ''
                }
              }
            }
            break

          case 'error':
            setStatus('error')
            setError(message.message)
            if (xtermRef.current) {
              xtermRef.current.writeln(`\x1b[31mError: ${message.message}\x1b[0m`)
            }
            break

          case 'disconnected':
            setStatus('disconnected')
            if (xtermRef.current) {
              xtermRef.current.writeln('')
              xtermRef.current.writeln('\x1b[33mConnection closed\x1b[0m')
            }
            break
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err)
      }
    }

    ws.onclose = () => {
      if (status === 'connecting' || status === 'connected' || status === 'claude_ready') {
        setStatus('disconnected')
      }
    }

    ws.onerror = () => {
      setStatus('error')
      setError('WebSocket connection failed')
    }
  }, [serverId, status])

  // Start Claude Code interactive session
  const startClaudeCode = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setStatus('claude_starting')

      // First cd to project directory if slug provided, then start claude --resume
      // Using --resume allows continuing previous conversations on reconnect
      // If no previous conversation exists, Claude Code will prompt to start a new one
      let command = ''
      if (projectSlug) {
        command = `cd /root/llm-hub-projects/${projectSlug} && claude --resume\n`
      } else {
        command = 'claude --resume\n'
      }

      wsRef.current.send(JSON.stringify({ type: 'input', data: command }))

      // Fallback: enable input after 3 seconds if prompt detection didn't trigger
      // This handles cases where Claude Code's prompt pattern isn't detected
      setTimeout(() => {
        if (!claudeStartedRef.current) {
          claudeStartedRef.current = true
          setStatus('claude_ready')
        }
      }, 3000)
    }
  }, [projectSlug])

  // Send message to Claude Code via terminal
  const sendMessage = useCallback(() => {
    if (!input.trim() || status !== 'claude_ready') return

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const userMessage = input.trim()

      // PHASE-2: Add user message immediately for responsive UI
      lastUserInputRef.current = userMessage
      setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])

      // Send message text first
      wsRef.current.send(JSON.stringify({ type: 'input', data: userMessage }))

      // Then send Enter key (\r) separately after a small delay
      // This mimics actual terminal typing behavior
      setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'input', data: '\r' }))
        }
      }, 50)

      setInput('')
    }
  }, [input, status])

  // Initialize xterm.js
  useEffect(() => {
    let mounted = true

    const loadXterm = async () => {
      const { Terminal } = await import('@xterm/xterm')
      const { FitAddon } = await import('@xterm/addon-fit')
      await import('@xterm/xterm/css/xterm.css')

      if (!mounted || !terminalRef.current) return

      // Create terminal with chat-friendly theme
      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: "'Monaco', 'Consolas', 'Courier New', monospace",
        theme: {
          background: '#0a0a0f', // Match chat background
          foreground: '#e4e4e7',
          cursor: '#e4e4e7',
          selection: '#33467c',
          black: '#15161e',
          red: '#f7768e',
          green: '#9ece6a',
          yellow: '#e0af68',
          blue: '#7aa2f7',
          magenta: '#bb9af7',
          cyan: '#7dcfff',
          white: '#a9b1d6',
        },
        scrollback: 5000,
        convertEol: true,
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)

      xtermRef.current = term
      fitAddonRef.current = fitAddon

      // Mount terminal
      term.open(terminalRef.current)

      // Fit terminal to container
      requestAnimationFrame(() => {
        if (fitAddonRef.current && mounted) {
          fitAddonRef.current.fit()
        }
      })

      // BUG-18 FIX: Handle terminal keyboard input - send to WebSocket
      term.onData((data) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'input', data }))
        }
      })

      // Focus terminal for keyboard input
      term.focus()

      // Connect if we have serverId
      if (serverId) {
        connect()
      }
    }

    loadXterm()

    // Cleanup
    return () => {
      mounted = false
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      if (xtermRef.current) {
        xtermRef.current.dispose()
        xtermRef.current = null
      }
    }
  }, []) // Only run once on mount

  // Reconnect when serverId or projectSlug changes (BUG-21: handles project switch)
  useEffect(() => {
    if (xtermRef.current && serverId) {
      xtermRef.current.clear()
      connect()
    }
  }, [serverId, projectSlug])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (fitAddonRef.current && xtermRef.current) {
        fitAddonRef.current.fit()

        // Send resize to server
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'resize',
            cols: xtermRef.current.cols,
            rows: xtermRef.current.rows
          }))
        }
      }
    }

    // Use ResizeObserver for more reliable resize detection
    const resizeObserver = new ResizeObserver(() => {
      handleResize()
    })

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const reconnect = () => {
    if (xtermRef.current) {
      xtermRef.current.clear()
      xtermRef.current.writeln('\x1b[33mReconnecting...\x1b[0m')
    }
    // PHASE-2: Clear chat messages on reconnect
    setChatMessages([])
    outputBufferRef.current = ''
    lastUserInputRef.current = null
    connect()
  }

  // PHASE-2: Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (viewMode === 'bubbles' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, viewMode])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      sendMessage()
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const toggleMic = () => {
    setIsRecording(!isRecording)
    // Voice input placeholder
  }

  // Status indicator
  const getStatusInfo = () => {
    switch (status) {
      case 'claude_ready':
        return { color: '#9ece6a', text: 'Claude Code Ready' }
      case 'claude_starting':
        return { color: '#e0af68', text: 'Starting Claude Code...' }
      case 'connected':
        return { color: '#7aa2f7', text: 'Connected' }
      case 'connecting':
        return { color: '#e0af68', text: 'Connecting...' }
      case 'error':
        return { color: '#f7768e', text: error || 'Error' }
      default:
        return { color: '#6b7280', text: 'Disconnected' }
    }
  }

  const statusInfo = getStatusInfo()

  // BUG-18 FIX: Focus terminal when clicked
  const handleTerminalClick = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.focus()
    }
  }, [])

  // BUG-22: Resize handle - delta-based drag pattern (from TERMINAL_WORKSPACE.md)
  useEffect(() => {
    const handle = resizeHandleRef.current
    if (!handle) return

    const onMouseDown = (e) => {
      e.preventDefault()
      setIsDragging(true)
      dragStartXRef.current = e.clientX
      dragStartWidthRef.current = terminalWidth
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
    }

    const onMouseMove = (e) => {
      if (dragStartXRef.current === null) return

      // Delta = how far mouse moved (positive = right/wider, negative = left/narrower)
      const delta = e.clientX - dragStartXRef.current
      const newWidth = dragStartWidthRef.current + delta
      // Clamp between 400px and 1200px
      const clampedWidth = Math.max(400, Math.min(1200, newWidth))
      setTerminalWidth(clampedWidth)
    }

    const onMouseUp = () => {
      setIsDragging(false)
      dragStartXRef.current = null
      dragStartWidthRef.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''

      // Refit terminal after resize
      if (fitAddonRef.current) {
        requestAnimationFrame(() => {
          fitAddonRef.current.fit()
          // Send resize to server
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && xtermRef.current) {
            wsRef.current.send(JSON.stringify({
              type: 'resize',
              cols: xtermRef.current.cols,
              rows: xtermRef.current.rows
            }))
          }
        })
      }
    }

    handle.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    return () => {
      handle.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [terminalWidth])

  return (
    <div className="chat-panel claude-code-terminal-chat-wrapper">
      {/* BUG-22: Resizable terminal container */}
      <div
        className="claude-code-terminal-chat"
        style={{ width: terminalWidth }}
      >
        {/* Status Header */}
        <div className="claude-code-status-bar">
          <div className="claude-code-status-left">
            <TerminalIcon size={14} />
            <span
              className="claude-code-status-dot"
              style={{ backgroundColor: statusInfo.color }}
            />
            <span className="claude-code-status-text">{statusInfo.text}</span>
            {serverInfo && (
              <span className="claude-code-server-name">• {serverInfo.server}</span>
            )}
          </div>
          <div className="claude-code-status-right">
            {/* PHASE-2: View mode toggle */}
            <div className="claude-code-view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'bubbles' ? 'active' : ''}`}
                onClick={() => setViewMode('bubbles')}
                title="Chat bubbles view"
              >
                <MessageSquare size={14} />
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'terminal' ? 'active' : ''}`}
                onClick={() => setViewMode('terminal')}
                title="Terminal view"
              >
                <TerminalIcon size={14} />
              </button>
            </div>
            {(status === 'disconnected' || status === 'error') && serverId && (
              <button className="claude-code-reconnect-btn" onClick={reconnect}>
                <RefreshCw size={12} />
                Reconnect
              </button>
            )}
          </div>
        </div>

        {/* PHASE-2: Chat Bubbles View */}
        {viewMode === 'bubbles' && (
          <div className="claude-code-bubbles-area">
            {chatMessages.length === 0 ? (
              <div className="claude-code-empty-state">
                <Sparkles size={32} style={{ color: '#bb9af7', marginBottom: '12px' }} />
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                  {status === 'claude_ready'
                    ? 'Start a conversation with Claude Code'
                    : 'Connecting to Claude Code...'}
                </p>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <ChatBubble key={i} message={msg} isUser={msg.role === 'user'} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Terminal Display Area - always rendered but hidden when in bubbles mode */}
        {/* BUG-18 FIX: Click to focus terminal for keyboard input */}
        <div
          ref={terminalRef}
          className="claude-code-terminal-area"
          onClick={handleTerminalClick}
          style={{ display: viewMode === 'terminal' ? 'block' : 'none' }}
        />

        {/* Chat Input Area (same as regular Chat) */}
        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            {/* Plus Button - disabled in terminal mode */}
            <button className="plus-btn" disabled title="Files not supported in terminal mode">
              <Plus size={18} />
            </button>

            {/* Chat Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={status === 'claude_ready' ? 'Ask Claude Code...' : 'Waiting for Claude Code...'}
              disabled={status !== 'claude_ready'}
            />

            {/* Mic Button */}
            <button
              className={`mic-btn ${isRecording ? 'recording' : ''}`}
              onClick={toggleMic}
              title="Voice input (Whisper)"
              disabled={status !== 'claude_ready'}
            >
              <Mic size={18} />
            </button>

            {/* Send Button */}
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || status !== 'claude_ready'}
            >
              <Send size={18} />
            </button>
          </div>

          {/* Input Hint */}
          <div className="chat-input-hint">
            {status === 'claude_ready'
              ? viewMode === 'bubbles'
                ? 'Type your message and press Enter'
                : 'Click terminal to type directly • Or use input box'
              : 'Connecting to Claude Code on VPS...'}
          </div>
        </div>
      </div>

      {/* BUG-22: Resize handle on right edge */}
      <div
        ref={resizeHandleRef}
        className={`claude-code-resize-handle ${isDragging ? 'dragging' : ''}`}
        title="Drag to resize"
      />
    </div>
  )
}
