# 📊 Market Data Source Analysis & Issues

**Date:** 12 November 2025  
**Issue:** Market data tidak muncul di dashboard  
**Status:** 🔴 CRITICAL - Perlu perbaikan

---

## 🔍 Current Implementation

Platform menggunakan **3 data sources** untuk market data:

### 1. **Yahoo Finance** (Primary - FREE, No API Key)
- **Used For:** Stocks, Forex, Indices
- **Endpoint:** `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}`
- **Status:** ⚠️ **INTERMITTENT ISSUES**
  - Rate limiting
  - CORS issues dari browser
  - Unreliable untuk production

### 2. **Alpha Vantage** (Fallback - FREE 500 req/day)
- **Used For:** Stocks, Forex (fallback)
- **API Key Required:** `VITE_ALPHA_VANTAGE_API_KEY`
- **Status:** ❌ **NOT CONFIGURED**
  - Environment variable tidak diset
  - Free tier: 500 requests/day (sangat terbatas)
  - Rate limit: 5 calls/minute

### 3. **CoinGecko** (Crypto - FREE)
- **Used For:** Cryptocurrency prices
- **Endpoint:** `https://api.coingecko.com/api/v3/simple/price`
- **Status:** ✅ **WORKING**
  - Tested: `bitcoin` price successfully retrieved
  - Free tier: 50 calls/minute
  - No API key needed

---

## 🐛 Problems Identified

### Problem #1: Yahoo Finance Unreliable
```
HTTP Status: Often returns errors or invalid JSON
CORS Issues: Blocked by browser security policies
Rate Limiting: Aggressive rate limits for free tier
```

**Test Results:**
```bash
# Test Yahoo Finance API
curl "https://query1.finance.yahoo.com/v8/finance/chart/EURUSD=X"
# Result: Invalid JSON or rate limited
```

### Problem #2: Alpha Vantage Not Configured
```typescript
// src/lib/marketData.ts (line 331)
export const marketDataProvider = new MarketDataProvider(
  import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || '' // ❌ Empty string!
);
```

**Missing Configuration:**
- `.env` file tidak ada
- `VITE_ALPHA_VANTAGE_API_KEY` tidak diset
- Fallback provider tidak berfungsi

### Problem #3: Frontend Tidak Terkoneksi ke Backend
```typescript
// src/components/DashboardPanel.tsx
const chartData = useChartData(); // ❌ Uses fake data generator!
const latestSignal = useSignalStore(); // ❌ Hardcoded EUR/USD

// NO CONNECTION to backend market service!
```

**Backend service exists but unused:**
```typescript
// worker/services/marketData.ts
export class MarketDataService {
  async getMarketDataAndSignal(pair: string) {
    // ✅ Real implementation exists
    // ❌ Frontend tidak memanggil ini
  }
}
```

---

## ✅ Recommended Solutions

### Solution #1: Use Better Free APIs (Recommended) 🚀

Replace unreliable Yahoo Finance dengan alternatives:

#### **Option A: Binance Public API** (No API Key, Very Reliable)
```typescript
// Free, no API key, excellent uptime
async getBinanceData(symbol: string): Promise<MarketPrice> {
  // Convert EUR/USD to EURUSD
  const binanceSymbol = symbol.replace('/', '');
  
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`;
  const response = await fetch(url);
  
  if (!response.ok) throw new Error('Binance API error');
  
  const data = await response.json();
  
  return {
    symbol: symbol,
    price: parseFloat(data.lastPrice),
    change: parseFloat(data.priceChange),
    changePercent: parseFloat(data.priceChangePercent),
    volume: parseFloat(data.volume),
    timestamp: Date.now(),
    source: 'Binance'
  };
}
```

**Pros:**
- ✅ No API key required
- ✅ Very reliable (99.9% uptime)
- ✅ Fast response times
- ✅ Good for crypto + forex
- ✅ Free tier: No hard limits

#### **Option B: Twelve Data API** (Free 800 req/day)
```typescript
// Better than Alpha Vantage
async getTwelveDataPrice(symbol: string): Promise<MarketPrice> {
  const apiKey = import.meta.env.VITE_TWELVE_DATA_API_KEY;
  
  const url = `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${apiKey}`;
  const response = await fetch(url);
  
  const data = await response.json();
  
  return {
    symbol: symbol,
    price: parseFloat(data.price),
    // ... other fields
    source: 'Twelve Data'
  };
}
```

**Pros:**
- ✅ Free tier: 800 requests/day
- ✅ Support stocks, forex, crypto
- ✅ More generous than Alpha Vantage
- ✅ Better documentation

#### **Option C: Polygon.io** (Free 5 calls/minute)
```typescript
async getPolygonData(symbol: string): Promise<MarketPrice> {
  const apiKey = import.meta.env.VITE_POLYGON_API_KEY;
  
  const url = `https://api.polygon.io/v2/last/trade/${symbol}?apiKey=${apiKey}`;
  const response = await fetch(url);
  
  // ... implementation
}
```

**Pros:**
- ✅ Very accurate real-time data
- ✅ Free tier available
- ✅ Professional grade API

---

### Solution #2: Setup Environment Variables ⚙️

Create `.env` file:
```bash
# Market Data APIs
VITE_ALPHA_VANTAGE_API_KEY=your_key_here
VITE_TWELVE_DATA_API_KEY=your_key_here  # Recommended
VITE_POLYGON_API_KEY=your_key_here

# OpenRouter (Already discussed)
CF_AI_BASE_URL=https://openrouter.ai/api/v1
CF_AI_API_KEY=sk-or-v1-your_key_here
```

**Get API Keys:**
1. **Alpha Vantage:** https://www.alphavantage.co/support/#api-key (Free)
2. **Twelve Data:** https://twelvedata.com/pricing (Free 800/day)
3. **Polygon.io:** https://polygon.io/pricing (Free 5/min)

---

### Solution #3: Connect Frontend to Backend Market Service 🔗

#### Step 1: Create API Hook

Create `src/hooks/use-real-market-data.ts`:
```typescript
import { useState, useEffect } from 'react';
import { useSignalStore } from '@/store/signalStore';

export function useRealMarketData(pair: string) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const updateSignal = useSignalStore((state) => state.updateSignal);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Call backend API (will use worker route)
        const response = await fetch('/api/market/price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol: pair })
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch market data');
        }

        const data = result.data;
        
        // Update signal store with real data
        updateSignal({
          pair: data.symbol,
          signal: data.signal,
          price: data.price,
          confidence: data.confidence,
          reasoning: data.reasoning
        });

        // Transform historical data for chart
        if (data.historicalData && data.historicalData.length > 0) {
          const chartPoints = data.historicalData.map((point: any) => ({
            time: new Date(point.timestamp).toLocaleTimeString(),
            price: point.close
          }));
          setChartData(chartPoints);
        } else {
          // Fallback: generate points from current price
          const points = [];
          let currentPrice = data.price;
          for (let i = 0; i < 30; i++) {
            points.push({
              time: new Date(Date.now() - (30 - i) * 60000).toLocaleTimeString(),
              price: currentPrice + (Math.random() - 0.5) * (currentPrice * 0.001)
            });
          }
          setChartData(points);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Market data fetch error:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchMarketData();

    // Poll every 30 seconds for updates
    interval = setInterval(fetchMarketData, 30000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pair, updateSignal]);

  return { chartData, isLoading, error };
}
```

#### Step 2: Update DashboardPanel

```typescript
// src/components/DashboardPanel.tsx
import { useState } from 'react';
import { useRealMarketData } from '@/hooks/use-real-market-data';

export function DashboardPanel() {
  const [selectedPair, setSelectedPair] = useState('EUR/USD');
  const { chartData, isLoading, error } = useRealMarketData(selectedPair);
  const latestSignal = useSignalStore((state) => state.signal);

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        <p>Error loading market data: {error}</p>
        <p className="text-sm mt-2">Check console for details</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading real market data...</div>;
  }

  return (
    // ... render chart with real data
  );
}
```

---

### Solution #4: Implement Backend Market Route 🛠️

Update `worker/userRoutes.ts`:
```typescript
import { createMarketDataService } from './services/marketData';

// Add market data route
app.post('/api/market/price', async (c) => {
  try {
    const { symbol } = await c.req.json();
    
    if (!symbol) {
      return c.json({ 
        success: false, 
        error: 'Symbol is required' 
      }, 400);
    }
    
    const marketService = createMarketDataService(c.env);
    const data = await marketService.getMarketDataAndSignal(symbol);
    
    return c.json({ 
      success: true, 
      data: {
        symbol: data.pair,
        price: data.price,
        signal: data.signal,
        confidence: data.confidence,
        reasoning: data.reasoning,
        indicators: data.indicators,
        historicalData: data.historicalData
      }
    });
  } catch (error) {
    console.error('Market price error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get market data' 
    }, 500);
  }
});
```

---

## 🎯 Implementation Priority

### Sprint 1: Quick Fix (2-3 hours)
1. ✅ **Setup Twelve Data API** (Better than Alpha Vantage)
   - Sign up: https://twelvedata.com/
   - Get free API key (800 req/day)
   - Add to `.env`: `VITE_TWELVE_DATA_API_KEY=xxx`

2. ✅ **Add Binance API** (No key needed, very reliable)
   - Implement `getBinanceData()` method
   - Use for forex and crypto

3. ✅ **Keep CoinGecko** for crypto (Already working)

### Sprint 2: Frontend Connection (4-6 hours)
4. ✅ Create `use-real-market-data.ts` hook
5. ✅ Update `DashboardPanel.tsx` to use real data
6. ✅ Add market pair selector component
7. ✅ Add backend route `/api/market/price`

### Sprint 3: Testing & Polish (2-3 hours)
8. ✅ Test all market pairs
9. ✅ Add error handling & fallbacks
10. ✅ Add loading states
11. ✅ Test rate limits

---

## 📊 Comparison Table

| Provider | Free Tier | API Key? | Reliability | Best For |
|----------|-----------|----------|-------------|----------|
| **Yahoo Finance** | Unlimited | ❌ No | ⚠️ Low | ❌ Not recommended |
| **Alpha Vantage** | 500/day | ✅ Yes | ⚠️ Medium | Stocks (limited) |
| **Twelve Data** | 800/day | ✅ Yes | ✅ High | Stocks + Forex |
| **Binance** | Unlimited* | ❌ No | ✅ Very High | Forex + Crypto |
| **CoinGecko** | 50/min | ❌ No | ✅ High | Crypto |
| **Polygon.io** | 5/min | ✅ Yes | ✅ Very High | Professional |

*Rate limited by IP, but very generous

---

## 🔗 API Documentation Links

- **Twelve Data:** https://twelvedata.com/docs
- **Binance:** https://binance-docs.github.io/apidocs/spot/en/
- **CoinGecko:** https://www.coingecko.com/en/api/documentation
- **Polygon.io:** https://polygon.io/docs/stocks/getting-started
- **Alpha Vantage:** https://www.alphavantage.co/documentation/

---

## ✅ Next Steps

1. **Immediate:** Setup Twelve Data API key
2. **Quick Win:** Implement Binance API (no key needed)
3. **Connect:** Wire frontend to backend market service
4. **Test:** Verify all market pairs work
5. **Monitor:** Check rate limits and errors

---

**Last Updated:** 12 November 2025  
**Priority:** 🔴 CRITICAL - Blocking feature
