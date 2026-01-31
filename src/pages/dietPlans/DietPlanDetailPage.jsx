import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDietPlan, updateDietPlan, deleteDietPlan } from '../../services/dietPlanService';
import { getClient } from '../../services/clientService';
import { generateDietPlan as generateWithAI } from '../../services/aiService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import FormattedPlan from '../../components/plans/FormattedPlan';
import html2pdf from 'html2pdf.js';

export default function DietPlanDetailPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const planContentRef = useRef(null);
  
  const [plan, setPlan] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  
  const [editForm, setEditForm] = useState({
    title: '',
    rawInput: '',
    generatedPlan: '',
    notes: '',
    status: 'draft'
  });

  useEffect(() => {
    loadPlanData();
  }, [planId]);

  const loadPlanData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const planData = await getDietPlan(planId);

      // Verify ownership
      if (planData.dietitianId !== user.uid) {
        throw new Error('Unauthorized access to this diet plan');
      }

      setPlan(planData);
      
      // Load client data
      if (planData.clientId) {
        try {
          const clientData = await getClient(planData.clientId);
          setClient(clientData);
        } catch (err) {
          console.warn('Client not found or deleted:', err);
        }
      }
      
      // Initialize edit form
      setEditForm({
        title: planData.title || '',
        rawInput: planData.rawInput || '',
        generatedPlan: planData.generatedPlan || '',
        notes: planData.notes || '',
        status: planData.status || 'draft'
      });
    } catch (err) {
      console.error('Error loading diet plan:', err);
      setError(err.message || 'Failed to load diet plan');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      setError(null);
      await updateDietPlan(planId, editForm);
      setIsEditing(false);
      await loadPlanData();
    } catch (err) {
      console.error('Error updating diet plan:', err);
      setError(err.message || 'Failed to update diet plan');
    }
  };

  const handleRegenerate = async () => {
    if (!plan?.rawInput) {
      setError('Cannot regenerate: No raw input available');
      return;
    }

    if (!client) {
      setError('Cannot regenerate: Client data not available');
      return;
    }

    try {
      setRegenerating(true);
      setShowRegenerateConfirm(false);
      setError(null);

      console.log('🤖 Regenerating AI diet plan...');
      
      // Call AI to regenerate the plan
      const generatedPlan = await generateWithAI(client, plan.rawInput);

      // Update the plan with new generated content
      await updateDietPlan(planId, { 
        generatedPlan,
        status: 'generated',
        updatedAt: new Date()
      });

      await loadPlanData();
      console.log('✅ Plan regenerated successfully');
    } catch (err) {
      console.error('Error regenerating plan:', err);
      setError(err.message || 'Failed to regenerate plan');
    } finally {
      setRegenerating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDietPlan(planId);
      navigate(client ? `/clients/${client.id}` : '/clients');
    } catch (err) {
      console.error('Error deleting diet plan:', err);
      setError(err.message || 'Failed to delete diet plan');
      setShowDeleteConfirm(false);
    }
  };

  /**
   * Export diet plan as PDF
   * Format: ClientName_PlanTitle_Date.pdf
   */
  const handleExportPDF = async () => {
    if (!plan?.generatedPlan || !planContentRef.current) {
      setError('No plan content to export');
      return;
    }

    try {
      setExportingPDF(true);
      setError(null);

      // Generate filename: ClientName_PlanTitle_Date.pdf
      const clientName = client?.fullName?.replace(/\s+/g, '_') || 'Client';
      const planTitle = plan.title?.replace(/\s+/g, '_') || 'DietPlan';
      const date = new Date().toISOString().split('T')[0];
      const filename = `${clientName}_${planTitle}_${date}.pdf`;

      // PDF configuration
      const opt = {
        margin: [15, 15, 15, 15],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // Create PDF content wrapper
      const pdfContent = document.createElement('div');
      pdfContent.style.cssText = 'background: white; padding: 20px; color: black;';
      
      // Add header
      const header = document.createElement('div');
      header.style.cssText = 'margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;';
      header.innerHTML = `
        <h1 style="margin: 0; font-size: 24px; color: #000;">${plan.title || 'Diet Plan'}</h1>
        ${client ? `<p style="margin: 5px 0; color: #333;">Client: ${client.fullName}</p>` : ''}
        <p style="margin: 5px 0; font-size: 12px; color: #666;">Generated: ${new Date().toLocaleDateString()}</p>
      `;
      pdfContent.appendChild(header);

      // Clone the plan content
      const contentClone = planContentRef.current.cloneNode(true);
      pdfContent.appendChild(contentClone);

      // Generate PDF
      await html2pdf().set(opt).from(pdfContent).save();

      console.log('✅ PDF exported successfully:', filename);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setError(err.message || 'Failed to export PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <Button onClick={() => navigate('/clients')} className="mt-4">
          Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex gap-2 mb-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
          >
            🏠 Dashboard
          </Button>
          {client && (
            <Button 
              variant="outline" 
              onClick={() => navigate(`/clients/${client.id}`)}
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {plan?.title || 'Diet Plan'}
            </h1>
            {client && (
              <p className="text-gray-600 mt-1">
                For: {client.fullName}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Created {plan?.createdAt?.toDate?.()?.toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              plan?.status === 'generated' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {plan?.status}
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Diet Plan?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this diet plan? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        {/* Client Information */}
        {client && (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Information</h2>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium">{client.fullName}</p>
                </div>
                {client.age && (
                  <div>
                    <span className="text-gray-600">Age:</span>
                    <p className="font-medium">{client.age} years</p>
                  </div>
                )}
                {client.gender && (
                  <div>
                    <span className="text-gray-600">Gender:</span>
                    <p className="font-medium capitalize">{client.gender}</p>
                  </div>
                )}
                {client.goals && (
                  <div className="md:col-span-3">
                    <span className="text-gray-600">Goals:</span>
                    <p className="font-medium">{client.goals}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Raw Input */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Raw Input</h2>
            {!isEditing ? (
              <pre className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm text-gray-800 border border-gray-200">
                {plan?.rawInput || 'No raw input provided'}
              </pre>
            ) : (
              <textarea
                name="rawInput"
                value={editForm.rawInput}
                onChange={handleEditChange}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
              />
            )}
          </div>
        </Card>

        {/* Generated Plan */}
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Generated Diet Plan</h2>
              <div className="flex gap-2">
                {!isEditing && plan?.generatedPlan && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handleExportPDF}
                      disabled={exportingPDF}
                    >
                      {exportingPDF ? '⏳ Exporting...' : '📄 Export PDF'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.print()}
                    >
                      🖨️ Print
                    </Button>
                  </>
                )}
                {!isEditing && (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowRegenerateConfirm(true)}
                    disabled={!plan?.rawInput || regenerating}
                  >
                    {regenerating ? '🤖 Regenerating...' : '🔄 Regenerate'}
                  </Button>
                )}
              </div>
            </div>

            {/* Regenerating Progress */}
            {regenerating && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center text-sm text-green-900">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                  <span className="font-medium">🤖 AI is regenerating your diet plan... This may take 10-30 seconds.</span>
                </div>
              </div>
            )}

            {!isEditing ? (
              plan?.generatedPlan ? (
                <div className="prose max-w-none print:prose-lg">
                  <div className="bg-white p-6 rounded-lg border border-gray-200" ref={planContentRef}>
                    <FormattedPlan planContent={plan.generatedPlan} />
                  </div>
                  <div className="mt-4 text-xs text-gray-500 no-print">
                    💡 <strong>Tip:</strong> Use "Export PDF" to save as a file, or "Print" for quick printing
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-600 mb-4">No plan generated yet</p>
                  <Button onClick={() => setShowRegenerateConfirm(true)} disabled={!plan?.rawInput}>
                    🤖 Generate Plan with AI
                  </Button>
                </div>
              )
            ) : (
              <textarea
                name="generatedPlan"
                value={editForm.generatedPlan}
                onChange={handleEditChange}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                placeholder="AI-generated plan will appear here..."
              />
            )}
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
            {!isEditing ? (
              <p className="text-gray-700 whitespace-pre-wrap">
                {plan?.notes || <span className="text-gray-400">No notes added</span>}
              </p>
            ) : (
              <textarea
                name="notes"
                value={editForm.notes}
                onChange={handleEditChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Add any additional notes..."
              />
            )}
          </div>
        </Card>

        {/* Actions */}
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div>
                {!isEditing ? (
                  <div className="flex gap-2">
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Plan
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Delete Plan
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit}>
                      Save Changes
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({
                          title: plan.title || '',
                          rawInput: plan.rawInput || '',
                          generatedPlan: plan.generatedPlan || '',
                          notes: plan.notes || '',
                          status: plan.status || 'draft'
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {plan?.updatedAt?.toDate?.()?.toLocaleString() || 'N/A'}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Regenerate Confirmation Modal */}
      {showRegenerateConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ⚠️ Regenerate Diet Plan?
              </h3>
              <p className="text-gray-600 mb-4">
                This will use AI to create a new diet plan based on the raw input. 
                The current generated plan will be <strong>overwritten</strong>. 
                This action cannot be undone.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-sm text-yellow-900">
                <p className="font-medium mb-1">⚡ What will happen:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Raw input will remain unchanged</li>
                  <li>AI will generate a fresh 7-day diet plan</li>
                  <li>Current generated content will be replaced</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowRegenerateConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRegenerate}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  🤖 Regenerate
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
