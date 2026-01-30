const BrandColorsStep = ({ formData, updateFormData }) => {
  const handleColorChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Color
        </label>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={formData.primaryColor}
            onChange={(e) => handleColorChange('primaryColor', e.target.value)}
            className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={formData.primaryColor}
            onChange={(e) => handleColorChange('primaryColor', e.target.value)}
            placeholder="#22c55e"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Used for headings, buttons, and key elements
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Secondary Color
        </label>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={formData.secondaryColor}
            onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
            className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={formData.secondaryColor}
            onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
            placeholder="#16a34a"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Used for accents and supporting elements
        </p>
      </div>

      {/* Live Preview */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-600 mb-3">Color Preview</h4>
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <div 
            className="h-16 rounded-lg flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: formData.primaryColor }}
          >
            Primary Color
          </div>
          <div 
            className="h-16 rounded-lg flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: formData.secondaryColor }}
          >
            Secondary Color
          </div>
          <div className="flex gap-2">
            <button 
              className="flex-1 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: formData.primaryColor }}
            >
              Button Example
            </button>
            <button 
              className="flex-1 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: formData.secondaryColor }}
            >
              Button Example
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandColorsStep;
