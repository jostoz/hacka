import yahooFinance from 'yahoo-finance2';
import { BaseMarketDataService } from './base';
import type { 
  MarketDataParams, 
  MarketDataResult, 
  TimeRange 
} from '@/lib/types/market-data';

export class YahooFinanceService extends BaseMarketDataService {
  readonly id = 'yahoo' as const;
  readonly name = 'Yahoo Finance';

  async fetchData(params: MarketDataParams): Promise<MarketDataResult> {
    try {
      this.validateParams(params);

      const queryOptions = {
        period1: this.calculateStartDate(params.range),
        interval: this.mapInterval(params.interval),
      };

      const result = await yahooFinance.historical(params.symbol, queryOptions);
      
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
            timestamp: new Date(candle.date).getTime(),
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: candle.volume || 0
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

  private calculateStartDate(range: TimeRange): Date {
    const now = new Date();
    switch (range) {
      case '1d': return new Date(now.setDate(now.getDate() - 1));
      case '5d': return new Date(now.setDate(now.getDate() - 5));
      case '1mo': return new Date(now.setMonth(now.getMonth() - 1));
      case '3mo': return new Date(now.setMonth(now.getMonth() - 3));
      case '6mo': return new Date(now.setMonth(now.getMonth() - 6));
      case '1y': return new Date(now.setFullYear(now.getFullYear() - 1));
      case '2y': return new Date(now.setFullYear(now.getFullYear() - 2));
      case '5y': return new Date(now.setFullYear(now.getFullYear() - 5));
      case 'max': return new Date(0);
      default: return new Date(now.setMonth(now.getMonth() - 1));
    }
  }

  private mapInterval(interval: string): string {
    const intervalMap: Record<string, string> = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '1h': '60m',
      '4h': '1h',
      '1d': '1d',
      '1w': '1wk',
      '1mo': '1mo'
    };
    return intervalMap[interval] || '1d';
  }

  private detectCurrency(symbol: string): string {
    // Detectar la moneda basado en el símbolo
    // Por ejemplo: EURUSD = USD, GBPJPY = JPY
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
    const quote = currencies.find(curr => symbol.endsWith(curr));
    return quote || 'USD';
  }
} 