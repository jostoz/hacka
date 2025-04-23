import type { ForexPair, Timeframe, FxData } from '../types/forex';
import { z } from 'zod';
import { ForexApplicationError } from '../../lib/errors/forex-application-error';

const VALID_TIMEFRAMES: ReadonlySet<Timeframe> = new Set([
  '1m', '5m', '15m', '30m', '1h', '4h', '1d'
]);

const FOREX_PAIR_REGEX = /^[A-Z]{3}\/[A-Z]{3}$/;

/**
 * Type guard to validate if a string is a valid timeframe
 */
export function isTimeframe(value: unknown): value is Timeframe {
  return typeof value === 'string' && VALID_TIMEFRAMES.has(value as Timeframe);
}

/**
 * Type guard to validate if a string is a valid forex pair
 */
export function isForexPair(value: unknown): value is ForexPair {
  return typeof value === 'string' && FOREX_PAIR_REGEX.test(value);
}

/**
 * Validates forex data structure
 * @throws {ForexApplicationError} if validation fails
 */
export function validateFxData(data: unknown): asserts data is FxData {
  if (!data || typeof data !== 'object') {
    throw new ForexApplicationError(
      'Invalid forex data structure',
      'INVALID_DATA_STRUCTURE',
      { received: typeof data }
    );
  }

  const fxData = data as Partial<FxData>;

  // Validate required numeric fields
  const numericFields: Array<keyof FxData> = ['timestamp', 'open', 'high', 'low', 'close', 'volume'];
  for (const field of numericFields) {
    if (typeof fxData[field] !== 'number') {
      throw new ForexApplicationError(
        `Invalid ${field} value`,
        'INVALID_NUMERIC_FIELD',
        { field, received: typeof fxData[field] }
      );
    }
  }

  // Validate timeframe
  if (!isTimeframe(fxData.timeframe)) {
    throw ForexApplicationError.invalidTimeframe(String(fxData.timeframe));
  }

  // Validate forex pair
  if (!isForexPair(fxData.pair)) {
    throw ForexApplicationError.invalidForexPair(String(fxData.pair));
  }
}

export const validateTimeframe = (timeframe: unknown): Timeframe => {
  if (!isTimeframe(timeframe)) {
    throw ForexApplicationError.invalidTimeframe(String(timeframe));
  }
  return timeframe;
};

export const validateForexPair = (pair: unknown): ForexPair => {
  if (!isForexPair(pair)) {
    throw ForexApplicationError.invalidForexPair(String(pair));
  }
  return pair;
};

const TimeframeSchema = z.string().refine(
  (value): value is Timeframe => isTimeframe(value),
  'Invalid timeframe'
);

export const FxDataSchema = z.object({
  timestamp: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  pair: z.string().refine(isForexPair, 'Invalid forex pair'),
  timeframe: TimeframeSchema,
});

export const validateFxDataWithZod = (data: unknown): FxData => {
  try {
    return FxDataSchema.parse(data);
  } catch (error) {
    throw new ForexApplicationError({
      message: 'Invalid forex data format',
      code: 'INVALID_DATA_FORMAT',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
  }
}; 