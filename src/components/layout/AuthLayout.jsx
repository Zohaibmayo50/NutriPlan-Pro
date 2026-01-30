/**
 * Authentication Layout Component
 * Used for login, signup, and other auth pages
 * Features: Centered card, responsive design
 */
const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600">NutriPlan Pro</h1>
            <p className="text-sm text-gray-500 mt-1">For Dietitians & Nutritionists</p>
            {title && <h2 className="text-xl font-semibold text-gray-900 mt-4">{title}</h2>}
            {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
          </div>

          {/* Content */}
          <div>{children}</div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2026 NutriPlan Pro. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default AuthLayout
