import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, Star, Zap, Crown, Rocket } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { PRICING_PLANS, SUPPORTED_CRYPTOS, type PlanId } from '../../lib/pricing';
import { SUPPORTED_CRYPTOS as CRYPTOS } from '../../lib/pricing';

const planIcons = {
  free: Star,
  basic: Zap,
  premium: Crown,
  pro: Rocket,
};

const planColors = {
  free: 'border-gray-200',
  basic: 'border-blue-500',
  premium: 'border-purple-500',
  pro: 'border-orange-500',
};

interface PricingTableProps {
  selectedPlan?: PlanId;
  onPlanSelect?: (planId: PlanId) => void;
  onPayment?: (planId: PlanId, crypto: keyof typeof SUPPORTED_CRYPTOS) => void;
}

export function PricingTable({ selectedPlan, onPlanSelect, onPayment }: PricingTableProps) {
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('pricing.title')}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {t('pricing.subtitle')}
        </p>
        
        {/* Billing Toggle */}
        <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {t('common.monthly')}
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {t('common.yearly')}
            <Badge variant="secondary" className="ml-2">
              Save 20%
            </Badge>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(PRICING_PLANS).map(([planId, plan]) => {
          const Icon = planIcons[planId as PlanId];
          const isSelected = selectedPlan === planId;
          
          return (
            <Card
              key={planId}
              className={`relative transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-blue-500 shadow-xl' : planColors[planId as PlanId]
              }`}
            >
              {/* Popular Badge */}
              {planId === 'premium' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white">
                    Most Popular
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
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-500">
                    /{t(`common.${billingCycle}`)}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Crypto Prices */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {t('payment.supportedCryptos')}:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(SUPPORTED_CRYPTOS).map(([cryptoId, crypto]) => (
                      <div key={cryptoId} className="flex items-center gap-2">
                        <span>{crypto.icon}</span>
                        <span className="text-gray-600">
                          {plan.cryptoPrices[cryptoId as keyof typeof plan.cryptoPrices]} {crypto.symbol}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => {
                    if (onPlanSelect) onPlanSelect(planId as PlanId);
                    if (onPayment) {
                      // Default to BTC for payment
                      onPayment(planId as PlanId, 'BTC');
                    }
                  }}
                  className={`w-full ${
                    planId === 'free'
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : planId === 'premium'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  disabled={isSelected}
                >
                  {planId === 'free'
                    ? t('pricing.getStarted')
                    : isSelected
                    ? t('pricing.currentPlan')
                    : t('pricing.getStarted')}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trust Section */}
      <div className="mt-16 text-center">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Trusted by Traders Worldwide
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of traders who use Signal Sage AI for educational trading analysis 
            and signal generation. All payments are secure and processed through blockchain technology.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">50K+</div>
            <div className="text-gray-600">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">1M+</div>
            <div className="text-gray-600">AI Signals Generated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">99.9%</div>
            <div className="text-gray-600">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">24/7</div>
            <div className="text-gray-600">Support</div>
          </div>
        </div>
      </div>
    </div>
  );
}
