import type { CapitalResolution, CapitalHistoricalDataParams, CapitalTimeframe } from '../../types/market-data';
import { ForexApplicationError } from '../../types/errors';
import { CAPITAL_TIMEFRAMES } from '../../config/timeframes';

export class CapitalHistoricalDataService {
    private readonly BASE_URL = 'https://api-capital.backend-capital.com/api/v1';
    private readonly API_KEY: string;

    constructor(apiKey: string) {
        this.API_KEY = apiKey;
    }

    async validateTimeframe(resolution: CapitalResolution, from?: number, to?: number): Promise<void> {
        const timeframe = CAPITAL_TIMEFRAMES[resolution];
        if (!timeframe) {
            throw new ForexApplicationError(
                'VALIDATION_ERROR',
                `Invalid resolution: ${resolution}`
            );
        }

        if (from && to) {
            const timeDiff = to - from;
            if (timeDiff > timeframe.maxRange) {
                throw new ForexApplicationError(
                    'VALIDATION_ERROR',
                    `Time range exceeds maximum allowed for resolution ${resolution}`
                );
            }
        }
    }

    private async makeRequest<T>(endpoint: string, params: Partial<CapitalHistoricalDataParams>): Promise<T> {
        const queryParams = Object.entries(params)
            .filter(([_, value]) => value !== undefined)
            .reduce((acc, [key, value]) => {
                acc[key] = String(value);
                return acc;
            }, {} as Record<string, string>);

        const url = new URL(endpoint, this.BASE_URL);
        Object.entries(queryParams).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'X-CAP-API-KEY': this.API_KEY,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new ForexApplicationError(
                    'API_ERROR',
                    `Capital.com API error: ${response.status} ${response.statusText}`
                );
            }

            const data = await response.json();
            return data as T;
        } catch (error) {
            if (error instanceof ForexApplicationError) {
                throw error;
            }
            throw new ForexApplicationError(
                'NETWORK_ERROR',
                `Failed to fetch data from Capital.com: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }
}

// ... existing code ...