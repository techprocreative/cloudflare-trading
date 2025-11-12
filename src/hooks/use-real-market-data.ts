import { useState, useEffect } from 'react';
import { useSignalStore } from '@/store/signalStore';

export function useRealMarketData(pair: string) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const updateSignal = useSignalStore((state) => state.updateSignal);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        
        // Call backend market service
        const response = await fetch('/api/market/signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pair })
        });

        if (!response.ok) throw new Error('Failed to fetch market data');

        const data = await response.json();
        
        // Update signal store with real data
        updateSignal({
          pair: data.pair,
          signal: data.signal,
          price: data.price,
          confidence: data.confidence,
          reasoning: data.reasoning
        });

        // Transform historical data for chart
        const chartPoints = data.historicalData.map((point: any) => ({
          time: new Date(point.timestamp).toLocaleTimeString(),
          price: point.close
        }));
        
        setChartData(chartPoints);
        setIsLoading(false);
      } catch (error) {
        console.error('Market data fetch error:', error);
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchMarketData();

    // Poll every 30 seconds for updates
    interval = setInterval(fetchMarketData, 30000);

    return () => clearInterval(interval);
  }, [pair, updateSignal]);

  return { chartData, isLoading };
}