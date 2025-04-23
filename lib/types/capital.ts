import { z } from 'zod';

export interface CapitalSession {
    sessionToken: string;
    expires: number;
}

export interface CapitalSessionConfig {
    apiKey: string;
    identifier: string;
    password: string;
}

export const CapitalSessionConfigSchema = z.object({
    apiKey: z.string().min(1),
    identifier: z.string().email(),
    password: z.string().min(8)
});

export interface CapitalApiError {
    errorCode: string;
    message: string;
}

export type CapitalResolution = 
    | 'MINUTE'      // 1 minute
    | 'MINUTE_5'    // 5 minutes
    | 'MINUTE_15'   // 15 minutes
    | 'MINUTE_30'   // 30 minutes
    | 'HOUR'        // 1 hour
    | 'HOUR_4'      // 4 hours
    | 'DAY'         // 1 day
    | 'WEEK';       // 1 week

export interface CapitalTimeframeConfig {
    resolution: CapitalResolution;
    maxBars: number;
    minBars: number;
    maxHistoricalDays: number;
    rateLimit: {
        requestsPerMinute: number;
        requestsPerHour: number;
    };
}

export interface CapitalProviderConfig {
    timeframes: Record<CapitalResolution, CapitalTimeframeConfig>;
    defaultTimeframe: CapitalResolution;
    defaultBars: number;
    maxRequestRetries: number;
    retryDelayMs: number;
    cacheDurationMs: number;
}

export const CAPITAL_TIMEFRAMES: Record<CapitalResolution, CapitalTimeframeConfig> = {
    MINUTE: {
        resolution: 'MINUTE',
        maxBars: 1000,
        minBars: 10,
        maxHistoricalDays: 10,
        rateLimit: {
            requestsPerMinute: 30,
            requestsPerHour: 500
        }
    },
    MINUTE_5: {
        resolution: 'MINUTE_5',
        maxBars: 1000,
        minBars: 10,
        maxHistoricalDays: 30,
        rateLimit: {
            requestsPerMinute: 30,
            requestsPerHour: 500
        }
    },
    MINUTE_15: {
        resolution: 'MINUTE_15',
        maxBars: 1000,
        minBars: 10,
        maxHistoricalDays: 60,
        rateLimit: {
            requestsPerMinute: 30,
            requestsPerHour: 500
        }
    },
    MINUTE_30: {
        resolution: 'MINUTE_30',
        maxBars: 1000,
        minBars: 10,
        maxHistoricalDays: 90,
        rateLimit: {
            requestsPerMinute: 30,
            requestsPerHour: 500
        }
    },
    HOUR: {
        resolution: 'HOUR',
        maxBars: 1000,
        minBars: 10,
        maxHistoricalDays: 180,
        rateLimit: {
            requestsPerMinute: 30,
            requestsPerHour: 500
        }
    },
    HOUR_4: {
        resolution: 'HOUR_4',
        maxBars: 1000,
        minBars: 10,
        maxHistoricalDays: 365,
        rateLimit: {
            requestsPerMinute: 30,
            requestsPerHour: 500
        }
    },
    DAY: {
        resolution: 'DAY',
        maxBars: 1000,
        minBars: 10,
        maxHistoricalDays: 730,
        rateLimit: {
            requestsPerMinute: 30,
            requestsPerHour: 500
        }
    },
    WEEK: {
        resolution: 'WEEK',
        maxBars: 1000,
        minBars: 10,
        maxHistoricalDays: 1825,
        rateLimit: {
            requestsPerMinute: 30,
            requestsPerHour: 500
        }
    }
};

export interface CapitalHistoricalDataParams {
    epic: string;
    resolution: string;
    from?: string;
    to?: string;
    max?: number;
    pageSize?: number;
    pageNumber?: number;
}

export interface CapitalPrice {
    snapshotTime: string;
    snapshotTimeUTC: string;
    openPrice: number;
    closePrice: number;
    highPrice: number;
    lowPrice: number;
    lastTradedVolume: number;
}

export interface CapitalErrorResponse {
    errorCode: string;
    httpStatus: number;
    errorMessage: string;
}

export interface CapitalCredentials {
    identifier: string;
    password: string;
    apiKey: string;
}

export interface CapitalAuthConfig {
    baseUrl: string;
    credentials: CapitalCredentials;
}

export interface CapitalAuthResponse {
    clientId: string;
    accountId: string;
    timezoneOffset: number;
    hasActiveDemoAccounts: boolean;
    hasActiveLiveAccounts: boolean;
    trailingStopsEnabled: boolean;
    streamEndpoint: string;
    authenticated: boolean;
    errorCode?: string;
    errorMessage?: string;
}

export interface CapitalAuthHeaders {
    CST: string;
    'X-SECURITY-TOKEN': string;
    'Content-Type': 'application/json';
    'X-CAP-API-KEY': string;
}

export interface CapitalCandle {
    snapshotTime: string;
    snapshotTimeUTC: string;
    openPrice: number;
    closePrice: number;
    highPrice: number;
    lowPrice: number;
    lastTradedVolume: number;
}

export interface CapitalHistoricalPricesResponse {
    prices: CapitalCandle[];
    metadata: {
        pageData?: {
            pageSize: number;
            pageNumber: number;
            totalPages: number;
        };
        size?: number;
        allowance: {
            remainingAllowance: number;
            totalAllowance: number;
            allowanceExpiry: number;
        };
    };
    errorCode?: string;
    errorMessage?: string;
}

export interface CapitalMarketDetailsResponse {
    marketStatus: string;
    netChange: number;
    percentageChange: number;
    updateTime: string;
    delayTime: number;
    bid: number;
    offer: number;
    high: number;
    low: number;
    instrumentType: string;
    epic: string;
    errorCode?: string;
    errorMessage?: string;
}

export const CapitalHistoricalDataParamsSchema = z.object({
    epic: z.string(),
    resolution: z.string(),
    from: z.string().optional(),
    to: z.string().optional(),
    max: z.number().optional(),
    pageSize: z.number().optional(),
    pageNumber: z.number().optional()
}); 