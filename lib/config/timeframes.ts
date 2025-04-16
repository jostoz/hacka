import type { CapitalResolution } from '../types/market-data';

interface TimeframeConfig {
    maxRange: number;  // Maximum time range in milliseconds
    minBars: number;   // Minimum number of bars required
    description: string;
}

export const CAPITAL_TIMEFRAMES: Record<CapitalResolution, TimeframeConfig> = {
    '1m': {
        maxRange: 7 * 24 * 60 * 60 * 1000, // 7 days
        minBars: 100,
        description: '1 minute'
    },
    '5m': {
        maxRange: 30 * 24 * 60 * 60 * 1000, // 30 days
        minBars: 100,
        description: '5 minutes'
    },
    '15m': {
        maxRange: 60 * 24 * 60 * 60 * 1000, // 60 days
        minBars: 100,
        description: '15 minutes'
    },
    '30m': {
        maxRange: 90 * 24 * 60 * 60 * 1000, // 90 days
        minBars: 100,
        description: '30 minutes'
    },
    '1h': {
        maxRange: 180 * 24 * 60 * 60 * 1000, // 180 days
        minBars: 100,
        description: '1 hour'
    },
    '4h': {
        maxRange: 365 * 24 * 60 * 60 * 1000, // 1 year
        minBars: 100,
        description: '4 hours'
    },
    '1d': {
        maxRange: 3 * 365 * 24 * 60 * 60 * 1000, // 3 years
        minBars: 100,
        description: '1 day'
    },
    '1w': {
        maxRange: 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
        minBars: 50,
        description: '1 week'
    }
} as const; 