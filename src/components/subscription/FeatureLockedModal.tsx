import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Zap, 
  BarChart3, 
  Shield, 
  CheckCircle,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatIDR, SUBSCRIPTION_PLANS } from '@/lib/subscription';
import { useNavigate } from 'react-router-dom';

interface FeatureLockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  currentPlan: string;
  reason?: string;
}

export function FeatureLockedModal({ 
  isOpen, 
  onClose, 
  feature, 
  currentPlan,
  reason 
}: FeatureLockedModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getFeatureInfo = (feature: string) => {
    switch (feature) {
      case 'ai_requests':
        return {
          title: t('subscription.limits.ai.title', 'AI Request Limit Reached'),
          description: t('subscription.limits.ai.description', 'You have reached your daily AI request limit.'),
          icon: <Zap className="h-8 w-8 text-yellow-400" />
        };
      case 'signals':
        return {
          title: t('subscription.limits.signals.title', 'Signal Generation Limit Reached'),
          description: t('subscription.limits.signals.description', 'You have reached your daily signal generation limit.'),
          icon: <BarChart3 className="h-8 w-8 text-blue-400" />
        };
      case 'portfolio_tracker':
        return {
          title: t('subscription.limits.portfolio.title', 'Portfolio Tracking'),
          description: t('subscription.limits.portfolio.description', 'Advanced portfolio tracking is available in higher plans.'),
          icon: <BarChart3 className="h-8 w-8 text-green-400" />
        };
      case 'api_access':
        return {
          title: t('subscription.limits.api.title', 'API Access'),
          description: t('subscription.limits.api.description', 'API access is available for Premium and Pro subscribers.'),
          icon: <Shield className="h-8 w-8 text-purple-400" />
        };
      case 'priority_support':
        return {
          title: t('subscription.limits.support.title', 'Priority Support'),
          description: t('subscription.limits.support.description', 'Priority support is available for Premium and Pro subscribers.'),
          icon: <Crown className="h-8 w-8 text-gold-400" />
        };
      default:
        return {
          title: t('subscription.limits.feature.title', 'Feature Unlocked'),
          description: t('subscription.limits.feature.description', 'This feature is available in higher subscription plans.'),
          icon: <Lock className="h-8 w-8 text-gray-400" />
        };
    }
  };

  const getRecommendedPlan = (currentPlan: string) => {
    switch (currentPlan) {
      case 'free':
        return 'basic';
      case 'basic':
        return 'premium';
      default:
        return 'pro';
    }
  };

  const recommendedPlan = getRecommendedPlan(currentPlan);
  const planInfo = SUBSCRIPTION_PLANS[recommendedPlan as keyof typeof SUBSCRIPTION_PLANS];
  const featureInfo = getFeatureInfo(feature);

  const handleUpgrade = () => {
    onClose();
    navigate(`/checkout/${recommendedPlan}`);
  };

  const handleViewPlans = () => {
    onClose();
    navigate('/pricing');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-700 text-white">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-gray-800 rounded-full w-fit">
            {featureInfo.icon}
          </div>
          <DialogTitle className="text-xl font-bold">
            {featureInfo.title}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {featureInfo.description}
            {reason && (
              <div className="mt-2 text-sm">
                <strong>Detail:</strong> {reason}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Plan Badge */}
          <div className="flex items-center justify-center">
            <Badge variant="outline" className="text-sm">
              <Shield className="h-3 w-3 mr-1" />
              {t(`subscription.plans.${currentPlan}`, currentPlan)} Plan
            </Badge>
          </div>

          {/* Recommended Plan */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <span className="font-semibold text-lg">
                    {t(`subscription.plans.${recommendedPlan}`, recommendedPlan)} Plan
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {formatIDR(planInfo.price)}
                  <span className="text-sm text-gray-400 font-normal">/month</span>
                </div>
              </div>
              <Button 
                onClick={handleUpgrade}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {t('subscription.upgrade.now', 'Upgrade Now')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            
            {/* Features included */}
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-300">
                {t('subscription.upgrade.includes', 'This plan includes:')}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {planInfo.features.features.slice(0, 4).map((featureKey, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>{t(`subscription.features.${featureKey}`, featureKey)}</span>
                  </div>
                ))}
              </div>
              
              {/* Key metrics */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-600">
                <div className="text-sm">
                  <span className="text-gray-400">
                    {t('subscription.limits.aiRequests', 'AI Requests')}:
                  </span>
                  <span className="ml-1 font-semibold">
                    {planInfo.features.aiRequests === 'unlimited' 
                      ? t('subscription.unlimited', 'Unlimited')
                      : planInfo.features.aiRequests
                    }
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">
                    {t('subscription.limits.signals', 'Signals')}:
                  </span>
                  <span className="ml-1 font-semibold">
                    {planInfo.features.signals === 'unlimited'
                      ? t('subscription.unlimited', 'Unlimited')
                      : planInfo.features.signals
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Alternative actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleViewPlans}
              className="flex-1 border-gray-600 hover:bg-gray-800"
            >
              {t('subscription.viewAllPlans', 'View All Plans')}
            </Button>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="flex-1 hover:bg-gray-800"
            >
              {t('common.cancel', 'Maybe Later')}
            </Button>
          </div>

          {/* Benefits */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {t('subscription.moneyBack', '30-day money-back guarantee • Cancel anytime')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}