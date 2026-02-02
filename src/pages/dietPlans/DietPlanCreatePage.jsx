import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createDietPlan } from '../../services/dietPlanService';
import { getDietitianClients, getClient } from '../../services/clientService';
import { generateDietPlan as generateWithAI } from '../../services/aiService';
import { getAIUsage } from '../../services/aiUsageService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function DietPlanCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [aiUsage, setAiUsage] = useState(null);
  
  const [formData, setFormData] = useState({
    clientId: searchParams.get('clientId') || '',
    title: '',
    rawInput: '',
    notes: ''
  });

  useEffect(() => {
    loadClients();
    loadAIUsage();
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

  const loadAIUsage = async () => {
    try {
      const usage = await getAIUsage(user.uid);
      setAiUsage(usage);
    } catch (err) {
      console.error('Error loading AI usage:', err);
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

    // Check AI usage limit
    if (aiUsage && aiUsage.remaining <= 0) {
      setError('Daily AI generation limit reached (3/3). Please try again tomorrow.');
      return;
    }

    try {
      setLoading(true);
      setGeneratingAI(true);
      setError(null);

      // Get full client data for AI prompt
      const clientData = await getClient(formData.clientId);

      // Generate diet plan using AI (with userId for usage tracking)
      console.log('🤖 Generating AI diet plan...');
      const aiResult = await generateWithAI(clientData, formData.rawInput, user.uid);

      // Update usage info
      if (aiResult.remaining !== null) {
        setAiUsage({
          generationsUsed: aiUsage ? aiUsage.generationsUsed + 1 : 1,
          limit: aiResult.limit,
          remaining: aiResult.remaining
        });
      }

      // Create the diet plan with AI-generated content
      const planData = {
        title: formData.title.trim() || `Diet Plan - ${clientData.fullName}`,
        rawInput: formData.rawInput.trim(),
        generatedPlan: aiResult.generatedPlan,
        notes: formData.notes.trim(),
        status: 'generated'
      };

      setGeneratingAI(false);
      const planId = await createDietPlan(user.uid, formData.clientId, planData);
      navigate(`/diet-plans/${planId}`);
    } catch (err) {
      console.error('Error creating diet plan:', err);
      setError(err.message || 'Failed to create diet plan');
      setGeneratingAI(false);
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
        <div className="flex gap-2 mb-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
          >
            🏠 Dashboard
          </Button>
          {formData.clientId && (
            <Button 
              variant="outline" 
              onClick={() => navigate(`/clients/${formData.clientId}`)}
            >
              ← Client Details
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => navigate('/clients')}
          >
            👥 Clients
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Create Diet Plan</h1>
        <p className="text-gray-600 mt-1">Create a new AI-powered diet plan for your client</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* AI Usage Indicator */}
          {aiUsage && (
            <div className={`px-4 py-3 rounded border ${
              aiUsage.remaining > 0 
                ? 'bg-blue-50 border-blue-200 text-blue-900' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {aiUsage.remaining > 0 ? '🤖 AI Generations Available' : '⛔ AI Limit Reached'}
                  </span>
                </div>
                <div className="text-sm font-semibold">
                  {aiUsage.remaining}/{aiUsage.limit} remaining today
                </div>
              </div>
              {aiUsage.remaining === 0 && (
                <p className="text-sm mt-1">
                  Daily limit reached. Resets tomorrow (UTC midnight).
                </p>
              )}
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
                <p className="font-medium mb-1">🤖 AI-Powered Generation:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>AI will create a personalized 7-day diet plan</li>
                  <li>Based on client profile + your raw input</li>
                  <li>Generated plan is fully editable after creation</li>
                  <li>Raw input is preserved for regeneration</li>
                </ul>
              </div>
            </div>
          </div>

          {/* AI Generation Progress */}
          {generatingAI && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-3"></div>
                <div className="text-sm text-green-900">
                  <p className="font-medium">🤖 AI is generating your diet plan...</p>
                  <p className="text-xs mt-1">This may take 10-30 seconds. Please wait.</p>
                </div>
              </div>
            </div>
          )}

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
            <Button 
              type="submit" 
              disabled={loading || clients.length === 0 || (aiUsage && aiUsage.remaining <= 0)}
            >
              {generatingAI ? '🤖 Generating with AI...' : loading ? 'Creating...' : '🤖 Generate Diet Plan'}
            </Button>
          </div>

          {/* Limit Reached Warning */}
          {aiUsage && aiUsage.remaining <= 0 && (
            <p className="text-sm text-red-600 text-center">
              ⛔ Daily AI generation limit reached. Resets tomorrow (UTC midnight).
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}
