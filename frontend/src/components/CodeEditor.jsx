import { useEffect, useRef, useState } from 'react'
import { Save, X, Loader2, Eye, Code } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

/**
 * CodeEditor Component
 *
 * Monaco-based code editor with syntax highlighting.
 * Loaded dynamically to reduce bundle size.
 * FEAT-52: Markdown preview toggle for .md files.
 */
export default function CodeEditor({
  path,
  content,
  onSave,
  onClose,
  readOnly = false
}) {
  const containerRef = useRef(null)
  const editorRef = useRef(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [monacoLoaded, setMonacoLoaded] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Determine language from file extension
  const getLanguage = (filepath) => {
    const ext = filepath.split('.').pop()?.toLowerCase()
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'rb': 'ruby',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'xml': 'xml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
      'zsh': 'shell',
      'dockerfile': 'dockerfile',
      'toml': 'toml',
      'ini': 'ini',
      'env': 'plaintext',
      'txt': 'plaintext'
    }
    return languageMap[ext] || 'plaintext'
  }

  const isMarkdown = getLanguage(path) === 'markdown'

  useEffect(() => {
    // Dynamically load Monaco
    const loadMonaco = async () => {
      // Load Monaco from CDN
      if (!window.monaco) {
        await new Promise((resolve) => {
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js'
          script.onload = resolve
          document.head.appendChild(script)
        })

        await new Promise((resolve) => {
          window.require.config({
            paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }
          })
          window.require(['vs/editor/editor.main'], () => {
            resolve()
          })
        })
      }

      setMonacoLoaded(true)
    }

    loadMonaco()
  }, [])

  useEffect(() => {
    if (!monacoLoaded || !containerRef.current) return

    // Create editor
    const editor = window.monaco.editor.create(containerRef.current, {
      value: content,
      language: getLanguage(path),
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      readOnly: readOnly,
      tabSize: 2,
      insertSpaces: true,
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true }
    })

    editorRef.current = editor

    // Track changes
    editor.onDidChangeModelContent(() => {
      setHasChanges(true)
    })

    // Keyboard shortcut for save
    editor.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KeyS, () => {
      handleSave()
    })

    // FEAT-52: Ctrl+Shift+V toggles markdown preview
    editor.addCommand(
      window.monaco.KeyMod.CtrlCmd | window.monaco.KeyMod.Shift | window.monaco.KeyCode.KeyV,
      () => { if (getLanguage(path) === 'markdown') setShowPreview(prev => !prev) }
    )

    return () => {
      editor.dispose()
    }
  }, [monacoLoaded, path])

  // Update content when it changes externally
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.getValue()) {
      editorRef.current.setValue(content)
      setHasChanges(false)
    }
  }, [content])

  // FEAT-52: Reset preview when switching to non-markdown file
  useEffect(() => {
    if (!isMarkdown) setShowPreview(false)
  }, [path])

  const handleSave = async () => {
    if (!editorRef.current || readOnly) return

    setIsSaving(true)
    try {
      const newContent = editorRef.current.getValue()
      await onSave(path, newContent)
      setHasChanges(false)
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const fileName = path.split('/').pop()

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {fileName}
            {hasChanges && <span className="text-yellow-500 ml-1">●</span>}
          </span>
          <span className="text-xs text-gray-500">{getLanguage(path)}</span>
          {/* FEAT-52: Markdown preview toggle */}
          {isMarkdown && (
            <button
              onClick={() => setShowPreview(prev => !prev)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '2px 8px', fontSize: '11px',
                background: showPreview ? 'var(--primary, #3b82f6)' : 'transparent',
                border: '1px solid var(--border, #374151)',
                borderRadius: '4px', color: 'var(--text-primary, #e5e7eb)',
                cursor: 'pointer'
              }}
              title="Toggle markdown preview (Ctrl+Shift+V)"
            >
              {showPreview ? <><Code size={12} /> Source</> : <><Eye size={12} /> Preview</>}
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!readOnly && (
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition"
            >
              {isSaving ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}
              Save
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-700 rounded transition"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Editor / Preview */}
      {!monacoLoaded ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : showPreview && isMarkdown ? (
        <div style={{
          flex: 1, overflow: 'auto', padding: '24px 32px',
          background: '#1e1e1e', color: '#c0caf5',
          fontSize: '14px', lineHeight: '1.7'
        }}>
          <ReactMarkdown
            components={{
              h1: ({children}) => <h1 style={{fontSize:'28px',fontWeight:700,marginTop:'24px',marginBottom:'12px',borderBottom:'1px solid #333',paddingBottom:'8px'}}>{children}</h1>,
              h2: ({children}) => <h2 style={{fontSize:'22px',fontWeight:600,marginTop:'20px',marginBottom:'8px',borderBottom:'1px solid #333',paddingBottom:'6px'}}>{children}</h2>,
              h3: ({children}) => <h3 style={{fontSize:'18px',fontWeight:600,marginTop:'16px',marginBottom:'6px'}}>{children}</h3>,
              p: ({children}) => <p style={{margin:'8px 0'}}>{children}</p>,
              code: ({inline,children,...props}) => inline
                ? <code style={{background:'#2d2d2d',padding:'2px 6px',borderRadius:'4px',fontSize:'13px'}} {...props}>{children}</code>
                : <pre style={{background:'#0d1117',padding:'16px',borderRadius:'8px',overflow:'auto',fontSize:'13px'}}><code {...props}>{children}</code></pre>,
              ul: ({children}) => <ul style={{paddingLeft:'24px',margin:'8px 0'}}>{children}</ul>,
              ol: ({children}) => <ol style={{paddingLeft:'24px',margin:'8px 0'}}>{children}</ol>,
              li: ({children}) => <li style={{margin:'4px 0'}}>{children}</li>,
              blockquote: ({children}) => <blockquote style={{borderLeft:'3px solid #3b82f6',paddingLeft:'16px',margin:'12px 0',color:'#9ca3af'}}>{children}</blockquote>,
              a: ({href,children}) => <a href={href} target="_blank" rel="noopener noreferrer" style={{color:'#3b82f6',textDecoration:'underline'}}>{children}</a>,
              table: ({children}) => <table style={{borderCollapse:'collapse',width:'100%',margin:'12px 0'}}>{children}</table>,
              th: ({children}) => <th style={{border:'1px solid #333',padding:'8px',textAlign:'left',background:'#2d2d2d'}}>{children}</th>,
              td: ({children}) => <td style={{border:'1px solid #333',padding:'8px'}}>{children}</td>
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      ) : (
        <div ref={containerRef} className="flex-1" style={{ display: showPreview ? 'none' : undefined }} />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-1 text-xs text-gray-500 bg-gray-800 border-t border-gray-700">
        <span>{path}</span>
        <span>{showPreview && isMarkdown ? 'Ctrl+Shift+V for source' : 'Ctrl+S to save'}</span>
      </div>
    </div>
  )
}
