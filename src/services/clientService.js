import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Client Service
 * Manages client profiles in Firestore
 * Structure: clients/{clientId}
 */

/**
 * Create a new client
 * @param {string} dietitianId - Dietitian's user ID
 * @param {object} clientData - Client information
 * @returns {Promise<string>} - Created client ID
 */
export const createClient = async (dietitianId, clientData) => {
  try {
    const clientsRef = collection(db, 'clients');
    const newClientRef = doc(clientsRef);
    
    const client = {
      dietitianId,
      fullName: clientData.fullName || '',
      age: clientData.age || '',
      gender: clientData.gender || '',
      height: clientData.height || '',
      weight: clientData.weight || '',
      medicalConditions: clientData.medicalConditions || [],
      allergies: clientData.allergies || [],
      goals: clientData.goals || '',
      notes: clientData.notes || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(newClientRef, client);
    console.log('✅ Client created:', newClientRef.id);
    return newClientRef.id;
  } catch (error) {
    console.error('❌ Error creating client:', error);
    throw new Error('Failed to create client');
  }
};

/**
 * Get a single client by ID
 * @param {string} clientId - Client ID
 * @returns {Promise<object>} - Client data with ID
 */
export const getClient = async (clientId) => {
  try {
    const clientRef = doc(db, 'clients', clientId);
    const clientSnap = await getDoc(clientRef);

    if (!clientSnap.exists()) {
      throw new Error('Client not found');
    }

    return {
      id: clientSnap.id,
      ...clientSnap.data()
    };
  } catch (error) {
    console.error('❌ Error getting client:', error);
    throw error;
  }
};

/**
 * Get all clients for a dietitian
 * @param {string} dietitianId - Dietitian's user ID
 * @returns {Promise<Array>} - Array of clients
 */
export const getDietitianClients = async (dietitianId) => {
  try {
    const clientsRef = collection(db, 'clients');
    const q = query(
      clientsRef, 
      where('dietitianId', '==', dietitianId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('❌ Error getting dietitian clients:', error);
    throw new Error('Failed to fetch clients');
  }
};

/**
 * Update an existing client
 * @param {string} clientId - Client ID
 * @param {object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateClient = async (clientId, updates) => {
  try {
    const clientRef = doc(db, 'clients', clientId);
    
    await updateDoc(clientRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Client updated:', clientId);
  } catch (error) {
    console.error('❌ Error updating client:', error);
    throw new Error('Failed to update client');
  }
};

/**
 * Delete a client
 * @param {string} clientId - Client ID
 * @returns {Promise<void>}
 */
export const deleteClient = async (clientId) => {
  try {
    const clientRef = doc(db, 'clients', clientId);
    await deleteDoc(clientRef);
    console.log('✅ Client deleted:', clientId);
  } catch (error) {
    console.error('❌ Error deleting client:', error);
    throw new Error('Failed to delete client');
  }
};
