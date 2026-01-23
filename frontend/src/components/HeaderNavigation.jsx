import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, MonitorPlay, Settings, PlusCircle, User, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

/**
 * HeaderNavigation - Main navigation tabs matching mockup design
 * Shows: Dashboard | Workspace | Settings | Create Project
 */
function HeaderNavigation({ onLogout }) {
  const { user } = useAuth()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/workspace', label: 'Workspace', icon: MonitorPlay },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/create-project', label: 'Create Project', icon: PlusCircle },
  ]

  return (
    <header
      className="h-14 border-b flex items-center justify-between px-4 flex-shrink-0"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            H
          </div>
          <span className="font-semibold text-white text-lg">HubLLM.dev</span>
        </div>

        {/* Navigation Tabs */}
        <nav
          className="flex gap-1"
          style={{ marginLeft: '24px' }}
        >
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path ||
              (path === '/dashboard' && location.pathname === '/')

            return (
              <NavLink
                key={path}
                to={path}
                className="nav-tab flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                }}
              >
                <Icon size={16} />
                {label}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2 p-2 rounded-lg transition hover:bg-opacity-10"
          style={{
            backgroundColor: showUserMenu ? 'var(--bg-tertiary)' : 'transparent',
          }}
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name || user.email}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {(user?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
          )}
        </button>

        {showUserMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowUserMenu(false)}
            />
            <div
              className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg z-20"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)'
              }}
            >
              <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <p className="font-medium text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                  {user?.email}
                </p>
              </div>
              <div className="p-1">
                <NavLink
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-md transition"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <User size={16} />
                  <span>Profile & Settings</span>
                </NavLink>
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    onLogout?.()
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-md transition"
                  style={{ color: 'var(--error)' }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CSS for nav-tab hover effects */}
      <style>{`
        .nav-tab:hover {
          background-color: var(--bg-tertiary) !important;
          color: var(--text-primary) !important;
        }
        .nav-tab[style*="background-color: var(--primary)"]:hover {
          background-color: var(--primary) !important;
          color: white !important;
        }
      `}</style>
    </header>
  )
}

export default HeaderNavigation
