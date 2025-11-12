import '@/lib/errorReporter';
import '@/lib/i18n';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { ErrorBoundary } from './components/ErrorBoundary';
import { RouteErrorBoundary } from './components/RouteErrorBoundary';
import { Disclaimer } from './components/Disclaimer';
import { AuthProvider } from './lib/auth-context';
import { ProtectedRoute } from './components/ProtectedRoute';
import OnboardingGuard from './components/OnboardingGuard';
import './index.css'

// Layout Components
import { PublicLayout } from './components/layouts/PublicLayout';
import { AppShell } from './components/layouts/AppShell';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import Pricing from './pages/Pricing';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import ArticlesPage from './pages/ArticlesPage';

// App Pages
import { DashboardPage } from './pages/app/DashboardPage';
import { AdvancedDashboardPage } from './pages/AdvancedDashboardPage';
import { ChatPage } from './pages/app/ChatPage';
import { SignalsPage } from './pages/app/SignalsPage';
import { PortfolioPage } from './pages/app/PortfolioPage';
import { SettingsPage } from './pages/app/SettingsPage';

// Onboarding Pages
import { WelcomeStep } from './pages/onboarding/WelcomeStep';
import { PlanSelectionStep } from './pages/onboarding/PlanSelectionStep';
import { ProfileSetupStep } from './pages/onboarding/ProfileSetupStep';

// Payment Pages
import { CheckoutPage } from './pages/payment/CheckoutPage';

// Demo Page (if needed)
import { DemoPage } from './pages/DemoPage';

// Simple component wrappers
const SimpleLayout = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// Main router configuration
const router = createBrowserRouter([
  // Public Routes
  {
    path: "/",
    element: (
      <PublicLayout>
        <LandingPage />
      </PublicLayout>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: (
      <PublicLayout>
        <LoginPage />
      </PublicLayout>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/register",
    element: (
      <PublicLayout>
        <RegisterPage />
      </PublicLayout>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/pricing",
    element: (
      <PublicLayout>
        <Pricing />
      </PublicLayout>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/terms",
    element: (
      <PublicLayout>
        <TermsOfService />
      </PublicLayout>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/privacy",
    element: (
      <PublicLayout>
        <PrivacyPolicy />
      </PublicLayout>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/courses",
    element: (
      <PublicLayout>
        <CoursesPage />
      </PublicLayout>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/courses/:courseId",
    element: (
      <PublicLayout>
        <CourseDetailPage />
      </PublicLayout>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/articles",
    element: (
      <PublicLayout>
        <ArticlesPage />
      </PublicLayout>
    ),
    errorElement: <RouteErrorBoundary />,
  },

  // App Routes (Protected)
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <AppShell />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "advanced-dashboard",
        element: <AdvancedDashboardPage />,
      },
      {
        path: "chat",
        element: <ChatPage />,
      },
      {
        path: "signals",
        element: <SignalsPage />,
      },
      {
        path: "portfolio",
        element: (
          <ProtectedRoute requireSubscription={true} minTier="premium">
            <PortfolioPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },

  // Onboarding Routes (Protected)
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="welcome" replace />,
      },
      {
        path: "welcome",
        element: <WelcomeStep />,
      },
      {
        path: "plan",
        element: <PlanSelectionStep />,
      },
      {
        path: "profile",
        element: <ProfileSetupStep />,
      },
    ],
  },

  // Payment Routes (Protected)
  {
    path: "/checkout/:planId",
    element: (
      <ProtectedRoute>
        <PublicLayout>
          <CheckoutPage />
        </PublicLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },

  // Demo route (optional)
  {
    path: "/demo",
    element: (
      <PublicLayout>
        <DemoPage />
      </PublicLayout>
    ),
    errorElement: <RouteErrorBoundary />,
  },
]);

// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Disclaimer />
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)