import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * System Prompt - Safety-First AI Assistant
 * This prompt ensures the AI never diagnoses or prescribes medication
 */
const SYSTEM_PROMPT = `You are a professional clinical dietitian assistant.
You do NOT diagnose diseases.
You do NOT prescribe medications.
You only create nutrition plans based on provided data.
If information is missing, make conservative assumptions.
Always prioritize food safety, dietary restrictions, and clarity.
Use neutral, professional language.
Output must be structured and ready for PDF formatting.`;

/**
 * Build dynamic user prompt from client data and raw input
 */
const buildUserPrompt = (clientData, rawInput) => {
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

  // Format arrays for better readability
  const formattedConditions = medicalConditions.length > 0 
    ? medicalConditions.join(', ') 
    : 'None specified';
  
  const formattedAllergies = allergies.length > 0 
    ? allergies.join(', ') 
    : 'None specified';

  return `Create a personalized diet plan based on the following data.

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
};

/**
 * Safety guard - block unsafe phrases
 */
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
 * Generate Diet Plan
 * POST /api/ai/generate-diet-plan
 * 
 * Request Body:
 * {
 *   clientData: { fullName, age, gender, height, weight, medicalConditions, allergies, goals },
 *   rawInput: string
 * }
 */
export const generateDietPlan = async (req, res) => {
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
        error: 'AI service not configured. Please add OPENAI_API_KEY to environment variables.'
      });
    }

    // Build the prompt
    const userPrompt = buildUserPrompt(clientData, rawInput);

    console.log('🤖 Generating diet plan for:', clientData.fullName);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Using GPT-4 for better quality
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
      temperature: 0.7, // Balanced creativity
      max_tokens: 3000 // Allow detailed plans
    });

    const generatedPlan = completion.choices[0].message.content;

    // Safety check - block unsafe content
    if (containsUnsafePhrases(generatedPlan)) {
      console.warn('⚠️ Generated plan contains unsafe phrases, regenerating...');
      return res.status(400).json({
        success: false,
        error: 'Generated plan contains inappropriate medical claims. Please try again or edit the raw input.'
      });
    }

    console.log('✅ Diet plan generated successfully');

    // Return the generated plan
    res.json({
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
        error: 'Invalid OpenAI API key. Please check your configuration.'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'AI service rate limit exceeded. Please try again in a few moments.'
      });
    }

    // Generic error response (don't expose internal errors to frontend)
    res.status(500).json({
      success: false,
      error: 'Failed to generate diet plan. Please try again.'
    });
  }
};
