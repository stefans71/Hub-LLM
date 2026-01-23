import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthPage from './components/AuthPage'
import AuthCallback from './components/AuthCallback'
import Workspace from './components/Workspace'
import ProjectSidebar from './components/ProjectSidebar'
import DashboardSidebar from './components/DashboardSidebar'
import ModelSelector from './components/ModelSelector'
import SettingsModal from './components/SettingsModal'
import CreateProject from './pages/CreateProject'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import { Settings as SettingsIcon, LogOut, User, Loader2, Plus } from 'lucide-react'

// Main App content (requires auth)
function AppContent() {
  const { user, logout, isAuthenticated, loading, getAuthHeader } = useAuth()
  const [projects, setProjects] = useState([])
  const [activeProject, setActiveProject] = useState(null)
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-sonnet-4')
  const [showSettings, setShowSettings] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard' | 'workspace' | 'create-project' | 'settings'
  const [apiKeys, setApiKeys] = useState({
    openrouter: localStorage.getItem('openrouter_key') || '',
    claude: localStorage.getItem('claude_key') || '',
    github: localStorage.getItem('github_token') || ''
  })

  // Load projects on mount (with auth)
  useEffect(() => {
    if (isAuthenticated) {
      loadProjects()
    }
  }, [isAuthenticated])

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects/', {
        headers: {
          ...getAuthHeader()
        }
      })
      const data = await res.json()
      setProjects(data)
      if (data.length > 0 && !activeProject) {
        setActiveProject(data[0])
      }
    } catch (err) {
      console.error('Failed to load projects:', err)
    }
  }

  const createProject = async (name) => {
    try {
      const res = await fetch('/api/projects/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ name })
      })
      const newProject = await res.json()
      setProjects([...projects, newProject])
      setActiveProject(newProject)
    } catch (err) {
      console.error('Failed to create project:', err)
    }
  }

  const handleProjectCreated = (project) => {
    setProjects([...projects, project])
    setActiveProject(project)
    setCurrentView('workspace')
  }

  const handleLogout = async () => {
    await logout()
    setProjects([])
    setActiveProject(null)
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  const saveApiKeys = (keys) => {
    setApiKeys(keys)
    localStorage.setItem('openrouter_key', keys.openrouter || '')
    localStorage.setItem('claude_key', keys.claude || '')
    localStorage.setItem('github_token', keys.github || '')
  }

  const hasApiKey = apiKeys.openrouter || apiKeys.claude

  // Render Settings page full-screen with its own layout
  if (currentView === 'settings') {
    return (
      <div className="h-screen bg-gray-900 text-white">
        <Settings onBack={() => setCurrentView('dashboard')} />
      </div>
    )
  }

  // Dashboard view with sidebar
  if (currentView === 'dashboard') {
    return (
      <div className="h-screen flex bg-[#0f1419] text-white">
        {/* Dashboard Sidebar */}
        <DashboardSidebar
          projects={projects}
          activeProject={activeProject}
          onSelectProject={setActiveProject}
          onNavigate={(view, project) => {
            if (project) setActiveProject(project)
            setCurrentView(view)
          }}
          onCreateProject={() => setCurrentView('create-project')}
          currentView={currentView}
        />

        {/* Main Content */}
        <Dashboard
          onNavigate={(view, project) => {
            if (project) setActiveProject(project)
            setCurrentView(view)
          }}
          onCreateProject={() => setCurrentView('create-project')}
        />

        {/* Settings Modal */}
        {showSettings && (
          <SettingsModal
            apiKeys={apiKeys}
            onSave={saveApiKeys}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-900 text-white">
      {/* Sidebar */}
      <ProjectSidebar
        projects={projects}
        activeProject={activeProject}
        onSelectProject={setActiveProject}
        onCreateProject={createProject}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-gray-700 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold">
              {currentView === 'create-project' ? 'Create Project' :
               (activeProject?.name || 'HubLLM')}
            </h1>
            {currentView === 'workspace' && (
              <ModelSelector
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            {currentView !== 'create-project' && (
              <button
                onClick={() => setCurrentView('create-project')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-sm font-medium"
              >
                <Plus size={16} />
                Create Project
              </button>
            )}
            {currentView === 'workspace' && (
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded-lg transition text-sm"
              >
                Dashboard
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('settings')}
              className="p-2 hover:bg-gray-700 rounded-lg transition"
              title="Settings"
            >
              <SettingsIcon size={20} />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-lg transition"
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name || user.email}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <User size={20} />
                )}
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-20">
                    <div className="p-3 border-b border-gray-700">
                      <p className="font-medium text-white truncate">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-400 hover:bg-gray-700 rounded-md transition"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        {currentView === 'create-project' ? (
          <CreateProject
            onCancel={() => setCurrentView('dashboard')}
            onCreateProject={handleProjectCreated}
          />
        ) : !hasApiKey ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md p-8">
              <h2 className="text-xl font-semibold mb-4">Welcome to HubLLM</h2>
              <p className="text-gray-400 mb-6">
                Add your API key to get started. You can use OpenRouter for access
                to multiple models, or your direct Claude API key.
              </p>
              <button
                onClick={() => setCurrentView('settings')}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition"
              >
                Add API Key
              </button>
            </div>
          </div>
        ) : (
          <Workspace
            project={activeProject}
            model={selectedModel}
            apiKeys={apiKeys}
          />
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          apiKeys={apiKeys}
          onSave={saveApiKeys}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

// Router component to handle auth callback
function AppRouter() {
  const { isAuthenticated, loading } = useAuth()
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  // Listen for path changes
  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Check for OAuth callback
  const isAuthCallback = currentPath === '/auth/callback' ||
    window.location.search.includes('access_token')

  if (isAuthCallback) {
    return (
      <AuthCallback
        onComplete={() => {
          window.history.replaceState({}, '', '/')
          setCurrentPath('/')
        }}
      />
    )
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage />
  }

  // Show main app
  return <AppContent />
}

// Main App with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App
