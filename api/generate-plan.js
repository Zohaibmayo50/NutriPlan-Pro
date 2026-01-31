import OpenAI from 'openai';

/**
 * Vercel Serverless Function - AI Diet Plan Generation
 * POST /api/generate-plan
 */

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { clientData, rawInput } = req.body;

    // Validation
    if (!clientData) {
      return res.status(400).json({
        success: false,
        error: 'Client data is required'
      });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured');
      return res.status(500).json({
        success: false,
        error: 'AI service not configured'
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

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const generatedPlan = completion.choices[0].message.content;

    // Safety check - block unsafe content
    if (containsUnsafePhrases(generatedPlan)) {
      console.warn('⚠️ Generated plan contains unsafe phrases');
      return res.status(400).json({
        success: false,
        error: 'Generated plan contains inappropriate medical claims. Please try again.'
      });
    }

    console.log('✅ Diet plan generated successfully');

    // Return the generated plan
    return res.status(200).json({
      success: true,
      generatedPlan,
      tokensUsed: completion.usage.total_tokens
    });

  } catch (error) {
    console.error('❌ Error generating diet plan:', error);

    // Handle specific OpenAI errors
    if (error.status === 401) {
      return res.status(500).json({
        success: false,
        error: 'Invalid OpenAI API key'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'AI service rate limit exceeded. Please try again in a few moments.'
      });
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      error: 'Failed to generate diet plan. Please try again.'
    });
  }
}
