import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthPage from './components/AuthPage'
import AuthCallback from './components/AuthCallback'
import Workspace from './components/Workspace'
import DashboardSidebar from './components/DashboardSidebar'
import HeaderNavigation from './components/HeaderNavigation'
import SettingsModal from './components/SettingsModal'
import CreateProject from './pages/CreateProject'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Setup from './pages/Setup'
import LandingPage from './pages/LandingPage'
import { Loader2 } from 'lucide-react'

// Main App content (requires auth)
function AppContent() {
  const { user, logout, isAuthenticated, loading, getAuthHeader } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [projects, setProjects] = useState([])
  const [activeProject, setActiveProject] = useState(null)

  // FEAT-25: Capture enhance param as state (survives URL clearing), one-shot
  const [enhanceMode, setEnhanceMode] = useState(() => searchParams.get('enhance') === 'true')
  useEffect(() => {
    if (searchParams.get('enhance') === 'true') {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('enhance')
      setSearchParams(newParams, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-sonnet-4')
  const [showSettings, setShowSettings] = useState(false)
  const [setupComplete, setSetupComplete] = useState(null) // null = not yet determined
  const [apiKeys, setApiKeys] = useState({
    openrouter: localStorage.getItem('openrouter_key') || '',
    claude: localStorage.getItem('claude_key') || '',
    github: localStorage.getItem('github_token') || ''
  })

  // Check if user has completed setup
  useEffect(() => {
    if (user) {
      setSetupComplete(user.setup_completed === true)
    }
  }, [user])

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
        // BUG-21: Check URL for projectId parameter on page refresh
        const urlProjectId = searchParams.get('projectId')
        if (urlProjectId) {
          const urlProject = data.find(p => String(p.id) === urlProjectId)
          if (urlProject) {
            setActiveProject(urlProject)
            return
          }
        }
        // Fallback to first project
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

  const handleProjectCreated = (project, options = {}) => {
    setProjects([...projects, project])
    setActiveProject(project)
    // BUG-21: Include projectId in URL for page refresh persistence
    const enhanceParam = options.enhance ? '&enhance=true' : ''
    navigate(`/workspace?projectId=${project.id}${enhanceParam}`)
  }

  const handleLogout = async () => {
    await logout()
    setProjects([])
    setActiveProject(null)
    navigate('/dashboard')
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  // Wait until setup status is determined (null = still loading)
  if (setupComplete === null) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  // Redirect to setup if user hasn't completed it (except if already on setup page)
  if (setupComplete === false && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />
  }

  // If on setup page but already completed, redirect to dashboard
  if (setupComplete === true && location.pathname === '/setup') {
    return <Navigate to="/dashboard" replace />
  }

  const saveApiKeys = (keys) => {
    setApiKeys(keys)
    localStorage.setItem('openrouter_key', keys.openrouter || '')
    localStorage.setItem('claude_key', keys.claude || '')
    localStorage.setItem('github_token', keys.github || '')
  }

  const hasApiKey = apiKeys.openrouter || apiKeys.claude

  // Determine current view based on route
  const currentView = location.pathname.replace('/', '') || 'dashboard'

  // Check if we should show the sidebar (Dashboard view only)
  const showDashboardSidebar = location.pathname === '/dashboard' || location.pathname === '/'

  return (
    <div className="h-screen flex flex-col text-white" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header Navigation */}
      <HeaderNavigation onLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Dashboard Sidebar (only on dashboard view) */}
        {showDashboardSidebar && (
          <DashboardSidebar
            projects={projects}
            activeProject={activeProject}
            onSelectProject={(project) => {
              setActiveProject(project)
              // BUG-21: Include projectId in URL for page refresh persistence
              navigate(`/workspace?projectId=${project.id}`)
            }}
            onNavigate={(view, project) => {
              if (project) setActiveProject(project)
              // BUG-21: Include projectId in URL when navigating to workspace
              if (view === 'workspace' && project?.id) {
                navigate(`/workspace?projectId=${project.id}`)
              } else {
                navigate(`/${view}`)
              }
            }}
            onCreateProject={() => navigate('/create-project')}
            currentView={currentView}
            onLogout={handleLogout}
          />
        )}

        {/* Routes */}
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route
              path="/setup"
              element={
                <Setup
                  onComplete={() => {
                    setSetupComplete(true)
                    navigate('/dashboard')
                  }}
                />
              }
            />
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  onNavigate={(view, project) => {
                    if (project) setActiveProject(project)
                    // BUG-21: Include projectId in URL when navigating to workspace
                    if (view === 'workspace' && project?.id) {
                      navigate(`/workspace?projectId=${project.id}`)
                    } else {
                      navigate(`/${view}`)
                    }
                  }}
                  onCreateProject={() => navigate('/create-project')}
                />
              }
            />
            <Route
              path="/workspace"
              element={
                hasApiKey ? (
                  <Workspace
                    project={activeProject}
                    model={selectedModel}
                    apiKeys={apiKeys}
                    enhanceWithAI={enhanceMode}
                    onProjectChange={(project) => {
                      setActiveProject(project)
                      // BUG-25: Update URL when switching projects within workspace
                      navigate(`/workspace?projectId=${project.id}`, { replace: true })
                    }}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-md p-8">
                      <h2 className="text-xl font-semibold mb-4">Welcome to HubLLM</h2>
                      <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                        Add your API key to get started. You can use OpenRouter for access
                        to multiple models, or your direct Claude API key.
                      </p>
                      <button
                        onClick={() => navigate('/settings')}
                        className="px-6 py-2 rounded-lg transition"
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        Add API Key
                      </button>
                    </div>
                  </div>
                )
              }
            />
            <Route
              path="/settings"
              element={
                <Settings
                  onBack={() => navigate('/dashboard')}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="/create-project"
              element={
                <CreateProject
                  onCancel={() => navigate('/dashboard')}
                  onCreateProject={handleProjectCreated}
                />
              }
            />
          </Routes>
        </div>
      </div>

      {/* Settings Modal (legacy, may be deprecated) */}
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
  const location = useLocation()
  const navigate = useNavigate()

  // Check for OAuth callback
  const isAuthCallback = location.pathname === '/auth/callback' ||
    location.search.includes('access_token')

  if (isAuthCallback) {
    return (
      <AuthCallback
        onComplete={() => {
          window.history.replaceState({}, '', '/dashboard')
        }}
      />
    )
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  // Show landing page or auth page if not authenticated
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<LandingPage onSignUp={() => navigate('/auth')} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  // Show main app
  return <AppContent />
}

// Main App with AuthProvider and BrowserRouter
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
