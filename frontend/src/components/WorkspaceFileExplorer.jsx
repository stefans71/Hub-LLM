import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * WorkspaceFileExplorer Component (W-38)
 *
 * Collapsible workspaces panel showing project tree from database
 */
export default function WorkspaceFileExplorer({
  isOpen = true,
  onToggle,
  currentProject,
  onSelectProject
}) {
  const navigate = useNavigate()
  const { getAuthHeader } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  // Tree state for folder expansion
  const [expandedFolders, setExpandedFolders] = useState({})

  // Fetch projects from API
  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects/', {
        headers: { ...getAuthHeader() }
      })
      if (res.ok) {
        const data = await res.json()
        setProjects(data)

        // Auto-expand first workspace
        if (data.length > 0) {
          const firstWorkspace = data[0].workspace || 'Default'
          setExpandedFolders({ [firstWorkspace]: true })
        }
      }
    } catch (err) {
      console.error('Failed to load projects:', err)
    } finally {
      setLoading(false)
    }
  }

  // Group projects by workspace
  const workspaces = projects.reduce((acc, project) => {
    const workspace = project.workspace || 'Default'
    if (!acc[workspace]) {
      acc[workspace] = {
        name: workspace.charAt(0).toUpperCase() + workspace.slice(1),
        icon: workspace === 'archives' ? 'archive' : 'folder',
        projects: []
      }
    }
    acc[workspace].projects.push(project)
    return acc
  }, {})

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }))
  }

  const handleProjectClick = (project) => {
    if (onSelectProject) {
      onSelectProject(project)
    }
  }

  const handleCreateProject = () => {
    navigate('/create-project')
  }

  if (!isOpen) return null

  return (
    <div id="file-explorer-panel" className="file-explorer">
      {/* W-39: File Explorer Header */}
      <div className="file-explorer-header">
        {/* W-40: Explorer Title */}
        <span className="file-explorer-title">Workspaces</span>

        {/* W-41: Explorer Actions */}
        <div className="file-explorer-actions">
          {/* W-42: Create Project Button */}
          <button
            title="Create Project"
            onClick={handleCreateProject}
            style={{
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '4px',
              fontSize: '10px',
              padding: '4px'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>

          {/* W-43: Collapse Panel Button */}
          <button
            title="Collapse Panel"
            onClick={onToggle}
          >
            ◀
          </button>
        </div>
      </div>

      {/* W-44: File Tree */}
      <div className="file-tree">
        {loading ? (
          <div className="file-tree-item" style={{ opacity: 0.6 }}>
            Loading...
          </div>
        ) : Object.keys(workspaces).length === 0 ? (
          <div className="file-tree-item" style={{ opacity: 0.6 }}>
            No projects yet
          </div>
        ) : (
          Object.entries(workspaces).map(([folderId, folder]) => (
            <div key={folderId}>
              {/* Folder item */}
              <div
                className="file-tree-item folder"
                onClick={() => toggleFolder(folderId)}
              >
                <span>{expandedFolders[folderId] ? '▼' : '▶'}</span>
                {folder.icon === 'archive' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6 }}>
                    <polyline points="21 8 21 21 3 21 3 8"></polyline>
                    <rect x="1" y="3" width="22" height="5"></rect>
                    <line x1="10" y1="12" x2="14" y2="12"></line>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                )}
                <span>{folder.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.5 }}>
                  {folder.projects.length}
                </span>
              </div>

              {/* Children container */}
              {expandedFolders[folderId] && (
                <div className="file-tree-children">
                  {folder.projects.map(project => (
                    <div
                      key={project.id}
                      className={`file-tree-item ${currentProject?.id === project.id ? 'active' : ''}`}
                      onClick={() => handleProjectClick(project)}
                      style={currentProject?.id === project.id ? {
                        background: 'rgba(59, 130, 246, 0.2)',
                        color: 'var(--primary)'
                      } : {}}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.7 }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      <span>{project.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
