/**
 * AI Service
 * Frontend service to interact with Vercel serverless API
 * Includes free-tier usage tracking
 */

/**
 * Generate a diet plan using AI
 * @param {object} clientData - Client profile data
 * @param {string} rawInput - Dietitian's raw text input
 * @param {string} userId - Current user ID for usage tracking
 * @returns {Promise<{generatedPlan: string, remaining: number, limit: number}>} - Generated diet plan and usage info
 */
export const generateDietPlan = async (clientData, rawInput, userId) => {
  try {
    const response = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientData,
        rawInput,
        userId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate diet plan');
    }

    if (!data.success) {
      throw new Error(data.error || 'AI generation failed');
    }

    return {
      generatedPlan: data.generatedPlan,
      remaining: data.remaining !== undefined ? data.remaining : null,
      limit: data.limit || 3
    };
  } catch (error) {
    console.error('❌ Error calling AI service:', error);
    throw error;
  }
};
