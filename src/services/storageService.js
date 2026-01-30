import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

/**
 * Storage Service
 * Handles file uploads to Firebase Storage
 * Primarily used for logo uploads during branding setup
 */

/**
 * Upload a logo file to Firebase Storage
 * @param {File} file - The logo file to upload
 * @param {string} userId - User ID for storage path
 * @returns {Promise<string>} - Download URL of uploaded file
 */
export const uploadLogo = async (file, userId) => {
  if (!file) {
    throw new Error('No file provided')
  }

  // Validate file type
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload PNG, JPG, or SVG')
  }

  // Validate file size (max 2MB)
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum 2MB allowed')
  }

  try {
    // Create storage reference
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name}`
    const storageRef = ref(storage, `logos/${userId}/${fileName}`)

    // Upload file
    console.log('📤 Uploading logo...')
    const snapshot = await uploadBytes(storageRef, file)

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log('✅ Logo uploaded successfully')

    return downloadURL
  } catch (error) {
    console.error('❌ Logo upload failed:', error)
    throw error
  }
}

/**
 * Delete a logo from Firebase Storage
 * @param {string} logoUrl - The URL of the logo to delete
 * @returns {Promise<void>}
 */
export const deleteLogo = async (logoUrl) => {
  if (!logoUrl) return

  try {
    // Extract path from URL
    const fileRef = ref(storage, logoUrl)
    await deleteObject(fileRef)
    console.log('✅ Old logo deleted')
  } catch (error) {
    console.error('❌ Logo deletion failed:', error)
    // Don't throw - it's okay if old logo deletion fails
  }
}

/**
 * Upload any file to Firebase Storage
 * Generic upload function for future use
 * @param {File} file - File to upload
 * @param {string} path - Storage path
 * @returns {Promise<string>} - Download URL
 */
export const uploadFile = async (file, path) => {
  if (!file) {
    throw new Error('No file provided')
  }

  try {
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error) {
    console.error('❌ File upload failed:', error)
    throw error
  }
}
