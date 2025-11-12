// Market Data API Routes - Phase 2

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import type { Env } from '../core-utils';
import { createMarketDataService } from '../services/marketData';

const marketDataRoutes = new Hono<{ Bindings: Env }>();

// Validation schemas
const priceQuerySchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  period: z.string().optional().default('1d'),
});

const overviewQuerySchema = z.object({
  category: z.enum(['forex', 'stocks', 'crypto', 'all']).optional().default('all'),
});

const symbolsQuerySchema = z.object({
  query: z.string().min(1, 'Query is required'),
  limit: z.number().optional().default(10),
});

// CORS middleware
marketDataRoutes.use('/*', cors({
  origin: ['http://localhost:3000', 'https://*.pages.dev'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

/**
 * Get current market price for a symbol
 * GET /api/market/price?symbol=BTC/USD
 */
marketDataRoutes.get('/price', async (c) => {
  try {
    const { symbol, period } = priceQuerySchema.parse(c.req.query());
    const marketDataService = createMarketDataService(c.env);
    
    console.log(`[Market Data] Fetching price for ${symbol}`);
    
    const data = await marketDataService.getMarketDataAndSignal(symbol);
    
    console.log(`[Market Data] Successfully fetched data for ${symbol}`);
    
    return c.json({
      success: true,
      data: {
        symbol: data.pair,
        price: data.price,
        signal: data.signal,
        confidence: data.confidence,
        reasoning: data.reasoning,
        indicators: data.indicators,
        historicalData: data.historicalData,
        timestamp: Date.now(),
      }
    });
  } catch (error) {
    console.error('[Market Data] Price endpoint error:', error);
    console.error('[Market Data] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get price data'
    }, 500);
  }
});

/**
 * Get historical data for a symbol
 * GET /api/market/history?symbol=BTC/USD&period=1d
 */
marketDataRoutes.get('/history', async (c) => {
  try {
    const { symbol, period } = priceQuerySchema.parse(c.req.query());
    const marketDataService = createMarketDataService(c.env);
    
    const data = await marketDataService.getMarketDataAndSignal(symbol);
    
    return c.json({
      success: true,
      data: {
        symbol: data.pair,
        historicalData: data.historicalData,
        period,
        timestamp: Date.now(),
      }
    });
  } catch (error) {
    console.error('History endpoint error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get historical data'
    }, 500);
  }
});

/**
 * Get market overview for Indonesian markets
 * GET /api/market/overview?category=all
 */
marketDataRoutes.get('/overview', async (c) => {
  try {
    const { category } = overviewQuerySchema.parse(c.req.query());
    const marketDataService = createMarketDataService(c.env);
    
    const overview = await marketDataService.getIndonesianMarketOverview();
    
    if (category === 'all') {
      return c.json({
        success: true,
        data: overview,
        timestamp: Date.now(),
      });
    } else {
      const movers = await marketDataService.getMarketMovers(category as any);
      return c.json({
        success: true,
        data: {
          category,
          movers,
          timestamp: Date.now(),
        }
      });
    }
  } catch (error) {
    console.error('Overview endpoint error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get market overview'
    }, 500);
  }
});

/**
 * Search for Indonesian trading symbols
 * GET /api/market/search?query=bank&limit=10
 */
marketDataRoutes.get('/search', async (c) => {
  try {
    const { query, limit } = symbolsQuerySchema.parse(c.req.query());
    const marketDataService = createMarketDataService(c.env);
    
    const results = await marketDataService.searchSymbols(query);
    
    return c.json({
      success: true,
      data: {
        query,
        symbols: results.slice(0, limit),
        timestamp: Date.now(),
      }
    });
  } catch (error) {
    console.error('Search endpoint error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search symbols'
    }, 500);
  }
});

/**
 * Get market movers (gainers/losers)
 * GET /api/market/movers?category=forex
 */
marketDataRoutes.get('/movers', async (c) => {
  try {
    const { category } = overviewQuerySchema.parse(c.req.query());
    const marketDataService = createMarketDataService(c.env);
    
    const movers = await marketDataService.getMarketMovers(category as any);
    
    return c.json({
      success: true,
      data: {
        category,
        gainers: movers.gainers,
        losers: movers.losers,
        timestamp: Date.now(),
      }
    });
  } catch (error) {
    console.error('Movers endpoint error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get market movers'
    }, 500);
  }
});

/**
 * Get technical indicators for a symbol
 * GET /api/market/indicators?symbol=BTC/USD
 */
marketDataRoutes.get('/indicators', async (c) => {
  try {
    const { symbol } = priceQuerySchema.parse(c.req.query());
    const marketDataService = createMarketDataService(c.env);
    
    const data = await marketDataService.getMarketDataAndSignal(symbol);
    
    return c.json({
      success: true,
      data: {
        symbol: data.pair,
        indicators: data.indicators,
        price: data.price,
        timestamp: Date.now(),
      }
    });
  } catch (error) {
    console.error('Indicators endpoint error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get technical indicators'
    }, 500);
  }
});

/**
 * Get multiple symbols at once
 * POST /api/market/prices
 * Body: { symbols: ["BTC/USD", "EUR/IDR"] }
 */
marketDataRoutes.post('/prices', async (c) => {
  try {
    const body = await c.req.json();
    const { symbols } = z.object({
      symbols: z.array(z.string()).min(1, 'At least one symbol is required').max(20, 'Maximum 20 symbols per request')
    }).parse(body);
    
    const marketDataService = createMarketDataService(c.env);
    const prices = await marketDataService.getMarketOverview(symbols);
    
    return c.json({
      success: true,
      data: {
        symbols,
        prices, // Already an array, no need to spread
        timestamp: Date.now(),
      }
    });
  } catch (error) {
    console.error('Prices endpoint error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get multiple prices'
    }, 500);
  }
});

/**
 * Health check for market data service
 * GET /api/market/health
 */
marketDataRoutes.get('/health', async (c) => {
  try {
    const marketDataService = createMarketDataService(c.env);
    
    // Test with a common symbol
    const testData = await marketDataService.getMarketDataAndSignal('USD/IDR');
    
    return c.json({
      success: true,
      data: {
        status: 'healthy',
        services: {
          marketData: 'online',
          cache: 'online',
        },
        lastUpdate: Date.now(),
        testSymbol: {
          symbol: testData.pair,
          price: testData.price,
          signal: testData.signal,
        }
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Market data service unhealthy',
      status: 'unhealthy'
    }, 503);
  }
});

/**
 * Get market signal for a trading pair
 * POST /api/market/signal
 * Body: { pair: string }
 */
marketDataRoutes.post('/signal', async (c) => {
  try {
    const body = await c.req.json();
    const { pair } = z.object({
      pair: z.string().min(1, 'Pair is required')
    }).parse(body);
    
    const marketDataService = createMarketDataService(c.env);
    const signal = await marketDataService.getMarketDataAndSignal(pair);
    
    return c.json({
      success: true,
      ...signal
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch market data'
    }, 500);
  }
});

export { marketDataRoutes };
