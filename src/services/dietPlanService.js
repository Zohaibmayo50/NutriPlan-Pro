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
 * Diet Plan Service
 * Manages diet plans in Firestore
 * Structure: dietPlans/{planId}
 */

/**
 * Create a new diet plan
 * @param {string} dietitianId - Dietitian's user ID
 * @param {string} clientId - Client ID
 * @param {object} planData - Plan information
 * @returns {Promise<string>} - Created plan ID
 */
export const createDietPlan = async (dietitianId, clientId, planData) => {
  try {
    const plansRef = collection(db, 'dietPlans');
    const newPlanRef = doc(plansRef);
    
    const plan = {
      dietitianId,
      clientId,
      title: planData.title || '',
      rawInput: planData.rawInput || '',
      generatedPlan: planData.generatedPlan || null,
      status: planData.status || 'draft',
      notes: planData.notes || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(newPlanRef, plan);
    console.log('✅ Diet plan created:', newPlanRef.id);
    return newPlanRef.id;
  } catch (error) {
    console.error('❌ Error creating diet plan:', error);
    throw new Error('Failed to create diet plan');
  }
};

/**
 * Get a single diet plan by ID
 * @param {string} planId - Plan ID
 * @returns {Promise<object>} - Plan data with ID
 */
export const getDietPlan = async (planId) => {
  try {
    const planRef = doc(db, 'dietPlans', planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      throw new Error('Diet plan not found');
    }

    return {
      id: planSnap.id,
      ...planSnap.data()
    };
  } catch (error) {
    console.error('❌ Error getting diet plan:', error);
    throw error;
  }
};

/**
 * Get all diet plans for a client
 * @param {string} clientId - Client ID
 * @returns {Promise<Array>} - Array of diet plans
 */
export const getClientDietPlans = async (clientId) => {
  try {
    const plansRef = collection(db, 'dietPlans');
    const q = query(
      plansRef, 
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('❌ Error getting client diet plans:', error);
    throw new Error('Failed to fetch diet plans');
  }
};

/**
 * Get all diet plans for a dietitian
 * @param {string} dietitianId - Dietitian's user ID
 * @returns {Promise<Array>} - Array of diet plans
 */
export const getDietitianDietPlans = async (dietitianId) => {
  try {
    const plansRef = collection(db, 'dietPlans');
    const q = query(
      plansRef, 
      where('dietitianId', '==', dietitianId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('❌ Error getting dietitian diet plans:', error);
    throw new Error('Failed to fetch diet plans');
  }
};

/**
 * Update an existing diet plan
 * @param {string} planId - Plan ID
 * @param {object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateDietPlan = async (planId, updates) => {
  try {
    const planRef = doc(db, 'dietPlans', planId);
    
    await updateDoc(planRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Diet plan updated:', planId);
  } catch (error) {
    console.error('❌ Error updating diet plan:', error);
    throw new Error('Failed to update diet plan');
  }
};

/**
 * Delete a diet plan
 * @param {string} planId - Plan ID
 * @returns {Promise<void>}
 */
export const deleteDietPlan = async (planId) => {
  try {
    const planRef = doc(db, 'dietPlans', planId);
    await deleteDoc(planRef);
    console.log('✅ Diet plan deleted:', planId);
  } catch (error) {
    console.error('❌ Error deleting diet plan:', error);
    throw new Error('Failed to delete diet plan');
  }
};
