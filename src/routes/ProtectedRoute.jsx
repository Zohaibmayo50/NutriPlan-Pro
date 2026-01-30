import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Protected Route Component
 * Enforces authentication, role verification, and onboarding requirements
 * 
 * Flow:
 * 1. Not authenticated → redirect to /login
 * 2. Authenticated but not a dietitian → redirect to /not-authorized
 * 3. Authenticated dietitian but no onboarding → redirect to /onboarding (if required)
 * 4. Authenticated dietitian with onboarding → allow access
 */
const ProtectedRoute = ({ children, requiresOnboarding = false, requiresDietitian = true }) => {
  const { isAuthenticated, hasCompletedOnboarding, userProfile, loading } = useAuth()

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

  // Check if user is a dietitian (if required)
  if (requiresDietitian && userProfile && userProfile.role !== 'dietitian') {
    return <Navigate to="/not-authorized" replace />
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
