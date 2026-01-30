import { doc, updateDoc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

/**
 * Branding Service
 * Manages dietitian branding settings in Firestore
 */

/**
 * Save branding settings to Firestore
 * Creates/updates branding subdocument under user
 * 
 * @param {string} userId - User ID
 * @param {Object} brandingData - Branding settings
 * @returns {Promise<void>}
 */
export const saveBrandingSettings = async (userId, brandingData) => {
  try {
    const brandingRef = doc(db, 'users', userId, 'branding', 'settings')
    
    const brandingDocument = {
      ...brandingData,
      updatedAt: serverTimestamp(),
    }

    await setDoc(brandingRef, brandingDocument, { merge: true })
    console.log('✅ Branding settings saved')
  } catch (error) {
    console.error('❌ Error saving branding settings:', error)
    throw error
  }
}

/**
 * Get branding settings from Firestore
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>}
 */
export const getBrandingSettings = async (userId) => {
  try {
    const brandingRef = doc(db, 'users', userId, 'branding', 'settings')
    const brandingSnap = await getDoc(brandingRef)

    if (brandingSnap.exists()) {
      return brandingSnap.data()
    }
    return null
  } catch (error) {
    console.error('❌ Error fetching branding settings:', error)
    throw error
  }
}

/**
 * Update specific branding fields
 * 
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateBrandingSettings = async (userId, updates) => {
  try {
    const brandingRef = doc(db, 'users', userId, 'branding', 'settings')
    await updateDoc(brandingRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
    console.log('✅ Branding settings updated')
  } catch (error) {
    console.error('❌ Error updating branding settings:', error)
    throw error
  }
}

/**
 * Get default branding settings
 * Returns fallback values if no branding exists
 * 
 * @returns {Object}
 */
export const getDefaultBrandingSettings = () => {
  return {
    businessName: '',
    tagline: '',
    logoUrl: '',
    primaryColor: '#22c55e',
    secondaryColor: '#16a34a',
    fontFamily: 'Inter',
    headerSettings: {
      showLogo: true,
      logoAlignment: 'left',
      showBusinessName: true,
    },
    footerSettings: {
      phone: '',
      email: '',
      website: '',
      socialLinks: {
        instagram: '',
        facebook: '',
        linkedin: '',
      },
      disclaimerText: 'This meal plan is personalized for your specific needs. Consult your healthcare provider before making dietary changes.',
    },
  }
}
