export const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCrypto = (amount: number, symbol: string, decimals: number): string => {
  const options: Intl.NumberFormatOptions = {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  };
  
  const formatted = new Intl.NumberFormat('en-US', options).format(amount);
  return `${formatted} ${symbol}`;
};

export const formatPercent = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const formatLargeNumber = (num: number): string => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
};

// Indonesian number formatting
export const formatNumberID = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num);
};

// Price formatting for trading pairs
export const formatTradingPrice = (price: number, symbol: string): string => {
  if (symbol.includes('BTC')) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (symbol.includes('JPY')) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
};

// Indonesian trading pairs
export const INDONESIAN_PAIRS = [
  // Forex
  'USD/IDR',
  'EUR/IDR', 
  'SGD/IDR',
  'JPY/IDR',
  'GBP/IDR',
  
  // Indonesian Stocks (IDX)
  'BBCA.JK', // Bank BCA
  'BBRI.JK', // Bank BRI
  'BMRI.JK', // Bank Mandiri
  'TLKM.JK', // Telkom Indonesia
  'ASII.JK', // Astra International
  'UNVR.JK', // Unilever Indonesia
  'ICBP.JK', // Indofood CBP Sukses Makmur
  'BBNI.JK', // Bank BNI
  'GGRM.JK', // Gudang Garam
  'ADRO.JK', // Adaro Energy
  
  // Crypto pairs with IDR
  'BTC/IDR',
  'ETH/IDR',
  'BNB/IDR',
  'USDT/IDR',
  
  // Index
  '^JKSE', // Jakarta Composite Index (IHSG)
  
  // Major global pairs
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'BTC/USD',
  'ETH/USD',
  'GOLD/USD'
] as const;
