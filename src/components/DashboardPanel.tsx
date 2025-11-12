import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceDot } from 'recharts';
import { ArrowUp, ArrowDown, TrendingUp, Zap, Clock, Minus, User } from 'lucide-react';
import { useSignalStore } from '@/store/signalStore';
import { motion } from 'framer-motion';
import { TradeHistory } from './TradeHistory';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarketSelector } from './MarketSelector';
import { useRealMarketData } from '@/hooks/use-real-market-data';
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/20 bg-gray-900/80 p-3 text-sm text-white backdrop-blur-sm">
        <p className="font-bold">{`Time: ${label}`}</p>
        <p className="text-indigo-400">{`Price: ${payload[0].value.toFixed(4)}`}</p>
      </div>
    );
  }
  return null;
};
export function DashboardPanel() {
  const { t } = useTranslation();
  const [selectedPair, setSelectedPair] = useState('EUR/USD');
  const { chartData, isLoading, error } = useRealMarketData(selectedPair);
  const latestSignal = useSignalStore((state) => state.signal);
  const lastEventTimestamp = useSignalStore((state) => state.lastEventTimestamp);
  
  const eventDataPoint = useMemo(() => {
    if (!lastEventTimestamp) return null;
    return chartData.find(d => d.time === lastEventTimestamp) || null;
  }, [chartData, lastEventTimestamp]);
  const getSignalAppearance = () => {
    switch (latestSignal.signal) {
      case 'BUY':
        return {
          Icon: ArrowUp,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
        };
      case 'SELL':
        return {
          Icon: ArrowDown,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
        };
      default: // HOLD
        return {
          Icon: Minus,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
        };
    }
  };
  const { Icon: SignalIcon, color: signalColor, bgColor: signalBgColor } = getSignalAppearance();
  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-6 text-white">
      <header className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
            <p className="text-gray-400 mt-1">
              {t('dashboard.subtitle', { pair: selectedPair })}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-gray-800/50 px-4 py-2 text-sm">
            <User className="h-5 w-5 text-indigo-400" />
            <div>
              <span className="text-gray-400">{t('dashboard.accountId')}:</span>
              <span className="ml-2 font-mono font-bold text-white">11266275</span>
            </div>
          </div>
        </div>
        
        {/* Market Selector */}
        <div className="mt-6">
          <MarketSelector
            currentPair={selectedPair}
            onPairChange={setSelectedPair}
            className="w-full"
          />
        </div>
      </header>

      {/* Error State */}
      {error && (
        <div className="mb-8 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="text-red-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-red-300">Failed to load market data</p>
              <p className="text-xs text-red-400 mt-1">{error}</p>
              <p className="text-xs text-gray-400 mt-1">
                Make sure OpenRouter API key is configured in wrangler.jsonc
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="mb-8 flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-sm text-gray-400">Loading real market data for {selectedPair}...</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {!isLoading && !error && chartData.length > 0 && (
        <div className="mb-8 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 0.001', 'dataMax + 0.001']} tickFormatter={(value) => `${Number(value).toFixed(4)}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Area type="monotone" dataKey="price" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" name={`${selectedPair} Price`} />
              {eventDataPoint && (
                <ReferenceDot
                  x={eventDataPoint.time}
                  y={eventDataPoint.price}
                  r={6}
                  fill="#facc15"
                  stroke="#a16207"
                  strokeWidth={2}
                  isFront={true}
                >
                  <animate attributeName="r" from="6" to="12" dur="1s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="1" to="0.5" dur="1s" repeatCount="indefinite" />
                </ReferenceDot>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-white/10 bg-gray-800/50 text-white transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">{t('dashboard.latestSignal')}</CardTitle>
            <Zap className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <motion.div key={latestSignal.timestamp + 'signal'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${signalBgColor}`}>
                <SignalIcon className={`h-6 w-6 ${signalColor}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${signalColor}`}>{latestSignal.signal}</p>
                <p className="text-xs text-gray-400">{latestSignal.pair}</p>
              </div>
            </motion.div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-gray-800/50 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">{t('dashboard.signalDetails')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <motion.div key={latestSignal.timestamp + 'details'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-2xl font-bold">{latestSignal.price.toFixed(4)}</div>
              <p className="text-xs text-gray-400">
                {t('dashboard.confidence')}: <span className="font-semibold text-indigo-400">{latestSignal.confidence}%</span>
              </p>
            </motion.div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-gray-800/50 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">{t('dashboard.signalTime')}</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <motion.div key={latestSignal.timestamp + 'time'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-2xl font-bold">{latestSignal.timestamp}</div>
              <p className="text-xs text-gray-400">{t('dashboard.localTime')}</p>
            </motion.div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-white/10 bg-gray-800/50 text-white">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-300">{t('dashboard.aiReasoning')}</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.p key={latestSignal.timestamp + 'reasoning'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-300">
              {latestSignal.reasoning}
            </motion.p>
          </CardContent>
        </Card>
        <TradeHistory />
      </div>
    </div>
  );
}