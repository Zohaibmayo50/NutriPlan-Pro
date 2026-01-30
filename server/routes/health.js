import express from 'express'
import { getHealth } from '../controllers/healthController.js'

const router = express.Router()

/**
 * Health check routes
 * Used to verify server status
 */

// GET /api/health
router.get('/', getHealth)

export default router
