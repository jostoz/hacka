import fetch from 'node-fetch';
import type { MarketDataService } from '../market-data-service';
import type { FxData, Timeframe } from '../../types/forex';
import type { MarketDataMetadata } from '../market-data-service';
import { CapitalAuthService } from './capital/auth';
import { ForexApplicationError } from '../../errors/forex-application-error';

interface CapitalApiResponse {
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  timestamp: number[];
}

export class CapitalService implements MarketDataService {
  private readonly baseUrl = 'https://api.capital.com/v1';

  constructor(private readonly authService: CapitalAuthService) {}

  private validateTimeframe(timeframe: Timeframe): string {
    const timeframeMap: Record<Timeframe, string> = {
      '1m': '1MIN',
      '5m': '5MIN',
      '15m': '15MIN',
      '30m': '30MIN',
      '1h': '1H',
      '4h': '4H',
      '1d': 'D',
      '1w': 'W'
    };

    const validTimeframe = timeframeMap[timeframe];
    if (!validTimeframe) {
      throw ForexApplicationError.invalidTimeframe(timeframe);
    }

    return validTimeframe;
  }

  async fetchData(pair: string, timeframe: Timeframe): Promise<{ data: FxData[], metadata: MarketDataMetadata }> {
    try {
      const validTimeframe = this.validateTimeframe(timeframe);
      const headers = await this.authService.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/prices/${pair}?period=${validTimeframe}`, {
        headers
      });

      if (!response.ok) {
        throw ForexApplicationError.dataFetchError({
          status: response.status,
          statusText: response.statusText
        });
      }

      const rawData = (await response.json()) as CapitalApiResponse;
      
      const data: FxData[] = rawData.timestamp.map((timestamp, index) => ({
        timestamp,
        open: rawData.open[index],
        high: rawData.high[index],
        low: rawData.low[index],
        close: rawData.close[index],
        volume: 0 // Capital.com API doesn't provide volume data
      }));

      const metadata: MarketDataMetadata = {
        source: 'capital.com',
        timeframe: validTimeframe,
        pair,
        lastUpdate: Date.now()
      };

      return { data, metadata };
    } catch (error) {
      if (error instanceof ForexApplicationError) {
        throw error;
      }
      throw ForexApplicationError.dataFetchError(
        error instanceof Error ? { message: error.message } : { message: 'Unknown error' }
      );
    }
  }
} 