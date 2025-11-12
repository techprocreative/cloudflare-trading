import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
  minTier?: 'free' | 'basic' | 'premium' | 'pro';
}

export function ProtectedRoute({ 
  children, 
  requireSubscription = false, 
  minTier = 'free' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-300">Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to="/login" 
        state={{ returnUrl: location.pathname + location.search }} 
        replace 
      />
    );
  }

  // Check subscription requirements
  if (requireSubscription && user.subscription) {
    const userTier = user.subscription.tier;
    const tierOrder = { 'free': 0, 'basic': 1, 'premium': 2, 'pro': 3 };
    const minTierOrder = tierOrder[minTier];
    const userTierOrder = tierOrder[userTier as keyof typeof tierOrder] ?? 0;

    if (userTierOrder < minTierOrder) {
      // Redirect to pricing with upgrade prompt
      return (
        <Navigate 
          to="/pricing" 
          state={{ 
            returnUrl: location.pathname + location.search,
            upgradeRequired: true,
            requiredTier: minTier,
            currentTier: userTier
          }} 
          replace 
        />
      );
    }
  }

  return <>{children}</>;
}