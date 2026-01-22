import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || ''

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get tokens from localStorage
  const getTokens = () => ({
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token')
  })

  // Save tokens to localStorage
  const saveTokens = (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
  }

  // Clear tokens from localStorage
  const clearTokens = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  // Fetch current user
  const fetchUser = async () => {
    const { accessToken } = getTokens()
    if (!accessToken) {
      setLoading(false)
      return null
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (res.ok) {
        const userData = await res.json()
        setUser(userData)
        return userData
      } else if (res.status === 401) {
        // Token expired, try refresh
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          return fetchUser()
        }
        clearTokens()
        setUser(null)
      }
    } catch (err) {
      console.error('Failed to fetch user:', err)
      setError('Failed to load user')
    } finally {
      setLoading(false)
    }
    return null
  }

  // Refresh access token
  const refreshAccessToken = async () => {
    const { refreshToken } = getTokens()
    if (!refreshToken) return false

    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      })

      if (res.ok) {
        const data = await res.json()
        saveTokens(data.access_token, data.refresh_token)
        return true
      }
    } catch (err) {
      console.error('Failed to refresh token:', err)
    }
    return false
  }

  // Login with email/password
  const login = async (email, password) => {
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (res.ok) {
        saveTokens(data.access_token, data.refresh_token)
        await fetchUser()
        return { success: true }
      } else {
        setError(data.detail || 'Login failed')
        return { success: false, error: data.detail }
      }
    } catch (err) {
      setError('Network error')
      return { success: false, error: 'Network error' }
    }
  }

  // Signup with email/password
  const signup = async (email, password, name) => {
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })

      const data = await res.json()

      if (res.ok) {
        saveTokens(data.access_token, data.refresh_token)
        await fetchUser()
        return { success: true }
      } else {
        setError(data.detail || 'Signup failed')
        return { success: false, error: data.detail }
      }
    } catch (err) {
      setError('Network error')
      return { success: false, error: 'Network error' }
    }
  }

  // Handle OAuth callback
  const handleOAuthCallback = async (accessToken, refreshToken) => {
    saveTokens(accessToken, refreshToken)
    await fetchUser()
  }

  // Logout
  const logout = async () => {
    try {
      const { accessToken } = getTokens()
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      clearTokens()
      setUser(null)
    }
  }

  // Get auth header for API requests
  const getAuthHeader = () => {
    const { accessToken } = getTokens()
    return accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
  }

  // Check auth on mount
  useEffect(() => {
    fetchUser()
  }, [])

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    handleOAuthCallback,
    getAuthHeader,
    refreshAccessToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
