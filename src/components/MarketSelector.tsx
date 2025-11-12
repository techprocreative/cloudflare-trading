import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { INDONESIAN_SYMBOLS } from '@/lib/marketData';

interface MarketSelectorProps {
  onPairChange: (pair: string) => void;
  currentPair: string;
}

export function MarketSelector({ onPairChange, currentPair }: MarketSelectorProps) {
  const symbols = Object.keys(INDONESIAN_SYMBOLS);

  return (
    <Select value={currentPair} onValueChange={onPairChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select market" />
      </SelectTrigger>
      <SelectContent>
        {symbols.map((symbol) => (
          <SelectItem key={symbol} value={symbol}>
            {symbol}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}