import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Clock,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { INDONESIAN_STOCKS } from '@/lib/portfolio';
import { formatIDR } from '@/lib/portfolio';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
}

interface WatchlistItem {
  symbol: string;
  addedAt: Date;
  priceAlert?: number;
}

// Mock market data generator
function generateMarketData(): MarketData[] {
  return INDONESIAN_STOCKS.map(stock => ({
    symbol: stock.symbol,
    name: stock.name,
    price: stock.price,
    change: stock.change,
    changePercent: (stock.change / stock.price) * 100,
    volume: Math.floor(Math.random() * 1000000) + 100000,
    marketCap: stock.price * Math.floor(Math.random() * 50000000) + 10000000
  }));
}

// Mock watchlist data
const MOCK_WATCHLIST: WatchlistItem[] = [
  { symbol: 'BBCA.JK', addedAt: new Date('2024-01-15') },
  { symbol: 'TLKM.JK', addedAt: new Date('2024-01-20') },
  { symbol: 'ASII.JK', addedAt: new Date('2024-01-25') }
];

// Indonesian Index Data
const INDONESIAN_INDEX = {
  name: 'IHSG',
  symbol: '^JKSE',
  value: 7125.48,
  change: 45.32,
  changePercent: 0.64,
  lastUpdated: new Date()
};

export function MarketOverview() {
  const { t } = useTranslation();
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(MOCK_WATCHLIST);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Generate initial market data
  useEffect(() => {
    setMarketData(generateMarketData());
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      setMarketData(generateMarketData());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMarketData(generateMarketData());
    setIsLoading(false);
  };

  const addToWatchlist = (symbol: string) => {
    if (!watchlist.find(item => item.symbol === symbol)) {
      setWatchlist([...watchlist, { symbol, addedAt: new Date() }]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(item => item.symbol !== symbol));
  };

  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    return {
      color: isPositive ? 'text-green-400' : 'text-red-400',
      icon: isPositive ? TrendingUp : TrendingDown,
      text: `${isPositive ? '+' : ''}${change.toFixed(0)} (${isPositive ? '+' : ''}${changePercent.toFixed(2)}%)`
    };
  };

  const getWatchlistData = () => {
    return watchlist.map(item => {
      const market = marketData.find(m => m.symbol === item.symbol);
      return market ? { ...item, ...market } : null;
    }).filter(Boolean);
  };

  const getTopGainers = () => {
    return marketData
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 5);
  };

  const getTopLosers = () => {
    return marketData
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 5);
  };

  const getMostActive = () => {
    return marketData
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))
      .slice(0, 5);
  };

  const indexChange = formatChange(INDONESIAN_INDEX.change, INDONESIAN_INDEX.changePercent);
  const IndexIcon = indexChange.icon;

  return (
    <Card className="border-white/10 bg-gray-800/50 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t('market.overview', 'Market Overview')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <div className="text-sm text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Indonesian Index */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{INDONESIAN_INDEX.name}</h3>
              <p className="text-2xl font-bold text-white mt-1">{INDONESIAN_INDEX.value.toLocaleString('id-ID')}</p>
            </div>
            <div className={`flex items-center gap-1 ${indexChange.color}`}>
              <IndexIcon className="h-5 w-5" />
              <span className="font-medium">{indexChange.text}</span>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-gray-700/50">
            <TabsTrigger value="overview">{t('market.tabs.overview', 'Overview')}</TabsTrigger>
            <TabsTrigger value="watchlist">{t('market.tabs.watchlist', 'Watchlist')}</TabsTrigger>
            <TabsTrigger value="gainers">{t('market.tabs.gainers', 'Top Gainers')}</TabsTrigger>
            <TabsTrigger value="losers">{t('market.tabs.losers', 'Top Losers')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Most Active */}
              <div>
                <h4 className="font-medium text-sm text-gray-300 mb-3">
                  {t('market.mostActive', 'Most Active')}
                </h4>
                <div className="space-y-2">
                  {getMostActive().map((stock) => {
                    const change = formatChange(stock.change, stock.changePercent);
                    const ChangeIcon = change.icon;
                    return (
                      <div key={stock.symbol} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                        <div>
                          <p className="font-medium text-sm">{stock.symbol}</p>
                          <p className="text-xs text-gray-400">{stock.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatIDR(stock.price)}</p>
                          <div className={`flex items-center gap-1 text-xs ${change.color}`}>
                            <ChangeIcon className="h-3 w-3" />
                            <span>{stock.change.toFixed(0)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Market Summary */}
              <div>
                <h4 className="font-medium text-sm text-gray-300 mb-3">
                  {t('market.summary', 'Market Summary')}
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded">
                    <span className="text-sm text-gray-300">
                      {t('market.advancing', 'Advancing')}
                    </span>
                    <Badge className="bg-green-500/20 text-green-400">
                      {marketData.filter(s => s.change > 0).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded">
                    <span className="text-sm text-gray-300">
                      {t('market.declining', 'Declining')}
                    </span>
                    <Badge className="bg-red-500/20 text-red-400">
                      {marketData.filter(s => s.change < 0).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded">
                    <span className="text-sm text-gray-300">
                      {t('market.unchanged', 'Unchanged')}
                    </span>
                    <Badge className="bg-gray-500/20 text-gray-400">
                      {marketData.filter(s => s.change === 0).length}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="watchlist" className="mt-6">
            <div className="space-y-2">
              {getWatchlistData().length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Eye className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{t('market.watchlistEmpty', 'Your watchlist is empty')}</p>
                  <p className="text-xs">{t('market.watchlistHint', 'Add stocks to track their performance')}</p>
                </div>
              ) : (
                getWatchlistData().map((stock) => {
                  const change = formatChange(stock!.change, stock!.changePercent);
                  const ChangeIcon = change.icon;
                  return (
                    <div key={stock!.symbol} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{stock!.symbol}</h4>
                          <Badge variant="outline" className="text-xs">
                            {stock!.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          Added {stock!.addedAt.toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{formatIDR(stock!.price)}</p>
                          <div className={`flex items-center gap-1 text-sm ${change.color}`}>
                            <ChangeIcon className="h-3 w-3" />
                            <span>{change.text}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromWatchlist(stock!.symbol)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <EyeOff className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="gainers" className="mt-6">
            <div className="space-y-2">
              {getTopGainers().map((stock, index) => {
                const change = formatChange(stock.change, stock.changePercent);
                const ChangeIcon = change.icon;
                return (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <div>
                        <h4 className="font-medium">{stock.symbol}</h4>
                        <p className="text-sm text-gray-400">{stock.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatIDR(stock.price)}</p>
                      <div className={`flex items-center gap-1 text-sm ${change.color}`}>
                        <ChangeIcon className="h-3 w-3" />
                        <span>{change.text}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="losers" className="mt-6">
            <div className="space-y-2">
              {getTopLosers().map((stock, index) => {
                const change = formatChange(stock.change, stock.changePercent);
                const ChangeIcon = change.icon;
                return (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <div>
                        <h4 className="font-medium">{stock.symbol}</h4>
                        <p className="text-sm text-gray-400">{stock.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatIDR(stock.price)}</p>
                      <div className={`flex items-center gap-1 text-sm ${change.color}`}>
                        <ChangeIcon className="h-3 w-3" />
                        <span>{change.text}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}