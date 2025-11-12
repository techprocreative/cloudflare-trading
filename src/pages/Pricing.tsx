import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { PricingTable } from '../components/payment/PricingTable';
import { CryptoPayment } from '../components/payment/CryptoPayment';
import { PRICING_PLANS, type PlanId, type CryptoId } from '../lib/pricing';

type PaymentState = {
  planId: PlanId | null;
  cryptoId: CryptoId | null;
  isProcessing: boolean;
};

export default function PricingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [paymentState, setPaymentState] = useState<PaymentState>({
    planId: null,
    cryptoId: null,
    isProcessing: false,
  });

  // Check for selected plan from URL parameters
  useEffect(() => {
    const selectedPlan = searchParams.get('plan');
    if (selectedPlan && PRICING_PLANS[selectedPlan as PlanId]) {
      if (!isAuthenticated) {
        // If not authenticated, redirect to register with plan parameter
        navigate(`/register?plan=${selectedPlan}`);
      } else {
        // If authenticated, redirect to checkout or handle accordingly
        if (selectedPlan === 'free') {
          // Update subscription tier for free plan
          handleFreePlanSelection(selectedPlan as PlanId);
        } else {
          setPaymentState({
            planId: selectedPlan as PlanId,
            cryptoId: 'BTC',
            isProcessing: true,
          });
        }
      }
    }
  }, [searchParams, isAuthenticated, navigate]);

  const handleFreePlanSelection = async (planId: PlanId) => {
    if (!isAuthenticated) {
      // Not authenticated - redirect to register
      navigate(`/register?plan=${planId}`);
      return;
    }

    // Authenticated user - update subscription
    try {
      // Mock update subscription tier
      const updatedUser = {
        ...user,
        user: {
          ...user!.user,
          subscriptionTier: planId,
        },
        subscription: {
          ...user!.subscription,
          tier: planId,
        }
      };
      
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      navigate('/app/dashboard');
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  const handlePlanSelect = (planId: PlanId) => {
    if (!isAuthenticated) {
      // Not authenticated - redirect to register with plan
      navigate(`/register?plan=${planId}`);
      return;
    }

    if (planId === 'free') {
      // Free plan - update subscription tier
      handleFreePlanSelection(planId);
      return;
    }
    
    // Paid plan - redirect to checkout
    navigate(`/checkout/${planId}`);
  };

  const handlePayment = (planId: PlanId, cryptoId: CryptoId) => {
    if (!isAuthenticated) {
      // Not authenticated - redirect to register with plan
      navigate(`/register?plan=${planId}`);
      return;
    }

    if (planId === 'free') {
      // Free plan - update subscription tier
      handleFreePlanSelection(planId);
      return;
    }
    
    // Paid plan - redirect to checkout
    navigate(`/checkout/${planId}`);
  };

  const handlePaymentSuccess = () => {
    setPaymentState({
      planId: null,
      cryptoId: null,
      isProcessing: false,
    });
    navigate('/app/dashboard');
  };

  const handleBack = () => {
    setPaymentState({
      planId: null,
      cryptoId: null,
      isProcessing: false,
    });
  };

  // Show payment flow if plan is selected
  if (paymentState.planId && paymentState.cryptoId) {
    return (
      <CryptoPayment
        planId={paymentState.planId}
        cryptoId={paymentState.cryptoId}
        onBack={handleBack}
        onSuccess={handlePaymentSuccess}
      />
    );
  }

  // Show pricing table
  return (
    <div className="min-h-screen bg-gray-50">
      <PricingTable
        selectedPlan={paymentState.planId || undefined}
        onPlanSelect={handlePlanSelect}
        onPayment={handlePayment}
      />
    </div>
  );
}
