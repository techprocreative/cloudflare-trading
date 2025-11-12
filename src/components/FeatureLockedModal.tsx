import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Lock, 
  Star,
  ArrowRight,
  Check,
  Zap
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface FeatureLockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  requiredTier: 'basic' | 'premium' | 'pro';
  currentTier?: 'free' | 'basic' | 'premium' | 'pro';
  description?: string;
  benefits?: string[];
}

export function FeatureLockedModal({
  isOpen,
  onClose,
  featureName,
  requiredTier,
  currentTier = 'free',
  description,
  benefits = [],
}: FeatureLockedModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const tierConfig = {
    basic: {
      name: 'Basic',
      color: 'bg-blue-600',
      icon: Star,
      gradient: 'from-blue-600 to-cyan-600',
      price: 'Free',
    },
    premium: {
      name: 'Premium',
      color: 'bg-purple-600',
      icon: Crown,
      gradient: 'from-purple-600 to-pink-600',
      price: 'IDR 299k',
    },
    pro: {
      name: 'Professional',
      color: 'bg-yellow-600',
      icon: Zap,
      gradient: 'from-yellow-600 to-orange-600',
      price: 'IDR 599k',
    },
  };

  const currentConfig = tierConfig[requiredTier];
  const Icon = currentConfig.icon;

  const handleUpgrade = () => {
    onClose();
    navigate(`/pricing?upgrade=${requiredTier}&feature=${encodeURIComponent(featureName)}`);
  };

  const handleViewPlans = () => {
    onClose();
    navigate(`/pricing`);
  };

  const tierHierarchy = ['free', 'basic', 'premium', 'pro'];
  const currentTierIndex = tierHierarchy.indexOf(currentTier);
  const requiredTierIndex = tierHierarchy.indexOf(requiredTier);
  const canUpgrade = currentTierIndex < requiredTierIndex;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700 text-white">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          
          <div className="space-y-2">
            <DialogTitle className="text-xl font-bold">
              {featureName} Premium Feature
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {description || `Unlock ${featureName} with the ${currentConfig.name} plan`}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current vs Required Tier */}
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${currentConfig.gradient} rounded-full flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold">{currentConfig.name}</h4>
                <p className="text-sm text-gray-400">{currentConfig.price}/month</p>
              </div>
            </div>
            <div className="text-gray-400">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          {/* Benefits */}
          {benefits.length > 0 && (
            <div className="space-y-3">
              <h5 className="font-semibold text-sm text-gray-300 uppercase tracking-wide">
                {currentConfig.name} Benefits
              </h5>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-3 text-sm">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Feature highlights for the required tier */}
          <div className="space-y-3">
            <h5 className="font-semibold text-sm text-gray-300 uppercase tracking-wide">
                {t('payment.success.title', { feature: featureName })}
              </h5>
            <div className="grid gap-2 text-sm">
              {requiredTier === 'basic' && (
                <>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span>{t('pricing.features.aiRequests', { count: 5 })}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span>{t('pricing.features.tradingSignals', { count: 10 })}</span>
                  </div>
                </>
              )}
              {requiredTier === 'premium' && (
                <>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    <span>{t('pricing.features.unlimited')} AI requests</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    <span>{t('pricing.features.unlimited')} trading signals</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    <span>{t('pricing.features.portfolioTracker')}</span>
                  </div>
                </>
              )}
              {requiredTier === 'pro' && (
                <>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                    <span>{t('pricing.features.betaFeatures')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                    <span>{t('pricing.features.apiAccess')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                    <span>{t('pricing.features.prioritySupport')}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleViewPlans}
            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            View All Plans
          </Button>
          <Button
            onClick={handleUpgrade}
            className={`bg-gradient-to-r ${currentConfig.gradient} hover:opacity-90 text-white font-semibold`}
          >
            Upgrade to {currentConfig.name}
          </Button>
        </DialogFooter>

        {/* Trust indicators */}
        <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-700 text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Secure payment</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Cancel anytime</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for easy integration
export function useFeatureLock(featureName: string, requiredTier: 'basic' | 'premium' | 'pro') {
  const [showModal, setShowModal] = React.useState(false);
  const { user } = useAuth();
  
  const currentTier = user?.subscription?.tier || 'free';
  const tierHierarchy = ['free', 'basic', 'premium', 'pro'];
  const hasAccess = tierHierarchy.indexOf(currentTier) >= tierHierarchy.indexOf(requiredTier);
  
  const showFeatureLocked = React.useCallback(() => {
    if (!hasAccess) {
      setShowModal(true);
    }
  }, [hasAccess]);
  
  const hideFeatureLocked = React.useCallback(() => {
    setShowModal(false);
  }, []);

  return {
    showModal,
    hasAccess,
    showFeatureLocked,
    hideFeatureLocked,
    FeatureLockedModalComponent: () => (
      <FeatureLockedModal
        isOpen={showModal}
        onClose={hideFeatureLocked}
        featureName={featureName}
        requiredTier={requiredTier}
        currentTier={currentTier as 'free' | 'basic' | 'premium' | 'pro'}
      />
    ),
  };
}