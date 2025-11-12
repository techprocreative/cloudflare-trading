import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  fullName: text('full_name'),
  phone: text('phone'),
  subscriptionTier: text('subscription_tier').default('free').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()).notNull(),
  lastLogin: integer('last_login', { mode: 'timestamp' }),
});

// User profiles
export const userProfiles = sqliteTable('user_profiles', {
  userId: text('user_id').primaryKey().references(() => users.id),
  riskProfile: text('risk_profile'), // conservative, moderate, aggressive
  experienceLevel: text('experience_level'), // beginner, intermediate, advanced
  preferredLanguage: text('preferred_language').default('id').notNull(),
  timezone: text('timezone').default('Asia/Jakarta').notNull(),
});

// Subscriptions
export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  tier: text('tier').notNull(), // free, basic, premium, pro
  status: text('status').notNull(), // active, cancelled, expired
  startedAt: integer('started_at', { mode: 'timestamp' }).default(new Date()).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  autoRenew: integer('auto_renew', { mode: 'boolean' }).default(true).notNull(),
  cryptoAddress: text('crypto_address'), // For crypto payments
  cryptoCurrency: text('crypto_currency'), // BTC, ETH, USDT, etc
});

// Transactions
export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  orderId: text('order_id').unique().notNull(),
  amount: real('amount').notNull(),
  currency: text('currency').default('USD').notNull(),
  paymentMethod: text('payment_method').notNull(),
  status: text('status').notNull(), // pending, success, failed
  cryptoTransactionHash: text('crypto_transaction_hash'),
  cryptoCurrency: text('crypto_currency'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()).notNull(),
});

// Market data
export const marketData = sqliteTable('market_data', {
  id: text('id').primaryKey(),
  symbol: text('symbol').notNull(),
  price: real('price').notNull(),
  change: real('change'),
  changePercent: real('change_percent'),
  volume: integer('volume'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).default(new Date()).notNull(),
  source: text('source').notNull(),
});

// Historical market data for charts
export const historicalData = sqliteTable('historical_data', {
  id: text('id').primaryKey(),
  symbol: text('symbol').notNull(),
  open: real('open').notNull(),
  high: real('high').notNull(),
  low: real('low').notNull(),
  close: real('close').notNull(),
  volume: integer('volume').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  period: text('period').notNull(), // 1m, 5m, 15m, 1h, 1d, etc.
});

// Technical indicators
export const technicalIndicators = sqliteTable('technical_indicators', {
  id: text('id').primaryKey(),
  symbol: text('symbol').notNull(),
  indicatorName: text('indicator_name').notNull(), // RSI, MACD, SMA, EMA, etc.
  value: real('value').notNull(),
  signal: text('signal'), // BUY, SELL, HOLD
  timestamp: integer('timestamp', { mode: 'timestamp' }).default(new Date()).notNull(),
});

// Watchlists
export const watchlists = sqliteTable('watchlists', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  symbol: text('symbol').notNull(),
  addedAt: integer('added_at', { mode: 'timestamp' }).default(new Date()).notNull(),
});

// Signal history
export const signalHistory = sqliteTable('signal_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  symbol: text('symbol').notNull(),
  signalType: text('signal_type').notNull(), // BUY, SELL, HOLD
  confidence: integer('confidence').notNull(),
  priceAtSignal: real('price_at_signal').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).default(new Date()).notNull(),
  outcome: text('outcome'), // correct, incorrect, pending
  priceAfter24h: real('price_after_24h'),
});

// Promo codes
export const promoCodes = sqliteTable('promo_codes', {
  code: text('code').primaryKey(),
  discountPercent: integer('discount_percent').notNull(),
  validUntil: integer('valid_until', { mode: 'timestamp' }).notNull(),
  maxUses: integer('max_uses').notNull(),
  currentUses: integer('current_uses').default(0).notNull(),
  applicableTiers: text('applicable_tiers', { mode: 'json' }).notNull(), // JSON array
});

// Referrals
export const referrals = sqliteTable('referrals', {
  id: text('id').primaryKey(),
  referrerUserId: text('referrer_user_id').references(() => users.id).notNull(),
  referredUserId: text('referred_user_id').references(() => users.id).notNull(),
  status: text('status').notNull(), // pending, completed
  rewardGiven: integer('reward_given', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()).notNull(),
});

// API keys for Pro users
export const apiKeys = sqliteTable('api_keys', {
  key: text('key').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  permissions: text('permissions', { mode: 'json' }).notNull(), // JSON array
  rateLimit: integer('rate_limit').notNull(),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type MarketData = typeof marketData.$inferSelect;
export type NewMarketData = typeof marketData.$inferInsert;
export type Watchlist = typeof watchlists.$inferSelect;
export type NewWatchlist = typeof watchlists.$inferInsert;
export type SignalHistory = typeof signalHistory.$inferSelect;
export type NewSignalHistory = typeof signalHistory.$inferInsert;
export type PromoCode = typeof promoCodes.$inferSelect;
export type NewPromoCode = typeof promoCodes.$inferInsert;
export type Referral = typeof referrals.$inferSelect;
export type NewReferral = typeof referrals.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
