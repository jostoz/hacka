export const FOREX_CONFIG = {
  PAIRS: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD'],
  TIMEFRAMES: ['1m', '5m', '15m', '30m', '1h', '4h', 'D', 'W'] as const,
  DEFAULT_PERIODS: 100,
  MAX_PERIODS: 1000,
  RISK_LIMITS: {
    MIN: 0.1,
    MAX: 10,
    DEFAULT: 2
  },
  INDICATORS: {
    RSI: {
      PERIOD: 14,
      OVERBOUGHT: 70,
      OVERSOLD: 30
    },
    MACD: {
      FAST: 12,
      SLOW: 26,
      SIGNAL: 9
    },
    SMA: {
      PERIOD: 20
    }
  }
} as const;
