import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * WorkspaceFileExplorer Component (W-38)
 *
 * Collapsible workspaces panel showing project tree:
 * - W-39: File Explorer Header
 * - W-40: Explorer Title
 * - W-41: Explorer Actions
 * - W-42: Create Project Button
 * - W-43: Collapse Panel Button
 * - W-44: File Tree
 * - W-45-W-51: Folder items and project items
 */
export default function WorkspaceFileExplorer({
  isOpen = true,
  onToggle,
  currentProject,
  onSelectProject
}) {
  const navigate = useNavigate()

  // Tree state for folder expansion
  const [expandedFolders, setExpandedFolders] = useState({
    customers: true,
    personal: false,
    archives: false
  })

  // Sample workspaces data (would come from API in real implementation)
  const workspaces = {
    customers: {
      name: 'Customers',
      icon: 'folder',
      projects: [
        { id: 'api-backend', name: 'API Backend Optimization' },
        { id: 'acme-corp', name: 'Acme Corp Website' },
        { id: 'beta-inc', name: 'Beta Inc Dashboard' }
      ]
    },
    personal: {
      name: 'Personal',
      icon: 'folder',
      projects: [
        { id: 'side-project', name: 'Side Project' },
        { id: 'learning', name: 'Learning Notes' }
      ]
    },
    archives: {
      name: 'Archives',
      icon: 'archive',
      projects: [
        { id: 'old-client', name: 'Old Client Project' }
      ]
    }
  }

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
        {Object.entries(workspaces).map(([folderId, folder]) => (
          <div key={folderId}>
            {/* Folder item (W-45, W-50, W-51) */}
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
            </div>

            {/* Children container (W-46) */}
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
        ))}
      </div>
    </div>
  )
}
