import { useEffect, useRef, useState } from 'react'
import { Save, X, Loader2 } from 'lucide-react'

/**
 * CodeEditor Component
 * 
 * Monaco-based code editor with syntax highlighting.
 * Loaded dynamically to reduce bundle size.
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

      {/* Editor */}
      {!monacoLoaded ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : (
        <div ref={containerRef} className="flex-1" />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-1 text-xs text-gray-500 bg-gray-800 border-t border-gray-700">
        <span>{path}</span>
        <span>Ctrl+S to save</span>
      </div>
    </div>
  )
}
