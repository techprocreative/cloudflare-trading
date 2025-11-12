import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth-context';
import { OnboardingLayout } from '../../components/layouts/OnboardingLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Check, Star, Zap, Crown, Rocket } from 'lucide-react';
import { PRICING_PLANS, type PlanId } from '../../lib/pricing';

const planIcons = {
  free: Star,
  basic: Zap,
  premium: Crown,
  pro: Rocket,
};

const planColors = {
  free: 'border-gray-200 hover:border-gray-300',
  basic: 'border-blue-500 hover:border-blue-600',
  premium: 'border-purple-500 hover:border-purple-600',
  pro: 'border-orange-500 hover:border-orange-600',
};

export function PlanSelectionStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('free');
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePlanSelect = async (planId: PlanId) => {
    setSelectedPlan(planId);
  };

  const handleContinue = async () => {
    if (selectedPlan === 'free') {
      // Free plan - update subscription tier and continue
      setIsUpdating(true);
      try {
        // Update user subscription tier in localStorage (mock implementation)
        const updatedUser = {
          ...user,
          user: {
            ...user!.user,
            subscriptionTier: selectedPlan,
          },
          subscription: {
            ...user!.subscription,
            tier: selectedPlan,
          }
        };
        
        localStorage.setItem('authUser', JSON.stringify(updatedUser));
        await refreshUser();
        
        navigate('/onboarding/profile');
      } catch (error) {
        console.error('Failed to update subscription:', error);
      } finally {
        setIsUpdating(false);
      }
    } else {
      // Paid plan - redirect to checkout
      navigate(`/checkout/${selectedPlan}`);
    }
  };

  const handleUnsure = () => {
    setSelectedPlan('free');
  };

  const handleSkip = () => {
    // Default to free plan
    handleContinue();
  };

  const getCtaText = (planId: PlanId) => {
    if (planId === 'free') return t('onboarding.plan.cta.free');
    return t('onboarding.plan.cta.paid', { plan: t(`pricing.${planId}`) });
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={3}
      showSkip={false} // No skip button on plan selection
      onSkip={handleSkip}
      onBack={() => navigate('/onboarding/welcome')}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('onboarding.plan.title')}
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            {t('onboarding.plan.subtitle')}
          </p>
          <p className="text-sm text-gray-500">
            {t('onboarding.plan.description')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {Object.entries(PRICING_PLANS).map(([planId, plan]) => {
            const Icon = planIcons[planId as PlanId];
            const isSelected = selectedPlan === planId;
            const isRecommended = planId === 'basic' || planId === 'premium';
            
            return (
              <Card
                key={planId}
                className={`relative transition-all cursor-pointer ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 shadow-xl scale-105' 
                    : `hover:shadow-lg ${planColors[planId as PlanId]}`
                }`}
                onClick={() => handlePlanSelect(planId as PlanId)}
              >
                {/* Popular Badge */}
                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-blue-600 text-white">
                      {t('onboarding.plan.recommended')}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Icon className="h-6 w-6 text-gray-700" />
                  </div>
                  <CardTitle className="text-xl font-bold">
                    {t(`pricing.${planId}`)}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-gray-500">
                      /{t('common.month')}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Features */}
                  <ul className="space-y-2">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 flex-shrink-0 text-green-600 mt-0.5" />
                        <span className="text-xs text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-xs text-gray-500 pl-6">
                        +{plan.features.length - 4} {t('onboarding.plan.moreFeatures')}
                      </li>
                    )}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContinue();
                    }}
                    className={`w-full ${
                      planId === 'free'
                        ? 'bg-gray-600 text-white hover:bg-gray-700'
                        : isRecommended
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                    disabled={isUpdating}
                  >
                    {getCtaText(planId as PlanId)}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Not Sure Option */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">{t('onboarding.plan.notSure')}</p>
          <Button
            variant="outline"
            onClick={handleUnsure}
            className="text-gray-600 hover:text-gray-800"
            disabled={isUpdating}
          >
            {t('onboarding.plan.unsure')}
          </Button>
        </div>

        {/* Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {t('onboarding.plan.note')}
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}