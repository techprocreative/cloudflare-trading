// Worker Market Data Service - Real-Time Integration
// Handles market data requests with caching and rate limiting

import { marketDataProvider, MarketPrice, HistoricalData, TechnicalIndicator, INDONESIAN_SYMBOLS } from '../../src/lib/marketData';
import type { Env } from '../core-utils';

export interface MarketDataSignal {
  pair: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  reasoning: string;
  indicators: TechnicalIndicator[];
  historicalData: HistoricalData[];
}

export class MarketDataService {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  // Get current market data with signal
  async getMarketDataAndSignal(pair: string): Promise<MarketDataSignal> {
    try {
      // Validate symbol
      const normalizedPair = this.normalizeSymbol(pair);
      
      // Get current price with error handling
      let marketData;
      try {
        marketData = await marketDataProvider.getCurrentPrice(normalizedPair);
      } catch (error) {
        console.error(`Failed to get price for ${normalizedPair}:`, error);
        throw new Error(`Market data service unavailable. Yahoo Finance or CoinGecko may be rate-limited.`);
      }
      
      if (!marketData) {
        throw new Error(`No market data available for ${pair}. This symbol may not be supported.`);
      }

      // Get historical data with fallback
      let historicalData;
      try {
        historicalData = await marketDataProvider.getHistoricalData(normalizedPair, '1d');
      } catch (error) {
        console.error(`Failed to get historical data for ${normalizedPair}:`, error);
        // Generate fallback data
        historicalData = this.generateFallbackHistoricalData(marketData.price);
      }
      
      // Get technical indicators with fallback
      let indicators;
      try {
        indicators = await marketDataProvider.getTechnicalIndicators(normalizedPair);
      } catch (error) {
        console.error(`Failed to get indicators for ${normalizedPair}:`, error);
        // Generate basic indicators
        indicators = this.generateBasicIndicators(marketData.price);
      }
      
      // Generate signal based on indicators
      const signal = this.generateSignal(indicators, marketData);
      
      return {
        pair: normalizedPair,
        signal: signal.signal,
        confidence: signal.confidence,
        price: marketData.price,
        reasoning: signal.reasoning,
        indicators,
        historicalData: historicalData.slice(-30) // Last 30 data points
      };
    } catch (error) {
      console.error(`Market data error for ${pair}:`, error);
      throw error;
    }
  }

  // Get multiple symbols at once
  async getMarketOverview(symbols: string[]): Promise<MarketPrice[]> {
    try {
      const normalizedSymbols = symbols.map(sym => this.normalizeSymbol(sym));
      return await marketDataProvider.getMultiplePrices(normalizedSymbols);
    } catch (error) {
      console.error(`Market overview error:`, error);
      throw error;
    }
  }

  // Get Indonesian market overview
  async getIndonesianMarketOverview(): Promise<{
    forex: MarketPrice[];
    stocks: MarketPrice[];
    crypto: MarketPrice[];
    index: MarketPrice[];
  }> {
    try {
      const forexPairs = ['USD/IDR', 'EUR/IDR', 'GBP/IDR'];
      const stockSymbols = ['BBCA.JK', 'BBRI.JK', 'BMRI.JK', 'TLKM.JK'];
      const cryptoSymbols = ['BTC/USD', 'ETH/USD', 'BNB/USD'];
      const indices = ['^JKSE'];

      const [forexData, stocksData, cryptoData, indexData] = await Promise.allSettled([
        marketDataProvider.getMultiplePrices(forexPairs),
        marketDataProvider.getMultiplePrices(stockSymbols),
        marketDataProvider.getMultiplePrices(cryptoSymbols),
        marketDataProvider.getMultiplePrices(indices)
      ]);

      return {
        forex: forexData.status === 'fulfilled' ? forexData.value : [],
        stocks: stocksData.status === 'fulfilled' ? stocksData.value : [],
        crypto: cryptoData.status === 'fulfilled' ? cryptoData.value : [],
        index: indexData.status === 'fulfilled' ? indexData.value : []
      };
    } catch (error) {
      console.error(`Indonesian market overview error:`, error);
      return {
        forex: [],
        stocks: [],
        crypto: [],
        index: []
      };
    }
  }

  // Get top gainers and losers
  async getMarketMovers(category: 'forex' | 'stocks' | 'crypto'): Promise<{
    gainers: MarketPrice[];
    losers: MarketPrice[];
  }> {
    try {
      let symbols: string[] = [];
      
      switch (category) {
        case 'forex':
          symbols = ['USD/IDR', 'EUR/IDR', 'GBP/IDR', 'JPY/IDR', 'SGD/IDR'];
          break;
        case 'stocks':
          symbols = Object.keys(INDONESIAN_SYMBOLS)
            .filter(key => INDONESIAN_SYMBOLS[key as keyof typeof INDONESIAN_SYMBOLS]?.category === 'stock')
            .slice(0, 10) as string[];
          break;
        case 'crypto':
          symbols = ['BTC/USD', 'ETH/USD', 'BNB/USD', 'ADA/USD', 'DOT/USD'];
          break;
      }

      const marketData = await marketDataProvider.getMultiplePrices(symbols);
      
      // Sort by change percentage
      const sorted = marketData.sort((a, b) => b.changePercent - a.changePercent);
      
      return {
        gainers: sorted.slice(0, 5).filter(d => d.changePercent > 0),
        losers: sorted.slice(-5).reverse().filter(d => d.changePercent < 0)
      };
    } catch (error) {
      console.error(`Market movers error:`, error);
      return { gainers: [], losers: [] };
    }
  }

  // Validate and normalize symbol
  private normalizeSymbol(symbol: string): string {
    // Common symbol mappings
    const symbolMappings: Record<string, string> = {
      'BTC': 'BTC/USD',
      'ETH': 'ETH/USD',
      'EUR': 'EUR/USD',
      'GBP': 'GBP/USD',
      'JPY': 'USD/JPY',
      'USDIDR': 'USD/IDR',
      'EURIDR': 'EUR/IDR',
      'BBCA': 'BBCA.JK',
      'BBRI': 'BBRI.JK',
      'BMRI': 'BMRI.JK',
      'TLKM': 'TLKM.JK'
    };

    const upperSymbol = symbol.toUpperCase();
    return symbolMappings[upperSymbol] || upperSymbol;
  }

  // Generate trading signal based on indicators
  private generateSignal(indicators: TechnicalIndicator[], marketData: MarketPrice): {
    signal: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    reasoning: string;
  } {
    const rsi = indicators.find(ind => ind.name === 'RSI');
    
    if (!rsi) {
      return {
        signal: 'HOLD',
        confidence: 50,
        reasoning: 'Insufficient data for signal generation'
      };
    }

    const rsiValue = rsi.value;
    const rsiSignal = rsi.signal;
    
    let confidence = 50;
    let reasoning = '';

    // RSI-based signals
    if (rsiValue > 70) {
      reasoning = `RSI at ${rsiValue} indicates overbought conditions. Consider selling or waiting for correction.`;
      confidence = Math.min(80, 50 + (rsiValue - 70));
    } else if (rsiValue < 30) {
      reasoning = `RSI at ${rsiValue} indicates oversold conditions. Potential buying opportunity.`;
      confidence = Math.min(80, 50 + (30 - rsiValue));
    } else if (rsiValue > 60) {
      reasoning = `RSI at ${rsiValue} shows bullish momentum. Monitor for continuation.`;
      confidence = 60;
    } else if (rsiValue < 40) {
      reasoning = `RSI at ${rsiValue} shows bearish momentum. Monitor for continuation.`;
      confidence = 60;
    } else {
      reasoning = `RSI at ${rsiValue} indicates neutral market conditions. Wait for clear signals.`;
      confidence = 40;
    }

    // Adjust confidence based on market conditions
    const volumeChange = marketData.volume > 0 ? 1 : 0.9; // Slightly reduce confidence if no volume data
    confidence *= volumeChange;

    return {
      signal: rsiSignal,
      confidence: Math.round(confidence),
      reasoning
    };
  }

  // Search for symbols
  async searchSymbols(query: string): Promise<Array<{
    symbol: string;
    name: string;
    category: string;
    sector?: string;
  }>> {
    try {
      const lowerQuery = query.toLowerCase();
      const results: Array<{
        symbol: string;
        name: string;
        category: string;
        sector?: string;
      }> = [];

      // Search Indonesian symbols
      Object.entries(INDONESIAN_SYMBOLS).forEach(([symbol, data]) => {
        const symbolMatch = symbol.toLowerCase().includes(lowerQuery);
        const nameMatch = data.name?.toLowerCase().includes(lowerQuery);
        const sectorMatch = data.sector?.toLowerCase().includes(lowerQuery);

        if (symbolMatch || nameMatch || sectorMatch) {
          results.push({
            symbol,
            name: data.name || symbol,
            category: data.category,
            sector: data.sector
          });
        }
      });

      return results.slice(0, 10); // Limit to 10 results
    } catch (error) {
      console.error(`Symbol search error:`, error);
      return [];
    }
  }

  // Cache market data in Cloudflare KV
  async cacheMarketData(symbol: string, data: MarketPrice): Promise<void> {
    try {
      const cacheKey = `market_data_${symbol}`;
      const ttl = 60; // 1 minute cache
      await this.env.CACHE.put(cacheKey, JSON.stringify(data), { expirationTtl: ttl });
    } catch (error) {
      console.error(`Cache error for ${symbol}:`, error);
    }
  }

  // Get cached market data
  async getCachedMarketData(symbol: string): Promise<MarketPrice | null> {
    try {
      const cacheKey = `market_data_${symbol}`;
      const cached = await this.env.CACHE.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error(`Cache retrieval error for ${symbol}:`, error);
      return null;
    }
  }

  // Generate fallback historical data when API fails
  private generateFallbackHistoricalData(currentPrice: number): HistoricalData[] {
    const data: HistoricalData[] = [];
    const now = Date.now();
    const volatility = 0.002; // 0.2% volatility
    
    for (let i = 29; i >= 0; i--) {
      const timestamp = now - (i * 24 * 60 * 60 * 1000);
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const price = currentPrice * (1 + randomChange * i / 30);
      
      data.push({
        time: timestamp,
        open: price * 0.998,
        high: price * 1.003,
        low: price * 0.997,
        close: price,
        volume: Math.floor(Math.random() * 1000000) + 500000,
      });
    }
    
    return data;
  }

  // Generate basic indicators when API fails
  private generateBasicIndicators(currentPrice: number): TechnicalIndicator[] {
    return [
      {
        name: 'RSI',
        value: 50 + (Math.random() - 0.5) * 20,
        signal: 'NEUTRAL',
        description: 'Relative Strength Index (estimated)',
      },
      {
        name: 'MACD',
        value: (Math.random() - 0.5) * 0.01,
        signal: 'NEUTRAL',
        description: 'Moving Average Convergence Divergence (estimated)',
      },
      {
        name: 'SMA',
        value: currentPrice * (1 + (Math.random() - 0.5) * 0.02),
        signal: 'NEUTRAL',
        description: 'Simple Moving Average (estimated)',
      },
    ];
  }
}

// Export singleton function
export function createMarketDataService(env: Env): MarketDataService {
  return new MarketDataService(env);
}
