import { BaseMarketDataService } from './base';
import type { 
  MarketDataParams, 
  MarketDataResult 
} from '@/lib/types/market-data';

interface CapitalCandle {
  t: number;      // timestamp
  o: number;      // open
  h: number;      // high
  l: number;      // low
  c: number;      // close
  v: number;      // volume
}

export class CapitalService extends BaseMarketDataService {
  readonly id = 'capital' as const;
  readonly name = 'Capital.com';
  private readonly API_KEY: string;
  private readonly BASE_URL = 'https://api-capital.backend-capital.com/api/v1';

  constructor(apiKey: string) {
    super();
    this.API_KEY = apiKey;
  }

  async fetchData(params: MarketDataParams): Promise<MarketDataResult> {
    try {
      this.validateParams(params);

      const endpoint = `${this.BASE_URL}/financial-charts/${params.symbol}`;
      const queryParams = new URLSearchParams({
        interval: this.mapInterval(params.interval),
        from: this.calculateStartTimestamp(params.range).toString(),
        to: Date.now().toString(),
      });

      const response = await fetch(`${endpoint}?${queryParams}`, {
        headers: {
          'X-CAP-API-KEY': this.API_KEY,
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Capital.com API error: ${response.statusText}`);
      }

      const result = await response.json() as CapitalCandle[];
      
      if (!result || result.length === 0) {
        return {
          success: false,
          error: {
            code: 'NO_DATA',
            message: 'No se encontraron datos para los parámetros especificados'
          }
        };
      }

      return {
        success: true,
        data: {
          data: result.map(candle => ({
            timestamp: candle.t,
            open: candle.o,
            high: candle.h,
            low: candle.l,
            close: candle.c,
            volume: candle.v
          })),
          metadata: {
            symbol: params.symbol,
            interval: params.interval,
            lastUpdated: Date.now(),
            timezone: 'UTC',
            currency: this.detectCurrency(params.symbol)
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error)
      };
    }
  }

  private calculateStartTimestamp(range: string): number {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    
    switch (range) {
      case '1d': return now - day;
      case '5d': return now - (5 * day);
      case '1mo': return now - (30 * day);
      case '3mo': return now - (90 * day);
      case '6mo': return now - (180 * day);
      case '1y': return now - (365 * day);
      case '2y': return now - (730 * day);
      case '5y': return now - (1825 * day);
      case 'max': return 0;
      default: return now - (30 * day);
    }
  }

  private mapInterval(interval: string): string {
    const intervalMap: Record<string, string> = {
      '1m': 'M1',
      '5m': 'M5',
      '15m': 'M15',
      '30m': 'M30',
      '1h': 'H1',
      '4h': 'H4',
      '1d': 'D1',
      '1w': 'W1',
      '1mo': 'MN'
    };
    return intervalMap[interval] || 'D1';
  }

  private detectCurrency(symbol: string): string {
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
    const quote = currencies.find(curr => symbol.endsWith(curr));
    return quote || 'USD';
  }
} 