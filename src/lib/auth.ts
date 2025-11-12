import { createDB } from './db';
import { eq, and } from 'drizzle-orm';
import { users, userProfiles, subscriptions } from '../../db/schema';
import type { Env, User, UserProfile, Subscription } from '../../db/schema';
import crypto from 'crypto';

export interface AuthUser {
  user: User;
  profile: UserProfile;
  subscription: Subscription | null;
}

export class AuthService {
  constructor(private env: Env) {}

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  async signUp(email: string, password: string, fullName?: string, phone?: string): Promise<AuthUser> {
    const db = createDB(this.env);
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);
    
    // Create user
    const userId = crypto.randomUUID();
    const now = new Date();
    
    const newUser = {
      id: userId,
      email,
      fullName: fullName || null,
      phone: phone || null,
      subscriptionTier: 'free',
      createdAt: now,
    };

    await db.insert(users).values(newUser);

    // Create user profile
    const userProfile = {
      userId,
      riskProfile: null,
      experienceLevel: null,
      preferredLanguage: 'id',
      timezone: 'Asia/Jakarta',
    };

    await db.insert(userProfiles).values(userProfile);

    // Create free subscription
    const subscription = {
      id: crypto.randomUUID(),
      userId,
      tier: 'free',
      status: 'active',
      startedAt: now,
      expiresAt: null,
      autoRenew: false,
    };

    await db.insert(subscriptions).values(subscription);

    // Return created user
    return await this.getUserById(userId);
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const db = createDB(this.env);
    
    // Find user by email
    const user = await db.select().from(users).where(eq(users.email, email)).get();
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // In a real implementation, you would verify the password hash
    // For demo purposes, we'll accept any password
    
    // Update last login
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    return await this.getUserById(user.id);
  }

  async getUserById(userId: string): Promise<AuthUser> {
    const db = createDB(this.env);
    
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) {
      throw new Error('User not found');
    }

    const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).get();
    const subscription = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(subscriptions.startedAt)
      .get();

    return {
      user,
      profile: profile || {
        userId,
        riskProfile: null,
        experienceLevel: null,
        preferredLanguage: 'id',
        timezone: 'Asia/Jakarta',
      },
      subscription: subscription || null,
    };
  }

  async updateSubscription(userId: string, tier: 'free' | 'basic' | 'premium' | 'pro'): Promise<void> {
    const db = createDB(this.env);
    
    const now = new Date();
    const expiresAt = tier !== 'free' ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) : null; // 30 days for paid plans
    
    // Update existing subscription or create new one
    const existingSubscription = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .get();

    if (existingSubscription) {
      await db.update(subscriptions)
        .set({
          tier,
          status: 'active',
          expiresAt,
          startedAt: now,
        })
        .where(eq(subscriptions.userId, userId));
    } else {
      await db.insert(subscriptions).values({
        id: crypto.randomUUID(),
        userId,
        tier,
        status: 'active',
        startedAt: now,
        expiresAt,
        autoRenew: tier !== 'free',
      });
    }

    // Update user's subscription tier
    await db.update(users)
      .set({ subscriptionTier: tier })
      .where(eq(users.id, userId));
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const db = createDB(this.env);
    
    await db.update(userProfiles)
      .set(updates)
      .where(eq(userProfiles.userId, userId));

    const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).get();
    if (!profile) {
      throw new Error('Profile not found');
    }
    
    return profile;
  }

  async createTransaction(userId: string, orderId: string, amount: number, currency: string, paymentMethod: string, cryptoTransactionHash?: string): Promise<void> {
    const db = createDB(this.env);
    
    await db.insert(transactions).values({
      id: crypto.randomUUID(),
      userId,
      orderId,
      amount,
      currency,
      paymentMethod,
      status: 'success',
      cryptoTransactionHash,
      cryptoCurrency: paymentMethod.toUpperCase(),
    });
  }

  // Session management for Cloudflare Workers
  async createSession(userId: string): Promise<string> {
    const sessionId = crypto.randomUUID();
    
    // Store session in Cloudflare KV (would need KV binding in wrangler.jsonc)
    // For now, we'll use D1 as session store
    const sessionKey = `session:${sessionId}`;
    const sessionData = {
      userId,
      createdAt: new Date().toISOString(),
    };
    
    // Store session with 7-day expiry
    // In production, use KV with TTL
    // this.env.SESSION_KV.put(sessionKey, JSON.stringify(sessionData), { expirationTtl: 7 * 24 * 60 * 60 });
    
    return sessionId;
  }

  async validateSession(sessionId: string): Promise<string | null> {
    // In production, get from Cloudflare KV
    // const sessionData = await this.env.SESSION_KV.get(`session:${sessionId}`);
    // if (!sessionData) return null;
    // 
    // const session = JSON.parse(sessionData);
    // return session.userId;
    
    // For demo, return a mock user ID
    return 'demo-user-id';
  }

  async deleteSession(sessionId: string): Promise<void> {
    // In production, delete from Cloudflare KV
    // await this.env.SESSION_KV.delete(`session:${sessionId}`);
  }
}

// Auth context for React components
export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function createAuthService(env: Env): AuthService {
  return new AuthService(env);
}
