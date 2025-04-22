// Available forex pairs
export const FOREX_PAIRS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/CHF',
  'USD/CAD',
  'AUD/USD',
  'NZD/USD',
  'EUR/GBP',
  'EUR/JPY',
  'GBP/JPY',
  'USD/MXN'
] as const;

// Available timeframes
export const TIMEFRAMES = [
  '1m',
  '5m',
  '15m',
  '30m',
  '1h',
  '4h',
  'D',
  'W',
  'M'
] as const;

// Type definitions derived from constants
export type ForexPair = typeof FOREX_PAIRS[number];
export type Timeframe = typeof TIMEFRAMES[number];

// Default values
export const DEFAULT_PERIODS = 20;
export const DEFAULT_CAPITAL = 10000;
export const DEFAULT_RISK_PERCENTAGE = 1;

// Technical Analysis Constants
export const TECHNICAL_INDICATORS = {
  RSI: {
    OVERBOUGHT: 70,
    OVERSOLD: 30,
    PERIODS: 14
  },
  MACD: {
    FAST_PERIOD: 12,
    SLOW_PERIOD: 26,
    SIGNAL_PERIOD: 9
  },
  SMA: {
    FAST_PERIOD: 10,
    SLOW_PERIOD: 20
  }
} as const;

// Also add some useful type guards
export const isValidForexPair = (pair: string): pair is ForexPair => {
  return FOREX_PAIRS.includes(pair as ForexPair);
};

export const isValidTimeframe = (timeframe: string): timeframe is Timeframe => {
  return TIMEFRAMES.includes(timeframe as Timeframe);
}; 