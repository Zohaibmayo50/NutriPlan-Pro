import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * AI Usage Tracking Service
 * Tracks daily AI generation usage per dietitian
 * Free tier limit: 3 generations per day
 */

const DAILY_LIMIT = 3;

/**
 * Get today's date string (UTC)
 */
const getTodayDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
};

/**
 * Get AI usage for a specific user and date
 * @param {string} userId - Dietitian's user ID
 * @returns {Promise<{generationsUsed: number, limit: number, remaining: number}>}
 */
export const getAIUsage = async (userId) => {
  try {
    const today = getTodayDate();
    const usageRef = doc(db, 'aiUsage', `${userId}_${today}`);
    const usageDoc = await getDoc(usageRef);

    if (!usageDoc.exists()) {
      return {
        generationsUsed: 0,
        limit: DAILY_LIMIT,
        remaining: DAILY_LIMIT
      };
    }

    const data = usageDoc.data();
    const used = data.generationsUsed || 0;

    return {
      generationsUsed: used,
      limit: DAILY_LIMIT,
      remaining: Math.max(0, DAILY_LIMIT - used)
    };
  } catch (error) {
    console.error('Error fetching AI usage:', error);
    throw error;
  }
};

/**
 * Check if user can generate AI content
 * @param {string} userId - Dietitian's user ID
 * @returns {Promise<{allowed: boolean, remaining: number, message?: string}>}
 */
export const canGenerateAI = async (userId) => {
  try {
    const usage = await getAIUsage(userId);

    if (usage.remaining <= 0) {
      return {
        allowed: false,
        remaining: 0,
        message: 'Daily AI generation limit reached (3/3). Please try again tomorrow.'
      };
    }

    return {
      allowed: true,
      remaining: usage.remaining
    };
  } catch (error) {
    console.error('Error checking AI usage:', error);
    throw error;
  }
};

/**
 * Increment AI usage counter
 * @param {string} userId - Dietitian's user ID
 * @returns {Promise<{generationsUsed: number, remaining: number}>}
 */
export const incrementAIUsage = async (userId) => {
  try {
    const today = getTodayDate();
    const usageRef = doc(db, 'aiUsage', `${userId}_${today}`);
    const usageDoc = await getDoc(usageRef);

    if (!usageDoc.exists()) {
      // Create new usage record
      await setDoc(usageRef, {
        userId,
        date: today,
        generationsUsed: 1,
        lastUpdated: serverTimestamp()
      });

      return {
        generationsUsed: 1,
        remaining: DAILY_LIMIT - 1
      };
    }

    // Update existing record
    const currentUsed = usageDoc.data().generationsUsed || 0;
    const newUsed = currentUsed + 1;

    await updateDoc(usageRef, {
      generationsUsed: newUsed,
      lastUpdated: serverTimestamp()
    });

    return {
      generationsUsed: newUsed,
      remaining: Math.max(0, DAILY_LIMIT - newUsed)
    };
  } catch (error) {
    console.error('Error incrementing AI usage:', error);
    throw error;
  }
};
