import yahooFinance from 'yahoo-finance2';
import type { 
    MarketDataProvider, 
    MarketDataParams, 
    MarketDataResult,
    MarketDataResponse,
    TimeInterval,
    TimeRange,
    OHLCV
} from '@/lib/types/market-data';
import { BaseMarketDataService } from './base';
import { validateHistoricalDataParams, validateOHLCVData, calculateReturns, calculateVolatility } from '@/lib/utils/market-data';

interface YahooQueryOptions {
    period1: Date;
    period2: Date;
    interval: '1d' | '1mo' | '1wk';
}

interface YahooHistoricalRow {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

export class YahooFinanceService extends BaseMarketDataService implements MarketDataProvider {
    public readonly id = 'yahoo' as const;
    public readonly name = 'Yahoo Finance';

    private readonly INTERVAL_MAP: Record<TimeInterval, '1d' | '1mo' | '1wk'> = {
        '1m': '1d',
        '5m': '1d',
        '15m': '1d',
        '30m': '1d',
        '1h': '1d',
        '4h': '1d',
        '1d': '1d',
        '1w': '1wk'
    } as const;

    private readonly MAX_BARS = 2000;
    private readonly MIN_BARS = 2;

    public async fetchData(params: MarketDataParams): Promise<MarketDataResult> {
        try {
            // Validate input parameters
            const validationResult = validateHistoricalDataParams(params);
            if (validationResult === null) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_PARAMS',
                        message: 'Invalid parameters'
                    }
                };
            }

            const { symbol, interval, range } = params;
            const queryOptions = await this.buildQueryOptions(interval, range);

            // Fetch historical data
            const result = await yahooFinance.historical(symbol, {
                ...queryOptions,
                events: 'history',
                includeAdjustedClose: true
            }) as YahooHistoricalRow[];
            
            if (!result || result.length === 0) {
                return {
                    success: false,
                    error: {
                        code: 'NO_DATA',
                        message: `No data found for symbol ${symbol}`
                    }
                };
            }

            // Transform and validate data
            const ohlcvData = this.transformToOHLCV(result);
            const isValidData = validateOHLCVData(ohlcvData);
            
            if (isValidData === null) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_DATA',
                        message: 'Invalid OHLCV data structure'
                    }
                };
            }

            // Calculate additional metrics
            const enrichedData = this.enrichData(ohlcvData);

            const response: MarketDataResponse = {
                data: enrichedData.map(candle => ({
                    ...candle,
                    volume: candle.volume || 0
                })),
                metadata: {
                    symbol,
                    interval,
                    lastUpdated: Date.now(),
                    timezone: 'UTC',
                    currency: this.detectCurrency(symbol)
                }
            };

            return {
                success: true,
                data: response
            };

        } catch (error: unknown) {
            return {
                success: false,
                error: {
                    code: 'YAHOO_API_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error occurred'
                }
            };
        }
    }

    private async buildQueryOptions(interval: TimeInterval, range: TimeRange): Promise<YahooQueryOptions> {
        const period2 = new Date();
        const period1 = this.calculateStartDate(range);
        
        return {
            period1,
            period2,
            interval: this.mapInterval(interval)
        };
    }

    private calculateStartDate(range: TimeRange): Date {
        const now = new Date();
        const ranges: Record<TimeRange, number> = {
            '1d': 1,
            '5d': 5,
            '1mo': 30,
            '3mo': 90,
            '6mo': 180,
            '1y': 365,
            '2y': 730,
            '5y': 1825,
            'max': 3650
        };

        const days = ranges[range];
        return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }

    private mapInterval(interval: TimeInterval): '1d' | '1mo' | '1wk' {
        return this.INTERVAL_MAP[interval];
    }

    private transformToOHLCV(data: YahooHistoricalRow[]): OHLCV[] {
        return data.map(row => ({
            timestamp: row.date.getTime(),
            open: row.open,
            high: row.high,
            low: row.low,
            close: row.close,
            volume: row.volume
        }));
    }

    private enrichData(data: OHLCV[]): OHLCV[] {
        // Calculate returns
        const withReturns = calculateReturns(data);
        
        // Calculate volatility (20-period by default)
        const enriched = calculateVolatility(withReturns, 20);
        
        return enriched;
    }

    private detectCurrency(symbol: string): string {
        const parts = symbol.split('/');
        return parts.length === 2 ? parts[1] : 'USD';
    }
} 