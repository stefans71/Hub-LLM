import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

const AuthContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || ''
const AUTH_TIMEOUT = 10000 // 10 second timeout for auth requests

// Helper to fetch with timeout
const fetchWithTimeout = async (url, options = {}, timeout = AUTH_TIMEOUT) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timeoutId)
    return res
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Request timed out')
    }
    throw err
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isMounted = useRef(true)

  // Get tokens from localStorage
  const getTokens = useCallback(() => ({
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token')
  }), [])

  // Save tokens to localStorage
  const saveTokens = useCallback((accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
  }, [])

  // Clear tokens from localStorage
  const clearTokens = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }, [])

  // Refresh access token
  const refreshAccessToken = useCallback(async () => {
    const { refreshToken } = getTokens()
    if (!refreshToken) return false

    try {
      const res = await fetchWithTimeout(`${API_URL}/api/auth/refresh`, {
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
  }, [getTokens, saveTokens])

  // Fetch current user (with recursion guard)
  const fetchUser = useCallback(async (isRetry = false) => {
    const { accessToken } = getTokens()
    if (!accessToken) {
      if (isMounted.current) setLoading(false)
      return null
    }

    try {
      const res = await fetchWithTimeout(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (res.ok) {
        const userData = await res.json()
        if (isMounted.current) setUser(userData)
        return userData
      } else if (res.status === 401 && !isRetry) {
        // Token expired, try refresh ONCE (no infinite recursion)
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          return fetchUser(true) // Mark as retry to prevent loop
        }
        clearTokens()
        if (isMounted.current) setUser(null)
      } else {
        // Either non-401 error or retry already attempted
        clearTokens()
        if (isMounted.current) setUser(null)
      }
    } catch (err) {
      console.error('Failed to fetch user:', err)
      if (isMounted.current) {
        setError(err.message === 'Request timed out' ? 'Connection timed out' : 'Failed to load user')
        // On timeout/error, clear tokens and allow user to re-login
        clearTokens()
        setUser(null)
      }
    } finally {
      if (isMounted.current) setLoading(false)
    }
    return null
  }, [getTokens, clearTokens, refreshAccessToken])

  // Login with email/password
  const login = useCallback(async (email, password) => {
    setError(null)
    try {
      const res = await fetchWithTimeout(`${API_URL}/api/auth/login`, {
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
      const errorMsg = err.message === 'Request timed out' ? 'Connection timed out' : 'Network error'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [saveTokens, fetchUser])

  // Signup with email/password
  const signup = useCallback(async (email, password, name) => {
    setError(null)
    try {
      const res = await fetchWithTimeout(`${API_URL}/api/auth/signup`, {
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
      const errorMsg = err.message === 'Request timed out' ? 'Connection timed out' : 'Network error'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [saveTokens, fetchUser])

  // Handle OAuth callback
  const handleOAuthCallback = useCallback(async (accessToken, refreshToken) => {
    saveTokens(accessToken, refreshToken)
    await fetchUser()
  }, [saveTokens, fetchUser])

  // Logout
  const logout = useCallback(async () => {
    try {
      const { accessToken } = getTokens()
      // Don't wait for logout API - just clear local state immediately
      fetchWithTimeout(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }, 5000).catch(() => {}) // Ignore logout errors
    } finally {
      clearTokens()
      if (isMounted.current) setUser(null)
    }
  }, [getTokens, clearTokens])

  // Get auth header for API requests
  const getAuthHeader = useCallback(() => {
    const { accessToken } = getTokens()
    return accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
  }, [getTokens])

  // Check auth on mount with cleanup
  useEffect(() => {
    isMounted.current = true
    fetchUser()

    return () => {
      isMounted.current = false
    }
  }, [fetchUser])

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
