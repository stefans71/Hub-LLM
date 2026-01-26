import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Plus, Mic, Send, Copy, X, Image as ImageIcon } from 'lucide-react'

const MAX_IMAGES = 4 // FIFO queue limit to prevent memory bloat

/**
 * Chat Component (W-54)
 *
 * AI chat interface matching mockup specification:
 * - W-54: Chat Panel Container
 * - W-55: Chat Messages Container
 * - W-56-60: Message bubbles (assistant/user)
 * - W-61-67: Chat Input Area with voice input
 * - FEAT-08: File drop and paste support
 * - CLAUDE-02: Routes to Claude Code on VPS when available
 */
export default function Chat({ project, model, apiKeys, serverId, claudeCodeStatus }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState('')
  const [attachedImages, setAttachedImages] = useState([]) // {id, dataUrl, name}
  const [isDragging, setIsDragging] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const chatPanelRef = useRef(null)
  const dragCounterRef = useRef(0) // Track nested drag events

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Convert file to base64 data URL
  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Add images to queue (FIFO - oldest removed when exceeding MAX_IMAGES)
  const addImages = useCallback(async (files) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (imageFiles.length === 0) return

    const newImages = await Promise.all(
      imageFiles.map(async (file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        dataUrl: await fileToDataUrl(file),
        name: file.name
      }))
    )

    setAttachedImages(prev => {
      const combined = [...prev, ...newImages]
      // FIFO: keep only the last MAX_IMAGES
      if (combined.length > MAX_IMAGES) {
        return combined.slice(-MAX_IMAGES)
      }
      return combined
    })
  }, [])

  // Remove specific image
  const removeImage = useCallback((id) => {
    setAttachedImages(prev => prev.filter(img => img.id !== id))
  }, [])

  // Handle file input change (from Plus button)
  const handleFileSelect = (e) => {
    if (e.target.files?.length > 0) {
      addImages(e.target.files)
      e.target.value = '' // Reset so same file can be selected again
    }
  }

  // Handle paste event (Ctrl+V)
  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items
    if (!items) return

    const imageItems = Array.from(items).filter(item => item.type.startsWith('image/'))
    if (imageItems.length === 0) return

    e.preventDefault()
    const files = imageItems.map(item => item.getAsFile()).filter(Boolean)
    addImages(files)
  }, [addImages])

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current = 0
    setIsDragging(false)

    const files = e.dataTransfer?.files
    if (files?.length > 0) {
      addImages(files)
    }
  }, [addImages])

  // Attach paste listener to window
  useEffect(() => {
    const panel = chatPanelRef.current
    if (!panel) return

    panel.addEventListener('paste', handlePaste)
    return () => panel.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  const sendMessage = async () => {
    if ((!input.trim() && attachedImages.length === 0) || isLoading) return

    // Build content - either string or array with text + images
    let content
    const imagesToSend = [...attachedImages]

    if (imagesToSend.length > 0) {
      // Multimodal content format for Claude API
      content = []

      // Add images first
      for (const img of imagesToSend) {
        // Extract base64 data and media type from data URL
        const [header, base64Data] = img.dataUrl.split(',')
        const mediaType = header.match(/data:([^;]+)/)?.[1] || 'image/png'

        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: base64Data
          }
        })
      }

      // Add text if present
      if (input.trim()) {
        content.push({ type: 'text', text: input.trim() })
      }
    } else {
      content = input.trim()
    }

    // For display, store both text and image previews
    const userMessage = {
      role: 'user',
      content: content,
      displayText: input.trim(),
      displayImages: imagesToSend.map(img => img.dataUrl)
    }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setAttachedImages([]) // Clear attached images after sending
    setIsLoading(true)
    setLoadingStatus('Thinking...')

    try {
      // CLAUDE-02: Determine provider based on available resources
      // Priority: Claude Code on VPS > Claude Direct API > OpenRouter
      let provider = 'openrouter'
      let useServerId = null

      // Check if we should route through Claude Code on VPS
      // Conditions: Anthropic model + Claude Code authenticated + VPS connected
      const isAnthropicModel = model?.provider === 'anthropic' ||
        (typeof model === 'string' && model.toLowerCase().includes('claude'))

      if (isAnthropicModel && claudeCodeStatus?.authenticated && serverId) {
        // Route through Claude Code on VPS (uses Pro subscription)
        provider = 'claude_code_ssh'
        useServerId = serverId
      } else if (apiKeys?.claude) {
        // Use direct Anthropic API
        provider = 'claude_direct'
      }
      // Otherwise use openrouter (default)

      const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-OpenRouter-Key': apiKeys?.openrouter || '',
          'X-Claude-Key': apiKeys?.claude || ''
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          model: typeof model === 'object' ? model.id : model,
          provider,
          stream: true,
          project_id: project?.id,
          server_id: useServerId
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
    <div
      className="chat-panel"
      id="chat-panel"
      ref={chatPanelRef}
      tabIndex={0}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drop Zone Overlay */}
      {isDragging && (
        <div className="chat-drop-overlay">
          <div className="chat-drop-content">
            <ImageIcon size={48} />
            <span>Drop images here</span>
            <span className="chat-drop-hint">Max {MAX_IMAGES} images</span>
          </div>
        </div>
      )}

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
              <div className="bubble">
                {/* Show attached images */}
                {msg.displayImages?.length > 0 && (
                  <div className="user-images">
                    {msg.displayImages.map((dataUrl, idx) => (
                      <img key={idx} src={dataUrl} alt={`Attachment ${idx + 1}`} />
                    ))}
                  </div>
                )}
                {/* Show text */}
                {msg.displayText || (typeof msg.content === 'string' ? msg.content : '')}
              </div>
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
        {/* Image Thumbnails (FEAT-08) */}
        {attachedImages.length > 0 && (
          <div className="chat-attached-images">
            {attachedImages.map((img) => (
              <div key={img.id} className="chat-image-thumb">
                <img src={img.dataUrl} alt={img.name} />
                <button
                  className="chat-image-remove"
                  onClick={() => removeImage(img.id)}
                  title="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {attachedImages.length >= MAX_IMAGES && (
              <span className="chat-image-limit">Max {MAX_IMAGES} images</span>
            )}
          </div>
        )}

        {/* W-62: Chat Input Wrapper */}
        <div className="chat-input-wrapper">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />

          {/* W-63: Plus Button */}
          <button
            className="plus-btn"
            title="Add image"
            onClick={() => fileInputRef.current?.click()}
          >
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
            disabled={(!input.trim() && attachedImages.length === 0) || isLoading}
          >
            <Send size={18} />
          </button>
        </div>

        {/* W-67: Input Hint */}
        <div className="chat-input-hint">
          Cmd+Enter to send • Drop or paste images • Click mic for voice input
        </div>
      </div>
    </div>
  )
}
