import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Plan Service
 * Manages diet plans in Firestore
 * Structure: users/{userId}/plans/{planId}
 */

/**
 * Create a new diet plan
 * @param {string} userId - Dietitian's user ID
 * @param {object} planData - Plan data including title, client info, raw text
 * @returns {Promise<string>} - Created plan ID
 */
export const createPlan = async (userId, planData) => {
  try {
    const plansRef = collection(db, 'users', userId, 'plans');
    const newPlanRef = doc(plansRef);
    
    const plan = {
      ...planData,
      status: 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(newPlanRef, plan);
    return newPlanRef.id;
  } catch (error) {
    console.error('Error creating plan:', error);
    throw new Error('Failed to create plan');
  }
};

/**
 * Get a single plan by ID
 * @param {string} userId - Dietitian's user ID
 * @param {string} planId - Plan ID
 * @returns {Promise<object>} - Plan data with ID
 */
export const getPlan = async (userId, planId) => {
  try {
    const planRef = doc(db, 'users', userId, 'plans', planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      throw new Error('Plan not found');
    }

    return {
      id: planSnap.id,
      ...planSnap.data()
    };
  } catch (error) {
    console.error('Error getting plan:', error);
    throw error;
  }
};

/**
 * Get all plans for a user
 * @param {string} userId - Dietitian's user ID
 * @returns {Promise<Array>} - Array of plans
 */
export const getUserPlans = async (userId) => {
  try {
    const plansRef = collection(db, 'users', userId, 'plans');
    const q = query(plansRef, orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user plans:', error);
    throw new Error('Failed to fetch plans');
  }
};

/**
 * Update an existing plan
 * @param {string} userId - Dietitian's user ID
 * @param {string} planId - Plan ID
 * @param {object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updatePlan = async (userId, planId, updates) => {
  try {
    const planRef = doc(db, 'users', userId, 'plans', planId);
    
    await updateDoc(planRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    throw new Error('Failed to update plan');
  }
};

/**
 * Delete a plan
 * @param {string} userId - Dietitian's user ID
 * @param {string} planId - Plan ID
 * @returns {Promise<void>}
 */
export const deletePlan = async (userId, planId) => {
  try {
    const planRef = doc(db, 'users', userId, 'plans', planId);
    await deleteDoc(planRef);
  } catch (error) {
    console.error('Error deleting plan:', error);
    throw new Error('Failed to delete plan');
  }
};
