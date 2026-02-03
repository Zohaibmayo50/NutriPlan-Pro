import { GoogleGenerativeAI } from '@google/generative-ai';
import * as admin from 'firebase-admin';

/**
 * Vercel Serverless Function - AI Diet Plan Generation
 * POST /api/generate-plan
 * Using Google Gemini API with Free Tier Usage Limits
 */

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

// System prompt - Safety-First AI Assistant
const SYSTEM_PROMPT = `You are a professional clinical dietitian assistant.
You do NOT diagnose diseases.
You do NOT prescribe medications.
You only create nutrition plans based on provided data.
If information is missing, make conservative assumptions.
Always prioritize food safety, dietary restrictions, and clarity.
Use neutral, professional language.
Output must be structured and ready for PDF formatting.`;

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

  let db;
  try {
    // Initialize Firebase Admin
    db = initializeFirebaseAdmin();
  } catch (firebaseError) {
    console.error('❌ Firebase initialization error:', firebaseError);
    return res.status(500).json({
      success: false,
      error: 'Server configuration error. Please check Firebase credentials.',
      details: firebaseError.message,
      debugInfo: {
        hasProjectId: !!process.env.project_id,
        hasClientEmail: !!process.env.client_email,
        hasPrivateKey: !!process.env.private_key,
        privateKeyLength: process.env.private_key?.length || 0
      }
    });
  }

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

    // Check usage limit BEFORE calling AI
    console.log('📊 Checking AI usage limit for user:', userId);
    const usageCheck = await checkAndTrackUsage(userId, db);

    if (!usageCheck.allowed) {
      console.log('⛔ Usage limit reached for user:', userId);
      return res.status(429).json({
        success: false,
        error: usageCheck.message,
        remaining: 0,
        limit: DAILY_LIMIT
      });
    }

    console.log(`✅ Usage allowed. Remaining: ${usageCheck.remaining}/${DAILY_LIMIT}`);

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

    // Initialize Gemini model (1.0 Pro - stable and free)
    const model = genAI.getGenerativeModel({ 
      model: 'models/gemini-1.0-pro',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3000,
      }
    });

    // Combine system prompt with user prompt
    const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;

    // Call Gemini API
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const generatedPlan = response.text();

    // Safety check - block unsafe content
    if (containsUnsafePhrases(generatedPlan)) {
      console.warn('⚠️ Generated plan contains unsafe phrases');
      return res.status(400).json({
        success: false,
        error: 'Generated plan contains inappropriate medical claims. Please try again.'
      });
    }

    console.log('✅ Diet plan generated successfully');

    // Return the generated plan with usage info
    return res.status(200).json({
      success: true,
      generatedPlan,
      remaining: usageCheck.remaining,
      limit: DAILY_LIMIT
    });

  } catch (error) {
    console.error('❌ Error generating diet plan:', error);

    // Handle specific Gemini API errors
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
      return res.status(500).json({
        success: false,
        error: 'AI service configuration error. Please contact support.'
      });
    }

    if (error.message?.includes('RATE_LIMIT') || error.message?.includes('quota') || error.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'AI service is temporarily busy. Please try again later.'
      });
    }

    if (error.message?.includes('SAFETY')) {
      return res.status(400).json({
        success: false,
        error: 'Content was blocked by safety filters. Please rephrase your input.'
      });
    }

    // Generic error response (don't expose internal errors)
    return res.status(500).json({
      success: false,
      error: 'Failed to generate diet plan. Please try again later.'
    });
  }
}
