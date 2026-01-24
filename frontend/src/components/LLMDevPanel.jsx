import { useState } from 'react'

/**
 * LLM-Dev Bottom Panel (W-88 to W-124)
 *
 * A collapsible development panel that includes:
 * - W-88: Header with toggle, tabs, and status
 * - W-89-90: Panel toggle with arrow
 * - W-91-95: Tab buttons (Terminal, Docker, Logs, Project Context)
 * - W-96: Status bar (server, tokens, encoding)
 * - W-97: Content area (hidden when collapsed)
 * - W-98-100: File explorer with tree and open editors
 * - W-101-104: Editor area with tabs and code content
 * - W-105-108: Terminal area with tabs and output
 * - W-109: Docker tab content
 * - W-110: Logs tab content
 * - W-111: Project Context tab content
 */
export default function LLMDevPanel({ project }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('terminal')
  const [activeFile, setActiveFile] = useState('server.js')
  const [activeTerminalTab, setActiveTerminalTab] = useState('terminal')

  // Mock file tree data
  const fileTree = [
    {
      name: 'src',
      type: 'folder',
      expanded: true,
      children: [
        { name: 'index.js', type: 'file' },
        { name: 'server.js', type: 'file', active: true },
        { name: 'routes.js', type: 'file' }
      ]
    },
    { name: 'package.json', type: 'file' },
    { name: 'README.md', type: 'file' }
  ]

  // Mock open editors
  const openEditors = [
    { name: 'server.js', active: true },
    { name: 'routes.js', active: false }
  ]

  // Mock code content
  const codeContent = `const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000);`

  // Mock terminal output
  const terminalOutput = [
    { type: 'prompt', text: 'user@prod-01:~$ npm run dev' },
    { type: 'output', text: '> api-backend@1.0.0 dev' },
    { type: 'output', text: '> node server.js' },
    { type: 'success', text: '✓ Server running on port 3000' },
    { type: 'output', text: 'Watching for file changes...' },
    { type: 'prompt', text: 'user@prod-01:~$ ', cursor: true }
  ]

  // Mock docker containers
  const containers = [
    { name: 'api-backend-db-1', image: 'postgres:15', status: 'Running' },
    { name: 'api-backend-redis-1', image: 'redis:7', status: 'Running' }
  ]

  // Mock logs
  const logs = [
    { time: '2025-01-22 10:23:45', level: 'INFO', text: 'Server started' },
    { time: '2025-01-22 10:23:46', level: 'INFO', text: 'Database connected' },
    { time: '2025-01-22 10:23:47', level: 'INFO', text: 'Ready to accept connections', success: true },
    { time: '2025-01-22 10:24:12', level: 'INFO', text: 'GET / - 200 - 12ms' },
    { time: '2025-01-22 10:24:15', level: 'INFO', text: 'GET /api/users - 200 - 45ms' },
    { time: '2025-01-22 10:24:20', level: 'WARN', text: 'Slow query detected (>100ms)', warning: true }
  ]

  const togglePanel = () => {
    setIsExpanded(!isExpanded)
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
  }

  const getFileIcon = (filename, isFolder = false) => {
    if (isFolder) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#e8a838' }}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    }

    const ext = filename.split('.').pop()
    let color = '#9ca3af'
    if (['js', 'jsx'].includes(ext)) color = '#f7df1e'
    if (['ts', 'tsx'].includes(ext)) color = '#3178c6'
    if (['json'].includes(ext)) color = '#cb3837'
    if (['md'].includes(ext)) color = '#519aba'

    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
    )
  }

  // Terminal Tab Icon
  const TerminalIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
  )

  // Docker Tab Icon
  const DockerIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '4px', color: '#2496ed' }}>
      <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.186m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.185.185v1.888c0 .102.084.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288z"/>
    </svg>
  )

  // Logs Tab Icon
  const LogsIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  )

  // Project Context Tab Icon
  const ContextIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  )

  return (
    <div
      className="llm-dev-panel"
      style={{
        height: isExpanded ? '350px' : '40px',
        borderTop: '3px solid var(--accent)',
        background: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '40px',
        transition: 'height 0.2s ease'
      }}
    >
      {/* W-88: LLM-Dev Header */}
      <div
        className="llm-dev-header"
        onClick={togglePanel}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          height: '36px',
          cursor: 'ns-resize',
          userSelect: 'none',
          flexShrink: 0
        }}
      >
        {/* W-89-90: Dev Panel Toggle */}
        <div
          className="llm-dev-toggle"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--accent)',
            cursor: 'pointer'
          }}
        >
          <span id="dev-panel-arrow" style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▲
          </span>
          LLM-Dev
        </div>

        {/* W-91: Dev Tabs */}
        <div
          className="llm-dev-tabs"
          style={{
            display: 'flex',
            gap: '4px',
            marginLeft: '24px'
          }}
        >
          {/* W-92: Terminal Tab */}
          <button
            className={activeTab === 'terminal' ? 'active' : ''}
            onClick={(e) => { e.stopPropagation(); handleTabClick('terminal'); }}
            style={{
              padding: '8px 16px',
              background: activeTab === 'terminal' ? 'var(--bg-primary)' : 'transparent',
              border: 'none',
              color: activeTab === 'terminal' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '13px',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <TerminalIcon />
            Terminal
          </button>

          {/* W-93: Docker Tab */}
          <button
            className={activeTab === 'docker' ? 'active' : ''}
            onClick={(e) => { e.stopPropagation(); handleTabClick('docker'); }}
            style={{
              padding: '8px 16px',
              background: activeTab === 'docker' ? 'var(--bg-primary)' : 'transparent',
              border: 'none',
              color: activeTab === 'docker' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '13px',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <DockerIcon />
            Docker
          </button>

          {/* W-94: Logs Tab */}
          <button
            className={activeTab === 'logs' ? 'active' : ''}
            onClick={(e) => { e.stopPropagation(); handleTabClick('logs'); }}
            style={{
              padding: '8px 16px',
              background: activeTab === 'logs' ? 'var(--bg-primary)' : 'transparent',
              border: 'none',
              color: activeTab === 'logs' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '13px',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogsIcon />
            Logs
          </button>

          {/* W-95: Project Context Tab */}
          <button
            className={activeTab === 'prompt' ? 'active' : ''}
            onClick={(e) => { e.stopPropagation(); handleTabClick('prompt'); }}
            style={{
              padding: '8px 16px',
              background: activeTab === 'prompt' ? 'var(--bg-primary)' : 'transparent',
              border: 'none',
              color: activeTab === 'prompt' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '13px',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ContextIcon />
            Project Context
          </button>
        </div>

        {/* W-96: Dev Status Bar */}
        <div
          className="llm-dev-status"
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}
        >
          <span className="server" style={{ color: 'var(--success)' }}>● prod-01 (192.168.1.104)</span>
          <span>Tokens: 14.2k</span>
          <span>UTF-8</span>
        </div>
      </div>

      {/* W-97: Dev Panel Content */}
      {isExpanded && (
        <div
          className="llm-dev-content"
          style={{
            flex: 1,
            display: 'flex',
            background: 'var(--bg-primary)',
            overflow: 'hidden',
            minHeight: 0
          }}
        >
          {/* Terminal Tab Content */}
          {activeTab === 'terminal' && (
            <>
              {/* W-98: Dev File Explorer */}
              <div
                className="dev-file-explorer"
                style={{
                  width: '220px',
                  minWidth: '150px',
                  maxWidth: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--bg-secondary)',
                  overflowY: 'auto',
                  flexShrink: 0
                }}
              >
                {/* Explorer Header */}
                <div
                  className="dev-file-explorer-header"
                  style={{
                    padding: '8px 12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border)'
                  }}
                >
                  <span>Explorer</span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '11px', padding: '2px 4px', borderRadius: '3px' }} title="Go to Home Directory">🏠</button>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '11px', padding: '2px 4px', borderRadius: '3px' }} title="Go Up One Level">⬆️</button>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', borderRadius: '3px' }} title="Go Back">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', borderRadius: '3px' }} title="Go Forward">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', borderRadius: '3px' }} title="Refresh">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '4px', padding: '4px 8px', borderBottom: '1px solid var(--border)' }}>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', borderRadius: '3px' }} title="New File">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="12" y1="18" x2="12" y2="12"></line>
                      <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                  </button>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', borderRadius: '3px' }} title="New Folder">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                      <line x1="12" y1="11" x2="12" y2="17"></line>
                      <line x1="9" y1="14" x2="15" y2="14"></line>
                    </svg>
                  </button>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', borderRadius: '3px' }} title="Collapse All">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="4 14 10 14 10 20"></polyline>
                      <polyline points="20 10 14 10 14 4"></polyline>
                      <line x1="14" y1="10" x2="21" y2="3"></line>
                      <line x1="3" y1="21" x2="10" y2="14"></line>
                    </svg>
                  </button>
                </div>

                {/* Path bar */}
                <div style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)' }}>
                  ~/projects/api-backend
                </div>

                {/* W-99: Dev File Tree */}
                <div className="dev-file-tree" style={{ flex: 1, overflowY: 'auto', padding: '8px', borderBottom: '1px solid var(--border)' }}>
                  {fileTree.map((item, index) => (
                    <div key={index}>
                      <div
                        className={`dev-file-item ${item.type === 'folder' ? 'folder' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: item.type === 'folder' ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontFamily: "'Monaco', 'Consolas', monospace",
                          fontWeight: item.type === 'folder' ? 500 : 400
                        }}
                      >
                        {getFileIcon(item.name, item.type === 'folder')}
                        {item.name}
                      </div>
                      {item.children && (
                        <div className="dev-file-children" style={{ marginLeft: '12px' }}>
                          {item.children.map((child, childIndex) => (
                            <div
                              key={childIndex}
                              className={`dev-file-item ${activeFile === child.name ? 'active' : ''}`}
                              onClick={() => setActiveFile(child.name)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: activeFile === child.name ? 'var(--primary)' : 'var(--text-secondary)',
                                fontFamily: "'Monaco', 'Consolas', monospace",
                                background: activeFile === child.name ? 'rgba(59, 130, 246, 0.2)' : 'transparent'
                              }}
                            >
                              {getFileIcon(child.name)}
                              {child.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* W-100: Open Editors Section */}
                <div>
                  <div
                    className="dev-file-explorer-header"
                    style={{
                      padding: '8px 12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>Open Editors</span>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <div className="dev-file-tree" style={{ padding: '8px' }}>
                    {openEditors.map((editor, index) => (
                      <div
                        key={index}
                        className={`dev-file-item ${editor.active ? 'active' : ''}`}
                        onClick={() => setActiveFile(editor.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: editor.active ? 'var(--primary)' : 'var(--text-secondary)',
                          fontFamily: "'Monaco', 'Consolas', monospace",
                          background: editor.active ? 'rgba(59, 130, 246, 0.2)' : 'transparent'
                        }}
                      >
                        {getFileIcon(editor.name)}
                        {editor.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* W-101: Dev Editor Resizer */}
              <div className="resizer-vertical" style={{ width: '4px', background: 'var(--border)', cursor: 'col-resize' }}></div>

              {/* W-102: Dev Editor Area */}
              <div
                className="dev-editor-area"
                style={{
                  flex: 1,
                  minWidth: '200px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* W-103: Editor Tabs */}
                <div
                  className="dev-editor-tabs"
                  style={{
                    display: 'flex',
                    background: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border)'
                  }}
                >
                  {openEditors.map((editor, index) => (
                    <div
                      key={index}
                      className={`dev-editor-tab ${editor.active ? 'active' : ''}`}
                      onClick={() => setActiveFile(editor.name)}
                      style={{
                        padding: '8px 16px',
                        fontSize: '12px',
                        color: editor.active ? 'var(--text-primary)' : 'var(--text-secondary)',
                        background: editor.active ? 'var(--bg-primary)' : 'transparent',
                        border: 'none',
                        borderRight: '1px solid var(--border)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>{editor.name}</span>
                      <span className="close" style={{ opacity: 0.5, fontSize: '10px' }}>✕</span>
                    </div>
                  ))}
                </div>

                {/* W-104: Editor Content */}
                <div
                  className="dev-editor-content"
                  style={{
                    flex: 1,
                    padding: '16px',
                    fontFamily: "'Monaco', 'Consolas', monospace",
                    fontSize: '13px',
                    overflow: 'auto',
                    lineHeight: 1.5
                  }}
                >
                  {codeContent.split('\n').map((line, index) => (
                    <div key={index}>
                      <span className="line-number" style={{ color: 'var(--text-muted)', marginRight: '16px', userSelect: 'none' }}>{index + 1}</span>
                      <span dangerouslySetInnerHTML={{
                        __html: line
                          .replace(/(const|require|get|send|listen)/g, '<span style="color: #c678dd;">$1</span>')
                          .replace(/('.*?')/g, '<span style="color: #98c379;">$1</span>')
                          .replace(/(\d+)/g, '<span style="color: #d19a66;">$1</span>')
                      }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* W-105: Terminal Resizer */}
              <div className="resizer-vertical" style={{ width: '4px', background: 'var(--border)', cursor: 'col-resize' }}></div>

              {/* W-106: Dev Terminal Area */}
              <div
                className="dev-terminal-area"
                style={{
                  width: '35%',
                  minWidth: '200px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* W-107: Terminal Tabs */}
                <div
                  className="dev-terminal-tabs"
                  style={{
                    display: 'flex',
                    background: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border)',
                    padding: '0 8px'
                  }}
                >
                  <div
                    className={`dev-terminal-tab ${activeTerminalTab === 'terminal' ? 'active' : ''}`}
                    onClick={() => setActiveTerminalTab('terminal')}
                    style={{
                      padding: '8px 12px',
                      fontSize: '12px',
                      color: activeTerminalTab === 'terminal' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeTerminalTab === 'terminal' ? '2px solid var(--primary)' : '2px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
                      <polyline points="4 17 10 11 4 5"></polyline>
                      <line x1="12" y1="19" x2="20" y2="19"></line>
                    </svg>
                    Terminal
                  </div>
                  <div
                    className={`dev-terminal-tab ${activeTerminalTab === 'output' ? 'active' : ''}`}
                    onClick={() => setActiveTerminalTab('output')}
                    style={{
                      padding: '8px 12px',
                      fontSize: '12px',
                      color: activeTerminalTab === 'output' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeTerminalTab === 'output' ? '2px solid var(--primary)' : '2px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    Output
                  </div>
                  <div
                    className={`dev-terminal-tab ${activeTerminalTab === 'problems' ? 'active' : ''}`}
                    onClick={() => setActiveTerminalTab('problems')}
                    style={{
                      padding: '8px 12px',
                      fontSize: '12px',
                      color: activeTerminalTab === 'problems' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeTerminalTab === 'problems' ? '2px solid var(--primary)' : '2px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '4px', color: '#f97316' }}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Problems
                  </div>
                  <button style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>

                {/* W-108: Terminal Content */}
                <div
                  className="dev-terminal-content"
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontFamily: "'Monaco', 'Consolas', monospace",
                    fontSize: '12px',
                    overflowY: 'auto'
                  }}
                >
                  {terminalOutput.map((line, index) => (
                    <div key={index} className="terminal-line" style={{ marginBottom: '2px' }}>
                      {line.type === 'prompt' && (
                        <>
                          <span className="prompt" style={{ color: 'var(--success)' }}>{line.text.split('$')[0]}$</span>
                          <span className="command" style={{ color: 'var(--text-primary)' }}> {line.text.split('$')[1]}</span>
                          {line.cursor && <span style={{ animation: 'blink 1s infinite' }}>▋</span>}
                        </>
                      )}
                      {line.type === 'output' && (
                        <span className="output" style={{ color: 'var(--text-secondary)' }}>{line.text}</span>
                      )}
                      {line.type === 'success' && (
                        <span className="success" style={{ color: 'var(--success)' }}>{line.text}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* W-109: Docker Tab Content */}
          {activeTab === 'docker' && (
            <div style={{ padding: '16px', width: '100%' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <button className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }}>🔄 Refresh</button>
                <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '12px', background: 'var(--primary)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>▶️ Start All</button>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '8px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                  <span>CONTAINER</span>
                  <span>IMAGE</span>
                  <span>STATUS</span>
                  <span>ACTIONS</span>
                </div>
                {containers.map((container, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr',
                      padding: '12px 16px',
                      fontSize: '13px',
                      alignItems: 'center',
                      borderTop: index > 0 ? '1px solid var(--border)' : 'none'
                    }}
                  >
                    <span>{container.name}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{container.image}</span>
                    <span style={{ color: 'var(--success)' }}>● {container.status}</span>
                    <span><button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>⏹️</button></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* W-110: Logs Tab Content */}
          {activeTab === 'logs' && (
            <div style={{ padding: '16px', width: '100%', fontFamily: "'Monaco', 'Consolas', monospace", fontSize: '12px', overflowY: 'auto' }}>
              {logs.map((log, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: '4px',
                    color: log.success ? 'var(--success)' : log.warning ? 'var(--warning)' : 'var(--text-muted)'
                  }}
                >
                  [{log.time}] {log.level}: {log.text}
                </div>
              ))}
            </div>
          )}

          {/* W-111: Project Context Tab Content */}
          {activeTab === 'prompt' && (
            <div style={{ padding: '16px', width: '100%', overflowY: 'auto', maxHeight: 'calc(100% - 40px)' }}>
              {/* Current Model & Auto-generated Files */}
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Current Model:</span>
                    <span style={{ fontWeight: 500 }}>Claude Opus 4.5</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', background: 'rgba(34, 197, 94, 0.2)', color: 'var(--success)', padding: '2px 8px', borderRadius: '4px' }}>CLAUDE.md ✓</span>
                    <span style={{ fontSize: '11px', background: 'rgba(34, 197, 94, 0.2)', color: 'var(--success)', padding: '2px 8px', borderRadius: '4px' }}>.claude/agents/ ✓</span>
                  </div>
                </div>
              </div>

              {/* Project Description */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Project Context</span>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', cursor: 'pointer' }}>Edit</button>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', fontFamily: "'Monaco', 'Consolas', monospace", fontSize: '12px', color: 'var(--text-primary)', maxHeight: '120px', overflowY: 'auto' }}>
                  <div style={{ color: 'var(--text-muted)' }}># API Backend Optimization</div>
                  <div style={{ marginTop: '8px' }}><span style={{ color: 'var(--accent)' }}>Tech:</span> Node.js, Express, PostgreSQL, Redis</div>
                  <div style={{ marginTop: '4px' }}><span style={{ color: 'var(--accent)' }}>Standards:</span> TypeScript strict, async/await, JSDoc</div>
                  <div style={{ marginTop: '8px', color: 'var(--text-muted)' }}>## Commands</div>
                  <div>npm run dev → Start dev server</div>
                  <div>npm test → Run tests</div>
                  <div>npm run lint → ESLint check</div>
                </div>
              </div>

              {/* Project Agents */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Agents</span>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', cursor: 'pointer' }}>+ Add</button>
                </div>

                {/* Project-specific agents */}
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>PROJECT-SPECIFIC</div>
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: '6px', padding: '8px 10px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🔧</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>api-designer</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Designs REST API endpoints</div>
                  </div>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '10px' }}>Edit</button>
                </div>

                {/* Global agents */}
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '12px', marginBottom: '4px' }}>GLOBAL (INHERITED)</div>
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: '6px', padding: '8px 10px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7 }}>
                  <span>📝</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>doc-generator</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Generates documentation</div>
                  </div>
                </div>
              </div>

              {/* MCP Servers */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>MCP Servers</span>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', cursor: 'pointer' }}>+ Add</button>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: '6px', padding: '8px 10px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--success)' }}>●</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>PostgreSQL</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Connected to production DB</div>
                  </div>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '10px' }}>Edit</button>
                </div>
              </div>

              {/* Regenerate Button */}
              <button
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                🔄 Regenerate CLAUDE.md
              </button>
            </div>
          )}
        </div>
      )}

      {/* Keyframe animation for cursor blink */}
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
