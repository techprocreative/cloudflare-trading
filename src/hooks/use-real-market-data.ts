import { useState, useEffect } from 'react';
import { useSignalStore } from '@/store/signalStore';

interface MarketDataResponse {
  success: boolean;
  data?: {
    symbol: string;
    price: number;
    signal: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    reasoning: string;
    indicators?: any[];
    historicalData?: Array<{
      timestamp: number;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>;
  };
  error?: string;
}

interface ChartDataPoint {
  time: string;
  price: number;
}

export function useRealMarketData(pair: string) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const updateSignal = useSignalStore((state) => state.updateSignal);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let isMounted = true;

    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Call backend API (GET with query params)
        const response = await fetch(`/api/market/price?symbol=${encodeURIComponent(pair)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!isMounted) return;

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const result: MarketDataResponse = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch market data');
        }

        const data = result.data;
        
        if (!data) {
          throw new Error('No data received from API');
        }

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
          const chartPoints = data.historicalData.map((point) => ({
            time: new Date(point.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            price: point.close
          }));
          setChartData(chartPoints);
        } else {
          // Fallback: generate points from current price if no historical data
          const points: ChartDataPoint[] = [];
          let currentPrice = data.price;
          const now = Date.now();
          
          for (let i = 29; i >= 0; i--) {
            const timestamp = now - (i * 60000); // 1 minute intervals
            const variation = (Math.random() - 0.5) * (currentPrice * 0.002); // 0.2% variation
            points.push({
              time: new Date(timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              price: currentPrice + variation
            });
          }
          setChartData(points);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Market data fetch error:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Unknown error');
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchMarketData();

    // Poll every 30 seconds for updates
    interval = setInterval(fetchMarketData, 30000);

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [pair, updateSignal]);

  return { chartData, isLoading, error };
}
