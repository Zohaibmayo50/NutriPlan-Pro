# Firebase Setup Guide - Phase 2

This guide will help you set up Firebase Authentication and Firestore for NutriPlan Pro.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `nutriplan-pro` (or your preferred name)
4. Disable Google Analytics (optional for this project)
5. Click **"Create project"**

## Step 2: Register Web App

1. In your Firebase project, click the **Web icon** (</>) to add a web app
2. Enter app nickname: `NutriPlan Pro Web`
3. **Do NOT** check "Set up Firebase Hosting" (we're using Vite)
4. Click **"Register app"**
5. Copy the configuration values (you'll need these for `.env`)

## Step 3: Enable Authentication Methods

1. In Firebase Console, navigate to **Build > Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable the following providers:

### Google Sign-In
- Click **"Google"**
- Toggle **"Enable"**
- Select project support email
- Click **"Save"**

### Apple Sign-In
- Click **"Apple"**
- Toggle **"Enable"**
- Add your Apple Developer Team ID and Service ID (if you have an Apple Developer account)
- Click **"Save"**
- *Note: Apple sign-in requires additional setup with Apple Developer. For testing, you can skip this and focus on Google/Email.*

### Email/Password
- Click **"Email/Password"**
- Toggle **"Enable"**
- Click **"Save"**

## Step 4: Create Firestore Database

1. In Firebase Console, navigate to **Build > Firestore Database**
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll apply proper rules next)
4. Choose a Cloud Firestore location (select closest to your users)
5. Click **"Enable"**

## Step 5: Deploy Firestore Security Rules

1. In Firestore Database, go to the **"Rules"** tab
2. Replace the default rules with the contents of `firestore.rules` from the project root
3. Click **"Publish"**

Alternatively, use Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

## Step 6: Configure Environment Variables

1. Copy `.env.example` to `.env` in the project root:
```bash
cp .env.example .env
```

2. Fill in your Firebase configuration from Step 2:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=nutriplan-pro.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nutriplan-pro
VITE_FIREBASE_STORAGE_BUCKET=nutriplan-pro.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Step 7: Test Authentication

1. Start the development server:
```bash
npm run dev
```

2. Open http://localhost:3000

3. Try signing in with:
   - **Email/Password**: Enter any email and password (account will be created automatically)
   - **Google**: Click "Continue with Google" button

4. Check Firestore Database:
   - Navigate to **Firestore Database > Data**
   - You should see a `users` collection
   - Your user document should appear with all profile fields

## Firestore Data Structure

### Users Collection
```
users/{uid}
  - uid: string
  - email: string
  - displayName: string
  - photoURL: string | null
  - authProvider: string
  - createdAt: timestamp
  - updatedAt: timestamp
  - onboardingCompleted: boolean
  - planExportCount: number
  - subscriptionStatus: string
```

## Security Rules Summary

- ✅ Users can only read/write their own profile
- ✅ User profiles can be created on first login
- ✅ Users cannot delete their own profile
- ✅ All other access is denied by default

## Troubleshooting

### Error: "Firebase not configured"
- Make sure your `.env` file exists and contains valid Firebase credentials
- Restart the dev server after changing `.env` files

### Error: "Unauthorized domain"
- Go to Firebase Console > Authentication > Settings > Authorized domains
- Add `localhost` and your production domain

### Error: "Missing or insufficient permissions"
- Check that Firestore security rules are deployed correctly
- Verify user is authenticated before accessing Firestore

### Google Sign-In Popup Blocked
- Allow popups for localhost in your browser
- Or use redirect method instead of popup (code modification needed)

## What's Next?

Phase 2 is complete! You now have:
- ✅ Real Firebase authentication
- ✅ User profiles in Firestore
- ✅ Protected routes with onboarding flow
- ✅ Google, Apple, and Email/Password sign-in

Ready for Phase 3: Business logic and features!
