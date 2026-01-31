import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDietitianClients } from '../../services/clientService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function ClientsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClients();
  }, [user]);

  const loadClients = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const clientList = await getDietitianClients(user.uid);
      setClients(clientList);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          🏠 Dashboard
        </Button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-1">Manage your client profiles</p>
          </div>
          <Button onClick={() => navigate('/clients/new')}>
            + Add New Client
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && clients.length === 0 && (
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400 mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No clients yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first client profile.
            </p>
            <Button onClick={() => navigate('/clients/new')}>
              Add Your First Client
            </Button>
          </div>
        </Card>
      )}

      {/* Client List */}
      {clients.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card 
              key={client.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/clients/${client.id}`)}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {client.fullName || 'Unnamed Client'}
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  {client.age && (
                    <div className="flex items-center">
                      <span className="font-medium w-20">Age:</span>
                      <span>{client.age} years</span>
                    </div>
                  )}
                  
                  {client.gender && (
                    <div className="flex items-center">
                      <span className="font-medium w-20">Gender:</span>
                      <span className="capitalize">{client.gender}</span>
                    </div>
                  )}
                  
                  {client.goals && (
                    <div className="mt-3">
                      <span className="font-medium block mb-1">Primary Goal:</span>
                      <p className="text-gray-700 line-clamp-2">{client.goals}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    Added {client.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
