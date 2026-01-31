import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getClient, updateClient, deleteClient } from '../../services/clientService';
import { getClientDietPlans } from '../../services/dietPlanService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function ClientDetailPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [client, setClient] = useState(null);
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [editForm, setEditForm] = useState({
    fullName: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    medicalConditions: '',
    allergies: '',
    goals: '',
    notes: ''
  });

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load client data first
      const clientData = await getClient(clientId);

      // Verify ownership
      if (clientData.dietitianId !== user.uid) {
        throw new Error('Unauthorized access to this client');
      }

      setClient(clientData);
      
      // Load diet plans (might be empty for new clients)
      try {
        const plans = await getClientDietPlans(clientId);
        setDietPlans(plans);
      } catch (planErr) {
        console.warn('No diet plans found for client:', planErr);
        setDietPlans([]);
      }
      
      // Initialize edit form
      setEditForm({
        fullName: clientData.fullName || '',
        age: clientData.age || '',
        gender: clientData.gender || '',
        height: clientData.height || '',
        weight: clientData.weight || '',
        medicalConditions: clientData.medicalConditions?.join(', ') || '',
        allergies: clientData.allergies?.join(', ') || '',
        goals: clientData.goals || '',
        notes: clientData.notes || ''
      });
    } catch (err) {
      console.error('Error loading client:', err);
      setError(err.message || 'Failed to load client data');
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
      
      const updates = {
        ...editForm,
        age: editForm.age ? Number(editForm.age) : '',
        medicalConditions: editForm.medicalConditions
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        allergies: editForm.allergies
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      };

      await updateClient(clientId, updates);
      setIsEditing(false);
      await loadClientData();
    } catch (err) {
      console.error('Error updating client:', err);
      setError(err.message || 'Failed to update client');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteClient(clientId);
      navigate('/clients');
    } catch (err) {
      console.error('Error deleting client:', err);
      setError(err.message || 'Failed to delete client');
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !client) {
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
          <Button 
            variant="outline" 
            onClick={() => navigate('/clients')}
          >
            ← Back to Clients
          </Button>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {client?.fullName || 'Client Details'}
            </h1>
            <p className="text-gray-600 mt-1">
              Added {client?.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </>
            )}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Client?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this client? This action cannot be undone.
                All associated diet plans will remain but will be orphaned.
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
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Information</h2>
            
            {!isEditing ? (
              <div className="grid md:grid-cols-2 gap-6">
                <InfoField label="Full Name" value={client?.fullName} />
                <InfoField label="Age" value={client?.age ? `${client.age} years` : ''} />
                <InfoField label="Gender" value={client?.gender} />
                <InfoField label="Height" value={client?.height} />
                <InfoField label="Weight" value={client?.weight} />
                <InfoField 
                  label="Medical Conditions" 
                  value={client?.medicalConditions?.join(', ')}
                  fullWidth 
                />
                <InfoField 
                  label="Allergies" 
                  value={client?.allergies?.join(', ')}
                  fullWidth 
                />
                <InfoField 
                  label="Goals" 
                  value={client?.goals}
                  fullWidth 
                />
                <InfoField 
                  label="Notes" 
                  value={client?.notes}
                  fullWidth 
                />
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  name="fullName"
                  value={editForm.fullName}
                  onChange={handleEditChange}
                  placeholder="Full Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="age"
                    value={editForm.age}
                    onChange={handleEditChange}
                    placeholder="Age"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="text"
                    name="height"
                    value={editForm.height}
                    onChange={handleEditChange}
                    placeholder="Height"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    name="weight"
                    value={editForm.weight}
                    onChange={handleEditChange}
                    placeholder="Weight"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <input
                  type="text"
                  name="medicalConditions"
                  value={editForm.medicalConditions}
                  onChange={handleEditChange}
                  placeholder="Medical Conditions (comma-separated)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  name="allergies"
                  value={editForm.allergies}
                  onChange={handleEditChange}
                  placeholder="Allergies (comma-separated)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <textarea
                  name="goals"
                  value={editForm.goals}
                  onChange={handleEditChange}
                  placeholder="Goals"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <textarea
                  name="notes"
                  value={editForm.notes}
                  onChange={handleEditChange}
                  placeholder="Additional Notes"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Diet Plans Section */}
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Diet Plans</h2>
              <Button onClick={() => navigate(`/diet-plans/new?clientId=${clientId}`)}>
                + Create New Plan
              </Button>
            </div>

            {dietPlans.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No diet plans created yet</p>
                <Button onClick={() => navigate(`/diet-plans/new?clientId=${clientId}`)}>
                  Create First Plan
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {dietPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/diet-plans/${plan.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {plan.title || 'Untitled Plan'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Status: <span className="capitalize">{plan.status}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Created {plan.createdAt?.toDate?.()?.toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        plan.status === 'generated' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {plan.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Helper component for displaying info fields
function InfoField({ label, value, fullWidth = false }) {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <p className="text-gray-900">{value || <span className="text-gray-400">Not provided</span>}</p>
    </div>
  );
}
