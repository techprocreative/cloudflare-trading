

// Subscription tier definitions
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'pro';

export interface SubscriptionLimits {
  aiRequests: number | 'unlimited';
  signals: number | 'unlimited';
  symbols: number | 'unlimited';
  dataDelay: string;
  features: string[];
  apiAccess: boolean;
  prioritySupport: boolean;
  economicCalendar: boolean;
  advancedIndicators: boolean;
  portfolioTracker: boolean;
  whiteLabel: boolean;
  oneOnOneMentoring: boolean;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, {
  price: number;
  features: SubscriptionLimits;
}> = {
  free: {
    price: 0,
    features: {
      aiRequests: 5,
      signals: 3,
      symbols: 5,
      dataDelay: '15 minutes',
      features: ['basic_chat', 'free_courses', 'limited_signals'],
      apiAccess: false,
      prioritySupport: false,
      economicCalendar: false,
      advancedIndicators: false,
      portfolioTracker: false,
      whiteLabel: false,
      oneOnOneMentoring: false
    }
  },
  basic: {
    price: 49000, // Rp 49,000/month
    features: {
      aiRequests: 50,
      signals: 20,
      symbols: 20,
      dataDelay: '5 minutes',
      features: ['advanced_chat', 'all_courses', 'portfolio_tracker'],
      apiAccess: false,
      prioritySupport: false,
      economicCalendar: false,
      advancedIndicators: false,
      portfolioTracker: true,
      whiteLabel: false,
      oneOnOneMentoring: false
    }
  },
  premium: {
    price: 149000, // Rp 149,000/month
    features: {
      aiRequests: 'unlimited',
      signals: 'unlimited',
      symbols: 'unlimited',
      dataDelay: 'real-time',
      features: ['everything', 'priority_support', 'economic_calendar', 'advanced_indicators'],
      apiAccess: true,
      prioritySupport: true,
      economicCalendar: true,
      advancedIndicators: true,
      portfolioTracker: true,
      whiteLabel: false,
      oneOnOneMentoring: false
    }
  },
  pro: {
    price: 499000, // Rp 499,000/month
    features: {
      aiRequests: 'unlimited',
      signals: 'unlimited',
      symbols: 'unlimited',
      dataDelay: 'real-time',
      features: ['everything_premium', 'api_access', 'white_label', '1on1_mentoring'],
      apiAccess: true,
      prioritySupport: true,
      economicCalendar: true,
      advancedIndicators: true,
      portfolioTracker: true,
      whiteLabel: true,
      oneOnOneMentoring: true
    }
  }
};

// Usage tracking
export interface UserUsage {
  aiRequestsUsed: number;
  signalsUsed: number;
  lastReset: Date;
  planTier: SubscriptionTier;
}

// Rate limiting utilities
export class SubscriptionManager {
  private static instance: SubscriptionManager;
  private usageCache = new Map<string, UserUsage>();

  static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager();
    }
    return SubscriptionManager.instance;
  }

  // Check if user can make AI request
  canMakeAIRequest(userId: string): { allowed: boolean; remaining?: number; resetTime?: Date } {
    const usage = this.getUserUsage(userId);
    const plan = SUBSCRIPTION_PLANS[usage.planTier];
    const limits = plan.features;

    // Check if unlimited
    if (limits.aiRequests === 'unlimited') {
      return { allowed: true };
    }

    // Check daily limits
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - usage.lastReset.getTime()) / (1000 * 60 * 60 * 24));
    
    // Reset daily if more than 24 hours
    if (daysDiff >= 1) {
      usage.aiRequestsUsed = 0;
      usage.lastReset = now;
      this.usageCache.set(userId, usage);
    }

    const remaining = limits.aiRequests as number - usage.aiRequestsUsed;
    
    if (remaining <= 0) {
      const resetTime = new Date(usage.lastReset.getTime() + 24 * 60 * 60 * 1000);
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime 
      };
    }

    return { allowed: true, remaining };
  }

  // Record AI request usage
  recordAIRequest(userId: string): void {
    const usage = this.getUserUsage(userId);
    const plan = SUBSCRIPTION_PLANS[usage.planTier];
    
    if (plan.features.aiRequests !== 'unlimited') {
      usage.aiRequestsUsed++;
      this.usageCache.set(userId, usage);
    }
  }

  // Check if user can generate signal
  canGenerateSignal(userId: string): { allowed: boolean; remaining?: number } {
    const usage = this.getUserUsage(userId);
    const plan = SUBSCRIPTION_PLANS[usage.planTier];
    const limits = plan.features;

    if (limits.signals === 'unlimited') {
      return { allowed: true };
    }

    const remaining = limits.signals as number - usage.signalsUsed;
    
    if (remaining <= 0) {
      return { allowed: false, remaining: 0 };
    }

    return { allowed: true, remaining };
  }

  // Record signal generation
  recordSignal(userId: string): void {
    const usage = this.getUserUsage(userId);
    const plan = SUBSCRIPTION_PLANS[usage.planTier];
    
    if (plan.features.signals !== 'unlimited') {
      usage.signalsUsed++;
      this.usageCache.set(userId, usage);
    }
  }

  // Check if feature is available for tier
  hasFeature(userId: string, feature: string): boolean {
    const usage = this.getUserUsage(userId);
    const plan = SUBSCRIPTION_PLANS[usage.planTier];
    return plan.features.features.includes(feature) || 
           (feature === 'api_access' && plan.features.apiAccess) ||
           (feature === 'priority_support' && plan.features.prioritySupport) ||
           (feature === 'economic_calendar' && plan.features.economicCalendar) ||
           (feature === 'advanced_indicators' && plan.features.advancedIndicators) ||
           (feature === 'portfolio_tracker' && plan.features.portfolioTracker) ||
           (feature === 'white_label' && plan.features.whiteLabel) ||
           (feature === 'one_on_one_mentoring' && plan.features.oneOnOneMentoring);
  }

  // Get data delay for tier
  getDataDelay(userId: string): string {
    const usage = this.getUserUsage(userId);
    const plan = SUBSCRIPTION_PLANS[usage.planTier];
    return plan.features.dataDelay;
  }

  // Get maximum symbols allowed
  getMaxSymbols(userId: string): number | 'unlimited' {
    const usage = this.getUserUsage(userId);
    const plan = SUBSCRIPTION_PLANS[usage.planTier];
    return plan.features.symbols;
  }

  // Upgrade user tier
  upgradeUserTier(userId: string, newTier: SubscriptionTier): void {
    const usage = this.getUserUsage(userId);
    usage.planTier = newTier;
    // Reset usage on tier change
    usage.aiRequestsUsed = 0;
    usage.signalsUsed = 0;
    usage.lastReset = new Date();
    this.usageCache.set(userId, usage);
  }

  // Get user usage
  getUserUsage(userId: string): UserUsage {
    if (!this.usageCache.has(userId)) {
      this.usageCache.set(userId, {
        aiRequestsUsed: 0,
        signalsUsed: 0,
        lastReset: new Date(),
        planTier: 'free'
      });
    }
    return this.usageCache.get(userId)!;
  }

  // Get subscription info for user
  getSubscriptionInfo(userId: string) {
    const usage = this.getUserUsage(userId);
    const plan = SUBSCRIPTION_PLANS[usage.planTier];
    
    return {
      tier: usage.planTier,
      price: plan.price,
      features: plan.features,
      usage: {
        aiRequests: {
          used: usage.aiRequestsUsed,
          limit: plan.features.aiRequests === 'unlimited' ? 'unlimited' : plan.features.aiRequests as number,
          remaining: plan.features.aiRequests === 'unlimited' ? 'unlimited' : Math.max(0, (plan.features.aiRequests as number) - usage.aiRequestsUsed)
        },
        signals: {
          used: usage.signalsUsed,
          limit: plan.features.signals === 'unlimited' ? 'unlimited' : plan.features.signals as number,
          remaining: plan.features.signals === 'unlimited' ? 'unlimited' : Math.max(0, (plan.features.signals as number) - usage.signalsUsed)
        }
      }
    };
  }
}

// Format currency (IDR)
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}