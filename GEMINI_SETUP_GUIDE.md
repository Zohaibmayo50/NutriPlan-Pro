# Switch to Google Gemini API - Setup Guide

## 🎯 Why Gemini?

- ✅ **Free tier:** 60 requests/minute (vs OpenAI's 3/minute)
- ✅ **No credit card required** for free tier
- ✅ **High quality** output (Gemini 1.5 Flash)
- ✅ **Cost-effective** for production

---

## 📋 Step 1: Get Gemini API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Click **"Get API Key"** or **"Create API Key"**
3. Select **"Create API key in new project"** (or use existing project)
4. Copy your API key (starts with `AIza...`)

**Important:** Keep this key secure! Don't share it publicly.

---

## 🔧 Step 2: Add API Key to Vercel

1. Go to your Vercel dashboard: https://vercel.com
2. Select your project: **NutriPlan-Pro**
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Your API key (paste the key you copied)
   - **Apply to:** Production, Preview, Development (check all)
5. Click **Save**
6. **Redeploy** your app (Settings → Deployments → click "..." → Redeploy)

---

## � Step 3: Setup Firebase Admin (Required for Usage Tracking)

### **Get Firebase Service Account Credentials:**

1. Go to **Firebase Console**: https://console.firebase.google.com
2. Select your project: **NutriPlan-Pro**
3. Click the **gear icon** (⚙️) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **"Generate New Private Key"**
6. Click **"Generate Key"** in the popup
7. A JSON file will download - **keep this file secure!**

### **Add Firebase Admin Credentials to Vercel:**

Open the downloaded JSON file. It will look like this:

```json
{
  "project_id": "your-project-id",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----"
}
```

Now go to **Vercel** → **Settings** → **Environment Variables** and add these 3 variables:

#### **Variable 1:**
- **Name:** `FIREBASE_PROJECT_ID`
- **Value:** Copy from JSON `project_id`
- **Example:** `nutriplan-pro-12345`

#### **Variable 2:**
- **Name:** `FIREBASE_CLIENT_EMAIL`
- **Value:** Copy from JSON `client_email`
- **Example:** `firebase-adminsdk-xxxxx@nutriplan-pro.iam.gserviceaccount.com`

#### **Variable 3:**
- **Name:** `FIREBASE_PRIVATE_KEY`
- **Value:** Copy from JSON `private_key` (entire key including BEGIN and END)
- **Important:** Keep the `\n` characters - they are needed!
- **Example:** `-----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n`

**For all 3 variables:**
- ✅ Check: Production
- ✅ Check: Preview  
- ✅ Check: Development

Click **Save** after adding each one.

### **Redeploy Your App:**

After adding all environment variables:
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **"..."** (three dots) → **"Redeploy"**
4. Wait 1-2 minutes for deployment to complete

---

## 💻 Step 4: Local Development Setup

Add to your `.env.local` file (create if doesn't exist):

```bash
GEMINI_API_KEY=your_api_key_here
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----"
```

**Note:** This file is ignored by Git (in .gitignore) so your keys stay secure.

---

## ✅ What's Been Changed

The following files have been updated:
- ✅ `api/generate-plan.js` - Switched from OpenAI to Gemini
- ✅ `package.json` - Replaced `openai` with `@google/generative-ai`

---

## 🧪 Testing

After deployment:
1. Open your app
2. Create a diet plan
3. Click "Generate Diet Plan"
4. Should work instantly (no rate limits on free tier!)

---

## 📊 Gemini Free Tier Limits

| Feature | Free Tier |
|---------|-----------|
| Requests/minute | 60 |
| Requests/day | 1,500 |
| Tokens/minute | 1,000,000 |
| Cost | **FREE** |

**No credit card required!**

---

## 🔄 Model Comparison

| Feature | OpenAI GPT-3.5 | Gemini 1.5 Flash |
|---------|----------------|------------------|
| Quality | Excellent | Excellent |
| Speed | Fast | Very Fast |
| Cost (Free Tier) | 3 req/min | 60 req/min |
| Context Window | 16k tokens | 1M tokens |
| Rate Limits | Strict | Generous |

---

## 🐛 Troubleshooting

### "API key not valid"
- Double-check the key in Vercel environment variables
- Make sure it starts with `AIza`
- Redeploy after adding the key

### "Still getting OpenAI errors"
- Clear browser cache
- Wait for Vercel deployment to complete
- Check deployment logs in Vercel dashboard

### "Generation fails"
- Check Vercel function logs
- Verify `GEMINI_API_KEY` is set correctly
- Try regenerating API key if needed

---

## 📞 Support Resources

- **Gemini API Docs:** https://ai.google.dev/docs
- **API Key Management:** https://aistudio.google.com/app/apikey
- **Rate Limits:** https://ai.google.dev/pricing

---

**Status:** Ready to use!  
**Remember:** After adding environment variables, you must redeploy for them to take effect!
