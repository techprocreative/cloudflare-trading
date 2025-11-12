import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth-context';
import { OnboardingLayout } from '../../components/layouts/OnboardingLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { 
  Check, 
  CreditCard, 
  Shield, 
  Clock, 
  Tag,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { PRICING_PLANS, type PlanId, SUPPORTED_CRYPTOS, type CryptoId } from '../../lib/pricing';

const cryptoIcons = {
  BTC: '₿',
  ETH: 'Ξ', 
  USDT: '₮',
  BNB: 'BNB'
};

const cryptoColors = {
  BTC: '#f7931a',
  ETH: '#627eea',
  USDT: '#26a17b',
  BNB: '#f3ba2f'
};

export function CheckoutPage() {
  const { planId } = useParams<{ planId: PlanId }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoId>('BTC');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success'>('details');

  const plan = planId ? PRICING_PLANS[planId] : null;
  
  useEffect(() => {
    if (!plan) {
      navigate('/pricing');
    }
  }, [plan, navigate]);

  if (!plan) {
    return null;
  }

  const originalPrice = plan.price;
  const discountAmount = originalPrice * (promoDiscount / 100);
  const finalPrice = originalPrice - discountAmount;
  const cryptoAmount = plan.cryptoPrices[selectedCrypto];

  const handlePromoCodeApply = () => {
    // Mock promo code logic
    if (promoCode.toLowerCase() === 'welcome10') {
      setPromoDiscount(10);
    } else if (promoCode.toLowerCase() === 'earlybird') {
      setPromoDiscount(15);
    } else {
      setPromoDiscount(0);
      alert(t('payment.invalidPromo'));
    }
  };

  const handlePayment = async () => {
    if (!acceptedTerms) {
      alert(t('payment.acceptTerms'));
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');

    // Simulate payment processing
    setTimeout(async () => {
      try {
        // Update user subscription tier
        const updatedUser = {
          ...user,
          user: {
            ...user!.user,
            subscriptionTier: planId!,
          },
          subscription: {
            ...user!.subscription,
            tier: planId!,
            status: 'active',
          }
        };
        
        localStorage.setItem('authUser', JSON.stringify(updatedUser));
        await refreshUser();
        
        setPaymentStep('success');
        
        // Redirect to onboarding profile after 2 seconds
        setTimeout(() => {
          navigate('/onboarding/profile');
        }, 2000);
        
      } catch (error) {
        console.error('Payment failed:', error);
        setPaymentStep('details');
      } finally {
        setIsProcessing(false);
      }
    }, 3000);
  };

  const handleBack = () => {
    navigate('/onboarding/plan');
  };

  if (paymentStep === 'success') {
    return (
      <OnboardingLayout currentStep={2} totalSteps={3} showSkip={false} onBack={handleBack}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('payment.success.title')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('payment.success.description', { plan: t(`pricing.${planId}`) })}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              {t('payment.success.redirect')}
            </p>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout currentStep={2} totalSteps={3} showSkip={false} onBack={handleBack}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('payment.checkout.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('payment.checkout.subtitle', { plan: t(`pricing.${planId}`) })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t('payment.orderSummary')}</span>
                  <Badge variant="secondary">{t(`pricing.${planId}`)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('payment.planPrice')}</span>
                  <span className="font-semibold">${originalPrice}/month</span>
                </div>
                
                {promoDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {t('payment.discount')} ({promoCode.toUpperCase()})
                    </span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>{t('payment.total')}</span>
                  <span>${finalPrice.toFixed(2)}/month</span>
                </div>
                
                {/* Crypto Price */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">
                    {t('payment.cryptoEquivalent')}:
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: cryptoColors[selectedCrypto] }} className="text-2xl">
                      {cryptoIcons[selectedCrypto]}
                    </span>
                    <span className="font-mono text-lg">
                      {cryptoAmount} {selectedCrypto}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>{t('payment.paymentMethod')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    {t('payment.selectCrypto')}:
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(SUPPORTED_CRYPTOS).map(([cryptoId, crypto]) => (
                      <div
                        key={cryptoId}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedCrypto === cryptoId
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedCrypto(cryptoId as CryptoId)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{crypto.icon}</span>
                          <div>
                            <div className="font-medium text-sm">{crypto.symbol}</div>
                            <div className="text-xs text-gray-500">{crypto.name}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Wallet Address (Mock) */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    {t('payment.walletAddress')}:
                  </div>
                  <div className="font-mono text-xs bg-white p-2 rounded border break-all">
                    1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {t('payment.sendExact')}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle>{t('payment.promoCode')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder={t('payment.enterPromo')}
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handlePromoCodeApply}>
                    {t('payment.apply')}
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {t('payment.tryPromo')}: WELCOME10, EARLYBIRD
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Terms & Action */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('payment.termsTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    {t('payment.termsText')}
                  </Label>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4" />
                  <span>{t('payment.securePayment')}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{t('payment.instantActivation')}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={handlePayment}
                  disabled={!acceptedTerms || isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('payment.processing')}
                    </div>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      {t('payment.completeOrder', { amount: `$${finalPrice.toFixed(2)}` })}
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="w-full mt-2"
                  disabled={isProcessing}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('payment.back')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}