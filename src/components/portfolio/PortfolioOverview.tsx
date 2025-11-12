import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target,
  Percent
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePortfolio, formatIDR } from '@/lib/portfolio';

export function PortfolioOverview() {
  const { t } = useTranslation();
  const { portfolio, performance, isLoading } = usePortfolio();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-white/10 bg-gray-800/50">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-700 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: t('portfolio.totalValue', 'Total Value'),
      value: formatIDR(performance.totalValue),
      icon: DollarSign,
      color: 'text-green-400',
      change: `+${performance.totalPnLPercent.toFixed(2)}%`,
      changeColor: performance.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
    },
    {
      title: t('portfolio.totalPnL', 'Total P&L'),
      value: formatIDR(performance.totalPnL),
      icon: performance.totalPnL >= 0 ? TrendingUp : TrendingDown,
      color: performance.totalPnL >= 0 ? 'text-green-400' : 'text-red-400',
      change: `${performance.totalPnLPercent.toFixed(2)}%`,
      changeColor: performance.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
    },
    {
      title: t('portfolio.totalInvested', 'Total Invested'),
      value: formatIDR(performance.totalInvested),
      icon: Target,
      color: 'text-blue-400',
      change: '',
      changeColor: 'text-gray-400'
    },
    {
      title: t('portfolio.holdings', 'Holdings'),
      value: portfolio.holdings.length.toString(),
      icon: Percent,
      color: 'text-purple-400',
      change: `${portfolio.holdings.length} assets`,
      changeColor: 'text-gray-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border-white/10 bg-gray-800/50 text-white hover:border-white/20 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  {stat.change && (
                    <p className={`text-sm mt-1 ${stat.changeColor}`}>
                      {stat.change}
                    </p>
                  )}
                </div>
                <div className={`h-12 w-12 rounded-full bg-gray-700/50 flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}