import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * WorkspaceFileExplorer Component (W-38)
 *
 * Collapsible workspaces panel showing project tree from database.
 * Projects expand to show VPS file tree from /root/llm-hub-projects/{slug}/
 */

// VPS project folder base path
const VPS_PROJECT_BASE = '/root/llm-hub-projects'

export default function WorkspaceFileExplorer({
  isOpen = true,
  onToggle,
  currentProject,
  onSelectProject,
  onFileSelect  // New: callback when a file is clicked
}) {
  const navigate = useNavigate()
  const { getAuthHeader } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  // Tree state for workspace folder expansion
  const [expandedFolders, setExpandedFolders] = useState({})

  // Project expansion state (shows VPS file tree)
  const [expandedProjects, setExpandedProjects] = useState({})

  // VPS file trees per project
  const [projectFileTrees, setProjectFileTrees] = useState({})

  // Loading state per project
  const [projectLoading, setProjectLoading] = useState({})

  // Expanded subdirectories within project file trees
  const [expandedDirs, setExpandedDirs] = useState({})

  // UI-03: VPS connection status per server
  const [serverStatuses, setServerStatuses] = useState({})

  // UI-05: Project menu state
  const [openMenuProjectId, setOpenMenuProjectId] = useState(null)

  // UI-06: Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    project: null,
    mode: 'archive', // 'archive' or 'permanent'
    deleteVpsFolder: false,
    isDeleting: false
  })

  // Fetch projects from API
  useEffect(() => {
    loadProjects()
    loadServerStatuses()
    // Poll server statuses every 10 seconds
    const interval = setInterval(loadServerStatuses, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadProjects = async () => {
    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    try {
      const res = await fetch('/api/projects/', {
        headers: { ...getAuthHeader() },
        signal: controller.signal
      })
      clearTimeout(timeout)

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
      clearTimeout(timeout)
      if (err.name !== 'AbortError') {
        console.error('Failed to load projects:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  // UI-03: Load VPS server connection statuses
  const loadServerStatuses = async () => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    try {
      const res = await fetch('/api/ssh/servers', {
        signal: controller.signal
      })
      clearTimeout(timeout)

      if (res.ok) {
        const servers = await res.json()
        const statuses = {}
        servers.forEach(server => {
          statuses[server.id] = {
            connected: server.connected || false,
            error: server.error || null
          }
        })
        setServerStatuses(statuses)
      }
    } catch (err) {
      clearTimeout(timeout)
      if (err.name !== 'AbortError') {
        console.error('Failed to load server statuses:', err)
      }
    }
  }

  // UI-03: Get status dot for a project based on VPS connection
  const getStatusDot = (project) => {
    if (!project.vps_server_id) {
      // No VPS assigned - gray dot
      return { color: '#6b7280', title: 'No VPS connected' }
    }

    const status = serverStatuses[project.vps_server_id]
    if (!status) {
      // Server not found in backend - gray dot
      return { color: '#6b7280', title: 'VPS not found' }
    }

    if (status.error) {
      // Error state - red dot
      return { color: '#ef4444', title: `VPS Error: ${status.error}` }
    }

    if (status.connected) {
      // Connected - green dot
      return { color: '#22c55e', title: 'VPS connected' }
    }

    // Not connected - gray dot
    return { color: '#6b7280', title: 'VPS not connected' }
  }

  // Fetch VPS files for a project
  const fetchProjectFiles = async (project, subPath = '') => {
    if (!project.vps_server_id) return

    const projectKey = project.id
    const basePath = `${VPS_PROJECT_BASE}/${project.slug}`
    const fullPath = subPath ? `${basePath}/${subPath}` : basePath

    setProjectLoading(prev => ({ ...prev, [projectKey]: true }))

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      const res = await fetch(
        `/api/files?serverId=${encodeURIComponent(project.vps_server_id)}&path=${encodeURIComponent(fullPath)}`,
        { signal: controller.signal }
      )
      clearTimeout(timeout)

      if (res.ok) {
        const data = await res.json()
        // Filter out . and .. directory entries
        const tree = data.files
          .filter(f => f.name !== '.' && f.name !== '..')
          .map(f => ({
            name: f.name,
            path: f.path,
            relativePath: f.path.replace(basePath + '/', ''),
            type: f.is_dir ? 'folder' : 'file',
            children: f.is_dir ? null : undefined  // null = not loaded yet
          }))

        if (subPath) {
          // Update subtree within existing tree
          setProjectFileTrees(prev => ({
            ...prev,
            [projectKey]: updateTreeAtPath(prev[projectKey] || [], subPath, tree)
          }))
        } else {
          // Set root tree
          setProjectFileTrees(prev => ({ ...prev, [projectKey]: tree }))
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to fetch project files:', err)
      }
    } finally {
      setProjectLoading(prev => ({ ...prev, [projectKey]: false }))
    }
  }

  // Helper to update a subtree at a specific path
  const updateTreeAtPath = (tree, targetPath, newChildren) => {
    return tree.map(item => {
      if (item.relativePath === targetPath && item.type === 'folder') {
        return { ...item, children: newChildren }
      }
      if (item.children && Array.isArray(item.children)) {
        return { ...item, children: updateTreeAtPath(item.children, targetPath, newChildren) }
      }
      return item
    })
  }

  // Toggle project expansion (show/hide file tree)
  const toggleProjectExpansion = (project) => {
    const projectKey = project.id
    const isExpanding = !expandedProjects[projectKey]

    setExpandedProjects(prev => ({ ...prev, [projectKey]: isExpanding }))

    // Fetch files if expanding and not already loaded
    if (isExpanding && !projectFileTrees[projectKey] && project.vps_server_id) {
      fetchProjectFiles(project)
    }
  }

  // Toggle directory expansion within a project's file tree
  const toggleDirExpansion = (project, item) => {
    const dirKey = `${project.id}:${item.relativePath}`
    const isExpanding = !expandedDirs[dirKey]

    setExpandedDirs(prev => ({ ...prev, [dirKey]: isExpanding }))

    // Fetch children if expanding and not already loaded
    if (isExpanding && item.children === null) {
      fetchProjectFiles(project, item.relativePath)
    }
  }

  // Handle file click
  const handleFileClick = (project, file) => {
    if (onFileSelect) {
      onFileSelect(project, file)
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

  // UI-05: Project menu handlers
  const handleMenuToggle = (e, projectId) => {
    e.stopPropagation()
    setOpenMenuProjectId(openMenuProjectId === projectId ? null : projectId)
  }

  const handleMenuClose = () => {
    setOpenMenuProjectId(null)
  }

  const handleRename = (project) => {
    handleMenuClose()
    // TODO: Implement rename modal
    console.log('Rename project:', project.name)
  }

  const handleProjectSettings = (project) => {
    handleMenuClose()
    // Navigate to project settings
    navigate(`/settings?project=${project.id}`)
  }

  const handleDisconnectVps = async (project) => {
    handleMenuClose()
    if (!project.vps_server_id) return

    // Update project to remove VPS link
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ vps_server_id: null })
      })
      if (res.ok) {
        // Refresh projects list
        loadProjects()
      }
    } catch (err) {
      console.error('Failed to disconnect VPS:', err)
    }
  }

  const handleDelete = (project) => {
    handleMenuClose()
    // UI-06: Open delete confirmation modal
    setDeleteModal({
      open: true,
      project,
      mode: 'archive',
      deleteVpsFolder: false,
      isDeleting: false
    })
  }

  // UI-06: Close delete modal
  const handleDeleteModalClose = () => {
    setDeleteModal(prev => ({ ...prev, open: false, project: null }))
  }

  // UI-06: Confirm delete/archive
  const handleDeleteConfirm = async () => {
    const { project, mode, deleteVpsFolder } = deleteModal
    if (!project) return

    setDeleteModal(prev => ({ ...prev, isDeleting: true }))

    try {
      if (mode === 'archive') {
        // Archive: Update project workspace to 'archives'
        const res = await fetch(`/api/projects/${project.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify({ workspace: 'archives' })
        })
        if (!res.ok) throw new Error('Failed to archive project')
      } else {
        // Permanent delete
        const res = await fetch(`/api/projects/${project.id}`, {
          method: 'DELETE',
          headers: { ...getAuthHeader() }
        })
        if (!res.ok) throw new Error('Failed to delete project')
      }

      // Delete VPS folder if checked and project has VPS
      if (deleteVpsFolder && project.vps_server_id && project.slug) {
        try {
          const folderPath = `${VPS_PROJECT_BASE}/${project.slug}`
          await fetch(`/api/files/delete?serverId=${encodeURIComponent(project.vps_server_id)}&path=${encodeURIComponent(folderPath)}`, {
            method: 'DELETE'
          })
        } catch (err) {
          console.error('Failed to delete VPS folder:', err)
          // Don't fail the whole operation if VPS folder delete fails
        }
      }

      // Refresh projects list
      loadProjects()
      handleDeleteModalClose()
    } catch (err) {
      console.error('Delete failed:', err)
      alert(err.message || 'Failed to delete project')
      setDeleteModal(prev => ({ ...prev, isDeleting: false }))
    }
  }

  // Get file icon based on extension
  const getFileIcon = (filename, isFolder = false) => {
    if (isFolder) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#e8a838', flexShrink: 0 }}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    }

    const ext = filename.split('.').pop()?.toLowerCase()
    let color = '#9ca3af'
    if (['js', 'jsx', 'mjs'].includes(ext)) color = '#f7df1e'
    if (['ts', 'tsx'].includes(ext)) color = '#3178c6'
    if (['json'].includes(ext)) color = '#cb3837'
    if (['md', 'mdx'].includes(ext)) color = '#519aba'
    if (['py'].includes(ext)) color = '#3572A5'
    if (['html', 'htm'].includes(ext)) color = '#e34c26'
    if (['css', 'scss', 'sass'].includes(ext)) color = '#563d7c'

    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color, flexShrink: 0 }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
    )
  }

  // Recursive file tree renderer
  const renderFileTree = (project, items, depth = 0) => {
    if (!items || items.length === 0) return null

    // Sort: folders first, then files, alphabetically
    const sorted = [...items].sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1
      if (a.type !== 'folder' && b.type === 'folder') return 1
      return a.name.localeCompare(b.name)
    })

    return sorted.map((item, index) => {
      const dirKey = `${project.id}:${item.relativePath}`
      const isExpanded = expandedDirs[dirKey]

      return (
        <div key={`${item.path}-${index}`}>
          <div
            className={`file-tree-item ${item.type === 'folder' ? 'folder' : 'file'}`}
            onClick={(e) => {
              e.stopPropagation()
              if (item.type === 'folder') {
                toggleDirExpansion(project, item)
              } else {
                handleFileClick(project, item)
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              paddingLeft: `${12 + depth * 12}px`,
              fontSize: '12px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              borderRadius: '3px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {item.type === 'folder' && (
              <span style={{ fontSize: '8px', opacity: 0.6, width: '8px' }}>
                {isExpanded ? '▼' : '▶'}
              </span>
            )}
            {item.type !== 'folder' && <span style={{ width: '8px' }}></span>}
            {getFileIcon(item.name, item.type === 'folder')}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.name}
            </span>
          </div>
          {item.type === 'folder' && isExpanded && (
            <div className="file-tree-children">
              {item.children === null ? (
                <div style={{ paddingLeft: `${24 + depth * 12}px`, fontSize: '11px', color: 'var(--text-muted)', padding: '4px 0' }}>
                  Loading...
                </div>
              ) : (
                renderFileTree(project, item.children, depth + 1)
              )}
            </div>
          )}
        </div>
      )
    })
  }

  const handleCreateProject = () => {
    navigate('/create-project')
  }

  if (!isOpen) return null

  return (
    <div id="file-explorer-panel" className="file-explorer">
      {/* UI-05: CSS for showing menu button on hover */}
      <style>{`
        .project-item:hover .project-menu-btn {
          opacity: 1 !important;
        }
      `}</style>
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
                  {folder.projects.map(project => {
                    const isProjectExpanded = expandedProjects[project.id]
                    const hasVps = !!project.vps_server_id
                    const fileTree = projectFileTrees[project.id]
                    const isLoadingFiles = projectLoading[project.id]

                    return (
                      <div key={project.id}>
                        {/* Project row */}
                        <div
                          className={`file-tree-item project-item ${currentProject?.id === project.id ? 'active' : ''}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            ...(currentProject?.id === project.id ? {
                              background: 'rgba(59, 130, 246, 0.2)',
                              color: 'var(--primary)'
                            } : {})
                          }}
                        >
                          {/* Expand arrow (only if VPS connected) */}
                          {hasVps ? (
                            <span
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleProjectExpansion(project)
                              }}
                              style={{
                                fontSize: '8px',
                                opacity: 0.6,
                                cursor: 'pointer',
                                padding: '2px',
                                width: '12px',
                                textAlign: 'center'
                              }}
                            >
                              {isProjectExpanded ? '▼' : '▶'}
                            </span>
                          ) : (
                            <span style={{ width: '12px' }}></span>
                          )}

                          {/* UI-03: Status dot - before folder icon */}
                          {(() => {
                            const statusDot = getStatusDot(project)
                            return (
                              <span
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: statusDot.color,
                                  flexShrink: 0,
                                  boxShadow: statusDot.color === '#22c55e' ? '0 0 4px rgba(34, 197, 94, 0.5)' : 'none'
                                }}
                                title={statusDot.title}
                              />
                            )
                          })()}

                          {/* Project icon and name */}
                          <div
                            onClick={() => handleProjectClick(project)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              flex: 1,
                              cursor: 'pointer',
                              overflow: 'hidden'
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.7 }}>
                              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span
                              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              title={project.name}
                            >
                              {project.name}
                            </span>
                          </div>

                          {/* UI-05: 3-dot menu */}
                          <div style={{ position: 'relative' }}>
                            <button
                              onClick={(e) => handleMenuToggle(e, project.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '2px 4px',
                                borderRadius: '4px',
                                color: 'var(--text-secondary)',
                                opacity: openMenuProjectId === project.id ? 1 : 0,
                                transition: 'opacity 0.15s'
                              }}
                              className="project-menu-btn"
                              title="Project options"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="5" r="2" />
                                <circle cx="12" cy="12" r="2" />
                                <circle cx="12" cy="19" r="2" />
                              </svg>
                            </button>

                            {/* Dropdown menu */}
                            {openMenuProjectId === project.id && (
                              <>
                                {/* Backdrop to close menu */}
                                <div
                                  style={{
                                    position: 'fixed',
                                    inset: 0,
                                    zIndex: 40
                                  }}
                                  onClick={handleMenuClose}
                                />
                                <div
                                  style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '100%',
                                    marginTop: '4px',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '6px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                    minWidth: '140px',
                                    zIndex: 50,
                                    overflow: 'hidden'
                                  }}
                                >
                                  <button
                                    onClick={() => handleRename(project)}
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      background: 'transparent',
                                      border: 'none',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      color: 'var(--text-primary)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Rename
                                  </button>
                                  <button
                                    onClick={() => handleProjectSettings(project)}
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      background: 'transparent',
                                      border: 'none',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      color: 'var(--text-primary)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="12" r="3" />
                                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                    </svg>
                                    Settings
                                  </button>
                                  {hasVps && (
                                    <button
                                      onClick={() => handleDisconnectVps(project)}
                                      style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        background: 'transparent',
                                        border: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        color: 'var(--text-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                                        <line x1="12" y1="2" x2="12" y2="12" />
                                      </svg>
                                      Disconnect VPS
                                    </button>
                                  )}
                                  <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                                  <button
                                    onClick={() => handleDelete(project)}
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      background: 'transparent',
                                      border: 'none',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      color: '#ef4444',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Project file tree (when expanded) */}
                        {isProjectExpanded && hasVps && (
                          <div className="project-file-tree" style={{ marginLeft: '4px' }}>
                            {isLoadingFiles && !fileTree && (
                              <div style={{ paddingLeft: '24px', fontSize: '11px', color: 'var(--text-muted)', padding: '4px 0' }}>
                                Loading files...
                              </div>
                            )}
                            {fileTree && fileTree.length === 0 && (
                              <div style={{ paddingLeft: '24px', fontSize: '11px', color: 'var(--text-muted)', padding: '4px 0' }}>
                                Empty project folder
                              </div>
                            )}
                            {fileTree && renderFileTree(project, fileTree, 1)}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* UI-06: Delete Confirmation Modal */}
      {deleteModal.open && deleteModal.project && (
        <>
          {/* Modal backdrop */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={handleDeleteModalClose}
          >
            {/* Modal content */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                padding: '24px',
                width: '400px',
                maxWidth: '90vw',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text-primary)' }}>
                Delete Project
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                What would you like to do with "{deleteModal.project.name}"?
              </p>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {/* Archive option */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `2px solid ${deleteModal.mode === 'archive' ? 'var(--primary)' : 'var(--border)'}`,
                    cursor: 'pointer',
                    background: deleteModal.mode === 'archive' ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="deleteMode"
                    checked={deleteModal.mode === 'archive'}
                    onChange={() => setDeleteModal(prev => ({ ...prev, mode: 'archive' }))}
                    style={{ marginTop: '2px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Archive
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Move to Archives folder. You can restore it later.
                    </div>
                  </div>
                </label>

                {/* Delete permanently option */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `2px solid ${deleteModal.mode === 'permanent' ? '#ef4444' : 'var(--border)'}`,
                    cursor: 'pointer',
                    background: deleteModal.mode === 'permanent' ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="deleteMode"
                    checked={deleteModal.mode === 'permanent'}
                    onChange={() => setDeleteModal(prev => ({ ...prev, mode: 'permanent' }))}
                    style={{ marginTop: '2px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 500, color: '#ef4444', marginBottom: '4px' }}>
                      Delete permanently
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      This cannot be undone. Project data will be lost.
                    </div>
                  </div>
                </label>
              </div>

              {/* VPS folder checkbox (only show if project has VPS) */}
              {deleteModal.project.vps_server_id && (
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '20px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={deleteModal.deleteVpsFolder}
                    onChange={(e) => setDeleteModal(prev => ({ ...prev, deleteVpsFolder: e.target.checked }))}
                  />
                  Also delete VPS folder <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>/root/llm-hub-projects/{deleteModal.project.slug}/</code>
                </label>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={handleDeleteModalClose}
                  disabled={deleteModal.isDeleting}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteModal.isDeleting}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: deleteModal.mode === 'permanent' ? '#ef4444' : 'var(--primary)',
                    color: 'white',
                    cursor: deleteModal.isDeleting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    opacity: deleteModal.isDeleting ? 0.7 : 1
                  }}
                >
                  {deleteModal.isDeleting ? 'Processing...' : (deleteModal.mode === 'archive' ? 'Archive' : 'Delete')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
