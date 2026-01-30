/**
 * Card Component
 * Reusable card container for content sections
 */
const Card = ({ 
  children, 
  title, 
  subtitle,
  icon,
  onClick,
  hoverable = false,
  className = '' 
}) => {
  const hoverClass = hoverable ? 'hover:shadow-md cursor-pointer transition-shadow' : ''
  
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${hoverClass} ${className}`}
    >
      {/* Icon */}
      {icon && (
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
          <span className="text-2xl">{icon}</span>
        </div>
      )}
      
      {/* Title */}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      )}
      
      {/* Subtitle */}
      {subtitle && (
        <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
      )}
      
      {/* Content */}
      {children}
    </div>
  )
}

export default Card
