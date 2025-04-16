export const FOREX_PAIRS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/CHF',
  'AUD/USD',
  'USD/CAD',
  'NZD/USD',
  'EUR/GBP',
  'EUR/JPY',
  'GBP/JPY'
] as const;

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

export type ForexPair = typeof FOREX_PAIRS[number];
export type Timeframe = typeof TIMEFRAMES[number];

// Default values for configuration
export const DEFAULT_PERIODS = 100;
export const DEFAULT_CAPITAL = 10000;
export const DEFAULT_RISK_PERCENTAGE = 1;

// Technical analysis constants
export const TECHNICAL_ANALYSIS = {
  RSI: {
    PERIODS: 14,
    OVERBOUGHT: 70,
    OVERSOLD: 30
  },
  MACD: {
    FAST_PERIODS: 12,
    SLOW_PERIODS: 26,
    SIGNAL_PERIODS: 9
  },
  SMA: {
    FAST_PERIODS: 10,
    SLOW_PERIODS: 20
  }
} as const;

// Also add some useful type guards
export const isValidForexPair = (pair: string): pair is ForexPair => {
  return FOREX_PAIRS.includes(pair as ForexPair);
};

export const isValidTimeframe = (timeframe: string): timeframe is Timeframe => {
  return TIMEFRAMES.includes(timeframe as Timeframe);
}; 