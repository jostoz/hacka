import { z } from 'zod';
import type { CapitalAuthService } from './auth';
import type { Timeframe } from '../../../types/forex';
import type { CapitalResolution } from '../../../types/capital';
import { ForexApplicationError } from '../../../errors/forex-application-error';

// Esquemas de validación
const CandleSchema = z.object({
  timestamp: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});

const MetadataSchema = z.object({
  symbol: z.string(),
  timeframe: z.string(),
  lastUpdate: z.number(),
});

const MarketDataResponseSchema = z.object({
  data: z.array(CandleSchema),
  metadata: MetadataSchema,
});

export type MarketDataResponse = z.infer<typeof MarketDataResponseSchema>;

const timeframeToResolution: Record<Timeframe, CapitalResolution> = {
  '1m': 'MINUTE',
  '5m': 'MINUTE_5',
  '15m': 'MINUTE_15',
  '30m': 'MINUTE_30',
  '1h': 'HOUR',
  '4h': 'HOUR_4',
  '1d': 'DAY',
  '1w': 'WEEK',
  '1M': 'WEEK' // Capital.com no soporta timeframe mensual, usamos semanal como fallback
};

export class CapitalService {
  private readonly baseUrl = 'https://api.capital.com/v1';
  private readonly authService: CapitalAuthService;

  constructor(authService: CapitalAuthService) {
    this.authService = authService;
  }

  async fetchData(symbol: string, timeframe: Timeframe): Promise<MarketDataResponse> {
    try {
      const resolution = timeframeToResolution[timeframe];
      if (!resolution) {
        throw ForexApplicationError.invalidTimeframe(timeframe);
      }

      const token = await this.authService.getToken();
      const formattedSymbol = symbol.replace('/', '');
      
      const response = await fetch(`${this.baseUrl}/prices/${formattedSymbol}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CAP-API-KEY': await this.authService.getApiKey()
        },
        method: 'GET'
      });

      if (!response.ok) {
        throw new ForexApplicationError({
          message: `Error fetching data: ${response.statusText}`,
          code: 'API_ERROR',
          details: { 
            status: response.status,
            symbol,
            timeframe 
          }
        });
      }

      const rawData = await response.json();
      
      // Transformar los datos al formato esperado
      const transformedData = {
        data: rawData.prices.map((price: any) => ({
          timestamp: new Date(price.snapshotTimeUTC).getTime(),
          open: price.openPrice,
          high: price.highPrice,
          low: price.lowPrice,
          close: price.closePrice,
          volume: price.lastTradedVolume
        })),
        metadata: {
          symbol: formattedSymbol,
          timeframe: resolution,
          lastUpdate: Date.now()
        }
      };
      
      // Validar y transformar los datos
      const validatedData = MarketDataResponseSchema.parse(transformedData);
      
      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ForexApplicationError({
          message: `Data validation error: ${error.message}`,
          code: 'VALIDATION_ERROR',
          details: { error }
        });
      }
      if (error instanceof ForexApplicationError) {
        throw error;
      }
      throw new ForexApplicationError({
        message: 'Unexpected error fetching data',
        code: 'UNKNOWN_ERROR',
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }
} 