import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/ui/Button';
import { getPlan, updatePlan, deletePlan } from '../../services/planService';
import { extractTextFromFile, validatePlanFile } from '../../utils/fileUtils';

/**
 * Plan Detail Page - Phase 4
 * View and edit an existing plan
 */
const PlanDetailPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    planTitle: '',
    duration: '',
    notes: '',
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
    rawText: '',
    status: 'draft',
    createdAt: null,
    updatedAt: null
  });

  useEffect(() => {
    loadPlan();
  }, [planId]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const plan = await getPlan(user.uid, planId);
      setFormData(plan);
    } catch (err) {
      setError(err.message || 'Failed to load plan');
    } finally {
      setLoading(false);
    }
  };

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
      const validation = validatePlanFile(file);
      if (!validation.valid) {
        setFileError(validation.error);
        setUploadingFile(false);
        return;
      }

      const extractedText = await extractTextFromFile(file);
      setFormData(prev => ({ ...prev, rawText: extractedText }));
    } catch (err) {
      setFileError(err.message || 'Failed to read file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSave = async () => {
    setError('');

    if (!formData.planTitle.trim()) {
      setError('Plan title is required');
      return;
    }

    setSaving(true);

    try {
      // Remove ID and timestamps from updates
      const { id, createdAt, updatedAt, ...updates } = formData;
      await updatePlan(user.uid, planId, updates);
      setIsEditing(false);
      await loadPlan(); // Reload to get updated timestamps
    } catch (err) {
      setError(err.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);

    try {
      await deletePlan(user.uid, planId);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to delete plan');
      setDeleting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="px-3 py-2"
              >
                ← Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isEditing ? 'Edit Plan' : formData.planTitle}
                </h1>
                <p className="text-gray-600 mt-1">
                  Status: <span className="font-medium capitalize">{formData.status}</span>
                  {' • '}
                  Updated: {formatDate(formData.updatedAt)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Plan
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    loadPlan();
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Plan details */}
        <div className="space-y-6">
          {/* Metadata Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Plan Metadata</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Title
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.planTitle}
                    onChange={(e) => handleInputChange('planTitle', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{formData.planTitle}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                {isEditing ? (
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
                ) : (
                  <p className="text-gray-900">{formData.duration || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Internal Notes
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">{formData.notes || 'No notes'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Client Information Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.client.name}
                    onChange={(e) => handleClientChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{formData.client.name || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.client.age}
                    onChange={(e) => handleClientChange('age', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{formData.client.age || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                {isEditing ? (
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
                ) : (
                  <p className="text-gray-900 capitalize">{formData.client.gender || 'Not specified'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
                {isEditing ? (
                  <textarea
                    value={formData.client.goals}
                    onChange={(e) => handleClientChange('goals', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">{formData.client.goals || 'Not specified'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Allergies / Restrictions</label>
                {isEditing ? (
                  <textarea
                    value={formData.client.allergies}
                    onChange={(e) => handleClientChange('allergies', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">{formData.client.allergies || 'None specified'}</p>
                )}
              </div>
            </div>

            {/* Macros */}
            {(formData.client.targetCalories || formData.client.targetProtein || formData.client.targetCarbs || formData.client.targetFats || isEditing) && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Target Macros</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['targetCalories', 'targetProtein', 'targetCarbs', 'targetFats'].map((field) => {
                    const labels = {
                      targetCalories: 'Calories',
                      targetProtein: 'Protein (g)',
                      targetCarbs: 'Carbs (g)',
                      targetFats: 'Fats (g)'
                    };
                    return (
                      <div key={field}>
                        <label className="block text-xs text-gray-600 mb-1">{labels[field]}</label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={formData.client[field]}
                            onChange={(e) => handleClientChange(field, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium">{formData.client[field] || '-'}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Raw Text Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Diet Plan Content</h2>
            
            {isEditing && (
              <div className="mb-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
                  <div className="text-center">
                    <label className="inline-block">
                      <span className="px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-green-600 text-sm">
                        {uploadingFile ? 'Uploading...' : 'Replace with File'}
                      </span>
                      <input
                        type="file"
                        accept=".txt,.docx"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-2 text-xs text-gray-500">
                      Upload a .txt or .docx file (max 5MB)
                    </p>
                  </div>
                  {fileError && (
                    <p className="mt-2 text-sm text-red-600 text-center">{fileError}</p>
                  )}
                </div>
              </div>
            )}

            {isEditing ? (
              <textarea
                value={formData.rawText}
                onChange={(e) => handleInputChange('rawText', e.target.value)}
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                placeholder="Enter diet plan content..."
              />
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900">
                  {formData.rawText || 'No content yet'}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PlanDetailPage;
