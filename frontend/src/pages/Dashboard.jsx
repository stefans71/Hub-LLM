import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  Zap,
  Users,
  Monitor,
  FolderOpen,
  Grid,
  List,
  Plus,
  RefreshCw,
  Server,
  GitBranch,
  MoreVertical
} from 'lucide-react'

// Stat Card Component
function StatCard({ icon: Icon, iconColor, badge, badgeType, label, value, description }) {
  const iconBgColors = {
    blue: 'bg-blue-500/20 text-blue-500',
    green: 'bg-green-500/20 text-green-500',
    purple: 'bg-purple-500/20 text-purple-500'
  }

  const badgeColors = {
    positive: 'bg-green-500/20 text-green-500',
    neutral: 'bg-gray-700 text-gray-400'
  }

  return (
    <div className="bg-[#1a2028] border border-[#2d3748] rounded-xl p-6 hover:border-[#3b82f6] transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgColors[iconColor]}`}>
          <Icon size={20} />
        </div>
        {badge && (
          <span className={`text-xs font-medium px-2 py-1 rounded ${badgeColors[badgeType]}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="text-4xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-400">{description}</div>
    </div>
  )
}

// Project Card Component
function ProjectCard({ project, onClick }) {
  const getSourceTag = () => {
    if (project.github_repo) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-md text-xs">
          <GitBranch size={12} />
          GitHub
        </span>
      )
    }
    if (project.vps_host) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 text-purple-400 rounded-md text-xs">
          <Server size={12} />
          VPS: {project.vps_host}
        </span>
      )
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 text-green-400 rounded-md text-xs">
        <Monitor size={12} />
        Local
      </span>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div
      className="bg-[#1a2028] border border-[#2d3748] rounded-xl p-5 cursor-pointer transition-all hover:border-[#3b82f6] hover:-translate-y-0.5"
      onClick={onClick}
    >
      {project.workspace && (
        <div className="text-xs text-gray-500 mb-1">{project.workspace}</div>
      )}
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-base font-semibold">{project.name}</h3>
        <button
          className="p-1 hover:bg-gray-700 rounded transition"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical size={16} className="text-gray-400" />
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
        {project.description || 'No description'}
      </p>
      <div className="flex gap-2 flex-wrap mb-4">
        {getSourceTag()}
        {project.tech_stack && (
          <span className="px-2.5 py-1 bg-[#242b35] text-gray-400 rounded-md text-xs">
            {project.tech_stack}
          </span>
        )}
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-[#2d3748]">
        <div className="flex">
          {project.agents?.slice(0, 3).map((agent, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full border-2 border-[#1a2028] flex items-center justify-center text-xs font-medium -ml-2 first:ml-0"
              style={{ background: ['#22c55e', '#3b82f6', '#8b5cf6'][i % 3] }}
              title={agent}
            >
              {agent.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Updated {formatDate(project.updated_at)}
        </div>
      </div>
    </div>
  )
}

// Main Dashboard Component
export default function Dashboard({ onNavigate, onCreateProject }) {
  const { getAuthHeader } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [stats, setStats] = useState({
    activeSessions: 0,
    totalProjects: 0,
    connectedLLMs: 5
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/projects/', {
        headers: { ...getAuthHeader() }
      })
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
        setStats(prev => ({
          ...prev,
          totalProjects: data.length,
          activeSessions: data.filter(p => p.status === 'active').length || Math.min(data.length, 3)
        }))
      }
    } catch (err) {
      console.error('Failed to load projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectClick = (project) => {
    onNavigate?.('workspace', project)
  }

  return (
    <div className="flex-1 overflow-auto bg-[#0f1419]">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-[#0f1419] border-b border-[#2d3748] px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <span className="text-gray-500">🔍</span>
            <input
              type="text"
              placeholder="Search projects, repos, or LLM outputs..."
              className="flex-1 bg-transparent text-sm text-gray-300 placeholder-gray-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hover:text-white cursor-pointer">Docs</span>
            <span className="text-sm text-gray-400 hover:text-white cursor-pointer">Community</span>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition">🔔</button>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition">💬</button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <a href="#" className="hover:text-white">Home</a>
          <span>›</span>
          <span className="text-white">Projects</span>
        </div>

        {/* Page Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Project Dashboard</h1>
            <p className="text-gray-400">Manage your LLM-connected workspaces and projects with ease.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadProjects}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a2028] border border-[#2d3748] rounded-lg hover:border-gray-600 transition text-sm"
            >
              <RefreshCw size={14} />
              Refresh All
            </button>
            <button
              onClick={onCreateProject}
              className="flex items-center gap-2 px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] rounded-lg transition text-sm font-medium"
            >
              <Plus size={14} />
              Create Project
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            icon={Zap}
            iconColor="blue"
            badge={stats.activeSessions > 0 ? '+20%' : null}
            badgeType="positive"
            label="Active Sessions"
            value={stats.activeSessions}
            description={`Across ${Math.min(stats.connectedLLMs, 4)} LLM providers`}
          />
          <StatCard
            icon={Users}
            iconColor="green"
            badge={stats.totalProjects > 0 ? '+5%' : null}
            badgeType="positive"
            label="Total Projects"
            value={stats.totalProjects}
            description={`${projects.filter(p => p.github_repo).length} GitHub, ${projects.filter(p => !p.github_repo).length} Local`}
          />
          <StatCard
            icon={Monitor}
            iconColor="purple"
            badge="Stable"
            badgeType="neutral"
            label="Connected LLMs"
            value={stats.connectedLLMs}
            description="OpenRouter + Anthropic"
          />
        </div>

        {/* Recent Projects Section */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FolderOpen size={18} />
            Recent Projects
          </h2>
          <div className="flex gap-1 bg-[#242b35] p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-[#1a2028] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-[#1a2028] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-[#1a2028] border border-[#2d3748] rounded-xl">
            <FolderOpen size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">Create your first project to get started</p>
            <button
              onClick={onCreateProject}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] rounded-lg transition text-sm font-medium"
            >
              <Plus size={14} />
              Create Project
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
            : 'flex flex-col gap-3'
          }>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
