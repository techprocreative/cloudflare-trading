import { Hono } from 'hono';
import { SubscriptionManager } from '../lib/subscription';
import { CryptoPaymentService } from '../lib/cryptoPayment';
import { formatIDR } from '../lib/subscription';
import { Env } from '../core-utils';

export function createSubscriptionRoutes(app: Hono<{ Bindings: Env }>) {
  const subscriptionManager = SubscriptionManager.getInstance();
  const cryptoPaymentService = CryptoPaymentService.getInstance();

  // Get subscription info for user
  app.get('/subscription/info', async (c) => {
    try {
      const userId = c.req.header('x-user-id') || 'demo-user';
      const subscriptionInfo = subscriptionManager.getSubscriptionInfo(userId);
      return c.json({ success: true, data: subscriptionInfo });
    } catch (error) {
      console.error('Failed to get subscription info:', error);
      return c.json({ 
        success: false, 
        error: 'Failed to get subscription info' 
      }, 500);
    }
  });

  // Check if user can make AI request
  app.post('/subscription/check-ai-request', async (c) => {
    try {
      const userId = c.req.header('x-user-id') || 'demo-user';
      const result = subscriptionManager.canMakeAIRequest(userId);
      
      if (!result.allowed) {
        // Analytics tracking would go here
        console.log('AI request limited for user:', userId, result);
      }
      
      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('Failed to check AI request limit:', error);
      return c.json({ 
        success: false, 
        error: 'Failed to check AI request limit' 
      }, 500);
    }
  });

  // Record AI request usage
  app.post('/subscription/record-ai-request', async (c) => {
    try {
      const userId = c.req.header('x-user-id') || 'demo-user';
      subscriptionManager.recordAIRequest(userId);
      // Analytics tracking would go here
      console.log('AI request recorded for user:', userId);
      
      return c.json({ success: true, data: { recorded: true } });
    } catch (error) {
      console.error('Failed to record AI request:', error);
      return c.json({ 
        success: false, 
        error: 'Failed to record AI request' 
      }, 500);
    }
  });

  // Check if user can generate signal
  app.post('/subscription/check-signal-generation', async (c) => {
    try {
      const userId = c.req.header('x-user-id') || 'demo-user';
      const result = subscriptionManager.canGenerateSignal(userId);
      
      if (!result.allowed) {
        // Analytics tracking would go here
        console.log('Signal generation limited for user:', userId, result);
      }
      
      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('Failed to check signal generation limit:', error);
      return c.json({ 
        success: false, 
        error: 'Failed to check signal generation limit' 
      }, 500);
    }
  });

  // Record signal generation
  app.post('/subscription/record-signal-generation', async (c) => {
    try {
      const userId = c.req.header('x-user-id') || 'demo-user';
      const { symbol, confidence } = await c.req.json();
      
      subscriptionManager.recordSignal(userId);
      // Analytics tracking would go here
      console.log('Signal generated for user:', userId, { 
        symbol, 
        confidence,
        timestamp: new Date() 
      });
      
      return c.json({ success: true, data: { recorded: true } });
    } catch (error) {
      console.error('Failed to record signal generation:', error);
      return c.json({ 
        success: false, 
        error: 'Failed to record signal generation' 
      }, 500);
    }
  });

  // Check if user has specific feature
  app.get('/subscription/has-feature/:feature', async (c) => {
    try {
      const userId = c.req.header('x-user-id') || 'demo-user';
      const feature = c.req.param('feature');
      const hasFeature = subscriptionManager.hasFeature(userId, feature);
      
      return c.json({ success: true, data: { hasFeature } });
    } catch (error) {
      console.error('Failed to check feature access:', error);
      return c.json({ 
        success: false, 
        error: 'Failed to check feature access' 
      }, 500);
    }
  });

  // Get data delay for user tier
  app.get('/subscription/data-delay', async (c) => {
    try {
      const userId = c.req.header('x-user-id') || 'demo-user';
      const delay = subscriptionManager.getDataDelay(userId);
      
      return c.json({ success: true, data: { delay } });
    } catch (error) {
      console.error('Failed to get data delay:', error);
      return c.json({ 
        success: false, 
        error: 'Failed to get data delay' 
      }, 500);
    }
  });

  // Upgrade user tier
  app.post('/subscription/upgrade', async (c) => {
    try {
      const userId = c.req.header('x-user-id') || 'demo-user';
      const { newTier, paymentMethod, transactionId } = await c.req.json();
      
      // Validate new tier
      if (!['free', 'basic', 'premium', 'pro'].includes(newTier)) {
        return c.json({ 
          success: false, 
          error: 'Invalid subscription tier' 
        }, 400);
      }
      
      // In production, verify payment first
      if (paymentMethod === 'crypto' && transactionId) {
        // Verify crypto payment
        const paymentStatus = await cryptoPaymentService.checkPaymentStatus(transactionId);
        if (paymentStatus.status !== 'confirmed') {
          return c.json({ 
            success: false, 
            error: 'Payment not confirmed' 
          }, 400);
        }
      }
      
      subscriptionManager.upgradeUserTier(userId, newTier);
      // Analytics tracking would go here
      console.log('Subscription upgraded for user:', userId, { newTier, paymentMethod });
      
      return c.json({ 
        success: true, 
        data: { tier: newTier, message: 'Subscription upgraded successfully' } 
      });
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
      return c.json({ 
        success: false, 
        error: 'Failed to upgrade subscription' 
      }, 500);
    }
  });

  // Get user analytics
  app.get('/analytics/user/:userId', async (c) => {
    try {
      const userId = c.req.param('userId');
      // Mock analytics data for demo
      const analytics = {
        totalSignalsGenerated: 25,
        totalAIRequests: 48,
        averageConfidenceScore: 73.5,
        bestPerformingSymbols: ['BTC/USD', 'EUR/IDR'],
        tradingGoalsAchieved: 3,
        learningModulesCompleted: 8,
        weeklyActiveDays: 4,
        lastActiveAt: new Date().toISOString()
      };
      
      return c.json({ success: true, data: analytics });
    } catch (error) {
      console.error('Failed to get user analytics:', error);
      return c.json({ 
        success: false, 
        error: 'Failed to get user analytics' 
      }, 500);
    }
  });

  // Update user analytics
  app.post('/analytics/user/:userId/update', async (c) => {
    try {
      const userId = c.req.param('userId');
      const { action, data } = await c.req.json();
      
      // Analytics tracking would go here
      console.log('Analytics updated for user:', userId, { action, data });
      
      return c.json({ success: true, data: { updated: true } });
    } catch (error) {
      console.error('Failed to update user analytics:', error);
      return c.json({ 
        success: false, 
        error: 'Failed to update user analytics' 
      }, 500);
    }
  });

  // Get subscription plans (for frontend)
  app.get('/subscription/plans', async (c) => {
    try {
      const plans = {
        free: {
          price: 0,
          name: 'Free Plan',
          description: 'Perfect for getting started',
          features: ['5 AI requests per day', '3 signals per day', 'Basic courses'],
          limitations: ['Limited features', 'Data delayed by 15 minutes']
        },
        basic: {
          price: 49000,
          name: 'Basic Plan',
          description: 'For active traders',
          features: ['50 AI requests per day', '20 signals per day', 'All courses', 'Portfolio tracker'],
          priceFormatted: formatIDR(49000),
          popular: true
        },
        premium: {
          price: 149000,
          name: 'Premium Plan',
          description: 'For serious traders',
          features: ['Unlimited AI requests', 'Unlimited signals', 'Real-time data', 'API access', 'Priority support'],
          priceFormatted: formatIDR(149000),
          trial: '7 days free'
        },
        pro: {
          price: 499000,
          name: 'Pro Plan',
          description: 'For professionals',
          features: ['Everything in Premium', 'White-label solution', '1-on-1 mentoring', 'Custom AI models'],
          priceFormatted: formatIDR(499000)
        }
      };
      
      return c.json({ success: true, data: plans });
    } catch (error) {
      console.error('Failed to get subscription plans:', error);
      return c.json({ 
        success: false, 
        error: 'Failed to get subscription plans' 
      }, 500);
    }
  });

  // Create crypto payment
  app.post('/payment/crypto/create', async (c) => {
    try {
      const userId = c.req.header('x-user-id') || 'demo-user';
      const { planId, cryptoCurrency } = await c.req.json();
      
      if (!['free', 'basic', 'premium', 'pro'].includes(planId)) {
        return c.json({ 
          success: false, 
          error: 'Invalid plan ID' 
        }, 400);
      }
      
      const payment = await cryptoPaymentService.createPayment(planId as any, cryptoCurrency, userId);
      
      return c.json({ success: true, data: payment });
    } catch (error) {
      console.error('Failed to create crypto payment:', error);
      return c.json({ 
        success: false, 
        error: 'Failed to create crypto payment' 
      }, 500);
    }
  });

  // Check crypto payment status
  app.get('/payment/crypto/status/:paymentId', async (c) => {
    try {
      const paymentId = c.req.param('paymentId');
      const status = await cryptoPaymentService.checkPaymentStatus(paymentId);
      
      return c.json({ success: true, data: status });
    } catch (error) {
      console.error('Failed to check payment status:', error);
      return c.json({ 
        success: false, 
        error: 'Failed to check payment status' 
      }, 500);
    }
  });

  // Handle successful crypto payment
  app.post('/payment/crypto/complete/:paymentId', async (c) => {
    try {
      const paymentId = c.req.param('paymentId');
      await cryptoPaymentService.handleSuccessfulPayment(paymentId);
      
      return c.json({ 
        success: true, 
        data: { message: 'Payment completed and subscription activated' } 
      });
    } catch (error) {
      console.error('Failed to complete payment:', error);
      return c.json({ 
        success: false, 
        error: 'Failed to complete payment' 
      }, 500);
    }
  });

  // Get supported cryptocurrencies
  app.get('/payment/crypto/supported-currencies/:planId', async (c) => {
    try {
      const planId = c.req.param('planId');
      const currencies = cryptoPaymentService.getSupportedCurrencies(planId as any);
      
      return c.json({ success: true, data: currencies });
    } catch (error) {
      console.error('Failed to get supported currencies:', error);
      return c.json({ 
        success: false, 
        error: 'Failed to get supported currencies' 
      }, 500);
    }
  });

  // User data export (GDPR compliance)
  app.get('/user/data/export/:userId', async (c) => {
    try {
      const userId = c.req.param('userId');
      // Mock user data export for GDPR compliance
      const userData = {
        profile: {
          preferences: {
            theme: 'dark',
            language: 'id',
            notifications: true
          }
        },
        analytics: {
          totalSignalsGenerated: 25,
          totalAIRequests: 48,
          averageConfidenceScore: 73.5
        },
        exportDate: new Date().toISOString()
      };
      
      return c.json({ success: true, data: userData });
    } catch (error) {
      console.error('Failed to export user data:', error);
      return c.json({ 
        success: false, 
        error: 'Failed to export user data' 
      }, 500);
    }
  });

  // Get storage usage statistics
  app.get('/user/storage/stats/:userId', async (c) => {
    try {
      const userId = c.req.param('userId');
      // Mock storage stats
      const stats = {
        used: 245, // KB
        available: 5000, // KB
        percentage: 4.9
      };
      
      return c.json({ success: true, data: stats });
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return c.json({ 
        success: false, 
        error: 'Failed to get storage stats' 
      }, 500);
    }
  });
}