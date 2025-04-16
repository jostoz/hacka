import type { FxData } from './types';

export type MarketDataSource = 'yahoo' | 'capital' | 'polygon';

export type TimeInterval = 
    | '1m' 
    | '5m' 
    | '15m' 
    | '30m' 
    | '1h' 
    | '4h' 
    | '1d' 
    | '1w';

export type TimeRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | 'max';

export interface MarketDataParams {
  symbol: string;
  interval: TimeInterval;
  range: TimeRange;
  source: MarketDataSource;
}

export interface MarketDataResponse {
  data: FxData[];
  metadata: {
    symbol: string;
    interval: TimeInterval;
    lastUpdated: number;
    timezone: string;
    currency: string;
  };
}

export interface MarketDataError {
  code: string;
  message: string;
  details?: unknown;
}

export interface MarketDataResult {
  success: boolean;
  data?: MarketDataResponse;
  error?: MarketDataError;
}

export interface MarketDataProvider {
  readonly id: MarketDataSource;
  readonly name: string;
  fetchData(params: MarketDataParams): Promise<MarketDataResult>;
}

export type CapitalResolution = TimeInterval;

export interface CapitalTimeframe {
    resolution: CapitalResolution;
    maxRange: number; // Maximum time range in milliseconds
    minRange: number; // Minimum time range in milliseconds
    maxBars: number; // Maximum number of bars that can be returned
}

export interface OHLCV {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
    returns?: number;
    volatility?: number;
}

export interface HistoricalDataParams {
    symbol: string;
    source: string;
    interval: string;
    startDate?: number;
    endDate?: number;
    period?: string;
}

export interface CapitalHistoricalDataParams {
    symbol: string;
    resolution: CapitalResolution;
    from?: number;
    to?: number;
    format: 'json';
} 