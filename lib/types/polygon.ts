import type { TimeInterval } from './market-data';
import type { FxData } from './types';

// Polygon API specific types
export interface PolygonCredentials {
  apiKey: string;
  baseUrl?: string;
}

export interface PolygonAggregateParams {
  ticker: string;
  multiplier: number;
  timespan: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  from: string;
  to: string;
  adjusted?: boolean;
  sort?: 'asc' | 'desc';
  limit?: number;
}

export interface PolygonBar {
  v: number;      // volume
  o: number;      // open price
  c: number;      // close price
  h: number;      // high price
  l: number;      // low price
  t: number;      // timestamp (Unix MS)
  n: number;      // number of transactions
  vw: number;     // volume weighted average price
}

export interface PolygonAggregateResponse {
  ticker: string;
  status: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
  results: PolygonBar[];
  request_id: string;
}

export interface PolygonError {
  status: string;
  request_id: string;
  message: string;
}

// Mapping functions types
export type PolygonTimeframeMap = {
  [K in TimeInterval]: {
    multiplier: number;
    timespan: PolygonAggregateParams['timespan'];
  };
};

// Utility type for transforming Polygon data to FxData
export type PolygonToFxDataTransformer = (bar: PolygonBar) => FxData;

// Configuration type for Polygon provider
export interface PolygonConfig {
  credentials: PolygonCredentials;
  timeframeMap: PolygonTimeframeMap;
  transformer: PolygonToFxDataTransformer;
} 