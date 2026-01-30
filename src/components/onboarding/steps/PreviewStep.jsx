const PreviewStep = ({ formData }) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="font-medium text-blue-900">Review Your Branding</h4>
            <p className="text-sm text-blue-700 mt-1">
              This is how your meal plans will look. You can change these settings anytime from your dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Full Page Preview */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg">
        {/* Header */}
        <div 
          className="p-6 border-b-2"
          style={{ 
            textAlign: formData.headerSettings.logoAlignment,
            borderColor: formData.primaryColor
          }}
        >
          {formData.headerSettings.showLogo && formData.logoUrl && (
            <img 
              src={formData.logoUrl} 
              alt="Logo" 
              className="h-16 inline-block mb-2"
            />
          )}
          {formData.headerSettings.showBusinessName && (
            <h1 
              className="text-3xl font-bold"
              style={{ 
                color: formData.primaryColor,
                fontFamily: formData.fontFamily
              }}
            >
              {formData.businessName || 'Your Business Name'}
            </h1>
          )}
          {formData.tagline && (
            <p className="text-gray-600 mt-1" style={{ fontFamily: formData.fontFamily }}>
              {formData.tagline}
            </p>
          )}
        </div>

        {/* Sample Content */}
        <div className="p-8" style={{ fontFamily: formData.fontFamily }}>
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: formData.primaryColor }}
          >
            7-Day Personalized Meal Plan
          </h2>
          
          <div className="space-y-6">
            <div className="border-l-4 pl-4" style={{ borderColor: formData.secondaryColor }}>
              <h3 className="font-semibold text-lg text-gray-900">Day 1</h3>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="font-medium text-gray-900">Breakfast: Greek Yogurt Parfait</p>
                  <p className="text-sm text-gray-600">High in protein and probiotics</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Lunch: Grilled Chicken Salad</p>
                  <p className="text-sm text-gray-600">Fresh vegetables with lean protein</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Dinner: Baked Salmon with Vegetables</p>
                  <p className="text-sm text-gray-600">Rich in omega-3 fatty acids</p>
                </div>
              </div>
            </div>

            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: formData.primaryColor + '15' }}
            >
              <h4 className="font-semibold text-gray-900 mb-2">Nutritional Goals</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Daily Calories: 2,000 kcal</li>
                <li>• Protein: 150g</li>
                <li>• Carbohydrates: 200g</li>
                <li>• Fats: 65g</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-3" style={{ fontFamily: formData.fontFamily }}>
          {formData.footerSettings.showContact && formData.footerSettings.contactInfo && (
            <p className="text-sm text-gray-700 text-center">
              {formData.footerSettings.contactInfo}
            </p>
          )}
          {formData.footerSettings.showDisclaimer && formData.footerSettings.disclaimerText && (
            <p className="text-xs text-gray-500 text-center italic">
              {formData.footerSettings.disclaimerText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewStep;
