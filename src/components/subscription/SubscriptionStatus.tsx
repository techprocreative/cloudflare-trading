import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Zap, 
  BarChart3, 
  Clock, 
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSubscription, formatIDR } from '@/lib/subscription';
import { useDatabase } from '@/lib/database';
import { FeatureLockedModal } from './FeatureLockedModal';

interface SubscriptionStatusProps {
  compact?: boolean;
  showUpgrade?: boolean;
}

export function SubscriptionStatus({ compact = false, showUpgrade = true }: SubscriptionStatusProps) {
  const { t } = useTranslation();
  const subscription = useSubscription();
  const database = useDatabase();
  
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showFeatureLocked, setShowFeatureLocked] = useState(false);
  const [lockedFeature, setLockedFeature] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [subInfo, userAnalytics] = await Promise.all([
        subscription.getSubscriptionInfo(),
        database.loadAnalytics()
      ]);
      
      setSubscriptionInfo(subInfo);
      setAnalytics(userAnalytics);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-white/10 bg-gray-800/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-gray-400">{t('common.loading', 'Loading...')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionInfo) {
    return null;
  }

  const { tier, price, features, usage } = subscriptionInfo;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-500/20 text-gray-400';
      case 'basic': return 'bg-blue-500/20 text-blue-400';
      case 'premium': return 'bg-purple-500/20 text-purple-400';
      case 'pro': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'free': return <Settings className="h-4 w-4" />;
      case 'basic': return <TrendingUp className="h-4 w-4" />;
      case 'premium': return <Crown className="h-4 w-4" />;
      case 'pro': return <Crown className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  if (compact) {
    return (
      <Card className="border-white/10 bg-gray-800/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={getTierColor(tier)}>
                {getTierIcon(tier)}
                <span className="ml-1">{t(`subscription.plans.${tier}`, tier) as string}</span>
              </Badge>
              {price > 0 && (
                <span className="text-sm text-gray-400">
                  {formatIDR(price)}/month
                </span>
              )}
            </div>
            
            {showUpgrade && tier === 'free' && (
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                {t('subscription.upgrade', 'Upgrade')}
              </Button>
            )}
          </div>
          
          {/* Quick usage indicators */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-yellow-400" />
              <span className="text-gray-400">
                {usage.aiRequests.remaining === 'unlimited' 
                  ? t('subscription.unlimited', '∞')
                  : `${usage.aiRequests.remaining}/${usage.aiRequests.limit}`
                }
              </span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3 text-blue-400" />
              <span className="text-gray-400">
                {usage.signals.remaining === 'unlimited'
                  ? t('subscription.unlimited', '∞')
                  : `${usage.signals.remaining}/${usage.signals.limit}`
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-white/10 bg-gray-800/50 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              {t('subscription.status.title', 'Subscription Status')}
            </CardTitle>
            <Badge className={getTierColor(tier)}>
              {getTierIcon(tier)}
              <span className="ml-1">{t(`subscription.plans.${tier}`, tier) as string} Plan</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Info */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {formatIDR(price)}
              {price > 0 && <span className="text-sm text-gray-400 font-normal">/month</span>}
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {t(`subscription.plans.${tier}.description`, `Full access to ${tier} features`)}
            </p>
          </div>

          {/* Usage Limits */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">{t('subscription.usage.title', 'Usage This Month')}</h4>
            
            {/* AI Requests */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span>{t('subscription.usage.aiRequests', 'AI Requests')}</span>
                </div>
                <span className="text-gray-400">
                  {usage.aiRequests.limit === 'unlimited'
                    ? t('subscription.unlimited', 'Unlimited')
                    : `${usage.aiRequests.used}/${usage.aiRequests.limit}`
                  }
                </span>
              </div>
              
              {usage.aiRequests.limit !== 'unlimited' && (
                <Progress 
                  value={(usage.aiRequests.used / usage.aiRequests.limit) * 100} 
                  className="h-2"
                />
              )}
              
              {usage.aiRequests.remaining !== 'unlimited' && usage.aiRequests.remaining <= 2 && usage.aiRequests.remaining > 0 && (
                <div className="flex items-center gap-1 text-xs text-yellow-400">
                  <AlertCircle className="h-3 w-3" />
                  {t('subscription.warning.lowLimit', 'Running low on AI requests')}
                </div>
              )}
            </div>

            {/* Trading Signals */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                  <span>{t('subscription.usage.tradingSignals', 'Trading Signals')}</span>
                </div>
                <span className="text-gray-400">
                  {usage.signals.limit === 'unlimited'
                    ? t('subscription.unlimited', 'Unlimited')
                    : `${usage.signals.used}/${usage.signals.limit}`
                  }
                </span>
              </div>
              
              {usage.signals.limit !== 'unlimited' && (
                <Progress 
                  value={(usage.signals.used / usage.signals.limit) * 100} 
                  className="h-2"
                />
              )}
              
              {usage.signals.remaining !== 'unlimited' && usage.signals.remaining <= 1 && usage.signals.remaining > 0 && (
                <div className="flex items-center gap-1 text-xs text-yellow-400">
                  <AlertCircle className="h-3 w-3" />
                  {t('subscription.warning.lowLimit', 'Running low on trading signals')}
                </div>
              )}
            </div>
          </div>

          {/* Features Available */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">{t('subscription.features.title', 'Available Features')}</h4>
            <div className="grid grid-cols-1 gap-2">
              {features.features.slice(0, 6).map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>{t(`subscription.features.${feature}`, feature)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Summary */}
          {analytics && (
            <div className="space-y-3 pt-3 border-t border-gray-700">
              <h4 className="font-semibold text-sm">{t('subscription.analytics.title', 'Your Activity')}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">{t('subscription.analytics.totalSignals', 'Total Signals')}</p>
                  <p className="font-semibold">{analytics.totalSignalsGenerated}</p>
                </div>
                <div>
                  <p className="text-gray-400">{t('subscription.analytics.averageConfidence', 'Avg. Confidence')}</p>
                  <p className="font-semibold">{Math.round(analytics.averageConfidenceScore)}%</p>
                </div>
                <div>
                  <p className="text-gray-400">{t('subscription.analytics.learningProgress', 'Learning Progress')}</p>
                  <p className="font-semibold">{analytics.learningModulesCompleted} modules</p>
                </div>
                <div>
                  <p className="text-gray-400">{t('subscription.analytics.activeDays', 'Active Days')}</p>
                  <p className="font-semibold">{analytics.weeklyActiveDays}</p>
                </div>
              </div>
            </div>
          )}

          {/* Upgrade Actions */}
          {showUpgrade && tier === 'free' && (
            <div className="pt-4 border-t border-gray-700">
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => {
                  // This could open a modal or navigate to pricing
                  const element = document.createElement('div');
                  element.innerHTML = `
                    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                                background: #1f2937; color: white; padding: 20px; border-radius: 8px; 
                                z-index: 9999; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                      <h3 style="margin: 0 0 10px 0;">Upgrade Your Plan</h3>
                      <p style="margin: 0 0 15px 0;">Get unlimited access to AI signals and premium features!</p>
                      <button onclick="window.location.href='/pricing'" 
                              style="background: linear-gradient(to right, #2563eb, #9333ea); 
                                     color: white; border: none; padding: 10px 20px; 
                                     border-radius: 6px; cursor: pointer;">
                        View Plans
                      </button>
                      <button onclick="this.closest('div').remove()" 
                              style="background: transparent; color: #9ca3af; border: none; 
                                     padding: 10px; cursor: pointer; margin-left: 10px;">
                        Maybe Later
                      </button>
                    </div>
                  `;
                  document.body.appendChild(element);
                }}
              >
                <Crown className="h-4 w-4 mr-2" />
                {t('subscription.upgrade.title', 'Upgrade for Unlimited Access')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Locked Modal */}
      <FeatureLockedModal
        isOpen={showFeatureLocked}
        onClose={() => setShowFeatureLocked(false)}
        feature={lockedFeature}
        currentPlan={tier}
      />
    </>
  );
}