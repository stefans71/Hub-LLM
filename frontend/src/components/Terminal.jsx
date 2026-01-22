import { useEffect, useRef, useState } from 'react'
import { Maximize2, Minimize2, X } from 'lucide-react'

/**
 * Terminal Component
 * 
 * Uses xterm.js for terminal emulation and WebSocket for SSH connection.
 * Loaded dynamically to avoid SSR issues.
 */
export default function Terminal({ serverId, serverName, onClose }) {
  const terminalRef = useRef(null)
  const xtermRef = useRef(null)
  const wsRef = useRef(null)
  const fitAddonRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Dynamically import xterm to avoid SSR issues
    const loadXterm = async () => {
      const { Terminal } = await import('@xterm/xterm')
      const { FitAddon } = await import('@xterm/addon-fit')
      await import('@xterm/xterm/css/xterm.css')

      // Create terminal
      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: {
          background: '#1a1b26',
          foreground: '#c0caf5',
          cursor: '#c0caf5',
          selection: '#33467c',
          black: '#15161e',
          red: '#f7768e',
          green: '#9ece6a',
          yellow: '#e0af68',
          blue: '#7aa2f7',
          magenta: '#bb9af7',
          cyan: '#7dcfff',
          white: '#a9b1d6',
        }
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      
      xtermRef.current = term
      fitAddonRef.current = fitAddon

      // Mount terminal
      if (terminalRef.current) {
        term.open(terminalRef.current)
        fitAddon.fit()
      }

      // Connect WebSocket
      connectWebSocket(term)
    }

    loadXterm()

    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (xtermRef.current) {
        xtermRef.current.dispose()
      }
    }
  }, [serverId])

  // Handle window resize
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

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const connectWebSocket = (term) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/ssh/servers/${serverId}/terminal`
    
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      setError(null)
      term.writeln('\x1b[32mConnected to ' + serverName + '\x1b[0m')
      term.writeln('')
      
      // Send initial resize
      setTimeout(() => {
        if (fitAddonRef.current) {
          fitAddonRef.current.fit()
          ws.send(JSON.stringify({
            type: 'resize',
            cols: term.cols,
            rows: term.rows
          }))
        }
      }, 100)
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.type === 'output') {
        term.write(message.data)
      } else if (message.type === 'error') {
        term.writeln('\x1b[31mError: ' + message.message + '\x1b[0m')
        setError(message.message)
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
      term.writeln('')
      term.writeln('\x1b[33mConnection closed\x1b[0m')
    }

    ws.onerror = (err) => {
      setError('WebSocket error')
      term.writeln('\x1b[31mConnection error\x1b[0m')
    }

    // Handle terminal input
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input', data }))
      }
    })
  }

  const reconnect = () => {
    if (xtermRef.current) {
      xtermRef.current.clear()
      connectWebSocket(xtermRef.current)
    }
  }

  return (
    <div className={`flex flex-col bg-[#1a1b26] rounded-lg overflow-hidden border border-gray-700 ${
      isMaximized ? 'fixed inset-4 z-50' : 'h-80'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-medium">{serverName}</span>
        </div>
        <div className="flex items-center gap-1">
          {!isConnected && (
            <button
              onClick={reconnect}
              className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition"
            >
              Reconnect
            </button>
          )}
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 hover:bg-gray-700 rounded transition"
          >
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Terminal */}
      <div 
        ref={terminalRef} 
        className="flex-1 p-2"
        style={{ minHeight: isMaximized ? 'calc(100% - 40px)' : '240px' }}
      />
    </div>
  )
}
