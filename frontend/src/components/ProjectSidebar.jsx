import { useState } from 'react'
import { Plus, Folder, FolderOpen } from 'lucide-react'

export default function ProjectSidebar({
  projects,
  activeProject,
  onSelectProject,
  onCreateProject
}) {
  const [newProjectName, setNewProjectName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim())
      setNewProjectName('')
      setIsCreating(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCreate()
    if (e.key === 'Escape') {
      setIsCreating(false)
      setNewProjectName('')
    }
  }

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-gray-700 flex items-center px-4">
        <h1 className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          HubLLM
        </h1>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex items-center justify-between px-2 py-2 text-sm text-gray-400">
          <span>Projects</span>
          <button
            onClick={() => setIsCreating(true)}
            className="p-1 hover:bg-gray-700 rounded transition"
            title="New project"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* New project input */}
        {isCreating && (
          <div className="px-2 mb-2">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newProjectName.trim()) setIsCreating(false)
              }}
              placeholder="Project name..."
              autoFocus
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Project list */}
        {projects.length === 0 && !isCreating && (
          <p className="text-sm text-gray-500 px-2 py-4 text-center">
            No projects yet. Create one to get started.
          </p>
        )}

        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onSelectProject(project)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition ${
              activeProject?.id === project.id
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            {activeProject?.id === project.id ? (
              <FolderOpen size={16} />
            ) : (
              <Folder size={16} />
            )}
            <span className="truncate text-sm" title={project.name}>{project.name}</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          hubllm.dev v0.1.0
        </p>
      </div>
    </aside>
  )
}
