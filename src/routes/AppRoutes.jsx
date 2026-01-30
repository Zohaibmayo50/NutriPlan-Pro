import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

// Auth pages
import LoginPage from '../pages/auth/LoginPage'

// Protected pages
import DashboardPage from '../pages/dashboard/DashboardPage'
import OnboardingPage from '../pages/onboarding/OnboardingPage'
import NewPlanPage from '../pages/plans/NewPlanPage'
import PlanDetailPage from '../pages/plans/PlanDetailPage'

/**
 * Application Routes Configuration
 * Defines all routes and their protection levels
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes - Require authentication */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiresOnboarding={true}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/plans/new"
        element={
          <ProtectedRoute requiresOnboarding={true}>
            <NewPlanPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/plans/:planId"
        element={
          <ProtectedRoute requiresOnboarding={true}>
            <PlanDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 - Redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRoutes
