import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SignalHistoryItem {
  id: string;
  pair: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  timestamp: Date;
  reasoning: string;
}

export function SignalsPage() {
  const { t } = useTranslation();
  const [signals, setSignals] = useState<SignalHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSignalHistory();
  }, []);

  const fetchSignalHistory = async () => {
    try {
      const response = await fetch('/api/signals/history');
      const data = await response.json();
      setSignals(data.signals || []);
    } catch (error) {
      console.error('Failed to fetch signals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY': return <TrendingUp className="h-5 w-5 text-green-400" />;
      case 'SELL': return <TrendingDown className="h-5 w-5 text-red-400" />;
      default: return <Minus className="h-5 w-5 text-yellow-400" />;
    }
  };

  if (isLoading) {
    return <div className="h-full p-6 text-white">Loading signals...</div>;
  }

  return (
    <div className="h-full p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">{t('signals.title')}</h1>
      
      <div className="space-y-4">
        {signals.length === 0 ? (
          <Card className="bg-gray-800/50 border-white/10">
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">
                No signals yet. Start chatting with AI to generate signals.
              </p>
            </CardContent>
          </Card>
        ) : (
          signals.map((signal) => (
            <Card key={signal.id} className="bg-gray-800/50 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getSignalIcon(signal.signal)}
                    {signal.pair}
                  </CardTitle>
                  <Badge className={
                    signal.signal === 'BUY' ? 'bg-green-500/20 text-green-400' :
                    signal.signal === 'SELL' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }>
                    {signal.signal}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Price</p>
                    <p className="font-bold">{signal.price.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Confidence</p>
                    <p className="font-bold">{signal.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Time</p>
                    <p className="font-bold">
                      {new Date(signal.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-300">{signal.reasoning}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}