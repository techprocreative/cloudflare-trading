import { useState, useEffect } from 'react';

// Portfolio Types
export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  lastUpdated: Date;
  sector?: string;
  type: 'stock' | 'forex' | 'crypto';
  exchange?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  userId: string;
  holdings: PortfolioHolding[];
  totalValue: number;
  totalInvested: number;
  totalPnL: number;
  totalPnLPercent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioPerformance {
  totalValue: number;
  totalInvested: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  monthChange: number;
  monthChangePercent: number;
  yearChange: number;
  yearChangePercent: number;
}

// Indonesian Stock Market Data (Mock - Replace with real API)
export const INDONESIAN_STOCKS = [
  { symbol: 'BBCA.JK', name: 'Bank Central Asia', sector: 'Banking', price: 8500, change: 125 },
  { symbol: 'BBRI.JK', name: 'Bank Rakyat Indonesia', sector: 'Banking', price: 4200, change: -75 },
  { symbol: 'TLKM.JK', name: 'Telkom Indonesia', sector: 'Telecommunications', price: 3100, change: 50 },
  { symbol: 'UNVR.JK', name: 'Unilever Indonesia', sector: 'Consumer Goods', price: 2400, change: -30 },
  { symbol: 'ASII.JK', name: 'Astra International', sector: 'Automotive', price: 5200, change: 80 },
  { symbol: 'ICBP.JK', name: 'Indofood CBP Sukses Makmur', sector: 'Food & Beverage', price: 11250, change: 150 },
  { symbol: 'BMRI.JK', name: 'Bank Mandiri', sector: 'Banking', price: 4750, change: 100 },
  { symbol: 'BBNI.JK', name: 'Bank Negara Indonesia', sector: 'Banking', price: 3850, change: -50 },
  { symbol: 'GGRM.JK', name: 'Gudang Garam', sector: 'Tobacco', price: 26500, change: 300 },
  { symbol: 'ADRO.JK', name: 'Adaro Energy Indonesia', sector: 'Mining', price: 2150, change: -25 }
];

// Sample Portfolio Data
export const SAMPLE_PORTFOLIO: Portfolio = {
  id: 'main_portfolio',
  name: 'My Trading Portfolio',
  userId: 'user_123',
  holdings: [
    {
      id: '1',
      symbol: 'BBCA.JK',
      name: 'Bank Central Asia',
      quantity: 1000,
      avgBuyPrice: 8200,
      currentPrice: 8500,
      lastUpdated: new Date(),
      sector: 'Banking',
      type: 'stock',
      exchange: 'IDX'
    },
    {
      id: '2',
      symbol: 'TLKM.JK',
      name: 'Telkom Indonesia',
      quantity: 2000,
      avgBuyPrice: 2950,
      currentPrice: 3100,
      lastUpdated: new Date(),
      sector: 'Telecommunications',
      type: 'stock',
      exchange: 'IDX'
    },
    {
      id: '3',
      symbol: 'ASII.JK',
      name: 'Astra International',
      quantity: 500,
      avgBuyPrice: 5100,
      currentPrice: 5200,
      lastUpdated: new Date(),
      sector: 'Automotive',
      type: 'stock',
      exchange: 'IDX'
    }
  ],
  totalValue: 0,
  totalInvested: 0,
  totalPnL: 0,
  totalPnLPercent: 0,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date()
};

// Calculate portfolio metrics
export function calculatePortfolioMetrics(holdings: PortfolioHolding[]): PortfolioPerformance {
  let totalValue = 0;
  let totalInvested = 0;
  let totalPnL = 0;

  holdings.forEach(holding => {
    const invested = holding.quantity * holding.avgBuyPrice;
    const current = holding.quantity * holding.currentPrice;
    totalInvested += invested;
    totalValue += current;
    totalPnL += (current - invested);
  });

  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  return {
    totalValue,
    totalInvested,
    totalPnL,
    totalPnLPercent,
    dayChange: 0, // Would be calculated from daily price changes
    dayChangePercent: 0,
    monthChange: 0,
    monthChangePercent: 0,
    yearChange: 0,
    yearChangePercent: 0
  };
}

// Format currency in IDR
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Portfolio Service Hook
export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<Portfolio>(SAMPLE_PORTFOLIO);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Calculate portfolio metrics
    const updatedPortfolio = {
      ...portfolio,
      ...calculatePortfolioMetrics(portfolio.holdings)
    };
    setPortfolio(updatedPortfolio);
  }, [portfolio.holdings]);

  const addHolding = async (holding: Omit<PortfolioHolding, 'id' | 'lastUpdated'>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newHolding: PortfolioHolding = {
        ...holding,
        id: Date.now().toString(),
        lastUpdated: new Date()
      };

      setPortfolio(prev => ({
        ...prev,
        holdings: [...prev.holdings, newHolding],
        updatedAt: new Date()
      }));
    } catch (err) {
      setError('Failed to add holding');
    } finally {
      setIsLoading(false);
    }
  };

  const updateHolding = async (id: string, updates: Partial<PortfolioHolding>) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setPortfolio(prev => ({
        ...prev,
        holdings: prev.holdings.map(holding =>
          holding.id === id ? { ...holding, ...updates, lastUpdated: new Date() } : holding
        ),
        updatedAt: new Date()
      }));
    } catch (err) {
      setError('Failed to update holding');
    } finally {
      setIsLoading(false);
    }
  };

  const removeHolding = async (id: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setPortfolio(prev => ({
        ...prev,
        holdings: prev.holdings.filter(holding => holding.id !== id),
        updatedAt: new Date()
      }));
    } catch (err) {
      setError('Failed to remove holding');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    portfolio,
    performance: calculatePortfolioMetrics(portfolio.holdings),
    isLoading,
    error,
    addHolding,
    updateHolding,
    removeHolding
  };
}