import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import healthRoutes from './routes/health.js'
import aiRoutes from './routes/ai.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

/**
 * Middleware Configuration
 */

// CORS - Allow requests from frontend
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

/**
 * Routes
 */
app.use('/api/health', healthRoutes)
app.use('/api/ai', aiRoutes)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'NutriPlan Pro API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} not found`
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

/**
 * Start Server
 */
app.listen(PORT, () => {
  console.log('='.repeat(50))
  console.log(`🚀 NutriPlan Pro Server`)
  console.log(`📡 Running on: http://localhost:${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`✅ Phase 1: Foundation Ready`)
  console.log('='.repeat(50))
})

export default app
