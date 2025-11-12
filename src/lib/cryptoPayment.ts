import { useAuth } from './auth-context';
import { SUBSCRIPTION_PLANS, formatIDR, SubscriptionTier } from './subscription';

// Solana payment configuration
export interface SolanaPaymentConfig {
  network: 'devnet' | 'mainnet-beta';
  rpcUrl: string;
  walletAdapter: string;
}

export interface CryptoPaymentData {
  planId: SubscriptionTier;
  amount: number;
  currency: string;
  cryptoCurrency: string;
  cryptoAmount: number;
  exchangeRate: number;
  walletAddress: string;
  deadline: Date;
}

// Supported cryptocurrencies
export const SUPPORTED_CRYPTOCURRENCIES = {
  SOL: {
    name: 'Solana',
    symbol: 'SOL',
    icon: '🟣',
    network: 'solana',
    decimals: 9,
    minAmount: 0.001,
    maxAmount: 1000,
    fee: 0.0001,
    estimatedMinutes: 2
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    icon: '🟢',
    network: 'solana',
    decimals: 6,
    minAmount: 1,
    maxAmount: 1000000,
    fee: 1,
    estimatedMinutes: 3
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    icon: '🔵',
    network: 'solana',
    decimals: 6,
    minAmount: 1,
    maxAmount: 1000000,
    fee: 1,
    estimatedMinutes: 3
  }
};

// Exchange rates (in production, this would be fetched from an API)
const EXCHANGE_RATES = {
  IDR: {
    SOL: 275000000, // 1 SOL = 275,000 IDR (example rate)
    USDT: 15000,    // 1 USDT = 15,000 IDR
    USDC: 15000     // 1 USDC = 15,000 IDR
  }
};

// Crypto payment service
export class CryptoPaymentService {
  private static instance: CryptoPaymentService;
  private config: SolanaPaymentConfig;

  constructor() {
    this.config = {
      network: process.env.NODE_ENV === 'production' ? 'mainnet-beta' : 'devnet',
      rpcUrl: process.env.NODE_ENV === 'production' 
        ? 'https://api.mainnet-beta.solana.com'
        : 'https://api.devnet.solana.com',
      walletAdapter: '@solana/wallet-adapter-react'
    };
  }

  static getInstance(): CryptoPaymentService {
    if (!CryptoPaymentService.instance) {
      CryptoPaymentService.instance = new CryptoPaymentService();
    }
    return CryptoPaymentService.instance;
  }

  // Get exchange rate for currency pair
  async getExchangeRate(idrAmount: number, cryptoCurrency: string): Promise<number> {
    try {
      // In production, fetch from API like CoinGecko, Binance, etc.
      // For demo, use static rates
      const rate = EXCHANGE_RATES.IDR[cryptoCurrency as keyof typeof EXCHANGE_RATES.IDR];
      
      if (!rate) {
        throw new Error(`Unsupported cryptocurrency: ${cryptoCurrency}`);
      }

      return idrAmount / rate;
    } catch (error) {
      console.error('Failed to get exchange rate:', error);
      throw error;
    }
  }

  // Create payment data
  async createPayment(
    planId: SubscriptionTier, 
    cryptoCurrency: string,
    userId: string
  ): Promise<CryptoPaymentData> {
    const plan = SUBSCRIPTION_PLANS[planId];
    const currencyInfo = SUPPORTED_CRYPTOCURRENCIES[cryptoCurrency as keyof typeof SUPPORTED_CRYPTOCURRENCIES];

    if (!currencyInfo) {
      throw new Error(`Unsupported cryptocurrency: ${cryptoCurrency}`);
    }

    try {
      // Get current exchange rate
      const cryptoAmount = await this.getExchangeRate(plan.price, cryptoCurrency);

      // Add network fee
      const totalCryptoAmount = cryptoAmount + currencyInfo.fee;

      // Generate unique payment ID
      const paymentId = `crypto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create wallet address (in production, this would be your merchant wallet)
      const walletAddress = await this.generateMerchantAddress();

      // Set payment deadline (30 minutes)
      const deadline = new Date(Date.now() + 30 * 60 * 1000);

      const paymentData: CryptoPaymentData = {
        planId,
        amount: plan.price,
        currency: 'IDR',
        cryptoCurrency,
        cryptoAmount: totalCryptoAmount,
        exchangeRate: plan.price / totalCryptoAmount,
        walletAddress,
        deadline
      };

      // Store payment in localStorage for tracking
      this.storePaymentData(paymentId, paymentData, userId);

      return paymentData;
    } catch (error) {
      console.error('Failed to create payment:', error);
      throw error;
    }
  }

  // Generate merchant wallet address (placeholder)
  private async generateMerchantAddress(): Promise<string> {
    // In production, generate from your merchant wallet
    // For demo, return a placeholder address
    const addresses = [
      '7BgBvyjrZX1BkzAEzQEDhrp2nnbv8H8pPQd3vS1n8m42', // Demo Solana address
      '98pjRuQjK3qA6gXts96PqZT4Ze5QmnCmt9uPEKekH3A4', // Demo Solana address
      'CzJ36EjHFNnzzo8WuhWmi9BuH9qTRBtdVYA7zgxJbyQA'  // Demo Solana address
    ];
    
    return addresses[Math.floor(Math.random() * addresses.length)];
  }

  // Store payment data for tracking
  private storePaymentData(paymentId: string, paymentData: CryptoPaymentData, userId: string): void {
    const payments = JSON.parse(localStorage.getItem('crypto_payments') || '{}');
    payments[paymentId] = {
      ...paymentData,
      userId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      paymentId
    };
    localStorage.setItem('crypto_payments', JSON.stringify(payments));
  }

  // Check payment status
  async checkPaymentStatus(paymentId: string): Promise<{
    status: 'pending' | 'confirming' | 'confirmed' | 'failed' | 'expired';
    confirmations?: number;
    blockHeight?: number;
  }> {
    try {
      const payments = JSON.parse(localStorage.getItem('crypto_payments') || '{}');
      const payment = payments[paymentId];

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Check if payment is expired
      if (new Date(payment.deadline) < new Date()) {
        payment.status = 'expired';
        localStorage.setItem('crypto_payments', JSON.stringify(payments));
        return { status: 'expired' };
      }

      // In production, you would check the blockchain here
      // For demo, simulate payment confirmation
      const timeElapsed = Date.now() - new Date(payment.createdAt).getTime();
      const minutesElapsed = timeElapsed / (1000 * 60);

      if (minutesElapsed > 5) {
        payment.status = 'confirmed';
        localStorage.setItem('crypto_payments', JSON.stringify(payments));
        return { 
          status: 'confirmed',
          confirmations: 3,
          blockHeight: Math.floor(Math.random() * 1000000) + 200000000
        };
      } else if (minutesElapsed > 2) {
        return { 
          status: 'confirming',
          confirmations: 1,
          blockHeight: Math.floor(Math.random() * 1000000) + 200000000
        };
      }

      return { status: 'pending' };
    } catch (error) {
      console.error('Failed to check payment status:', error);
      return { status: 'failed' };
    }
  }

  // Handle successful payment
  async handleSuccessfulPayment(paymentId: string): Promise<void> {
    try {
      const payments = JSON.parse(localStorage.getItem('crypto_payments') || '{}');
      const payment = payments[paymentId];

      if (!payment || payment.status !== 'confirmed') {
        throw new Error('Invalid payment status');
      }

      // Update subscription tier
      await this.updateUserSubscription(payment.userId, payment.planId);

      // Store transaction record
      this.storeTransaction(paymentId, payment);

      // Clean up payment data
      delete payments[paymentId];
      localStorage.setItem('crypto_payments', JSON.stringify(payments));
    } catch (error) {
      console.error('Failed to handle successful payment:', error);
      throw error;
    }
  }

  // Update user subscription
  private async updateUserSubscription(userId: string, planId: SubscriptionTier): Promise<void> {
    // In production, update via API
    // For demo, update in localStorage
    const userData = JSON.parse(localStorage.getItem(`user_session_${userId}`) || '{}');
    if (userData.subscription) {
      userData.subscription.tier = planId;
      userData.subscription.status = 'active';
      userData.subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
      localStorage.setItem(`user_session_${userId}`, JSON.stringify(userData));
    }
  }

  // Store transaction record
  private storeTransaction(paymentId: string, payment: any): void {
    const transactions = JSON.parse(localStorage.getItem('crypto_transactions') || '{}');
    transactions[paymentId] = {
      id: paymentId,
      userId: payment.userId,
      planId: payment.planId,
      amount: payment.amount,
      currency: payment.currency,
      cryptoCurrency: payment.cryptoCurrency,
      cryptoAmount: payment.cryptoAmount,
      walletAddress: payment.walletAddress,
      status: 'success',
      createdAt: payment.createdAt,
      confirmedAt: new Date().toISOString()
    };
    localStorage.setItem('crypto_transactions', JSON.stringify(transactions));
  }

  // Get supported cryptocurrencies for a plan
  getSupportedCurrencies(planId: SubscriptionTier): Array<{
    symbol: string;
    name: string;
    icon: string;
    estimatedAmount: number;
  }> {
    const plan = SUBSCRIPTION_PLANS[planId];
    const currencies = Object.keys(SUPPORTED_CRYPTOCURRENCIES);

    return currencies.map(symbol => {
      const info = SUPPORTED_CRYPTOCURRENCIES[symbol as keyof typeof SUPPORTED_CRYPTOCURRENCIES];
      const rate = EXCHANGE_RATES.IDR[symbol as keyof typeof EXCHANGE_RATES.IDR];
      
      return {
        symbol,
        name: info.name,
        icon: info.icon,
        estimatedAmount: plan.price / rate
      };
    });
  }

  // Validate payment amount
  validateAmount(amount: number, cryptoCurrency: string): { valid: boolean; message?: string } {
    const currencyInfo = SUPPORTED_CRYPTOCURRENCIES[cryptoCurrency as keyof typeof SUPPORTED_CRYPTOCURRENCIES];
    
    if (!currencyInfo) {
      return { valid: false, message: 'Unsupported cryptocurrency' };
    }

    if (amount < currencyInfo.minAmount) {
      return { valid: false, message: `Minimum amount is ${currencyInfo.minAmount} ${cryptoCurrency}` };
    }

    if (amount > currencyInfo.maxAmount) {
      return { valid: false, message: `Maximum amount is ${currencyInfo.maxAmount} ${cryptoCurrency}` };
    }

    return { valid: true };
  }

  // Get payment instructions for user
  getPaymentInstructions(cryptoCurrency: string): string {
    const currencyInfo = SUPPORTED_CRYPTOCURRENCIES[cryptoCurrency as keyof typeof SUPPORTED_CRYPTOCURRENCIES];
    
    switch (currencyInfo.symbol) {
      case 'SOL':
        return `Send SOL to the wallet address above. Make sure you're sending on the Solana network.`;
      case 'USDT':
        return `Send USDT to the wallet address above. Make sure you're sending on the Solana network (SPL tokens).`;
      case 'USDC':
        return `Send USDC to the wallet address above. Make sure you're sending on the Solana network (SPL tokens).`;
      default:
        return `Send the exact amount of ${cryptoCurrency} to the wallet address above.`;
    }
  }
}

// React hook for crypto payments
export function useCryptoPayment() {
  const { user } = useAuth();
  const paymentService = CryptoPaymentService.getInstance();

  return {
    createPayment: (planId: SubscriptionTier, cryptoCurrency: string) => 
      user?.user?.id && paymentService.createPayment(planId, cryptoCurrency, user.user.id),
    
    checkPaymentStatus: (paymentId: string) => 
      paymentService.checkPaymentStatus(paymentId),
    
    handleSuccessfulPayment: (paymentId: string) => 
      paymentService.handleSuccessfulPayment(paymentId),
    
    getSupportedCurrencies: (planId: SubscriptionTier) => 
      paymentService.getSupportedCurrencies(planId),
    
    validateAmount: (amount: number, cryptoCurrency: string) => 
      paymentService.validateAmount(amount, cryptoCurrency),
    
    getPaymentInstructions: (cryptoCurrency: string) => 
      paymentService.getPaymentInstructions(cryptoCurrency)
  };
}

// Utility functions
export function formatCryptoAmount(amount: number, currency: string): string {
  const currencyInfo = SUPPORTED_CRYPTOCURRENCIES[currency as keyof typeof SUPPORTED_CRYPTOCURRENCIES];
  if (!currencyInfo) return amount.toString();
  
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: currencyInfo.decimals,
    maximumFractionDigits: currencyInfo.decimals
  }).format(amount) + ` ${currency}`;
}

export function generateQRCodeData(walletAddress: string, amount: number, currency: string): string {
  const currencyInfo = SUPPORTED_CRYPTOCURRENCIES[currency as keyof typeof SUPPORTED_CRYPTOCURRENCIES];
  if (!currencyInfo) return walletAddress;
  
  // Solana URI format
  return `solana:${walletAddress}?amount=${amount}&memo=SignalSage-AI-Payment`;
}