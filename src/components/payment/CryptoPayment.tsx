import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, QrCode, AlertCircle, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { PRICING_PLANS, SUPPORTED_CRYPTOS, type CryptoId, type PlanId } from '../../lib/pricing';
import { formatCrypto } from '../../lib/currency';

interface CryptoPaymentProps {
  planId: PlanId;
  cryptoId?: CryptoId;
  onBack: () => void;
  onSuccess: () => void;
}

export function CryptoPayment({ planId, cryptoId = 'BTC', onBack, onSuccess }: CryptoPaymentProps) {
  const { t } = useTranslation();
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [progress, setProgress] = useState(0);

  const plan = PRICING_PLANS[planId];
  const crypto = SUPPORTED_CRYPTOS[cryptoId];
  const amount = plan.cryptoPrices[cryptoId];
  
  // Generate mock wallet address (in production, this would come from backend)
  const walletAddress = `bc1q${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate payment confirmation after 2 minutes for demo
    if (timeLeft === 1500) {
      setPaymentStatus('confirmed');
      setTimeout(onSuccess, 2000);
    }
  }, [timeLeft, onSuccess]);

  useEffect(() => {
    // Update progress bar
    const totalTime = 1800;
    const currentProgress = ((totalTime - timeLeft) / totalTime) * 100;
    setProgress(currentProgress);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  if (paymentStatus === 'confirmed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('payment.paymentSuccess')}
            </h2>
            <p className="text-gray-600 mb-6">
              Your {plan.name} subscription has been activated successfully!
            </p>
            <Button onClick={onSuccess} className="w-full">
              {t('nav.dashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Pricing
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('payment.title')}</span>
                <Badge variant="outline" className="gap-2">
                  {crypto.icon} {crypto.name}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900">
                  {formatCrypto(amount, crypto.symbol, crypto.decimals)}
                </div>
                <div className="text-gray-600">
                  {plan.name} Plan - {t(`common.${plan.period}`)}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t('payment.waitForConfirmation')}
                  </span>
                  <span className="font-mono">{formatTime(timeLeft)}</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="mt-2 text-xs text-gray-500">
                  {t('payment.estimatedTime', { minutes: Math.ceil(timeLeft / 60) })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Instructions */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* QR Code Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                {t('payment.scanQR')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mx-auto mb-4 h-48 w-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <QrCode className="h-24 w-24 text-gray-400" />
                {/* In production, generate real QR code here */}
              </div>
              <p className="text-sm text-gray-600">
                Scan this QR code with your crypto wallet
              </p>
            </CardContent>
          </Card>

          {/* Address Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('payment.cryptoAddress')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Send {crypto.name} to this address:
                </label>
                <div className="mt-2 relative">
                  <div className="rounded-md border border-gray-300 bg-gray-50 p-3 pr-12 font-mono text-sm">
                    {walletAddress}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyAddress}
                    className="absolute right-1 top-1 gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        {t('crypto.copyAddress')}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Important Notes */}
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">
                    Send exact amount: {formatCrypto(amount, crypto.symbol, crypto.decimals)}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">
                    Network fees will be deducted from your wallet
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">
                    Payment confirmation usually takes 10-30 minutes
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Card */}
        <Card className="mt-6">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${
                paymentStatus === 'pending' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
              }`} />
              <div>
                <div className="font-medium text-gray-900">
                  {t('payment.paymentPending')}
                </div>
                <div className="text-sm text-gray-600">
                  {t('payment.waitForConfirmation')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
