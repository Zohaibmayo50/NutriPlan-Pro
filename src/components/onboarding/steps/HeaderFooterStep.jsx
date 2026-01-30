const HeaderFooterStep = ({ formData, updateFormData }) => {
  const updateHeaderSettings = (updates) => {
    updateFormData({
      headerSettings: { ...formData.headerSettings, ...updates }
    });
  };

  const updateFooterSettings = (updates) => {
    updateFormData({
      footerSettings: { ...formData.footerSettings, ...updates }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Settings */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Header Settings</h4>
        
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="showBusinessName"
            checked={formData.headerSettings.showBusinessName}
            onChange={(e) => updateHeaderSettings({ showBusinessName: e.target.checked })}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="showBusinessName" className="text-sm text-gray-700">
            Show business name in header
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="showLogo"
            checked={formData.headerSettings.showLogo}
            onChange={(e) => updateHeaderSettings({ showLogo: e.target.checked })}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="showLogo" className="text-sm text-gray-700">
            Show logo in header
          </label>
        </div>

        {formData.headerSettings.showLogo && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo Alignment
            </label>
            <select
              value={formData.headerSettings.logoAlignment}
              onChange={(e) => updateHeaderSettings({ logoAlignment: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        )}
      </div>

      {/* Footer Settings */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Footer Settings</h4>
        
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="showContact"
            checked={formData.footerSettings.showContact}
            onChange={(e) => updateFooterSettings({ showContact: e.target.checked })}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="showContact" className="text-sm text-gray-700">
            Show contact information in footer
          </label>
        </div>

        {formData.footerSettings.showContact && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Information
            </label>
            <textarea
              value={formData.footerSettings.contactInfo}
              onChange={(e) => updateFooterSettings({ contactInfo: e.target.value })}
              placeholder="Email: contact@example.com | Phone: (555) 123-4567"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="showDisclaimer"
            checked={formData.footerSettings.showDisclaimer}
            onChange={(e) => updateFooterSettings({ showDisclaimer: e.target.checked })}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="showDisclaimer" className="text-sm text-gray-700">
            Show disclaimer in footer
          </label>
        </div>

        {formData.footerSettings.showDisclaimer && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Disclaimer Text
            </label>
            <textarea
              value={formData.footerSettings.disclaimerText}
              onChange={(e) => updateFooterSettings({ disclaimerText: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Legal disclaimer to protect your practice
            </p>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-600 mb-3">Preview</h4>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header Preview */}
          <div 
            className="p-4 border-b border-gray-200"
            style={{ 
              textAlign: formData.headerSettings.logoAlignment,
              backgroundColor: formData.primaryColor + '10'
            }}
          >
            {formData.headerSettings.showLogo && formData.logoUrl && (
              <img 
                src={formData.logoUrl} 
                alt="Logo" 
                className="h-12 inline-block"
              />
            )}
            {formData.headerSettings.showBusinessName && (
              <h3 className="text-lg font-semibold text-gray-900 mt-2">
                {formData.businessName || 'Your Business Name'}
              </h3>
            )}
          </div>
          
          {/* Content Preview */}
          <div className="p-6">
            <p className="text-gray-600 text-center">Meal plan content goes here</p>
          </div>
          
          {/* Footer Preview */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600 space-y-2">
            {formData.footerSettings.showContact && formData.footerSettings.contactInfo && (
              <p className="text-center">{formData.footerSettings.contactInfo}</p>
            )}
            {formData.footerSettings.showDisclaimer && formData.footerSettings.disclaimerText && (
              <p className="text-xs text-gray-500 text-center italic">
                {formData.footerSettings.disclaimerText}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderFooterStep;
