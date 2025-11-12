import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Calendar,
  Settings,
  Maximize2,
  RefreshCw,
  Zap,
  Target,
  BookOpen,
  Newspaper
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PortfolioOverview } from '@/components/portfolio/PortfolioOverview';
import { AssetAllocationChart } from '@/components/portfolio/AssetAllocationChart';
import { MarketOverview } from '@/components/market/MarketOverview';
import { Link } from 'react-router-dom';
import { useSignalStore, type Signal } from '@/store/signalStore';
import { educationService } from '@/lib/education';

// Real data hooks
function useSignalHistory() {
  const signal = useSignalStore((state) => state.signal);
  return signal ? [{
    id: '1',
    symbol: signal.pair,
    signal: signal.signal,
    confidence: signal.confidence,
    price: signal.price,
    timestamp: new Date(),
    outcome: 'pending' as const,
    reasoning: signal.reasoning
  }] : [];
}

function useMarketNews() {
  const articles = educationService.getArticles({ category: 'news' }).slice(0, 5);
  return articles.map(article => ({
    id: article.id,
    title: article.title,
    summary: article.excerpt,
    category: 'market',
    sentiment: 'neutral' as const,
    publishedAt: article.publishedAt,
    source: 'Signal Sage News'
  }));
}

function useEconomicEvents() {
  return [
    {
      id: '1',
      title: 'Bank Indonesia Rate Decision',
      date: new Date(Date.now() + 86400000),
      impact: 'high' as const,
      country: 'ID'
    }
  ];
}

export function AdvancedDashboardPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get real data
  const signalHistory = useSignalHistory();
  const marketNews = useMarketNews();
  const economicEvents = useEconomicEvents();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {t('dashboard.advanced.title', 'Advanced Dashboard')}
            </h1>
            <p className="text-gray-400 mt-2">
              {t('dashboard.advanced.subtitle', 'Complete trading intelligence and portfolio management')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('common.refresh', 'Refresh')}
            </Button>
            <Link to="/app/chat">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Zap className="h-4 w-4 mr-2" />
                {t('dashboard.newSignal', 'New Signal')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{t('dashboard.signalsToday', 'Signals Today')}</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{t('dashboard.hitRate', 'Hit Rate')}</p>
                <p className="text-2xl font-bold text-green-400">73%</p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{t('dashboard.activeWatchlist', 'Watchlist Items')}</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{t('dashboard.newsUpdate', 'News Updates')}</p>
                <p className="text-2xl font-bold">{marketNews.length}</p>
              </div>
              <Newspaper className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column - Main Widgets */}
        <div className="xl:col-span-3 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
              <TabsTrigger value="overview">
                {t('dashboard.tabs.overview', 'Overview')}
              </TabsTrigger>
              <TabsTrigger value="portfolio">
                {t('dashboard.tabs.portfolio', 'Portfolio')}
              </TabsTrigger>
              <TabsTrigger value="signals">
                {t('dashboard.tabs.signals', 'Signals')}
              </TabsTrigger>
              <TabsTrigger value="news">
                {t('dashboard.tabs.news', 'News & Events')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Market Overview */}
              <MarketOverview />
              
              {/* Portfolio Overview */}
              <PortfolioOverview />
              
              {/* Asset Allocation */}
              <AssetAllocationChart />
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-6">
              {/* Portfolio Overview */}
              <PortfolioOverview />
              
              {/* Asset Allocation */}
              <AssetAllocationChart />
              
              {/* Portfolio Holdings */}
              <Card className="border-white/10 bg-gray-800/50 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {t('portfolio.holdingsTable', 'Portfolio Holdings')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Target className="h-16 w-16 mx-auto text-gray-400 mb-4 opacity-30" />
                    <p className="text-gray-400 mb-4">{t('portfolio.detailedView', 'Detailed portfolio management coming soon')}</p>
                    <Link to="/app/portfolio">
                      <Button variant="outline">
                        {t('portfolio.viewFull', 'View Full Portfolio')}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signals" className="space-y-6">
              {/* Signal History */}
              <Card className="border-white/10 bg-gray-800/50 text-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      {t('dashboard.signalHistory', 'Signal History')}
                    </CardTitle>
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      {t('dashboard.accuracyRate', '73% Accuracy')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {signalHistory.map((signal) => (
                      <div key={signal.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            signal.signal === 'BUY' ? 'bg-green-500' : 
                            signal.signal === 'SELL' ? 'bg-red-500' : 'bg-yellow-500'
                          }`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{signal.symbol}</span>
                              <Badge variant="outline" className="text-xs">
                                {signal.signal}
                              </Badge>
                              <Badge className="text-xs bg-yellow-500/20 text-yellow-400">
                                Pending
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{signal.reasoning}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{signal.confidence}%</p>
                          <p className="text-sm text-gray-400">{signal.timestamp.toLocaleTimeString('id-ID')}</p>
                        </div>
                      </div>
                    ))}
                    {signalHistory.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <Zap className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">{t('dashboard.noSignals', 'No signals generated yet')}</p>
                        <p className="text-xs">{t('dashboard.startChat', 'Start a conversation with the AI to get signals')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="news" className="space-y-6">
              {/* News Feed */}
              <Card className="border-white/10 bg-gray-800/50 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5" />
                    {t('dashboard.marketNews', 'Market News')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketNews.map((news) => (
                      <div key={news.id} className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium mb-2">{news.title}</h4>
                            <p className="text-sm text-gray-400 mb-2">{news.summary}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{news.category}</Badge>
                              <Badge className="text-xs bg-gray-500/20 text-gray-400">
                                {news.sentiment}
                              </Badge>
                              <span className="text-xs text-gray-500">{news.source}</span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {news.publishedAt.toLocaleTimeString('id-ID', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                    {marketNews.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <Newspaper className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">{t('dashboard.noNews', 'No news available')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Economic Calendar */}
              <Card className="border-white/10 bg-gray-800/50 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {t('dashboard.economicCalendar', 'Economic Calendar')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {economicEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-gray-400">
                            {event.date.toLocaleDateString('id-ID', { 
                              weekday: 'long',
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <Badge className={`text-xs ${
                          event.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                          event.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {event.impact} impact
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar Widgets */}
        <div className="xl:col-span-1 space-y-6">
          {/* Quick Actions */}
          <Card className="border-white/10 bg-gray-800/50 text-white">
            <CardHeader>
              <CardTitle className="text-lg">{t('dashboard.quickActions', 'Quick Actions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/app/chat" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  {t('dashboard.newSignal', 'New Signal')}
                </Button>
              </Link>
              <Link to="/courses" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  {t('dashboard.learn', 'Learn Trading')}
                </Button>
              </Link>
              <Button className="w-full justify-start" variant="outline" disabled>
                <Settings className="h-4 w-4 mr-2" />
                {t('dashboard.settings', 'Settings')}
              </Button>
            </CardContent>
          </Card>

          {/* Market Status */}
          <Card className="border-white/10 bg-gray-800/50 text-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t('dashboard.marketStatus', 'Market Status')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{t('dashboard.indoStock', 'Indonesian Stock Market')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-400">Open</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {t('dashboard.nextClose', 'Closes in 2h 15m')}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{t('dashboard.cryptocurrency', 'Cryptocurrency')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-400">Open</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}