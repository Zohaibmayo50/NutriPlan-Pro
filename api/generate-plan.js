// No SDK import needed - using direct fetch to Gemini API
import * as admin from 'firebase-admin';

/**
 * Vercel Serverless Function - AI Diet Plan Generation
 * POST /api/generate-plan
 * Using Google Gemini API with Free Tier Usage Limits
 */

// Free tier daily limit
const DAILY_LIMIT = 3;

/**
 * Initialize Firebase Admin (lazy initialization)
 */
const initializeFirebaseAdmin = () => {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      return admin.firestore();
    }

    // Log environment variables (without exposing full values)
    console.log('🔍 Checking Firebase credentials...');
    console.log('  project_id:', process.env.project_id ? '✓ Set' : '✗ Missing');
    console.log('  client_email:', process.env.client_email ? '✓ Set' : '✗ Missing');
    console.log('  private_key:', process.env.private_key ? `✓ Set (${process.env.private_key.length} chars)` : '✗ Missing');
    
    if (!process.env.project_id || !process.env.client_email || !process.env.private_key) {
      throw new Error('Missing Firebase environment variables');
    }

    const privateKey = process.env.private_key.replace(/\\n/g, '\n');
    
    // Validate private key format
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('private_key does not contain BEGIN marker');
    }
    if (!privateKey.includes('-----END PRIVATE KEY-----')) {
      throw new Error('private_key does not contain END marker');
    }
    
    console.log('🔥 Initializing Firebase Admin...');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.project_id,
        clientEmail: process.env.client_email,
        privateKey: privateKey
      })
    });
    console.log('✅ Firebase Admin initialized successfully');
    
    return admin.firestore();
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    console.error('❌ Full error:', error);
    throw error;
  }
};

// System prompt - Professional Clinical Nutrition Assistant
const SYSTEM_PROMPT = `You are creating a professional nutrition plan on behalf of a qualified dietitian.

The plan MUST appear as if written directly by the dietitian - natural, personal, and professional.

CRITICAL: Do NOT mention AI, algorithms, automation, or "generated". Write as a human dietitian would.

────────────────────────
PROFESSIONAL TONE
────────────────────────
- Write in first person or professional third person
- Use phrases like "I recommend", "Based on your profile", "This plan includes"
- Be warm but professional
- Show expertise and care

────────────────────────
STRUCTURE (MANDATORY)
────────────────────────

1. CLIENT PROFILE SUMMARY
Brief overview of client's goals and considerations

2. NUTRITION TARGETS
Daily calorie and macronutrient targets (approximate, adjustable)

3. 7-DAY MEAL PLAN
Format each day clearly:

Day 1

Breakfast
- Foods and portions
- Preparation notes if needed

Mid-Morning Snack
- Foods and portions

Lunch
- Foods and portions  
- Preparation notes if needed

Evening Snack
- Foods and portions

Dinner
- Foods and portions
- Preparation notes if needed

(Repeat for Days 2-7)

4. FOOD ALTERNATIVES
Provide swaps for:
- Proteins
- Carbohydrates  
- Fats
- Snacks

5. NUTRITION GUIDELINES
- Hydration recommendations
- Cooking methods
- Portion control tips
- Meal timing suggestions

6. FOODS TO EMPHASIZE
List beneficial foods for this client

7. FOODS TO LIMIT
List foods to reduce or avoid (with reasoning)

8. PROFESSIONAL NOTES
Any important reminders or considerations

9. DISCLAIMER
Standard professional disclaimer about consulting healthcare providers

────────────────────────
CONTENT RULES
────────────────────────
- Use realistic, affordable, culturally appropriate foods
- Include protein in every main meal
- Specify portions in grams, cups, or pieces
- Keep it practical and achievable
- No extreme restrictions unless medically necessary
- No brand names or supplements unless specified
- No disease cure claims
- No medical diagnoses

────────────────────────
FORMATTING RULES
────────────────────────
- Use clear section headings
- Use bullet points for lists
- NO emojis
- NO markdown tables
- NO technical jargon
- Clean, professional layout

Write as if YOU are the dietitian personally creating this plan for your client.`;

// Safety guard - block unsafe phrases
const containsUnsafePhrases = (text) => {
  const unsafePhrases = [
    'this will cure',
    'medical treatment',
    'guaranteed results',
    'diagnose',
    'prescribe medication',
    'replace your doctor'
  ];

  const lowerText = text.toLowerCase();
  return unsafePhrases.some(phrase => lowerText.includes(phrase));
};

/**
 * Get today's date string (UTC)
 */
const getTodayDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
};

/**
 * Check and track AI usage
 * @param {string} userId - User ID
 * @param {FirebaseFirestore.Firestore} db - Firestore instance
 * @returns {Promise<{allowed: boolean, remaining: number, message?: string}>}
 */
const checkAndTrackUsage = async (userId, db) => {
  const today = getTodayDate();
  const usageDocId = `${userId}_${today}`;
  const usageRef = db.collection('aiUsage').doc(usageDocId);

  try {
    const usageDoc = await usageRef.get();

    if (!usageDoc.exists) {
      // Create new usage record
      await usageRef.set({
        userId,
        date: today,
        generationsUsed: 1,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        allowed: true,
        remaining: DAILY_LIMIT - 1
      };
    }

    // Check existing usage
    const data = usageDoc.data();
    const currentUsed = data.generationsUsed || 0;

    if (currentUsed >= DAILY_LIMIT) {
      return {
        allowed: false,
        remaining: 0,
        message: `Daily AI generation limit reached (${DAILY_LIMIT}/${DAILY_LIMIT}). Please try again tomorrow.`
      };
    }

    // Increment usage
    await usageRef.update({
      generationsUsed: admin.firestore.FieldValue.increment(1),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      allowed: true,
      remaining: DAILY_LIMIT - currentUsed - 1
    };
  } catch (error) {
    console.error('Error tracking AI usage:', error);
    throw error;
  }
};

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  // TEMPORARILY DISABLED FIREBASE ADMIN FOR TESTING
  console.log('⚠️ Firebase Admin usage tracking is temporarily disabled for debugging');

  try {
    const { clientData, rawInput, userId } = req.body;

    // Validation
    if (!clientData) {
      return res.status(400).json({
        success: false,
        error: 'Client data is required'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      });
    }

    // SKIP USAGE TRACKING FOR NOW
    console.log('⚠️ Skipping usage tracking - generating plan without limits');

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not configured');
      return res.status(500).json({
        success: false,
        error: 'AI service not configured. Please add GEMINI_API_KEY to environment variables.'
      });
    }

    // Build user prompt
    const {
      fullName = 'Client',
      age = 'Not specified',
      gender = 'Not specified',
      height = 'Not specified',
      weight = 'Not specified',
      medicalConditions = [],
      allergies = [],
      goals = 'Not specified'
    } = clientData;

    const formattedConditions = medicalConditions.length > 0 
      ? medicalConditions.join(', ') 
      : 'None specified';
    
    const formattedAllergies = allergies.length > 0 
      ? allergies.join(', ') 
      : 'None specified';

    const userPrompt = `Create a personalized diet plan based on the following data.

Client Profile:
- Name: ${fullName}
- Age: ${age}
- Gender: ${gender}
- Height: ${height}
- Weight: ${weight}
- Medical Conditions: ${formattedConditions}
- Allergies: ${formattedAllergies}
- Goals: ${goals}

Dietitian Notes / Raw Input:
${rawInput || 'No additional notes provided.'}

REQUIREMENTS:
- Do NOT mention diagnoses
- Respect all allergies and restrictions
- Focus on whole foods
- Include portion sizes where appropriate
- Use simple household measurements
- Avoid supplements unless explicitly mentioned
- Include hydration guidance
- Include culturally neutral food options

OUTPUT FORMAT:
1. Short Introduction
2. Daily Calorie & Macro Overview (if data allows)
3. 7-Day Meal Plan
   - Breakfast
   - Lunch
   - Dinner
   - Optional Snacks
4. General Nutrition Guidelines
5. Foods to Prefer
6. Foods to Limit
7. Disclaimer (non-medical)`;

    console.log('🤖 Generating diet plan for:', clientData.fullName);

    // Call Gemini API directly (for Google AI Studio API keys)
    // Using v1 API with gemini-2.5-flash (latest free tier model)
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;
    
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 3000,
        }
      })
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error('❌ Gemini API Error:', errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await apiResponse.json();
    const generatedPlan = data.candidates[0].content.parts[0].text;

    // Safety check - block unsafe content
    if (containsUnsafePhrases(generatedPlan)) {
      console.warn('⚠️ Generated plan contains unsafe phrases');
      return res.status(400).json({
        success: false,
        error: 'Generated plan contains inappropriate medical claims. Please try again.'
      });
    }

    console.log('✅ Diet plan generated successfully');

    // Return the generated plan (without usage info since tracking is disabled)
    return res.status(200).json({
      success: true,
      generatedPlan,
      remaining: 999, // Unlimited for now
      limit: 999
    });

  } catch (error) {
    console.error('❌ Error generating diet plan:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);

    // Handle specific Gemini API errors
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
      return res.status(500).json({
        success: false,
        error: 'AI service configuration error. Please contact support.',
        details: error.message
      });
    }

    if (error.message?.includes('RATE_LIMIT') || error.message?.includes('quota') || error.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'AI service is temporarily busy. Please try again later.',
        details: error.message
      });
    }

    if (error.message?.includes('SAFETY')) {
      return res.status(400).json({
        success: false,
        error: 'Content was blocked by safety filters. Please rephrase your input.',
        details: error.message
      });
    }

    // Generic error response with details for debugging
    return res.status(500).json({
      success: false,
      error: 'Failed to generate diet plan. Please try again later.',
      details: error.message,
      errorType: error.constructor.name,
      debugInfo: {
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0
      }
    });
  }
}
