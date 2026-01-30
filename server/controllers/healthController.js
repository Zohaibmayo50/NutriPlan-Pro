/**
 * Health Check Controller
 * Provides server health and status information
 */

/**
 * Get server health status
 * @route GET /api/health
 */
export const getHealth = (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    phase: 'Phase 1 - Foundation'
  }

  res.json(healthData)
}
