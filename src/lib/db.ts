import { drizzle } from 'drizzle-orm/d1';
import { users, subscriptions, transactions, watchlists, signalHistory, userProfiles, promoCodes, referrals, apiKeys } from '../../db/schema';
import type { Env } from '@/worker/core-utils';

export function createDB(env: Env) {
  return drizzle(env.DB, { 
    schema: { 
      users, 
      subscriptions, 
      transactions, 
      watchlists, 
      signalHistory, 
      userProfiles,
      promoCodes,
      referrals,
      apiKeys
    } 
  });
}

export type DB = ReturnType<typeof createDB>;
