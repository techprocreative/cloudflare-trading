import { create } from 'zustand';
export type SignalType = 'BUY' | 'SELL' | 'HOLD';
export interface Signal {
  pair: string;
  signal: SignalType;
  price: number;
  confidence: number;
  reasoning: string;
  timestamp: string;
}
export interface Trade {
  id: string;
  pair: string;
  action: 'BUY' | 'SELL';
  amount: number;
  price: number;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
}
interface SignalState {
  signal: Signal;
  trades: Trade[];
  lastEventTimestamp: string | null;
  updateSignal: (newSignal: Partial<Omit<Signal, 'timestamp'>>) => void;
  addTrade: (newTrade: Omit<Trade, 'id' | 'timestamp'>) => void;
}
const initialState: Signal = {
  pair: 'EUR/USD',
  signal: 'HOLD',
  price: 1.0752,
  confidence: 75,
  reasoning: 'Awaiting new market analysis from the AI assistant.',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
};
export const useSignalStore = create<SignalState>((set) => ({
  signal: initialState,
  trades: [],
  lastEventTimestamp: null,
  updateSignal: (newSignal) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    set((state) => ({
      signal: { ...state.signal, ...newSignal, timestamp },
      lastEventTimestamp: timestamp,
    }));
  },
  addTrade: (newTrade) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    set((state) => ({
      trades: [
        {
          ...newTrade,
          id: crypto.randomUUID(),
          timestamp,
        },
        ...state.trades,
      ].slice(0, 10), // Keep only the last 10 trades
      lastEventTimestamp: timestamp,
    }));
  },
}));