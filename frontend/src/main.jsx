import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// BUG-69: StrictMode removed — it double-mounts components (by design) which
// creates duplicate WebSocket/PTY connections in terminal components.
// The app runs `npm run dev` in production (Docker), so StrictMode was active
// on hubllm.dev causing double echo in ClaudeCodeTerminalChat.
// Re-enable when migrating to production builds (INFRA-02).
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />,
)
