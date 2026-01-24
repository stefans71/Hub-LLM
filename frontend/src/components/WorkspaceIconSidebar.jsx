import { FolderOpen, Search, GitBranch, Plus, Settings } from 'lucide-react'

/**
 * WorkspaceIconSidebar Component (W-31)
 *
 * Vertical icon navigation bar for workspace:
 * - W-32: Workspaces Icon (toggle file explorer)
 * - W-33: Search Icon
 * - W-34: Source Control Icon
 * - W-35: Create Project Icon
 * - W-36: Spacer
 * - W-37: Settings Icon
 */
export default function WorkspaceIconSidebar({
  activePanel = 'workspaces',
  onPanelChange,
  onNavigate
}) {
  const handleIconClick = (panel) => {
    if (onPanelChange) {
      onPanelChange(panel)
    }
  }

  const handleNavigate = (view) => {
    if (onNavigate) {
      onNavigate(view)
    }
  }

  return (
    <div className="workspace-icon-bar">
      {/* W-32: Workspaces Icon */}
      <button
        id="workspaces-icon-btn"
        className={`workspace-icon-btn ${activePanel === 'workspaces' ? 'active' : ''}`}
        onClick={() => handleIconClick('workspaces')}
        title="Workspaces"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      {/* W-33: Search Icon */}
      <button
        className={`workspace-icon-btn ${activePanel === 'search' ? 'active' : ''}`}
        onClick={() => handleIconClick('search')}
        title="Search"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>

      {/* W-34: Source Control Icon */}
      <button
        className={`workspace-icon-btn ${activePanel === 'source-control' ? 'active' : ''}`}
        onClick={() => handleIconClick('source-control')}
        title="Source Control"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="18" r="3"></circle>
          <circle cx="6" cy="6" r="3"></circle>
          <path d="M6 21V9a9 9 0 0 0 9 9"></path>
        </svg>
      </button>

      {/* W-35: Create Project Icon */}
      <button
        className="workspace-icon-btn"
        onClick={() => handleNavigate('create-project')}
        title="Create Project"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      {/* W-36: Spacer */}
      <div style={{ flex: 1 }}></div>

      {/* W-37: Settings Icon */}
      <button
        className="workspace-icon-btn"
        onClick={() => handleNavigate('settings')}
        title="Settings"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
    </div>
  )
}
