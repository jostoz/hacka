export interface ForexErrorParams {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class ForexApplicationError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor({ message, code, details }: ForexErrorParams) {
    super(message);
    this.name = 'ForexApplicationError';
    this.code = code;
    this.details = details;

    // Mantener la stack trace correcta
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ForexApplicationError);
    }

    // Necesario para que instanceof funcione correctamente
    Object.setPrototypeOf(this, ForexApplicationError.prototype);
  }

  static invalidTimeframe(timeframe: string): ForexApplicationError {
    return new ForexApplicationError({
      code: 'INVALID_TIMEFRAME',
      message: `Invalid timeframe: ${timeframe}`,
      details: { providedTimeframe: timeframe }
    });
  }

  static invalidForexPair(pair: string): ForexApplicationError {
    return new ForexApplicationError({
      code: 'INVALID_FOREX_PAIR',
      message: `Invalid forex pair: ${pair}`,
      details: { providedPair: pair }
    });
  }

  static dataFetchError(details: Record<string, unknown>): ForexApplicationError {
    return new ForexApplicationError({
      code: 'DATA_FETCH_ERROR',
      message: 'Failed to fetch forex data',
      details
    });
  }
} 