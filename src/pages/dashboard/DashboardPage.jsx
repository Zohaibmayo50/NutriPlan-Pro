import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'

/**
 * Dashboard Page
 * Main dashboard for dietitians showing client plans and activity
 */
const DashboardPage = () => {
  const navigate = useNavigate()

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your client meal plans and exports</p>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 - Create Plan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer"
               onClick={() => navigate('/plans/new')}>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">➕</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Client Plan</h3>
            <p className="text-sm text-gray-600">Build a custom meal plan for your client</p>
          </div>

          {/* Card 2 - Recent Plans */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Client Plans</h3>
            <p className="text-sm text-gray-600">View and manage all client meal plans</p>
            <p className="text-xs text-gray-500 mt-3 italic">Coming in Phase 3</p>
          </div>

          {/* Card 3 - Analytics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Practice Analytics</h3>
            <p className="text-sm text-gray-600">Track your plan exports and usage</p>
            <p className="text-xs text-gray-500 mt-3 italic">Coming in Phase 3</p>
          </div>
        </div>

        {/* Stats section */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Phase 2 Complete ✅</h2>
          <p className="text-primary-100 mb-6">
            Authentication is live! You can now create professional meal plans for your clients.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-3xl font-bold">🔐</p>
              <p className="text-sm text-primary-100 mt-1">Secure Authentication</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-3xl font-bold">👥</p>
              <p className="text-sm text-primary-100 mt-1">Client Management</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-3xl font-bold">📄</p>
              <p className="text-sm text-primary-100 mt-1">PDF Export Ready</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default DashboardPage
