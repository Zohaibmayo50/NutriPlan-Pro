import express from 'express';
import { generateDietPlan } from '../controllers/aiController.js';

const router = express.Router();

/**
 * POST /api/ai/generate-diet-plan
 * Generate a diet plan using AI based on client data and raw input
 */
router.post('/generate-diet-plan', generateDietPlan);

export default router;
