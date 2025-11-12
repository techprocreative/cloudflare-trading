import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';

interface OnboardingGuardProps {
  children: ReactNode;
}

function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // If not authenticated, let the ProtectedRoute handle it
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Check if user has completed onboarding
  const hasCompletedOnboarding = localStorage.getItem('userHasCompletedOnboarding') === 'true';
  const isOnboardingRoute = location.pathname.startsWith('/onboarding');

  // If user has completed onboarding and is trying to access onboarding routes, redirect to dashboard
  if (hasCompletedOnboarding && isOnboardingRoute) {
    return <Navigate to="/app/dashboard" replace />;
  }

  // If user has NOT completed onboarding and is trying to access app routes (except checkout), redirect to onboarding
  if (!hasCompletedOnboarding && !isOnboardingRoute && !location.pathname.startsWith('/checkout')) {
    return <Navigate to="/onboarding/welcome" replace />;
  }

  return <>{children}</>;
}

export default OnboardingGuard;