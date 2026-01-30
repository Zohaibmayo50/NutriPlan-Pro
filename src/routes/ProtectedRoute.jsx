import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Protected Route Component
 * Enforces authentication and onboarding requirements
 * 
 * Flow:
 * 1. Not authenticated → redirect to /login
 * 2. Authenticated but no onboarding → redirect to /onboarding (if on protected page)
 * 3. Authenticated with onboarding → allow access
 */
const ProtectedRoute = ({ children, requiresOnboarding = false }) => {
  const { isAuthenticated, hasCompletedOnboarding, loading } = useAuth()

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Authenticated but hasn't completed onboarding
  // Only redirect if the route requires onboarding
  if (requiresOnboarding && !hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />
  }

  // All checks passed - render the protected content
  return children
}

export default ProtectedRoute
