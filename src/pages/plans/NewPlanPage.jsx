import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/ui/Button';
import { createPlan } from '../../services/planService';
import { extractTextFromFile, validatePlanFile } from '../../utils/fileUtils';

/**
 * New Plan Page - Phase 4
 * Create a meal plan for a client
 * Collects: Plan metadata, client info, raw diet plan text
 */
const NewPlanPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Section 1: Plan Metadata
    planTitle: '',
    duration: '',
    notes: '',

    // Section 2: Client Information
    client: {
      name: '',
      age: '',
      gender: '',
      goals: '',
      allergies: '',
      targetCalories: '',
      targetProtein: '',
      targetCarbs: '',
      targetFats: ''
    },

    // Section 3: Raw Diet Plan Text
    rawText: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClientChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      client: { ...prev.client, [field]: value }
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileError('');
    setUploadingFile(true);

    try {
      // Validate file
      const validation = validatePlanFile(file);
      if (!validation.valid) {
        setFileError(validation.error);
        setUploadingFile(false);
        return;
      }

      // Extract text
      const extractedText = await extractTextFromFile(file);
      setFormData(prev => ({ ...prev, rawText: extractedText }));
    } catch (err) {
      setFileError(err.message || 'Failed to read file');
    } finally {
      setUploadingFile(false);
    }
  };

  const validateForm = () => {
    if (!formData.planTitle.trim()) {
      setError('Plan title is required');
      return false;
    }
    return true;
  };

  const handleSaveDraft = async () => {
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const planId = await createPlan(user.uid, formData);
      navigate(`/plans/${planId}`);
    } catch (err) {
      setError(err.message || 'Failed to save plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Plan</h1>
          <p className="text-gray-600 mt-2">Design a personalized diet plan for your client</p>
        </div>


        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Main form */}
        <div className="space-y-8">
          {/* SECTION 1: Plan Metadata */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Plan Metadata</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.planTitle}
                  onChange={(e) => handleInputChange('planTitle', e.target.value)}
                  placeholder="e.g., 30-Day Weight Loss Plan"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Duration (Optional)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select duration</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="28">28 days</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Internal Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Private notes for yourself about this plan..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  These notes are for your reference only and won't be shown to the client
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: Client Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Client Information</h2>
              <p className="text-sm text-gray-600 mt-1">
                This information applies only to this plan and is not part of your account.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.client.name}
                    onChange={(e) => handleClientChange('name', e.target.value)}
                    placeholder="John Smith"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.client.age}
                    onChange={(e) => handleClientChange('age', e.target.value)}
                    placeholder="35"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender (Optional)
                </label>
                <select
                  value={formData.client.gender}
                  onChange={(e) => handleClientChange('gender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goals (Optional)
                </label>
                <textarea
                  value={formData.client.goals}
                  onChange={(e) => handleClientChange('goals', e.target.value)}
                  placeholder="e.g., Weight loss, muscle gain, improved energy levels..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies / Dietary Restrictions (Optional)
                </label>
                <textarea
                  value={formData.client.allergies}
                  onChange={(e) => handleClientChange('allergies', e.target.value)}
                  placeholder="e.g., Dairy allergy, gluten-free, vegetarian..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Target Macros (Optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Calories</label>
                    <input
                      type="number"
                      value={formData.client.targetCalories}
                      onChange={(e) => handleClientChange('targetCalories', e.target.value)}
                      placeholder="2000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Protein (g)</label>
                    <input
                      type="number"
                      value={formData.client.targetProtein}
                      onChange={(e) => handleClientChange('targetProtein', e.target.value)}
                      placeholder="150"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      value={formData.client.targetCarbs}
                      onChange={(e) => handleClientChange('targetCarbs', e.target.value)}
                      placeholder="200"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Fats (g)</label>
                    <input
                      type="number"
                      value={formData.client.targetFats}
                      onChange={(e) => handleClientChange('targetFats', e.target.value)}
                      placeholder="65"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Raw Diet Plan Input */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Raw Diet Plan Input</h2>

            {/* Upload or paste toggle */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Choose how you'd like to input the diet plan:
              </p>

              {/* File upload option */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <label className="inline-block">
                      <span className="px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-green-600">
                        {uploadingFile ? 'Uploading...' : 'Upload File'}
                      </span>
                      <input
                        type="file"
                        accept=".txt,.docx"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-2 text-sm text-gray-500">
                      Upload a .txt or .docx file (max 5MB)
                    </p>
                  </div>
                  {fileError && (
                    <p className="mt-2 text-sm text-red-600">{fileError}</p>
                  )}
                </div>
              </div>

              {/* Text area option */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or paste your diet plan text below:
                </label>
                <textarea
                  value={formData.rawText}
                  onChange={(e) => handleInputChange('rawText', e.target.value)}
                  placeholder={`Day 1:
Breakfast: Oatmeal with berries and almonds
Lunch: Grilled chicken salad with olive oil dressing
Dinner: Baked salmon with roasted vegetables

Day 2:
Breakfast: Greek yogurt with granola and honey
Lunch: Turkey and avocado wrap
Dinner: Lean beef stir-fry with brown rice

...`}
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Paste your complete diet plan. No formatting required - raw text is fine.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 4: Save Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Ready to save?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your plan will be saved as a draft. You can edit it anytime.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveDraft}
                  disabled={loading || !formData.planTitle.trim()}
                >
                  {loading ? 'Saving...' : 'Save Draft'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default NewPlanPage;
