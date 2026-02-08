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
  return text
    // Standard CSI sequences: ESC [ ... final_byte
    .replace(/\x1B\[[0-9;?]*[A-Za-z]/g, '')
    // OSC sequences: ESC ] ... BEL or ESC ] ... ESC \
    .replace(/\x1B\][^\x07\x1B]*(?:\x07|\x1B\\)/g, '')
    // OSC fragments (incomplete): ESC ] ... (to end or next escape)
    .replace(/\x1B\][^\x1B]*/g, '')
    // Other escape sequences: ESC followed by single char
    .replace(/\x1B[@-Z\\-_]/g, '')
    // Remove BEL and other control chars that leak through
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Remove remaining fragments like "9;4;0;" that look like escape params
    .replace(/^\d+(?:;\d+)*;?$/gm, '')
    // Clean up \u0007 (BEL) that might be in string form
    .replace(/\\u0007/g, '')
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
    gap: '14px',
    marginBottom: '20px',
    maxWidth: '100%',
    padding: '0 8px'
  }

  const avatarStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: isUser
      ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
      : 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
  }

  const contentStyle = {
    maxWidth: '85%',
    padding: '14px 18px',
    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
    background: isUser ? '#3b82f6' : '#1a1a2e',
    color: '#f0f0f5',
    fontSize: '14px',
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.25)',
    border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.05)'
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
export default function ClaudeCodeTerminalChat({ project, serverId, projectSlug, onProcessingChange, enhanceWithAI, autoStart = false }) {
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
  // Start in terminal mode so user can see Claude Code loading and select conversation
  const [viewMode, setViewMode] = useState('terminal') // 'bubbles' | 'terminal'
  const [chatMessages, setChatMessages] = useState([])
  const outputBufferRef = useRef('')
  const messagesEndRef = useRef(null)
  const lastUserInputRef = useRef(null) // Track last user input to avoid duplicates
  const waitingForEchoRef = useRef(false) // Skip output until echo completes
  const echoTimeoutRef = useRef(null) // Timer to detect echo completion
  const [isProcessing, setIsProcessing] = useState(false) // True when waiting for Claude's response
  const [processingText, setProcessingText] = useState('') // Current spinner text (e.g., "Channeling...")
  const [terminalReady, setTerminalReady] = useState(false) // True when xterm is mounted and ready

  // FEAT-25: Enhance banner state (captured on mount, survives prop changes)
  const [showEnhanceBanner, setShowEnhanceBanner] = useState(!!enhanceWithAI)
  const [copied, setCopied] = useState(false)

  // FEAT-27: Floating hint overlay state
  const [showCommandHint, setShowCommandHint] = useState(false)
  // FEAT-35: Collapsible hint bubble
  const [hintCollapsed, setHintCollapsed] = useState(false)

  const copyBriefToClipboard = useCallback(() => {
    if (!project?.brief) return
    const cleanBrief = project.brief.trim().replace(/\n+/g, ' ').substring(0, 500)
    const prompt = `I just created this project. Here's my brief: ${cleanBrief}. Help me set up the project structure, dependencies, and initial files.`
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [project?.brief])

  // FEAT-10: Propagate processing state to parent (for project dot pulse animation)
  useEffect(() => {
    onProcessingChange?.(isProcessing)
  }, [isProcessing, onProcessingChange])

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
            }
            if (autoStart) {
              if (xtermRef.current) {
                xtermRef.current.writeln('\x1b[90mStarting Claude Code session...\x1b[0m')
                xtermRef.current.writeln('')
                xtermRef.current.scrollToBottom()
              }
              startClaudeCode()
            } else {
              // FEAT-33: Auto-cd to project directory
              if (projectSlug && wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'input', data: `cd /root/llm-hub-projects/${projectSlug}\n` }))
              }
              if (xtermRef.current) {
                xtermRef.current.writeln('\x1b[36mType "claude" to start a new session, or "claude --resume" to resume a previous one.\x1b[0m')
                xtermRef.current.writeln('')
                xtermRef.current.scrollToBottom()
              }
              claudeStartedRef.current = true
              setStatus('claude_ready')
              setShowCommandHint(true)
            }
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
                // Strip ANSI codes
                const cleanData = stripAnsi(message.data)

                // If waiting for user input echo to complete, check for response start
                if (waitingForEchoRef.current) {
                  // Look for indicators that Claude started responding (spinner started)
                  const lowerData = cleanData.toLowerCase()
                  const responseIndicators = [
                    'catapulting', 'pollinating', 'percolating', 'thinking',
                    '●', '○', '◐', '◑', '⠋', '⠙', '⠹', '⠸' // spinner chars
                  ]
                  const hasResponseStart = responseIndicators.some(i => lowerData.includes(i))

                  if (hasResponseStart) {
                    // Echo complete, Claude is responding
                    waitingForEchoRef.current = false
                    outputBufferRef.current = '' // Clear any accumulated echo
                    if (echoTimeoutRef.current) {
                      clearTimeout(echoTimeoutRef.current)
                      echoTimeoutRef.current = null
                    }
                  }
                  // Still waiting for echo to complete - skip this output
                  return
                }

                // Detect and display spinner/processing text
                const lowerData = cleanData.toLowerCase()
                const spinnerPatterns = [
                  'channeling', 'catapulting', 'pollinating', 'percolating', 'bamboozling',
                  'thinking', 'processing', 'analyzing', 'generating', 'writing'
                ]
                for (const pattern of spinnerPatterns) {
                  if (lowerData.includes(pattern)) {
                    // Capitalize first letter
                    setProcessingText(pattern.charAt(0).toUpperCase() + pattern.slice(1) + '...')
                    break
                  }
                }

                // Append to buffer
                outputBufferRef.current += cleanData

                // Accumulate response and update in real-time
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
                  if (trimmed === '' || trimmed === '>' || trimmed === '❯') return false
                  if (trimmed.startsWith('> ') || trimmed.startsWith('❯ ')) return false
                  // Skip lines that match the last user input (echo)
                  if (lastUserInputRef.current && trimmed === lastUserInputRef.current) return false

                  // Skip Claude Code UI elements - be very aggressive
                  const lowerLine = trimmed.toLowerCase()

                  // Skip spinner/loading animation text and fragments
                  // Claude Code uses creative spinner words - be very comprehensive
                  const spinnerWords = [
                    // -ating/-ulting words
                    'evaporating', 'pollinating', 'percolating', 'bamboozling', 'schmoozling',
                    'actualizing', 'crystallizing', 'ruminating', 'cogitating', 'deliberating',
                    'pondering', 'contemplating', 'meditating', 'reflecting', 'musing',
                    'initializing', 'processing', 'thinking', 'loading', 'calculating',
                    'formulating', 'generating', 'synthesizing', 'analyzing', 'evaluating',
                    'calibrating', 'activating', 'orchestrating', 'incubating', 'marinating',
                    'hibernating', 'germinating', 'simulating', 'cascading', 'brewing',
                    'catapulting', 'consulting', 'exulting', 'insulting', 'resulting',
                    // -ing words
                    'gathering', 'assembling', 'compiling', 'warming', 'charging', 'spinning',
                    'dreaming', 'scheming', 'plotting', 'hatching', 'concocting', 'manifesting',
                    'crunching', 'munching', 'scrunching',
                    // UI fragments
                    'app opinion', 'fetching', 'working', 'preparing'
                  ]
                  if (spinnerWords.some(word => lowerLine.includes(word))) return false

                  // Skip any line ending with "..." (incomplete/loading indicator)
                  if (trimmed.endsWith('...')) return false

                  // Skip tool call indicators
                  const toolNames = ['read', 'write', 'edit', 'bash', 'glob', 'grep', 'task', 'webfetch', 'websearch']
                  if (toolNames.some(tool => lowerLine === tool || lowerLine.startsWith(tool + ' '))) return false

                  // Skip lines that look like command output fragments (very short, no spaces)
                  if (trimmed.length < 10 && !trimmed.includes(' ') && !/^[A-Z]/.test(trimmed)) return false

                  if (trimmed.match(/^[0●•\*\+;❯]+$/)) return false  // Spinner frames
                  if (trimmed.match(/^[\d;]+$/)) return false  // Leftover escape params
                  // Skip partial spinner fragments (ng..., *liz, ctal, *Au, ating..., etc.)
                  if (trimmed.match(/^[\*\-\+●•]?[a-z]{1,5}\.{2,3}❯?$/i)) return false
                  if (trimmed.match(/^[\*\-\+●•]?[A-Za-z]{1,4}$/)) return false  // Very short text fragments
                  if (trimmed.includes('ought for')) return false  // "...ought for 1s)" spinner fragment
                  if (trimmed.includes('Esc to interrupt')) return false  // Interrupt hint
                  if (trimmed.match(/^\d+m\s*\d+s/)) return false  // Time display "1m 1s"
                  if (trimmed.match(/↑\s*\d+\s*tokens/)) return false  // Token count with arrow

                  // Skip Claude Code status bar (DO project-name Model tokens LIVE)
                  if (lowerLine === 'live' || trimmed === '● LIVE' || trimmed === '○ LIVE') return false
                  if (lowerLine.includes('live') && /\d+%/.test(trimmed)) return false
                  if (/\d+k\/\d+k/.test(trimmed)) return false  // Token counts like 18k/200k
                  if (trimmed.includes('█') || trimmed.includes('▓') || trimmed.includes('░')) return false  // Progress bar chars
                  if (trimmed.startsWith('●') || trimmed.startsWith('○')) return false  // Status indicators

                  // Skip welcome screen and session picker
                  if (lowerLine.includes('welcome back')) return false
                  if (lowerLine.includes('tips for getting started')) return false
                  if (lowerLine.includes('recent activity')) return false
                  if (lowerLine.includes('no recent activity')) return false
                  if (lowerLine.includes('organization')) return false
                  if (lowerLine.includes('resume session')) return false
                  if (lowerLine.includes('loading conversation')) return false
                  if (lowerLine.includes('search')) return false
                  if (lowerLine.includes('ctrl+') || lowerLine.includes('esc to')) return false
                  if (lowerLine.includes('messages') && /\d+/.test(lowerLine)) return false

                  // Skip ASCII art box characters and UI frames
                  if (/^[│┃|├┤┌┐└┘─━┬┴┼]+$/.test(trimmed)) return false
                  if (/^[|\-+]+$/.test(trimmed)) return false
                  // Skip lines that are mostly box-drawing or UI structure
                  if ((trimmed.match(/[│┃|├┤┌┐└┘─━]/g) || []).length > trimmed.length * 0.3) return false

                  // Skip model/status bar elements
                  if (lowerLine.includes('opus') || lowerLine.includes('sonnet') || lowerLine.includes('haiku')) return false
                  if (lowerLine.includes('claude code')) return false
                  if (/\d+\s*(tokens?|tk)/i.test(trimmed)) return false
                  if (/\$\d+\.\d+/.test(trimmed) || lowerLine.includes('cost:')) return false

                  // Skip path and command lines
                  if (trimmed.startsWith('/root/') || trimmed.includes('llm-hub-projects')) return false
                  if (trimmed.includes('&& claude') || trimmed.startsWith('cd /')) return false
                  if (lowerLine.includes('/init') || lowerLine.includes('claude.md')) return false

                  // Skip status indicators
                  if (lowerLine.includes('thinking') || lowerLine.includes('processing')) return false

                  // Skip divider lines
                  if (/^[-=_*~─━]+$/.test(trimmed)) return false

                  // Skip very short lines that look like UI fragments
                  if (trimmed.length < 3 && !/^[.!?●•└├]/.test(trimmed)) return false

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
                  setIsProcessing(false)
                  setProcessingText('')
                }
              }
            }
            break

          case 'error':
            setStatus('error')
            setError(message.message)
            setIsProcessing(false)
            setProcessingText('')
            if (xtermRef.current) {
              xtermRef.current.writeln(`\x1b[31mError: ${message.message}\x1b[0m`)
            }
            break

          case 'disconnected':
            setStatus('disconnected')
            setIsProcessing(false)
            setProcessingText('')
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

      // FEAT-10: Check if this project had a previous Claude session
      // If yes, use `claude -c` to auto-continue most recent conversation (no picker)
      // If no, use `claude --resume` to show picker or start new
      const sessionKey = projectSlug ? `claude_session_${projectSlug}` : null
      const hasPreviousSession = sessionKey && localStorage.getItem(sessionKey)
      const claudeFlag = hasPreviousSession ? '-c' : '--resume'

      let command = ''
      if (projectSlug) {
        command = `cd /root/llm-hub-projects/${projectSlug} && claude ${claudeFlag}\n`
      } else {
        command = 'claude --resume\n'
      }

      wsRef.current.send(JSON.stringify({ type: 'input', data: command }))

      // FEAT-10: Mark that this project has had a Claude session
      if (sessionKey) {
        localStorage.setItem(sessionKey, Date.now().toString())
      }

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

      // Clear output buffer and set flag to wait for echo to complete
      outputBufferRef.current = ''
      waitingForEchoRef.current = true
      setIsProcessing(true)
      setProcessingText('Thinking...')

      // Fallback: if no response indicator seen within 500ms, assume echo done
      if (echoTimeoutRef.current) clearTimeout(echoTimeoutRef.current)
      echoTimeoutRef.current = setTimeout(() => {
        waitingForEchoRef.current = false
        outputBufferRef.current = '' // Clear accumulated echo
      }, 500)

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

      // Fit terminal to container and mark as ready
      requestAnimationFrame(() => {
        if (fitAddonRef.current && mounted) {
          fitAddonRef.current.fit()
          setTerminalReady(true)
        }
      })

      // BUG-18 FIX: Handle terminal keyboard input - send to WebSocket
      term.onData((data) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'input', data }))
        }
        // FEAT-27/35: Collapse hint overlay on first keystroke (X to fully dismiss)
        setHintCollapsed(true)
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
      if (echoTimeoutRef.current) {
        clearTimeout(echoTimeoutRef.current)
        echoTimeoutRef.current = null
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
    // PHASE-2: Clear chat messages and processing state on reconnect
    setChatMessages([])
    outputBufferRef.current = ''
    lastUserInputRef.current = null
    setIsProcessing(false)
    setProcessingText('')
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

        {/* FEAT-25: Enhance banner */}
        {showEnhanceBanner && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(249, 115, 22, 0.08)',
            borderBottom: '1px solid rgba(249, 115, 22, 0.2)'
          }}>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {project?.brief ? (project.brief.length > 100 ? project.brief.substring(0, 100) + '...' : project.brief) : 'No brief provided'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Paste this into Claude Code when ready
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowEnhanceBanner(false)}
                style={{
                  padding: '4px 12px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                Dismiss
              </button>
              <button
                onClick={copyBriefToClipboard}
                style={{
                  padding: '4px 12px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>
        )}

        {/* PHASE-2: Chat Bubbles View */}
        {viewMode === 'bubbles' && (
          <div className="claude-code-bubbles-area">
            {chatMessages.length === 0 && !isProcessing ? (
              <div className="claude-code-empty-state">
                <Sparkles size={32} style={{ color: '#bb9af7', marginBottom: '12px' }} />
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                  {status === 'claude_ready'
                    ? 'Start a conversation with Claude Code'
                    : status === 'error' || status === 'disconnected'
                      ? 'Connection lost - click Reconnect'
                      : 'Connecting to Claude Code...'}
                </p>
              </div>
            ) : (
              <>
                {chatMessages.map((msg, i) => (
                  <ChatBubble key={i} message={msg} isUser={msg.role === 'user'} />
                ))}
                {/* Thinking indicator */}
                {isProcessing && (
                  <div className="claude-code-thinking">
                    <div className="thinking-avatar">
                      <Sparkles size={16} color="#fff" />
                    </div>
                    <div className="thinking-bubble">
                      <div className="thinking-dots">
                        <span></span><span></span><span></span>
                      </div>
                      <span className="thinking-text">{processingText || 'Thinking...'}</span>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Loading Overlay - shown while connecting to VPS */}
        {(status === 'connecting' || status === 'connected' || status === 'claude_starting') && (
          <div className="claude-code-loading-overlay">
            <div className="terminal-loading-spinner"></div>
            <p>
              {status === 'connecting' && 'Connecting to VPS...'}
              {status === 'connected' && 'Connected, starting Claude Code...'}
              {status === 'claude_starting' && 'Starting Claude Code session...'}
            </p>
          </div>
        )}

        {/* Terminal Loading State */}
        {viewMode === 'terminal' && !terminalReady && status === 'claude_ready' && (
          <div className="claude-code-terminal-loading">
            <div className="terminal-loading-spinner"></div>
            <p>Loading terminal...</p>
          </div>
        )}

        {/* Terminal Display Area - always rendered but hidden when in bubbles mode */}
        {/* BUG-18 FIX: Click to focus terminal for keyboard input */}
        <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
          <div
            ref={terminalRef}
            className="claude-code-terminal-area"
            onClick={handleTerminalClick}
            style={{ display: viewMode === 'terminal' && terminalReady ? 'block' : 'none', height: '100%' }}
          />
          {/* FEAT-27/35: Floating hint overlay with collapse/dismiss */}
          {showCommandHint && viewMode === 'terminal' && (
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 20, 25, 0.85)',
              backdropFilter: 'blur(8px)',
              borderRadius: '8px',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              maxWidth: '420px',
              zIndex: 10,
              ...(!hintCollapsed ? { padding: '12px 16px' } : { padding: '6px 12px', cursor: 'pointer' })
            }}
              {...(hintCollapsed ? { onClick: () => setHintCollapsed(false) } : {})}
            >
              {hintCollapsed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12px' }}>
                  <span style={{ transform: 'rotate(-90deg)', display: 'inline-block' }}>&#9662;</span>
                  <span>Hint</span>
                </div>
              ) : (
                <>
                  {/* Controls row */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', marginBottom: '8px' }}>
                    <button
                      onClick={() => setHintCollapsed(true)}
                      title="Collapse hint"
                      style={{
                        background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
                        padding: '2px 4px', fontSize: '14px', lineHeight: 1, borderRadius: '4px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#e2e8f0'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                    >&#9662;</button>
                    <button
                      onClick={() => setShowCommandHint(false)}
                      title="Dismiss hint"
                      style={{
                        background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
                        padding: '2px 4px', fontSize: '14px', lineHeight: 1, borderRadius: '4px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#e2e8f0'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                    >&times;</button>
                  </div>
                  <div style={{ fontSize: '13px', color: '#e2e8f0', marginBottom: '6px', textAlign: 'center' }}>
                    {showEnhanceBanner
                      ? 'Copy your project brief above, then type claude to start'
                      : 'Type claude to start a new session'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', marginBottom: '8px' }}>
                    or claude --resume to continue a previous one
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', borderTop: '1px solid rgba(56, 189, 248, 0.1)', paddingTop: '8px' }}>
                    Open the README.md file in the file explorer for more useful information.
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Chat Input Area - only shown in bubble view */}
        {viewMode === 'bubbles' && (
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
                ? 'Type your message and press Enter'
                : 'Connecting to Claude Code on VPS...'}
            </div>
          </div>
        )}
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
