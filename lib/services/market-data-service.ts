import type { FxData, Timeframe } from '../types/forex';

export interface MarketDataMetadata {
  source: string;
  timeframe: string;
  pair: string;
  lastUpdate: number;
}

export interface MarketDataService {
  fetchData(pair: string, timeframe: Timeframe): Promise<{
    data: FxData[];
    metadata: MarketDataMetadata;
  }>;
} 