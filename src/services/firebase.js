import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

/**
 * Firebase Configuration
 * Initialize Firebase app with environment variables
 * 
 * Setup Instructions:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Authentication > Sign-in methods: Google, Apple, Email/Password
 * 3. Create Firestore Database
 * 4. Copy your config values to .env file
 * 5. Deploy Firestore security rules from firestore.rules
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Validate configuration
const isConfigured = Object.values(firebaseConfig).every(
  value => value && value !== 'your_api_key_here' && value !== 'your_project_id'
)

if (!isConfigured) {
  console.warn(
    '⚠️ Firebase is not fully configured. Please update your .env file with actual Firebase credentials.'
  )
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
