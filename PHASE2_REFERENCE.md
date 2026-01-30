# Phase 2 - Authentication Implementation Reference

## What Was Built

### 1. Firebase Integration
- **File:** [src/services/firebase.js](src/services/firebase.js)
- Initializes Firebase app with environment variables
- Exports `auth` and `db` instances
- Validates configuration on startup

### 2. User Service
- **File:** [src/services/userService.js](src/services/userService.js)
- `createUserProfile()` - Creates Firestore user document on first login
- `getUserProfile()` - Fetches user data from Firestore
- `updateUserProfile()` - Updates user fields
- `completeUserOnboarding()` - Marks onboarding as complete
- `userExists()` - Checks if user has a Firestore profile

### 3. Authentication Context
- **File:** [src/context/AuthContext.jsx](src/context/AuthContext.jsx)
- **State Management:**
  - `user` - Firebase auth user object
  - `userProfile` - Firestore user document data
  - `loading` - Auth state loading indicator
  - `isAuthenticated` - Boolean auth status
  - `hasCompletedOnboarding` - From Firestore profile

- **Methods:**
  - `loginWithGoogle()` - Google Sign-In with popup
  - `loginWithApple()` - Apple Sign-In with popup
  - `loginWithEmail(email, password)` - Email/Password auth (auto-creates account)
  - `logout()` - Sign out user
  - `completeOnboarding()` - Mark onboarding done

- **Features:**
  - Listens to Firebase auth state changes
  - Automatically creates Firestore profile for new users
  - Fetches and syncs user profile data
  - Persists auth state across page refreshes

### 4. Login Page
- **File:** [src/pages/auth/LoginPage.jsx](src/pages/auth/LoginPage.jsx)
- Three sign-in options with proper UI:
  - Google (with Google logo)
  - Apple (with Apple logo)
  - Email/Password form
- Loading states during authentication
- Error handling with user-friendly messages
- Automatic redirect based on onboarding status
- Responsive design with Tailwind CSS

### 5. Protected Routes
- **File:** [src/routes/ProtectedRoute.jsx](src/routes/ProtectedRoute.jsx)
- Shows loading screen while checking auth state
- Redirects to login if not authenticated
- Redirects to onboarding if not completed (when `requiresOnboarding={true}`)
- Allows access to protected content when authenticated

### 6. Updated Components

#### Header Component
- **File:** [src/components/layout/Header.jsx](src/components/layout/Header.jsx)
- Displays real user name from Firebase/Firestore
- Shows user photo if available (Google/Apple avatars)
- Logout button with proper state cleanup

#### Onboarding Page
- **File:** [src/pages/onboarding/OnboardingPage.jsx](src/pages/onboarding/OnboardingPage.jsx)
- Calls `completeOnboarding()` to update Firestore
- Redirects to dashboard after completion

### 7. Security

#### Firestore Rules
- **File:** [firestore.rules](firestore.rules)
- Users can only read/write their own profile
- Users can create their own profile on first login
- Users cannot delete profiles
- All other access denied by default

#### Backend Middleware
- **File:** [server/middleware/auth.js](server/middleware/auth.js)
- Placeholder for Firebase Admin SDK token verification
- Will be used in future phases for protected API routes
- Currently logs token but doesn't validate (Phase 2)

## Authentication Flow Diagram

```
┌─────────────┐
│   App Start │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Check Auth     │◄─── onAuthStateChanged listener
│  State          │
└────┬───────┬────┘
     │       │
     │       └─── Not Authenticated
     │            │
     │            ▼
     │       ┌─────────────┐
     │       │ /login      │
     │       └─────────────┘
     │            │
     │            ▼
     │       ┌──────────────────┐
     │       │ Sign In:         │
     │       │ - Google         │
     │       │ - Apple          │
     │       │ - Email/Password │
     │       └────────┬─────────┘
     │                │
     └─── Authenticated
          │
          ▼
     ┌────────────────┐
     │ Check if user  │
     │ exists in      │
     │ Firestore      │
     └────┬─────┬─────┘
          │     │
    NO ───┘     └─── YES
     │              │
     ▼              ▼
┌──────────┐   ┌──────────────────┐
│ Create   │   │ Load profile     │
│ Profile  │   │ from Firestore   │
└────┬─────┘   └────┬─────────────┘
     │              │
     └──────┬───────┘
            │
            ▼
     ┌──────────────────────┐
     │ Check onboarding     │
     │ status               │
     └───┬────────────┬─────┘
         │            │
    false│            │true
         │            │
         ▼            ▼
    ┌──────────┐  ┌───────────┐
    │/onboarding│  │/dashboard │
    └──────────┘  └───────────┘
```

## Data Structure

### Firebase User Object (auth.currentUser)
```javascript
{
  uid: "abc123...",
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  emailVerified: true,
  providerData: [...]
}
```

### Firestore User Profile (users/{uid})
```javascript
{
  uid: "abc123...",
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  authProvider: "google.com",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  onboardingCompleted: false,
  planExportCount: 0,
  subscriptionStatus: "free"
}
```

## Testing Checklist

### Authentication
- [ ] Google Sign-In works
- [ ] Apple Sign-In works (if configured)
- [ ] Email/Password sign-in works
- [ ] New account creation works
- [ ] Error messages display correctly
- [ ] Logout works

### User Profile
- [ ] Firestore profile created on first login
- [ ] Profile data loads correctly
- [ ] User info displays in header
- [ ] Profile photo shows (if available)

### Routing & Flow
- [ ] Unauthenticated users redirected to /login
- [ ] First-time users redirected to /onboarding
- [ ] Onboarding completion updates Firestore
- [ ] After onboarding, users redirect to /dashboard
- [ ] Returning users skip onboarding
- [ ] Protected routes enforce authentication

### Security
- [ ] Firestore rules deployed
- [ ] Users can only access own data
- [ ] Unauthorized access denied
- [ ] Auth state persists on refresh

## Environment Setup Required

1. **Firebase Project:** Create at console.firebase.google.com
2. **Auth Providers:** Enable Google, Apple, Email/Password
3. **Firestore:** Create database and deploy rules
4. **Environment Variables:** Configure `.env` file
5. **Authorized Domains:** Add localhost to Firebase

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed instructions.

## Common Issues & Solutions

### "Firebase is not fully configured"
- Check `.env` file exists and has valid Firebase credentials
- Restart dev server after updating `.env`

### "Popup blocked" during Google/Apple sign-in
- Allow popups for localhost in browser
- Or implement redirect flow instead of popup

### "Missing permissions" in Firestore
- Deploy security rules from `firestore.rules`
- Check user is authenticated before Firestore operations

### User profile not loading
- Check Firestore database is created
- Verify security rules allow user to read own document
- Check browser console for errors

## Next Steps (Phase 3)

With authentication complete, Phase 3 can implement:
- Actual onboarding data collection and storage
- PDF upload and parsing
- Meal plan creation and storage
- Client management
- Subscription/billing integration
- User settings and preferences
