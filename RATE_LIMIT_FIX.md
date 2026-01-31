# OpenAI Rate Limit Fix Guide

## 🚨 Error: "AI service rate limit exceeded"

This error (HTTP 429) means you've hit OpenAI's usage limits.

---

## ✅ Immediate Solutions

### 1. Check Your OpenAI Usage
1. Go to: https://platform.openai.com/usage
2. Check your current usage and limits
3. Verify your billing status

### 2. Check Your Rate Limits
Visit: https://platform.openai.com/account/limits

**Common Limits:**
- **Free Tier:** 3 requests/minute, 200 requests/day
- **Tier 1:** 500 requests/minute
- **Tier 2:** 5,000 requests/minute

### 3. Wait and Retry
- Rate limits reset automatically
- Free tier: Wait 1-3 minutes
- Paid tier: Wait 20-60 seconds

---

## 🔧 Prevent Future Rate Limits

### Option A: Add Billing (Recommended)
1. Go to: https://platform.openai.com/account/billing
2. Add a payment method
3. Set a spending limit (e.g., $10/month)
4. **Benefit:** Much higher rate limits

### Option B: Implement Rate Limiting in Frontend

Add a cooldown between generations:

```javascript
// In DietPlanCreatePage.jsx
const [lastGeneration, setLastGeneration] = useState(null);

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Check if last generation was less than 60 seconds ago
  if (lastGeneration && Date.now() - lastGeneration < 60000) {
    const waitTime = Math.ceil((60000 - (Date.now() - lastGeneration)) / 1000);
    setError(`Please wait ${waitTime} seconds before generating another plan`);
    return;
  }
  
  // ... rest of generation code
  setLastGeneration(Date.now());
};
```

### Option C: Use GPT-3.5-Turbo (Cheaper, Higher Limits)

Change in `api/generate-plan.js`:

```javascript
// Line 133
const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo', // Changed from 'gpt-4o'
  // ... rest of config
});
```

**Trade-off:**
- ✅ 10x cheaper
- ✅ Higher rate limits
- ⚠️ Slightly lower quality output

---

## 📊 Current Configuration

Your app uses:
- **Model:** GPT-4o
- **Max Tokens:** 3,000 per request
- **Cost:** ~$0.03-0.05 per plan

---

## ⚡ Quick Fix Right Now

**Just wait 2-3 minutes and try again.** The rate limit will reset automatically.

---

## 🎯 Recommended Setup

1. **Add billing to OpenAI account** ($5 minimum)
2. **Set monthly budget** (e.g., $10/month = ~200 diet plans)
3. **Monitor usage** at https://platform.openai.com/usage

With billing enabled, you get:
- **500 requests/minute** (vs 3/minute free)
- **10,000 requests/day** (vs 200/day free)
- Much more reliable service

---

## 🔍 Check If You're on Free Tier

Run this in your OpenAI dashboard:
1. Go to: https://platform.openai.com/account/billing/overview
2. Check "Current plan"
3. If it says "Free trial" → You need to add billing

---

## 💡 Tips

- **Don't spam generate:** Wait for each plan to complete
- **Test with small inputs:** Shorter plans = fewer tokens = cheaper
- **Use gpt-3.5-turbo for testing:** Switch to gpt-4o for production

---

## ✅ Verification

After waiting, test with:
1. Refresh the page
2. Select a client
3. Add raw input
4. Click "Generate Diet Plan"
5. Should work if rate limit has reset

---

**Current Status:** Rate limit exceeded - WAIT 2-3 minutes then try again.
