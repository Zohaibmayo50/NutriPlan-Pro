const PROFESSIONAL_FONTS = [
  { value: 'Inter', label: 'Inter', description: 'Modern and clean' },
  { value: 'Roboto', label: 'Roboto', description: 'Professional and readable' },
  { value: 'Open Sans', label: 'Open Sans', description: 'Friendly and approachable' },
  { value: 'Lato', label: 'Lato', description: 'Elegant and warm' },
  { value: 'Montserrat', label: 'Montserrat', description: 'Bold and contemporary' },
  { value: 'Poppins', label: 'Poppins', description: 'Geometric and modern' },
  { value: 'Merriweather', label: 'Merriweather', description: 'Classic and sophisticated' },
  { value: 'Playfair Display', label: 'Playfair Display', description: 'Elegant and refined' }
];

const FontSelectionStep = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Select Your Font
        </label>
        <div className="grid grid-cols-1 gap-3">
          {PROFESSIONAL_FONTS.map((font) => (
            <button
              key={font.value}
              onClick={() => updateFormData({ fontFamily: font.value })}
              className={`text-left p-4 rounded-lg border-2 transition-all ${
                formData.fontFamily === font.value
                  ? 'border-primary bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p 
                    className="text-lg font-semibold text-gray-900"
                    style={{ fontFamily: font.value }}
                  >
                    {font.label}
                  </p>
                  <p className="text-sm text-gray-500">{font.description}</p>
                </div>
                {formData.fontFamily === font.value && (
                  <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-600 mb-3">Font Preview</h4>
        <div 
          className="bg-white p-6 rounded-lg shadow-sm space-y-3"
          style={{ fontFamily: formData.fontFamily }}
        >
          <h3 className="text-2xl font-bold text-gray-900">
            7-Day Personalized Meal Plan
          </h3>
          <p className="text-gray-600">
            This meal plan has been carefully crafted to meet your nutritional needs and goals.
          </p>
          <div className="pt-4 border-t border-gray-200">
            <p className="font-semibold text-gray-900">Breakfast: Greek Yogurt Parfait</p>
            <p className="text-sm text-gray-600">High in protein and probiotics for gut health</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontSelectionStep;
