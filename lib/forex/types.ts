import type { Signal, Forecast, TechnicalAnalysisData, FxData } from '../types/types';

// Re-export common types
export type { Signal, Forecast, TechnicalAnalysisData, FxData };

// Forex-specific types
export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

export interface ForexPair {
  base: string;
  quote: string;
  pip: number;
  lotSize: number;
  minLot: number;
  maxLot: number;
  commission: number;
  spread: number;
}

export interface ForexPosition {
  pair: string;
  type: 'buy' | 'sell';
  lotSize: number;
  openPrice: number;
  stopLoss: number;
  takeProfit?: number;
  openTime: string;
  closeTime?: string;
  closePrice?: number;
  pnl?: number;
  status: 'open' | 'closed';
}

export interface ForexAccount {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  positions: ForexPosition[];
}

export interface ForexMarket {
  pair: string;
  bid: number;
  ask: number;
  spread: number;
  timestamp: string;
}

export interface TechnicalAnalysis {
  rsi: {
    value: number;
    signal: 'overbought' | 'oversold' | 'neutral';
  };
  macd: {
    value: number;
    signal: number;
    histogram: number;
    trend: 'bullish' | 'bearish' | 'neutral';
  };
  sma: {
    fast: number;
    slow: number;
    trend: 'bullish' | 'bearish' | 'neutral';
  };
}

export interface ForexConfig {
  pair: ForexPair;
  timeframe: Timeframe;
  periods: number;
  capital: number;
  riskPercentage: number;
}

export interface ForexError {
  message: string;
  code?: string;
  details?: unknown;
}

export type ForexResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ForexError;
}; 