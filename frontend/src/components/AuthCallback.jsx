import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

/**
 * AuthCallback Component
 *
 * Handles OAuth callback redirects from GitHub/Google.
 * URL format: /auth/callback?access_token=xxx&refresh_token=xxx
 */
function AuthCallback({ onComplete }) {
  const { handleOAuthCallback } = useAuth()
  const [status, setStatus] = useState('processing') // processing, success, error
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const processCallback = async () => {
      // Get tokens from URL params
      const params = new URLSearchParams(window.location.search)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const error = params.get('error')

      if (error) {
        setStatus('error')
        setErrorMessage(error)
        return
      }

      if (!accessToken || !refreshToken) {
        setStatus('error')
        setErrorMessage('Missing authentication tokens')
        return
      }

      try {
        // Save tokens and fetch user
        await handleOAuthCallback(accessToken, refreshToken)
        setStatus('success')

        // Clear URL params
        window.history.replaceState({}, '', window.location.pathname)

        // Redirect after short delay
        setTimeout(() => {
          onComplete?.()
        }, 1500)
      } catch (err) {
        setStatus('error')
        setErrorMessage('Failed to complete authentication')
      }
    }

    processCallback()
  }, [handleOAuthCallback, onComplete])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Completing Sign In...
            </h2>
            <p className="text-gray-400">
              Please wait while we set up your account
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Welcome to HubLLM!
            </h2>
            <p className="text-gray-400">
              Redirecting you to the app...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-400 mb-6">
              {errorMessage || 'Something went wrong'}
            </p>
            <button
              onClick={() => onComplete?.()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Return to Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default AuthCallback
