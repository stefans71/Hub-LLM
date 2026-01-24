import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Plus, Mic, Send, Copy } from 'lucide-react'

/**
 * Chat Component (W-54)
 *
 * AI chat interface matching mockup specification:
 * - W-54: Chat Panel Container
 * - W-55: Chat Messages Container
 * - W-56-60: Message bubbles (assistant/user)
 * - W-61-67: Chat Input Area with voice input
 */
export default function Chat({ project, model, apiKeys }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)
    setLoadingStatus('Thinking...')

    try {
      // Determine provider based on available keys
      const provider = apiKeys?.claude ? 'claude_direct' : 'openrouter'

      const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-OpenRouter-Key': apiKeys?.openrouter || '',
          'X-Claude-Key': apiKeys?.claude || ''
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          model,
          provider,
          stream: true,
          project_id: project?.id
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      // Handle streaming response
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = { role: 'assistant', content: '' }
      setMessages([...newMessages, assistantMessage])
      setLoadingStatus('Generating response...')

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
                assistantMessage.content += parsed.content
                setMessages([...newMessages, { ...assistantMessage }])
              }
            } catch (e) {
              // Skip parse errors
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err)
      setMessages([
        ...newMessages,
        { role: 'assistant', content: `Error: ${err.message}` }
      ])
    } finally {
      setIsLoading(false)
      setLoadingStatus('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      sendMessage()
    }
  }

  const toggleMic = () => {
    setIsRecording(!isRecording)
    // Voice input would be implemented here with Whisper API
    if (!isRecording) {
      // Start recording
      console.log('Starting voice recording...')
    } else {
      // Stop recording and process
      console.log('Stopping voice recording...')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  // Extract code language from className
  const getLanguage = (className) => {
    const match = /language-(\w+)/.exec(className || '')
    return match ? match[1] : 'text'
  }

  return (
    <div className="chat-panel" id="chat-panel">
      {/* W-55: Chat Messages Container */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-message assistant">
            <div className="avatar claude-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L14.5 9H22L16 14L18.5 21L12 16.5L5.5 21L8 14L2 9H9.5L12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="chat-message-content">
              <p>Hello! I'm Claude, your AI coding assistant. Ask me to build, modify, or explain anything about your project.</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          msg.role === 'assistant' ? (
            // W-56: Assistant Message
            <div key={i} className="chat-message assistant">
              {/* W-57: Claude Avatar */}
              <div className="avatar claude-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L14.5 9H22L16 14L18.5 21L12 16.5L5.5 21L8 14L2 9H9.5L12 2Z" fill="currentColor"/>
                </svg>
              </div>
              {/* W-58: Message Content */}
              <div className="chat-message-content">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p>{children}</p>,
                    code: ({ node, inline, className, children, ...props }) => {
                      const language = getLanguage(className)
                      const codeString = String(children).replace(/\n$/, '')

                      if (inline) {
                        return (
                          <code style={{
                            background: 'var(--bg-tertiary)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '13px'
                          }} {...props}>
                            {children}
                          </code>
                        )
                      }

                      // W-58: Code block with header
                      return (
                        <div className="chat-code-block">
                          <div className="chat-code-header">
                            <span>{language.toUpperCase()}</span>
                            <button onClick={() => copyToClipboard(codeString)} title="Copy code">
                              <Copy size={14} />
                            </button>
                          </div>
                          <div className="chat-code-content">
                            <SyntaxHighlighter
                              style={oneDark}
                              language={language}
                              PreTag="div"
                              customStyle={{
                                margin: 0,
                                padding: 0,
                                background: 'transparent',
                                fontSize: '13px'
                              }}
                            >
                              {codeString}
                            </SyntaxHighlighter>
                          </div>
                        </div>
                      )
                    }
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            // W-59: User Message
            <div key={i} className="chat-message user">
              <div className="bubble">{msg.content}</div>
            </div>
          )
        ))}

        {/* W-60: Loading state with spinner */}
        {isLoading && (
          <div className="chat-message assistant">
            <div className="avatar claude-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L14.5 9H22L16 14L18.5 21L12 16.5L5.5 21L8 14L2 9H9.5L12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="chat-message-content">
              <div className="chat-status">
                <div className="spinner"></div>
                {loadingStatus}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* W-61: Chat Input Area */}
      <div className="chat-input-area">
        {/* W-62: Chat Input Wrapper */}
        <div className="chat-input-wrapper">
          {/* W-63: Plus Button */}
          <button className="plus-btn" title="Add attachment">
            <Plus size={18} />
          </button>

          {/* W-64: Chat Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Claude to build something..."
          />

          {/* W-65: Mic Button */}
          <button
            className={`mic-btn ${isRecording ? 'recording' : ''}`}
            onClick={toggleMic}
            title="Voice input (Whisper)"
          >
            <Mic size={18} />
          </button>

          {/* W-66: Send Button */}
          <button
            className="send-btn"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            <Send size={18} />
          </button>
        </div>

        {/* W-67: Input Hint */}
        <div className="chat-input-hint">
          Cmd+Enter to send • Click mic for voice input
        </div>
      </div>
    </div>
  )
}
