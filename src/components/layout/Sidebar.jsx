import { Link, useLocation } from 'react-router-dom'

/**
 * Sidebar Navigation Component
 * Left sidebar with navigation links
 */
const Sidebar = () => {
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/plans/new', label: 'New Plan', icon: '➕' },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600">NutriPlan Pro</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User info - bottom */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <p className="font-medium">Phase 1 - Foundation</p>
          <p className="text-xs mt-1">Navigation ready</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
