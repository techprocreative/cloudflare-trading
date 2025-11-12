export const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'month',
    features: [
      '5 AI requests per day',
      '3 trading signals per day',
      '5 symbols maximum',
      '15-minute data delay',
      'Basic chat features',
      'Free courses access',
      'Community access'
    ],
    cryptoPrices: {
      btc: 0,
      eth: 0,
      usdt: 0,
      bnb: 0
    }
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 49.99,
    period: 'month',
    features: [
      '50 AI requests per day',
      '20 trading signals per day',
      '20 symbols maximum',
      '5-minute data delay',
      'Advanced chat features',
      'All courses access',
      'Portfolio tracker',
      'Watchlist with alerts'
    ],
    cryptoPrices: {
      btc: 0.0012, // ~$49.99 BTC
      eth: 0.018,   // ~$49.99 ETH
      usdt: 49.99,  // ~$49.99 USDT
      bnb: 0.18     // ~$49.99 BNB
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 149.99,
    period: 'month',
    features: [
      'Unlimited AI requests',
      'Unlimited trading signals',
      'Unlimited symbols',
      'Real-time data',
      'Advanced AI analysis',
      'Priority support',
      'Economic calendar',
      'Advanced indicators',
      'Paper trading bot'
    ],
    cryptoPrices: {
      btc: 0.0036, // ~$149.99 BTC
      eth: 0.054,   // ~$149.99 ETH
      usdt: 149.99, // ~$149.99 USDT
      bnb: 0.54     // ~$149.99 BNB
    }
  },
  pro: {
    id: 'pro',
    name: 'Professional',
    price: 499.99,
    period: 'month',
    features: [
      'Everything in Premium',
      'API access',
      'White-label option',
      '1-on-1 mentoring',
      'Custom AI models',
      'Advanced analytics',
      'Beta features access',
      'Dedicated support'
    ],
    cryptoPrices: {
      btc: 0.012,   // ~$499.99 BTC
      eth: 0.18,    // ~$499.99 ETH
      usdt: 499.99, // ~$499.99 USDT
      bnb: 1.8      // ~$499.99 BNB
    }
  }
} as const;

export const SUPPORTED_CRYPTOS = {
  BTC: {
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '₿',
    color: '#f7931a',
    decimals: 8
  },
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'Ξ',
    color: '#627eea',
    decimals: 18
  },
  USDT: {
    name: 'Tether',
    symbol: 'USDT',
    icon: '₮',
    color: '#26a17b',
    decimals: 6
  },
  BNB: {
    name: 'Binance Coin',
    symbol: 'BNB',
    icon: 'BNB',
    color: '#f3ba2f',
    decimals: 18
  }
} as const;

export type PlanId = keyof typeof PRICING_PLANS;
export type CryptoId = keyof typeof SUPPORTED_CRYPTOS;
