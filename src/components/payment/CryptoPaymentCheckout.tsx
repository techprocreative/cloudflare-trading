import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Copy, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Wallet,
  Shield,
  RefreshCw,
  AlertCircle,
  QrCode
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  useCryptoPayment,
  formatCryptoAmount,
  generateQRCodeData,
  SUPPORTED_CRYPTOCURRENCIES
} from '@/lib/cryptoPayment';
import { formatIDR, SUBSCRIPTION_PLANS } from '@/lib/subscription';

interface CryptoPaymentCheckoutProps {
  planId: string;
  cryptoCurrency: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

export function CryptoPaymentCheckout({ 
  planId, 
  cryptoCurrency, 
  onSuccess, 
  onError 
}: CryptoPaymentCheckoutProps) {
  const { t } = useTranslation();
  const cryptoPayment = useCryptoPayment();
  
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<{
    status: 'pending' | 'confirming' | 'confirmed' | 'failed' | 'expired';
    confirmations?: number;
    blockHeight?: number;
  }>({ status: 'pending' });
  const [isLoading, setIsLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (planId && cryptoCurrency) {
      initializePayment();
    }
  }, [planId, cryptoCurrency]);

  useEffect(() => {
    if (paymentData && paymentStatus.status !== 'confirmed') {
      const interval = setInterval(checkPaymentStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [paymentData, paymentStatus.status]);

  useEffect(() => {
    if (paymentData) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const deadline = new Date(paymentData.deadline).getTime();
        const remaining = Math.max(0, deadline - now);
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          setPaymentStatus({ status: 'expired' });
          onError('Payment deadline has expired');
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [paymentData, onError]);

  const initializePayment = async () => {
    try {
      setIsLoading(true);
      const payment = await cryptoPayment.createPayment(
        planId as any, 
        cryptoCurrency
      );
      setPaymentData(payment);
    } catch (error) {
      console.error('Failed to initialize payment:', error);
      onError('Failed to initialize payment');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentData) return;
    
    try {
      const status = await cryptoPayment.checkPaymentStatus(paymentData.paymentId);
      setPaymentStatus(status);
      
      if (status.status === 'confirmed') {
        await cryptoPayment.handleSuccessfulPayment(paymentData.paymentId);
        onSuccess(paymentData.paymentId);
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (paymentStatus.status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'confirming':
        return <RefreshCw className="h-5 w-5 text-blue-400 animate-spin" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus.status) {
      case 'confirmed':
        return {
          title: t('payment.crypto.confirmed.title', 'Payment Confirmed!'),
          message: t('payment.crypto.confirmed.message', 'Your subscription has been activated.')
        };
      case 'confirming':
        return {
          title: t('payment.crypto.confirming.title', 'Confirming Payment'),
          message: t('payment.crypto.confirming.message', 'Waiting for blockchain confirmation...')
        };
      case 'expired':
        return {
          title: t('payment.crypto.expired.title', 'Payment Expired'),
          message: t('payment.crypto.expired.message', 'The payment deadline has passed. Please try again.')
        };
      default:
        return {
          title: t('payment.crypto.waiting.title', 'Awaiting Payment'),
          message: t('payment.crypto.waiting.message', 'Please send the exact amount to the wallet address above.')
        };
    }
  };

  if (isLoading) {
    return (
      <Card className="border-white/10 bg-gray-800/50 text-white">
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">{t('payment.crypto.loading', 'Initializing payment...')}</p>
        </CardContent>
      </Card>
    );
  }

  if (!paymentData) {
    return (
      <Alert className="border-red-500/50 bg-red-500/10">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t('payment.crypto.error', 'Failed to initialize payment. Please try again.')}
        </AlertDescription>
      </Alert>
    );
  }

  const currencyInfo = SUPPORTED_CRYPTOCURRENCIES[cryptoCurrency as keyof typeof SUPPORTED_CRYPTOCURRENCIES];
  const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
  const statusInfo = getStatusMessage();

  return (
    <div className="space-y-6">
      {/* Payment Status */}
      <Card className="border-white/10 bg-gray-800/50 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            {statusInfo.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 mb-4">{statusInfo.message}</p>
          
          {/* Time Left */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-yellow-400" />
            <span>{t('payment.crypto.deadline', 'Payment deadline')}:</span>
            <Badge variant="outline" className="bg-red-500/20 text-red-400">
              {formatTime(timeLeft)}
            </Badge>
          </div>

          {/* Confirmation details */}
          {paymentStatus.status === 'confirming' && (
            <div className="mt-3 text-sm">
              <p className="text-gray-400">
                {t('payment.crypto.confirmations', 'Confirmations')}: {paymentStatus.confirmations || 0}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card className="border-white/10 bg-gray-800/50 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {t('payment.crypto.summary', 'Payment Summary')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">{t('payment.plan', 'Plan')}</p>
              <p className="font-semibold capitalize">{planId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t('payment.amount', 'Amount')}</p>
              <p className="font-semibold">{formatIDR(plan.price)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t('payment.currency', 'Currency')}</p>
              <p className="font-semibold">{cryptoCurrency}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t('payment.crypto.total', 'Total to Pay')}</p>
              <p className="font-semibold text-lg text-blue-400">
                {formatCryptoAmount(paymentData.cryptoAmount, cryptoCurrency)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Address */}
      <Card className="border-white/10 bg-gray-800/50 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('payment.crypto.wallet.title', 'Send Payment To')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Crypto Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
            <span className="text-2xl">{currencyInfo.icon}</span>
            <div>
              <p className="font-semibold">{currencyInfo.name}</p>
              <p className="text-sm text-gray-400">{currencyInfo.symbol} on Solana</p>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="space-y-2">
            <Label>{t('payment.crypto.wallet.address', 'Wallet Address')}</Label>
            <div className="flex gap-2">
              <Input 
                value={paymentData.walletAddress}
                readOnly
                className="bg-gray-700/50 border-gray-600 font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(paymentData.walletAddress)}
                className="border-gray-600 hover:bg-gray-700"
              >
                {copySuccess ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>{t('payment.crypto.amount', 'Amount to Send')}</Label>
            <Input 
              value={formatCryptoAmount(paymentData.cryptoAmount, cryptoCurrency)}
              readOnly
              className="bg-gray-700/50 border-gray-600 font-mono text-sm"
            />
            <p className="text-xs text-gray-400">
              {t('payment.crypto.networkFee', 'Network fee included')}
            </p>
          </div>

          {/* QR Code Placeholder */}
          <div className="flex items-center gap-2 p-3 bg-gray-700/50 rounded-lg">
            <QrCode className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-400">
              {t('payment.crypto.qrNote', 'Scan QR code with your wallet app')}
            </span>
          </div>

          {/* Instructions */}
          <Alert className="border-blue-500/50 bg-blue-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {cryptoPayment.getPaymentInstructions(cryptoCurrency)}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Status Actions */}
      <div className="space-y-3">
        <Button
          variant="outline"
          size="sm"
          onClick={checkPaymentStatus}
          className="w-full border-gray-600 hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('payment.crypto.refresh', 'Refresh Status')}
        </Button>

        <p className="text-xs text-center text-gray-500">
          {t('payment.crypto.note', 'Note: Please wait for at least 3 confirmations before your subscription is activated.')}
        </p>
      </div>
    </div>
  );
}