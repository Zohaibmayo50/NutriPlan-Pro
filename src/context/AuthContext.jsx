import { createContext, useContext, useState, useEffect } from 'react'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from 'firebase/auth'
import { auth } from '../services/firebase'
import {
  createUserProfile,
  getUserProfile,
  userExists,
  completeUserOnboarding,
} from '../services/userService'

/**
 * Authentication Context
 * Manages user authentication state with Firebase
 * Handles user profile creation and onboarding status
 */
const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  /**
   * Initialize auth state listener
   * Listens for Firebase auth state changes
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser(firebaseUser)
        setIsAuthenticated(true)

        try {
          // Check if user profile exists in Firestore
          const exists = await userExists(firebaseUser.uid)

          if (!exists) {
            // First time login - create profile
            console.log('🆕 First-time user detected. Creating profile...')
            await createUserProfile(firebaseUser)
          }

          // Fetch user profile
          const profile = await getUserProfile(firebaseUser.uid)
          setUserProfile(profile)
        } catch (error) {
          console.error('Error loading user profile:', error)
        }
      } else {
        // User is signed out
        setUser(null)
        setUserProfile(null)
        setIsAuthenticated(false)
      }
      setLoading(false)
    })

    // Cleanup subscription
    return () => unsubscribe()
  }, [])

  /**
   * Sign in with Google
   */
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      return { success: true, user: result.user }
    } catch (error) {
      console.error('Google sign-in error:', error)
      return { success: false, error: error.message }
    }
  }



  /**
   * Sign in with Email and Password
   * Attempts login first, creates account if doesn't exist
   */
  const loginWithEmail = async (email, password) => {
    try {
      // Try to sign in
      const result = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: result.user }
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // User doesn't exist - create new account
        try {
          const result = await createUserWithEmailAndPassword(auth, email, password)
          return { success: true, user: result.user, isNewUser: true }
        } catch (createError) {
          console.error('Account creation error:', createError)
          return { success: false, error: createError.message }
        }
      } else {
        console.error('Email sign-in error:', error)
        return { success: false, error: error.message }
      }
    }
  }

  /**
   * Sign out user
   */
  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setUserProfile(null)
      setIsAuthenticated(false)
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Complete onboarding process
   * Updates Firestore user profile
   */
  const completeOnboarding = async () => {
    if (!user) return { success: false, error: 'No user logged in' }

    try {
      console.log('Completing onboarding for user:', user.uid)
      await completeUserOnboarding(user.uid)
      
      // Fetch fresh profile from Firestore to ensure state is synchronized
      const updatedProfile = await getUserProfile(user.uid)
      setUserProfile(updatedProfile)
      
      console.log('Onboarding completed, updated profile:', updatedProfile)
      return { success: true }
    } catch (error) {
      console.error('Onboarding completion error:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    isAuthenticated,
    hasCompletedOnboarding: userProfile?.onboardingCompleted || false,
    loginWithGoogle,
    loginWithEmail,
    logout,
    completeOnboarding,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
