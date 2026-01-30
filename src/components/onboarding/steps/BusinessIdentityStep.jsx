const BusinessIdentityStep = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.businessName}
          onChange={(e) => updateFormData({ businessName: e.target.value })}
          placeholder="e.g., Smith Nutrition Services"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          This will appear on all your meal plans
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tagline (Optional)
        </label>
        <input
          type="text"
          value={formData.tagline}
          onChange={(e) => updateFormData({ tagline: e.target.value })}
          placeholder="e.g., Personalized Nutrition for Better Health"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <p className="mt-1 text-sm text-gray-500">
          A short description of your practice
        </p>
      </div>

      {/* Live Preview */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-600 mb-3">Preview</h4>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900">
            {formData.businessName || 'Your Business Name'}
          </h3>
          {formData.tagline && (
            <p className="text-gray-600 mt-2">{formData.tagline}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessIdentityStep;
