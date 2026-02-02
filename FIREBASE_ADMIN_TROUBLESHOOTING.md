# Firebase Admin Troubleshooting Guide

## Current Error: "Unexpected token 'A'... is not valid JSON"

This error means the Vercel serverless function is crashing before it can return JSON.

---

## 🔍 Step 1: Check Vercel Function Logs

1. Go to: https://vercel.com → Your Project
2. Click **"Deployments"** → Latest deployment
3. Click **"Functions"** tab
4. Find `api/generate-plan`
5. Check the **error logs**

**Look for errors like:**
- "Cannot find module 'firebase-admin'"
- "Private key must be a string"
- "Invalid service account"

---

## 🔧 Step 2: Verify Environment Variables

Go to Vercel → Settings → Environment Variables and verify:

### **FIREBASE_PROJECT_ID**
- Should be a simple string like: `nutriplan-pro-12345`
- No quotes, no special characters

### **FIREBASE_CLIENT_EMAIL**  
- Should look like: `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`
- No quotes

### **FIREBASE_PRIVATE_KEY**
- **Most common issue!**
- Should be **ONE LONG LINE** starting with:
  ```
  -----BEGIN PRIVATE KEY-----\nMIIEvQI...
  ```
- The `\n` should be **literal characters** (backslash + n), not actual newlines
- Should end with: `...\n-----END PRIVATE KEY-----\n`

**Test the format:**
Open your Firebase service account JSON file and look at the `private_key` field:

```json
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIB...AAAA==\n-----END PRIVATE KEY-----\n"
```

Copy **everything between the outer quotes** (including all `\n` characters) and paste into Vercel.

---

## 🐛 Common Issues & Fixes:

### **Issue 1: Line breaks instead of \n**
❌ **Wrong:**
```
-----BEGIN PRIVATE KEY-----
MIIEvQI...
-----END PRIVATE KEY-----
```

✅ **Correct:**
```
-----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n
```

### **Issue 2: Missing \n at the end**
The key must end with `\n` after `-----END PRIVATE KEY-----`

### **Issue 3: Extra quotes**
Don't add extra quotes in Vercel. Paste the raw key string.

### **Issue 4: Escaped backslashes**
Some text editors might show `\\n` instead of `\n`. Make sure it's just `\n` (one backslash).

---

## ✅ Step 3: Test Firebase Admin Locally

Create a test file to verify your credentials work:

```javascript
// test-firebase.js
const admin = require('firebase-admin');

const serviceAccount = require('./path-to-your-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

console.log('✅ Firebase Admin initialized successfully!');
```

Run: `node test-firebase.js`

If this works, your credentials are valid.

---

## 🔄 Step 4: Alternative Method (If Still Failing)

Instead of pasting the private key, try this in Vercel:

1. **Delete** `FIREBASE_PRIVATE_KEY` variable
2. **Upload the entire JSON file** as a secret:
   - Go to Vercel → Settings → Environment Variables
   - Click "Add" → "Secret"
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Paste the **entire JSON file content**

Then update `api/generate-plan.js`:

```javascript
// Option 2: Using full service account JSON
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({
    credential: cert(serviceAccount)
  });
}
```

---

## 📊 Step 5: Check Deployment Status

After fixing the environment variable:
1. **Redeploy** the app (Deployments → "..." → Redeploy)
2. **Wait** for deployment to complete (1-2 minutes)
3. **Check logs** immediately after trying to generate a plan
4. **Clear browser cache** and try again

---

## 🆘 Still Not Working?

**Check these:**
1. ✅ All 4 environment variables are set (GEMINI_API_KEY + 3 Firebase vars)
2. ✅ All variables apply to Production, Preview, AND Development
3. ✅ You've redeployed after adding variables
4. ✅ The Firebase service account has "Cloud Datastore User" role
5. ✅ Firestore database is created (not just Realtime Database)

**Check Vercel logs for the specific error message!**
