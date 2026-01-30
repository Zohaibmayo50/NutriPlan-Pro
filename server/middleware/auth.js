/**
 * Firebase Auth Middleware (Placeholder)
 * 
 * This middleware will verify Firebase ID tokens on protected API routes
 * To be fully implemented when backend authentication is needed
 * 
 * Usage in future phases:
 * - Add to protected routes: app.use('/api/plans', verifyFirebaseToken, planRoutes)
 * - Extract user info from token: req.user = decodedToken
 */

/**
 * Verify Firebase ID token
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
export const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authorization token provided'
      })
    }

    const idToken = authHeader.split('Bearer ')[1]

    // TODO: Implement Firebase Admin SDK token verification
    // const admin = require('firebase-admin')
    // const decodedToken = await admin.auth().verifyIdToken(idToken)
    // req.user = decodedToken
    // next()

    // Placeholder: For Phase 2, just pass through
    console.log('⚠️ Firebase token verification not yet implemented')
    console.log('Token received:', idToken.substring(0, 20) + '...')
    
    // Mock user data
    req.user = {
      uid: 'mock-user-id',
      email: 'mock@example.com'
    }
    
    next()
  } catch (error) {
    console.error('Token verification error:', error)
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or expired token'
    })
  }
}

/**
 * Optional auth middleware
 * Verifies token if present, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1]
      
      // TODO: Implement token verification
      req.user = {
        uid: 'mock-user-id',
        email: 'mock@example.com'
      }
    }
    
    next()
  } catch (error) {
    // Silently fail - user remains unauthenticated
    next()
  }
}
