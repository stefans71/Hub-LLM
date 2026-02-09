import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, User, Github, Loader2, Eye, EyeOff, AlertCircle, Check, X } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || ''

// Password validation rules
const passwordRules = [
  { id: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'number', label: 'One number', test: (pw) => /\d/.test(pw) },
  { id: 'special', label: 'One special character (!@#$%^&*)', test: (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw) }
]

// Validate password against all rules
const validatePassword = (password) => {
  return passwordRules.every(rule => rule.test(password))
}

// Password requirements component with real-time feedback
function PasswordRequirements({ password }) {
  if (!password) return null

  return (
    <div className="mt-2 p-3 bg-gray-700/50 rounded-lg">
      <p className="text-xs text-gray-400 mb-2">Password must contain:</p>
      <ul className="space-y-1">
        {passwordRules.map(rule => {
          const passed = rule.test(password)
          return (
            <li key={rule.id} className="flex items-center gap-2 text-xs">
              {passed ? (
                <Check size={14} className="text-green-400" />
              ) : (
                <X size={14} className="text-red-400" />
              )}
              <span className={passed ? 'text-green-400' : 'text-gray-400'}>
                {rule.label}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * AuthPage Component
 *
 * Combined Login/Signup page with OAuth support
 */
function AuthPage() {
  const { login, signup, error: authError } = useAuth()
  const [mode, setMode] = useState('login') // login or signup
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [oauthProviders, setOauthProviders] = useState({ github: false, google: false })

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })

  // Fetch available OAuth providers
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/oauth/providers`)
        if (res.ok) {
          const data = await res.json()
          setOauthProviders(data)
        }
      } catch (err) {
        console.error('Failed to fetch OAuth providers:', err)
      }
    }
    fetchProviders()
  }, [])

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'login') {
        const result = await login(formData.email, formData.password)
        if (!result.success) {
          setError(result.error || 'Login failed')
        }
      } else {
        // Validate password against all rules
        if (!validatePassword(formData.password)) {
          setError('Password does not meet all requirements')
          setLoading(false)
          return
        }

        const result = await signup(formData.email, formData.password, formData.name)
        if (!result.success) {
          setError(result.error || 'Signup failed')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = (provider) => {
    window.location.href = `${API_URL}/api/auth/oauth/${provider}`
  }

  const hasOAuth = oauthProviders.github || oauthProviders.google

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span style={{ color: '#fff' }}>Hub</span>
            <span style={{ color: 'var(--primary)' }}>LLM</span>
          </h1>
          <p className="text-gray-400">
            AI Development Environment
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
          {/* Tabs */}
          <div className="flex mb-6 bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                mode === 'login'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                mode === 'signup'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {(error || authError) && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-center gap-2 text-red-200">
              <AlertCircle size={18} />
              <span className="text-sm">{error || authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter password'}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Password requirements feedback (signup only) */}
              {mode === 'signup' && <PasswordRequirements password={formData.password} />}
            </div>

            {/* Forgot Password (login only) */}
            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-blue-400 hover:text-blue-300"
                  onClick={() => {/* TODO: Forgot password modal */}}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (mode === 'signup' && !validatePassword(formData.password))}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* OAuth Divider */}
          {hasOAuth && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-500">or continue with</span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-3">
                {oauthProviders.github && (
                  <button
                    onClick={() => handleOAuth('github')}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <Github size={20} />
                    <span>Continue with GitHub</span>
                  </button>
                )}

                {oauthProviders.google && (
                  <button
                    onClick={() => handleOAuth('google')}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default AuthPage
