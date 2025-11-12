// Market Data Service - Phase 2 Implementation
// Supports real-time data from multiple providers

export interface MarketPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
  source: string;
}

export interface HistoricalData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
}

// Popular Indonesian trading symbols
export const INDONESIAN_SYMBOLS = {
  // Forex Pairs
  'USD/IDR': { category: 'forex', baseCurrency: 'USD', quoteCurrency: 'IDR' },
  'EUR/IDR': { category: 'forex', baseCurrency: 'EUR', quoteCurrency: 'IDR' },
  'SGD/IDR': { category: 'forex', baseCurrency: 'SGD', quoteCurrency: 'IDR' },
  'JPY/IDR': { category: 'forex', baseCurrency: 'JPY', quoteCurrency: 'IDR' },
  'GBP/IDR': { category: 'forex', baseCurrency: 'GBP', quoteCurrency: 'IDR' },
  
  // Indonesian Stocks (IDX)
  'BBCA.JK': { category: 'stock', name: 'Bank Central Asia', sector: 'Banking' },
  'BBRI.JK': { category: 'stock', name: 'Bank BRI', sector: 'Banking' },
  'BMRI.JK': { category: 'stock', name: 'Bank Mandiri', sector: 'Banking' },
  'TLKM.JK': { category: 'stock', name: 'Telkom Indonesia', sector: 'Telecommunications' },
  'ASII.JK': { category: 'stock', name: 'Astra International', sector: 'Automotive' },
  'UNVR.JK': { category: 'stock', name: 'Unilever Indonesia', sector: 'Consumer Goods' },
  'ICBP.JK': { category: 'stock', name: 'Indofood CBP', sector: 'Food & Beverage' },
  'BBNI.JK': { category: 'stock', name: 'Bank BNI', sector: 'Banking' },
  'GGRM.JK': { category: 'stock', name: 'Gudang Garam', sector: 'Tobacco' },
  'ADRO.JK': { category: 'stock', name: 'Adaro Energy', sector: 'Mining' },
  
  // Crypto Pairs
  'BTC/USD': { category: 'crypto', name: 'Bitcoin' },
  'ETH/USD': { category: 'crypto', name: 'Ethereum' },
  'BNB/USD': { category: 'crypto', name: 'Binance Coin' },
  'BTC/IDR': { category: 'crypto', name: 'Bitcoin to IDR' },
  'ETH/IDR': { category: 'crypto', name: 'Ethereum to IDR' },
  
  // Indonesian Index
  '^JKSE': { category: 'index', name: 'Jakarta Composite Index (IHSG)' },
};

// Free API Providers
class MarketDataProvider {
  private apiKey: string;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Yahoo Finance (Free)
  async getYahooFinanceData(symbol: string): Promise<MarketPrice | null> {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`Yahoo Finance API error: ${response.status}`);
      
      const data = await response.json();
      const chart = data.chart?.result?.[0];
      
      if (!chart || !chart.meta || !chart.indicators?.quote?.[0]?.close) {
        return null;
      }

      const meta = chart.meta;
      const quotes = chart.indicators.quote[0];
      const latestClose = quotes.close[quotes.close.length - 1];
      const previousClose = quotes.close[quotes.close.length - 2] || meta.previousClose;

      return {
        symbol: meta.symbol,
        price: latestClose,
        change: latestClose - previousClose,
        changePercent: ((latestClose - previousClose) / previousClose) * 100,
        volume: quotes.volume[quotes.volume.length - 1] || 0,
        timestamp: Date.now(),
        source: 'Yahoo Finance'
      };
    } catch (error) {
      console.error(`Yahoo Finance error for ${symbol}:`, error);
      return null;
    }
  }

  // Alpha Vantage (Free tier - 500 requests/day)
  async getAlphaVantageData(symbol: string): Promise<MarketPrice | null> {
    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`Alpha Vantage API error: ${response.status}`);
      
      const data = await response.json();
      const quote = data['Global Quote'];
      
      if (!quote) {
        return null;
      }

      const price = parseFloat(quote['05. price']);
      const change = parseFloat(quote['09. change']);
      const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

      return {
        symbol: quote['01. symbol'],
        price,
        change,
        changePercent,
        volume: parseInt(quote['06. volume']) || 0,
        timestamp: Date.now(),
        source: 'Alpha Vantage'
      };
    } catch (error) {
      console.error(`Alpha Vantage error for ${symbol}:`, error);
      return null;
    }
  }

  // CoinGecko for Crypto (Free)
  async getCoinGeckoData(coinId: string, vsCurrency = 'usd'): Promise<MarketPrice | null> {
    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${vsCurrency}&include_24hr_change=true`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`CoinGecko API error: ${response.status}`);
      
      const data = await response.json();
      const coinData = data[coinId];
      
      if (!coinData) {
        return null;
      }

      return {
        symbol: coinId.toUpperCase(),
        price: coinData[vsCurrency],
        change: coinData[`${vsCurrency}_24h_change`] || 0,
        changePercent: coinData[`${vsCurrency}_24h_change`] || 0,
        volume: 0, // CoinGecko doesn't provide volume in simple price endpoint
        timestamp: Date.now(),
        source: 'CoinGecko'
      };
    } catch (error) {
      console.error(`CoinGecko error for ${coinId}:`, error);
      return null;
    }
  }

  // Cache management
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCachedData(key: string, data: any, ttlMs: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  // Main method to get current price
  async getCurrentPrice(symbol: string): Promise<MarketPrice | null> {
    const cacheKey = `price_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    let data: MarketPrice | null = null;

    // Try different providers based on symbol type
    if (INDONESIAN_SYMBOLS[symbol as keyof typeof INDONESIAN_SYMBOLS]?.category === 'crypto') {
      // Convert crypto symbol to CoinGecko ID
      const coinId = symbol.includes('BTC') ? 'bitcoin' : 
                    symbol.includes('ETH') ? 'ethereum' : 
                    symbol.includes('BNB') ? 'binancecoin' : symbol.toLowerCase();
      data = await this.getCoinGeckoData(coinId);
    } else {
      // Try Yahoo Finance first (free and reliable)
      data = await this.getYahooFinanceData(symbol);
      
      // Fallback to Alpha Vantage if Yahoo fails
      if (!data && this.apiKey) {
        data = await this.getAlphaVantageData(symbol);
      }
    }

    if (data) {
      // Cache for 1 minute
      this.setCachedData(cacheKey, data, 60000);
    }

    return data;
  }

  // Get historical data
  async getHistoricalData(symbol: string, period: string = '1d'): Promise<HistoricalData[]> {
    const cacheKey = `history_${symbol}_${period}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // For now, use Yahoo Finance for historical data
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${period}&range=1mo`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`Historical data error: ${response.status}`);
      
      const data = await response.json();
      const chart = data.chart?.result?.[0];
      
      if (!chart) return [];

      const timestamps = chart.timestamp;
      const opens = chart.indicators.quote[0].open;
      const highs = chart.indicators.quote[0].high;
      const lows = chart.indicators.quote[0].low;
      const closes = chart.indicators.quote[0].close;
      const volumes = chart.indicators.quote[0].volume;

      const historicalData: HistoricalData[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        historicalData.push({
          timestamp: timestamps[i] * 1000, // Convert to milliseconds
          open: opens[i],
          high: highs[i],
          low: lows[i],
          close: closes[i],
          volume: volumes[i] || 0
        });
      }

      // Cache historical data for 5 minutes
      this.setCachedData(cacheKey, historicalData, 300000);
      return historicalData;

    } catch (error) {
      console.error(`Historical data error for ${symbol}:`, error);
      return [];
    }
  }

  // Get multiple symbols at once
  async getMultiplePrices(symbols: string[]): Promise<MarketPrice[]> {
    const promises = symbols.map(symbol => this.getCurrentPrice(symbol));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<MarketPrice> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }

  // Get technical indicators (simplified)
  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicator[]> {
    const historicalData = await this.getHistoricalData(symbol);
    
    if (historicalData.length < 14) {
      return [{
        name: 'RSI',
        value: 50,
        signal: 'HOLD'
      }];
    }

    // Simple RSI calculation
    const closes = historicalData.map(d => d.close);
    const rsi = this.calculateRSI(closes);
    
    return [
      {
        name: 'RSI',
        value: rsi,
        signal: rsi > 70 ? 'SELL' : rsi < 30 ? 'BUY' : 'HOLD'
      }
    ];
  }

  // Simple RSI calculation
  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i < period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return Math.round(rsi * 100) / 100;
  }
}

// Singleton instance - No API key needed for basic functionality
export const marketDataProvider = new MarketDataProvider('');
