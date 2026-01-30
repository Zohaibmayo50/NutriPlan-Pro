import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createDietPlan } from '../../services/dietPlanService';
import { getDietitianClients } from '../../services/clientService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function DietPlanCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  
  const [formData, setFormData] = useState({
    clientId: searchParams.get('clientId') || '',
    title: '',
    rawInput: '',
    notes: ''
  });

  useEffect(() => {
    loadClients();
  }, [user]);

  const loadClients = async () => {
    try {
      setLoadingClients(true);
      const clientList = await getDietitianClients(user.uid);
      setClients(clientList);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Failed to load clients');
    } finally {
      setLoadingClients(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.clientId) {
      setError('Please select a client');
      return;
    }

    if (!formData.rawInput.trim()) {
      setError('Please provide raw input for the diet plan');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const planData = {
        title: formData.title.trim() || 'Untitled Diet Plan',
        rawInput: formData.rawInput.trim(),
        notes: formData.notes.trim(),
        status: 'draft',
        generatedPlan: null
      };

      const planId = await createDietPlan(user.uid, formData.clientId, planData);
      navigate(`/diet-plans/${planId}`);
    } catch (err) {
      console.error('Error creating diet plan:', err);
      setError(err.message || 'Failed to create diet plan');
    } finally {
      setLoading(false);
    }
  };

  if (loadingClients) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={() => navigate(formData.clientId ? `/clients/${formData.clientId}` : '/clients')}
          className="mb-4"
        >
          ← Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Create Diet Plan</h1>
        <p className="text-gray-600 mt-1">Create a new diet plan for your client</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Client <span className="text-red-500">*</span>
            </label>
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.fullName || 'Unnamed Client'} 
                  {client.age && ` (${client.age} years)`}
                </option>
              ))}
            </select>
            
            {clients.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                No clients found. <button 
                  type="button"
                  onClick={() => navigate('/clients/new')}
                  className="text-blue-600 hover:underline"
                >
                  Create a client first
                </button>
              </p>
            )}
          </div>

          {/* Plan Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Title (Optional)
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Weight Loss Plan - March 2026"
            />
          </div>

          {/* Raw Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raw Input <span className="text-red-500">*</span>
            </label>
            <textarea
              name="rawInput"
              value={formData.rawInput}
              onChange={handleChange}
              required
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Paste raw text here...&#10;&#10;Example:&#10;35-year-old male, type 2 diabetic, overweight, lactose intolerance, goal: fat loss&#10;&#10;Lab results:&#10;- Blood sugar: 180 mg/dL&#10;- BMI: 32&#10;- Cholesterol: 220 mg/dL&#10;&#10;Doctor's notes: Needs low-carb, high-protein diet. Avoid dairy. Target 1800 calories/day."
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste doctor notes, lab summaries, or custom instructions here. This will be used to generate the diet plan.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional notes or instructions for this plan..."
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your plan will be saved as a <strong>draft</strong></li>
                  <li>Raw input will be preserved for future reference</li>
                  <li>You can regenerate the plan later when AI integration is available</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(formData.clientId ? `/clients/${formData.clientId}` : '/clients')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || clients.length === 0}>
              {loading ? 'Creating...' : 'Create Diet Plan'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
