import { z } from 'zod';
import type { 
    OHLCV, 
    HistoricalDataParams, 
    CapitalResolution, 
    CapitalHistoricalDataParams,
    TimeInterval 
} from '../types/market-data';
import { ForexApplicationError } from '../types/errors';

// Zod schema for OHLCV data validation
export const OHLCVSchema = z.object({
    timestamp: z.number(),
    open: z.number(),
    high: z.number(),
    low: z.number(),
    close: z.number(),
    volume: z.number().optional(),
    returns: z.number().optional(),
    volatility: z.number().optional()
});

// Type inference from schema
export type OHLCVType = z.infer<typeof OHLCVSchema>;

// Zod schema for historical data parameters
export const HistoricalDataParamsSchema = z.object({
    symbol: z.string(),
    source: z.string(),
    interval: z.string(),
    startDate: z.number().optional(),
    endDate: z.number().optional(),
    period: z.string().optional()
});

/**
 * Validates historical data parameters
 * @throws {ForexApplicationError} If validation fails
 */
export function validateHistoricalDataParams(params: HistoricalDataParams): void {
    try {
        HistoricalDataParamsSchema.parse(params);
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new ForexApplicationError(
                'VALIDATION_ERROR',
                `Invalid historical data parameters: ${error.message}`
            );
        }
        throw error;
    }
}

/**
 * Maps time intervals to capital resolutions
 */
const CAPITAL_RESOLUTION_MAP = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '30m': '30m',
    '1h': '1h',
    '4h': '4h',
    '1d': '1d',
    '1w': '1w'
} as const;

// Type for resolution map keys
export type SupportedTimeInterval = keyof typeof CAPITAL_RESOLUTION_MAP;

/**
 * Maps interval to capital resolution
 * @throws {ForexApplicationError} If interval is not supported
 */
export function mapCapitalResolution(interval: TimeInterval): CapitalResolution {
    const resolution = CAPITAL_RESOLUTION_MAP[interval as SupportedTimeInterval];
    if (!resolution) {
        throw new ForexApplicationError(
            'VALIDATION_ERROR',
            `Unsupported interval: ${interval}`
        );
    }
    return resolution;
}

/**
 * Transforms historical data parameters into capital historical data parameters
 * @throws {ForexApplicationError} If validation fails
 */
export function transformCapitalParams(params: HistoricalDataParams): CapitalHistoricalDataParams {
    validateHistoricalDataParams(params);
    
    return {
        symbol: params.symbol,
        resolution: mapCapitalResolution(params.interval as TimeInterval),
        from: params.startDate,
        to: params.endDate,
        format: 'json'
    };
}

/**
 * Calculates returns for OHLCV data
 */
export function calculateReturns(data: readonly OHLCV[]): OHLCV[] {
    return data.map((candle, index) => {
        if (index === 0) {
            return { ...candle, returns: 0 };
        }
        const previousClose = data[index - 1].close;
        const returns = (candle.close - previousClose) / previousClose;
        return { ...candle, returns };
    });
}

/**
 * Calculates mean of an array of numbers
 */
function calculateMean(values: readonly number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Calculates variance of an array of numbers
 */
function calculateVariance(values: readonly number[], mean: number): number {
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
}

/**
 * Calculates volatility based on specified period
 * @throws {ForexApplicationError} If insufficient data
 */
export function calculateVolatility(data: readonly OHLCV[], period = 14): OHLCV[] {
    if (data.length < period) {
        throw new ForexApplicationError(
            'DATA_ERROR',
            `Insufficient data for volatility calculation. Need at least ${period} periods.`
        );
    }

    const dataWithReturns = calculateReturns(data);
    
    return dataWithReturns.map((candle, index) => {
        if (index < period) {
            return { ...candle, volatility: 0 };
        }

        const periodReturns = dataWithReturns
            .slice(index - period, index)
            .map(c => c.returns || 0);

        const mean = calculateMean(periodReturns);
        const variance = calculateVariance(periodReturns, mean);
        const volatility = Math.sqrt(variance);

        return { ...candle, volatility };
    });
}

/**
 * Validates an array of OHLCV data
 * @throws {ForexApplicationError} If validation fails
 */
export function validateOHLCVData(data: readonly OHLCV[]): void {
    try {
        z.array(OHLCVSchema).parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new ForexApplicationError(
                'VALIDATION_ERROR',
                `Invalid OHLCV data: ${error.message}`
            );
        }
        throw error;
    }
} 