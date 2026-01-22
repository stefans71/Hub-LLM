import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import VoiceInput from './VoiceInput'
import { Send, Loader2 } from 'lucide-react'

export default function Chat({ project, model, apiKeys }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      // Determine provider based on available keys
      const provider = apiKeys.claude ? 'claude_direct' : 'openrouter'
      const apiKey = provider === 'claude_direct' ? apiKeys.claude : apiKeys.openrouter

      const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-OpenRouter-Key': apiKeys.openrouter || '',
          'X-Claude-Key': apiKeys.claude || ''
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
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleVoiceResult = (text) => {
    setInput(prev => prev + (prev ? ' ' : '') + text)
    textareaRef.current?.focus()
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-lg">Start a conversation</p>
            <p className="text-sm mt-2">Type a message or use voice input</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              {msg.role === 'assistant' ? (
                <ReactMarkdown
                  className="prose prose-invert max-w-none"
                  components={{
                    code: ({ node, inline, className, children, ...props }) => {
                      if (inline) {
                        return (
                          <code className="bg-gray-700 px-1 rounded" {...props}>
                            {children}
                          </code>
                        )
                      }
                      return (
                        <pre className="bg-gray-900 p-3 rounded-lg overflow-x-auto">
                          <code {...props}>{children}</code>
                        </pre>
                      )
                    }
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-3">
              <Loader2 className="animate-spin" size={20} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <VoiceInput onResult={handleVoiceResult} />
          
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message or use voice..."
              rows={1}
              className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:border-blue-500 max-h-40"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          Model: {model}
        </p>
      </div>
    </div>
  )
}
