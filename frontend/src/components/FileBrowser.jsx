import { useState, useEffect } from 'react'
import { 
  Folder, 
  File, 
  ChevronRight, 
  ChevronDown,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Home,
  ArrowUp
} from 'lucide-react'

/**
 * FileBrowser Component
 * 
 * SFTP file browser with tree view and file editing.
 */
export default function FileBrowser({ serverId, serverName }) {
  const [currentPath, setCurrentPath] = useState('~')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load files when path changes
  useEffect(() => {
    loadFiles()
  }, [serverId, currentPath])

  const loadFiles = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch(
        `/api/ssh/servers/${serverId}/files?path=${encodeURIComponent(currentPath)}`
      )
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to load files')
      }
      
      const data = await res.json()
      setFiles(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openFile = async (file) => {
    if (file.is_dir) {
      setCurrentPath(file.path)
      setSelectedFile(null)
      setFileContent('')
      setIsEditing(false)
    } else {
      // Load file content
      setLoading(true)
      try {
        const res = await fetch(
          `/api/ssh/servers/${serverId}/files/read?path=${encodeURIComponent(file.path)}`
        )
        
        if (!res.ok) {
          throw new Error('Failed to read file')
        }
        
        const data = await res.json()
        setSelectedFile(file)
        setFileContent(data.content)
        setIsEditing(false)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const saveFile = async () => {
    if (!selectedFile) return
    
    setIsSaving(true)
    try {
      const res = await fetch(`/api/ssh/servers/${serverId}/files/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: selectedFile.path,
          content: fileContent
        })
      })
      
      if (!res.ok) {
        throw new Error('Failed to save file')
      }
      
      setIsEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteFile = async (file) => {
    if (!confirm(`Delete ${file.name}?`)) return
    
    try {
      const res = await fetch(
        `/api/ssh/servers/${serverId}/files?path=${encodeURIComponent(file.path)}`,
        { method: 'DELETE' }
      )
      
      if (!res.ok) {
        throw new Error('Failed to delete')
      }
      
      loadFiles()
      if (selectedFile?.path === file.path) {
        setSelectedFile(null)
        setFileContent('')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const goUp = () => {
    const parts = currentPath.split('/')
    parts.pop()
    setCurrentPath(parts.length > 0 ? parts.join('/') || '/' : '~')
  }

  const goHome = () => {
    setCurrentPath('~')
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="flex h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
      {/* File List */}
      <div className="w-72 flex flex-col border-r border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
          <span className="text-sm font-medium truncate">{serverName}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={goHome}
              className="p-1 hover:bg-gray-700 rounded transition"
              title="Home"
            >
              <Home size={14} />
            </button>
            <button
              onClick={goUp}
              className="p-1 hover:bg-gray-700 rounded transition"
              title="Go up"
            >
              <ArrowUp size={14} />
            </button>
            <button
              onClick={loadFiles}
              className="p-1 hover:bg-gray-700 rounded transition"
              title="Refresh"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Path breadcrumb */}
        <div className="px-2 py-1 text-xs text-gray-400 bg-gray-800/50 truncate">
          {currentPath}
        </div>

        {/* File list */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="p-2 text-sm text-red-400 bg-red-900/20">
              {error}
            </div>
          )}
          
          {files.map((file) => (
            <div
              key={file.path}
              className={`flex items-center gap-2 px-2 py-1.5 hover:bg-gray-800 cursor-pointer group ${
                selectedFile?.path === file.path ? 'bg-gray-800' : ''
              }`}
              onClick={() => openFile(file)}
            >
              {file.is_dir ? (
                <Folder size={16} className="text-blue-400 flex-shrink-0" />
              ) : (
                <File size={16} className="text-gray-400 flex-shrink-0" />
              )}
              <span className="flex-1 text-sm truncate">{file.name}</span>
              {!file.is_dir && (
                <span className="text-xs text-gray-500">{formatSize(file.size)}</span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteFile(file)
                }}
                className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 size={12} className="text-red-400" />
              </button>
            </div>
          ))}
          
          {files.length === 0 && !loading && !error && (
            <div className="p-4 text-sm text-gray-500 text-center">
              Empty directory
            </div>
          )}
        </div>
      </div>

      {/* File Content */}
      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <>
            {/* File header */}
            <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
              <span className="text-sm font-medium truncate">{selectedFile.name}</span>
              <div className="flex items-center gap-1">
                {isEditing ? (
                  <>
                    <button
                      onClick={saveFile}
                      disabled={isSaving}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 rounded transition"
                    >
                      <Save size={12} />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-1 hover:bg-gray-700 rounded transition"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition"
                  >
                    <Edit2 size={12} />
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* File content */}
            {isEditing ? (
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="flex-1 p-3 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
                spellCheck={false}
              />
            ) : (
              <pre className="flex-1 p-3 overflow-auto text-sm font-mono text-gray-300 whitespace-pre-wrap">
                {fileContent}
              </pre>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a file to view</p>
          </div>
        )}
      </div>
    </div>
  )
}
