import { z } from 'zod';
import type { CapitalProviderConfig, CapitalResolution } from '@/lib/types/capital';

export const CAPITAL_API_CONFIG = {
    BASE_URL: process.env.CAPITAL_API_BASE_URL || 'https://api-capital.backend-capital.com/api/v1',
    DEFAULT_HEADERS: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
} as const;

const createTimeframeConfig = (resolution: CapitalResolution, maxBars = 1000) => ({
    resolution,
    maxBars,
    minBars: 10,
    maxHistoricalDays: 10,
    rateLimit: {
        requestsPerMinute: 30,
        requestsPerHour: 500
    }
});

export const CAPITAL_PROVIDER_CONFIG: CapitalProviderConfig = {
    timeframes: {
        MINUTE: createTimeframeConfig('MINUTE'),
        MINUTE_5: createTimeframeConfig('MINUTE_5'),
        MINUTE_15: createTimeframeConfig('MINUTE_15'),
        MINUTE_30: createTimeframeConfig('MINUTE_30'),
        HOUR: createTimeframeConfig('HOUR'),
        HOUR_4: createTimeframeConfig('HOUR_4'),
        DAY: createTimeframeConfig('DAY', 5000),
        WEEK: createTimeframeConfig('WEEK', 5000)
    },
    defaultTimeframe: 'HOUR',
    defaultBars: 100,
    maxRequestRetries: 3,
    retryDelayMs: 1000,
    cacheDurationMs: 5 * 60 * 1000 // 5 minutes
};

export const CapitalConfigSchema = z.object({
    apiKey: z.string().min(1, "API Key is required"),
    baseUrl: z.string().url("Invalid base URL").optional(),
    demo: z.boolean().optional()
}); 