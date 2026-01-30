import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

/**
 * User Service
 * Manages user profiles in Firestore
 */

/**
 * Create a new dietitian profile in Firestore
 * Called only on first login
 * 
 * @param {Object} userData - User data from Firebase Auth
 * @returns {Promise<void>}
 */
export const createUserProfile = async (userData) => {
  const { uid, email, displayName, photoURL, providerData } = userData

  // Determine auth provider
  const authProvider = providerData[0]?.providerId || 'email'

  const userProfile = {
    uid,
    email,
    displayName: displayName || email?.split('@')[0] || 'Dietitian',
    photoURL: photoURL || null,
    authProvider,
    role: 'dietitian',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    onboardingCompleted: false,
    brandingSettings: {
      businessName: '',
      logo: '',
      primaryColor: '#22c55e',
      footerText: '',
    },
    planExportCount: 0,
    subscriptionStatus: 'free',
  }

  try {
    const userRef = doc(db, 'users', uid)
    await setDoc(userRef, userProfile, { merge: false })
    console.log('✅ Dietitian profile created:', uid)
    return userProfile
  } catch (error) {
    console.error('❌ Error creating dietitian profile:', error)
    throw error
  }
}

/**
 * Get user profile from Firestore
 * 
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>}
 */
export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return userSnap.data()
    } else {
      console.log('No user profile found for:', uid)
      return null
    }
  } catch (error) {
    console.error('❌ Error fetching user profile:', error)
    throw error
  }
}

/**
 * Update user profile in Firestore
 * 
 * @param {string} uid - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (uid, updates) => {
  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
    console.log('✅ User profile updated:', uid)
  } catch (error) {
    console.error('❌ Error updating user profile:', error)
    throw error
  }
}

/**
 * Mark onboarding as completed
 * 
 * @param {string} uid - User ID
 * @returns {Promise<void>}
 */
export const completeUserOnboarding = async (uid) => {
  return updateUserProfile(uid, { onboardingCompleted: true })
}

/**
 * Check if user exists in Firestore
 * 
 * @param {string} uid - User ID
 * @returns {Promise<boolean>}
 */
export const userExists = async (uid) => {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)
  return userSnap.exists()
}
