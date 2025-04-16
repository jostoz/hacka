import { z } from 'zod';

export interface MarketDataConfig {
  apiKey: string;
  baseUrl: string;
}

export interface HistoricalDataParams {
  symbol: string;
  interval: string;
  from: number;
  to: number;
}

export interface CapitalCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class MarketDataFactory {
  private config: MarketDataConfig;

  constructor(config: MarketDataConfig) {
    this.config = config;
  }

  async getHistoricalData(params: HistoricalDataParams): Promise<CapitalCandle[]> {
    try {
      const { symbol, interval, from, to } = params;
      const url = new URL(`${this.config.baseUrl}/api/v1/market-data/historical`);
      
      url.searchParams.append('symbol', symbol);
      url.searchParams.append('interval', interval);
      url.searchParams.append('from', from.toString());
      url.searchParams.append('to', to.toString());

      const response = await fetch(url.toString(), {
        headers: {
          'X-CAP-API-KEY': this.config.apiKey,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Capital.com API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.validateAndTransformCandles(data);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching historical data: ${error.message}`);
      }
      throw new Error('Unknown error fetching historical data');
    }
  }

  private validateAndTransformCandles(data: unknown): CapitalCandle[] {
    const CandleSchema = z.object({
      timestamp: z.number(),
      open: z.number(),
      high: z.number(),
      low: z.number(),
      close: z.number(),
      volume: z.number()
    });

    const DataSchema = z.array(CandleSchema);
    
    try {
      return DataSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid data format from Capital.com API: ${error.message}`);
      }
      throw new Error('Failed to validate data from Capital.com API');
    }
  }
} 