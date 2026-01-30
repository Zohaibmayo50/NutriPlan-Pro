import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

/**
 * Header Component
 * Top navigation bar with user info and logout
 */
const Header = () => {
  const { user, userProfile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      navigate('/login')
    }
  }

  // Get display name from profile or user object
  const displayName = userProfile?.displayName || user?.displayName || 'User'
  const email = user?.email || 'user@example.com'
  const photoURL = userProfile?.photoURL || user?.photoURL

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Page title area - can be customized per page */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800">NutriPlan Pro</h2>
          <p className="text-sm text-gray-600 mt-1">Professional meal plan management</p>
        </div>

        {/* User actions */}
        <div className="flex items-center gap-4">
          {/* User info */}
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-500">{email}</p>
          </div>

          {/* Avatar */}
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
              {displayName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
