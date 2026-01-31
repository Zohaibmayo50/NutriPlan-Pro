/**
 * AI Service
 * Frontend service to interact with Vercel serverless API
 */

/**
 * Generate a diet plan using AI
 * @param {object} clientData - Client profile data
 * @param {string} rawInput - Dietitian's raw text input
 * @returns {Promise<string>} - Generated diet plan text
 */
export const generateDietPlan = async (clientData, rawInput) => {
  try {
    const response = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientData,
        rawInput
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate diet plan');
    }

    if (!data.success) {
      throw new Error(data.error || 'AI generation failed');
    }

    return data.generatedPlan;
  } catch (error) {
    console.error('❌ Error calling AI service:', error);
    throw error;
  }
};
