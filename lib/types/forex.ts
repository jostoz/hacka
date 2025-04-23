export interface FxData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalAnalysisData {
  timestamp: number;
  value: number;
  indicator: string;
  parameters: Record<string, unknown>;
}

export interface QuantSignal {
  timestamp: number;
  direction: 'long' | 'short' | 'neutral';
  confidence: number;
  source: string;
  metadata?: Record<string, unknown>;
}

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';
export type ForexPair = 'EURUSD' | 'GBPUSD' | 'USDJPY' | 'AUDUSD' | 'USDCAD' | 'USDCHF' | 'NZDUSD';

export const isTimeframe = (value: unknown): value is Timeframe => {
  const validTimeframes: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
  return typeof value === 'string' && validTimeframes.includes(value as Timeframe);
};

export const isForexPair = (value: unknown): value is ForexPair => {
  const validPairs: ForexPair[] = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD'];
  return typeof value === 'string' && validPairs.includes(value as ForexPair);
};

export const isFxData = (value: unknown): value is FxData => {
  if (!value || typeof value !== 'object') return false;
  
  const data = value as Record<string, unknown>;
  return (
    typeof data.timestamp === 'number' &&
    typeof data.open === 'number' &&
    typeof data.high === 'number' &&
    typeof data.low === 'number' &&
    typeof data.close === 'number' &&
    typeof data.volume === 'number'
  );
};

export const isTechnicalAnalysisData = (value: unknown): value is TechnicalAnalysisData => {
  if (!value || typeof value !== 'object') return false;
  
  const data = value as Record<string, unknown>;
  return (
    typeof data.timestamp === 'number' &&
    typeof data.value === 'number' &&
    typeof data.indicator === 'string' &&
    typeof data.parameters === 'object' &&
    data.parameters !== null
  );
};

export const isQuantSignal = (value: unknown): value is QuantSignal => {
  if (!value || typeof value !== 'object') return false;
  
  const data = value as Record<string, unknown>;
  const validDirections = ['long', 'short', 'neutral'];
  
  return (
    typeof data.timestamp === 'number' &&
    typeof data.direction === 'string' &&
    validDirections.includes(data.direction) &&
    typeof data.confidence === 'number' &&
    typeof data.source === 'string' &&
    (data.metadata === undefined || (typeof data.metadata === 'object' && data.metadata !== null))
  );
}; 