import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

// Auth pages
import LoginPage from '../pages/auth/LoginPage'
import NotAuthorizedPage from '../pages/auth/NotAuthorizedPage'

// Protected pages
import DashboardPage from '../pages/dashboard/DashboardPage'
import OnboardingPage from '../pages/onboarding/OnboardingPage'
import NewPlanPage from '../pages/plans/NewPlanPage'
import PlanDetailPage from '../pages/plans/PlanDetailPage'

// Client Management pages
import ClientsPage from '../pages/clients/ClientsPage'
import AddClientPage from '../pages/clients/AddClientPage'
import ClientDetailPage from '../pages/clients/ClientDetailPage'

// Diet Plan pages
import DietPlanCreatePage from '../pages/dietPlans/DietPlanCreatePage'
import DietPlanDetailPage from '../pages/dietPlans/DietPlanDetailPage'

/**
 * Application Routes Configuration
 * Defines all routes and their protection levels
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/not-authorized" element={<NotAuthorizedPage />} />

      {/* Protected Routes - Require authentication */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute requiresDietitian={true}>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiresOnboarding={true} requiresDietitian={true}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/plans/new"
        element={
          <ProtectedRoute requiresOnboarding={true} requiresDietitian={true}>
            <NewPlanPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/plans/:planId"
        element={
          <ProtectedRoute requiresOnboarding={true} requiresDietitian={true}>
            <PlanDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Client Management Routes */}
      <Route
        path="/clients"
        element={
          <ProtectedRoute requiresOnboarding={true} requiresDietitian={true}>
            <ClientsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clients/new"
        element={
          <ProtectedRoute requiresOnboarding={true} requiresDietitian={true}>
            <AddClientPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clients/:clientId"
        element={
          <ProtectedRoute requiresOnboarding={true} requiresDietitian={true}>
            <ClientDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Diet Plan Routes */}
      <Route
        path="/diet-plans/new"
        element={
          <ProtectedRoute requiresOnboarding={true} requiresDietitian={true}>
            <DietPlanCreatePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/diet-plans/:planId"
        element={
          <ProtectedRoute requiresOnboarding={true} requiresDietitian={true}>
            <DietPlanDetailPage />
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
