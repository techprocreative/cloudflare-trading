import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { createAuthService, type AuthService } from '../src/lib/auth';
import type { Env } from './core-utils';

// Validation schemas
const signUpSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().optional(),
  phone: z.string().optional(),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  riskProfile: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  preferredLanguage: z.string().optional(),
  timezone: z.string().optional(),
});

export function createAuthRoutes(env: Env) {
  const app = new Hono<{ Bindings: Env }>();
  const authService = createAuthService(env);

  // CORS middleware
  app.use('/*', cors({
    origin: ['http://localhost:3000', 'https://*.pages.dev'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }));

  // Helper middleware for auth
  const requireAuth = async (c: any, next: any) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.substring(7);
    const userId = await authService.validateSession(token);
    
    if (!userId) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    c.set('userId', userId);
    await next();
  };

  // Sign up
  app.post('/auth/signup', async (c) => {
    try {
      const body = await c.req.json();
      const { email, password, fullName, phone } = signUpSchema.parse(body);

      const authUser = await authService.signUp(email, password, fullName, phone);
      const sessionId = await authService.createSession(authUser.user.id);

      return c.json({
        success: true,
        data: {
          user: authUser,
          sessionId,
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ 
          success: false, 
          error: error.message 
        }, error.message.includes('already') ? 400 : 500);
      }
      return c.json({ 
        success: false, 
        error: 'Signup failed' 
      }, 500);
    }
  });

  // Sign in
  app.post('/auth/signin', async (c) => {
    try {
      const body = await c.req.json();
      const { email, password } = signInSchema.parse(body);

      const authUser = await authService.signIn(email, password);
      const sessionId = await authService.createSession(authUser.user.id);

      return c.json({
        success: true,
        data: {
          user: authUser,
          sessionId,
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ 
          success: false, 
          error: error.message 
        }, 401);
      }
      return c.json({ 
        success: false, 
        error: 'Signin failed' 
      }, 500);
    }
  });

  // Sign out
  app.post('/auth/signout', requireAuth, async (c) => {
    try {
      const authHeader = c.req.header('Authorization');
      const token = authHeader?.substring(7);
      
      if (token) {
        await authService.deleteSession(token);
      }

      return c.json({
        success: true,
        message: 'Signed out successfully'
      });
    } catch (error) {
      return c.json({ 
        success: false, 
        error: 'Signout failed' 
      }, 500);
    }
  });

  // Get current user
  app.get('/auth/me', requireAuth, async (c) => {
    try {
      const userId = c.get('userId');
      const authUser = await authService.getUserById(userId);

      return c.json({
        success: true,
        data: authUser
      });
    } catch (error) {
      return c.json({ 
        success: false, 
        error: 'Failed to get user' 
      }, 500);
    }
  });

  // Update profile
  app.put('/auth/profile', requireAuth, async (c) => {
    try {
      const userId = c.get('userId');
      const body = await c.req.json();
      const updates = updateProfileSchema.parse(body);

      const profile = await authService.updateProfile(userId, updates);

      return c.json({
        success: true,
        data: profile
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ 
          success: false, 
          error: 'Invalid input',
          details: error.errors 
        }, 400);
      }
      return c.json({ 
        success: false, 
        error: 'Failed to update profile' 
      }, 500);
    }
  });

  // Update subscription
  app.put('/auth/subscription', requireAuth, async (c) => {
    try {
      const userId = c.get('userId');
      const body = await c.req.json();
      const { tier } = body;

      if (!['free', 'basic', 'premium', 'pro'].includes(tier)) {
        return c.json({ 
          success: false, 
          error: 'Invalid subscription tier' 
        }, 400);
      }

      await authService.updateSubscription(userId, tier);

      return c.json({
        success: true,
        message: 'Subscription updated successfully'
      });
    } catch (error) {
      return c.json({ 
        success: false, 
        error: 'Failed to update subscription' 
      }, 500);
    }
  });

  // Validate session
  app.post('/auth/validate', async (c) => {
    try {
      const body = await c.req.json();
      const { sessionId } = body;

      if (!sessionId) {
        return c.json({ 
          success: false, 
          error: 'Session ID is required' 
        }, 400);
      }

      const userId = await authService.validateSession(sessionId);
      
      if (!userId) {
        return c.json({ 
          success: false, 
          error: 'Invalid session' 
        }, 401);
      }

      return c.json({
        success: true,
        data: { userId }
      });
    } catch (error) {
      return c.json({ 
        success: false, 
        error: 'Session validation failed' 
      }, 500);
    }
  });

  return app;
}
