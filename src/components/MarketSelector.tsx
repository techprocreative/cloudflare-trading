import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel
} from '@/components/ui/select';
import { INDONESIAN_SYMBOLS } from '@/lib/marketData';
import { TrendingUp, Bitcoin, Building2, Globe } from 'lucide-react';

interface MarketSelectorProps {
  onPairChange: (pair: string) => void;
  currentPair: string;
  className?: string;
}

export function MarketSelector({ onPairChange, currentPair, className = '' }: MarketSelectorProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Group symbols by category
  const groupedSymbols = Object.entries(INDONESIAN_SYMBOLS).reduce((acc, [symbol, info]) => {
    const category = info.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ symbol, ...info });
    return acc;
  }, {} as Record<string, Array<{ symbol: string; name: string; category: string }>>);

  // Category labels and icons
  const categoryConfig = {
    forex: {
      label: 'Forex',
      icon: Globe,
      color: 'text-blue-400'
    },
    stock: {
      label: 'Indonesian Stocks (IDX)',
      icon: Building2,
      color: 'text-green-400'
    },
    crypto: {
      label: 'Cryptocurrency',
      icon: Bitcoin,
      color: 'text-orange-400'
    },
    index: {
      label: 'Market Indices',
      icon: TrendingUp,
      color: 'text-purple-400'
    }
  };

  // Get display name for current pair
  const currentSymbolInfo = INDONESIAN_SYMBOLS[currentPair as keyof typeof INDONESIAN_SYMBOLS];
  const displayName = currentSymbolInfo?.name || currentPair;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select value={currentPair} onValueChange={onPairChange}>
        <SelectTrigger className="w-[280px] bg-gray-800 border-white/10 text-white">
          <SelectValue>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="font-semibold">{currentPair}</span>
              <span className="text-xs text-gray-400 hidden sm:inline">• {displayName}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-white/10 text-white max-h-[400px]">
          {Object.entries(groupedSymbols).map(([category, symbols]) => {
            const config = categoryConfig[category as keyof typeof categoryConfig];
            const Icon = config?.icon || TrendingUp;
            
            return (
              <SelectGroup key={category}>
                <SelectLabel className="text-gray-400 flex items-center gap-2 py-2">
                  <Icon className={`h-4 w-4 ${config?.color || 'text-gray-400'}`} />
                  {config?.label || category.toUpperCase()}
                </SelectLabel>
                {symbols.map((item) => (
                  <SelectItem 
                    key={item.symbol} 
                    value={item.symbol}
                    className="text-white hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full gap-3">
                      <span className="font-medium">{item.symbol}</span>
                      <span className="text-xs text-gray-400 truncate">{item.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          })}
        </SelectContent>
      </Select>
      
      {/* Quick access buttons for popular pairs */}
      <div className="hidden lg:flex items-center gap-1">
        {['EUR/USD', 'BTC/USD', 'USD/IDR'].map((pair) => (
          <button
            key={pair}
            onClick={() => onPairChange(pair)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              currentPair === pair
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {pair}
          </button>
        ))}
      </div>
    </div>
  );
}
