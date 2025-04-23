/**
 * Valid timeframe values for forex data
 */
export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';

/**
 * Represents a forex currency pair (e.g., 'EUR/USD', 'GBP/JPY')
 */
export type ForexPair = string;

/**
 * Structure for forex price data
 */
export interface FxData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  pair: ForexPair;
  timeframe: Timeframe;
}

export interface ForexDataRequest {
  pair: ForexPair;
  timeframe: Timeframe;
  from?: number;
  to?: number;
  limit?: number;
}

export interface ForexDataResponse {
  data: FxData[];
  pair: ForexPair;
  timeframe: Timeframe;
} 