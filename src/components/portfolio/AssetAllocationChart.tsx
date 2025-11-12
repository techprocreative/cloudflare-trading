import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePortfolio, formatIDR } from '@/lib/portfolio';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#84cc16'];

export function AssetAllocationChart() {
  const { t } = useTranslation();
  const { portfolio } = usePortfolio();

  const allocationData = portfolio.holdings.map(holding => ({
    name: holding.symbol,
    value: holding.quantity * holding.currentPrice,
    percentage: ((holding.quantity * holding.currentPrice) / portfolio.holdings.reduce((sum, h) => sum + (h.quantity * h.currentPrice), 0)) * 100,
    sector: holding.sector || 'Unknown'
  }));

  if (portfolio.holdings.length === 0) {
    return (
      <Card className="border-white/10 bg-gray-800/50 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t('portfolio.assetAllocation', 'Asset Allocation')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Target className="h-16 w-16 mx-auto text-gray-400 mb-4 opacity-30" />
            <p className="text-gray-400">{t('portfolio.noHoldings', 'No holdings to display')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-gray-800/50 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {t('portfolio.assetAllocation', 'Asset Allocation')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                  labelLine={false}
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatIDR(value), 'Value']}
                  labelStyle={{ color: '#000' }}
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151', 
                    borderRadius: '8px', 
                    color: '#fff' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Allocation List */}
          <div className="space-y-3">
            {allocationData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-400">{item.sector}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatIDR(item.value)}</p>
                  <p className="text-sm text-gray-400">{item.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}