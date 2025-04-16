import { ForexPair, Timeframe } from './constants';

export interface FxData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface QuantSignal {
  direction: 'buy' | 'sell' | 'hold';
  entry?: number;
  stopLoss?: number;
  takeProfit?: number;
  positionSize?: number;
  riskAmount?: number;
}

export interface Forecast {
  nextPrice: number;
  confidence: number;
  trend: 'up' | 'down' | 'sideways';
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