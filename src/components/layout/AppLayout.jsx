import Sidebar from './Sidebar'
import Header from './Header'

/**
 * App Layout Component
 * Main application layout with sidebar and header
 * Used for all authenticated pages
 */
const AppLayout = ({ children }) => {
  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="container-custom">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
