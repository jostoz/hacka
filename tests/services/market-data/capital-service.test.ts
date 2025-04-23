/// <reference types="vitest" />

import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { CapitalService } from '../../../lib/services/market-data/capital';
import { CapitalAuthService } from '../../../lib/services/market-data/capital/auth';
import type { Timeframe } from '../../../lib/types/forex';
import { ForexApplicationError } from '../../../lib/errors/forex-error';

declare global {
  var fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

describe('CapitalService Integration Tests', () => {
  let service: CapitalService;
  let authService: CapitalAuthService;

  beforeAll(async () => {
    // NOTA: Esto es solo para pruebas, NO usar en producción
    const API_KEY = 'BN66hb0IzRdHKkWR';
    const IDENTIFIER = 'jozaguts@gmail.com';
    const PASSWORD = 'Jozaguts2024@';

    // Inicializar el servicio de autenticación
    authService = CapitalAuthService.getInstance();
    await authService.initialize({
      apiKey: API_KEY,
      identifier: IDENTIFIER,
      password: PASSWORD
    });

    // Inicializar el servicio principal con la autenticación
    service = new CapitalService(authService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchData', () => {
    it('should fetch historical data successfully for EUR/USD', async () => {
      const pair = 'EUR/USD';
      const timeframe: Timeframe = '1h';

      const result = await service.fetchData(pair, timeframe);
      
      // Verify data structure
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      
      // Verify first candle structure
      const firstCandle = result.data[0];
      expect(firstCandle).toMatchObject({
        timestamp: expect.any(Number),
        open: expect.any(Number),
        high: expect.any(Number),
        low: expect.any(Number),
        close: expect.any(Number),
        volume: expect.any(Number)
      });
      
      // Verify metadata
      expect(result.metadata).toMatchObject({
        source: 'capital.com',
        timeframe: expect.any(String),
        pair: 'EUR/USD',
        lastUpdate: expect.any(Number)
      });
    });

    it('should handle rate limiting and retry requests', async () => {
      const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY'];
      const timeframe: Timeframe = '1h';

      // Make multiple requests in parallel to test rate limiting
      const results = await Promise.all(
        pairs.map(pair => service.fetchData(pair, timeframe))
      );

      results.forEach((result, index) => {
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBeGreaterThan(0);
        expect(result.metadata.pair).toBe(pairs[index]);
      });
    });

    it('should fetch data for all supported timeframes', async () => {
      const timeframes: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
      const pair = 'EUR/USD';
      
      for (const timeframe of timeframes) {
        const result = await service.fetchData(pair, timeframe);
        
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBeGreaterThan(0);
        expect(result.metadata).toMatchObject({
          source: 'capital.com',
          timeframe: expect.any(String),
          pair,
          lastUpdate: expect.any(Number)
        });
      }
    });

    it('should handle invalid symbol gracefully', async () => {
      const pair = 'INVALID/PAIR';
      const timeframe: Timeframe = '1h';

      await expect(async () => {
        await service.fetchData(pair, timeframe);
      }).rejects.toThrow(ForexApplicationError);
    });

    it('should handle network errors gracefully', async () => {
      const pair = 'EUR/USD';
      const timeframe: Timeframe = '1h';

      // Simulate network error
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      await expect(async () => {
        await service.fetchData(pair, timeframe);
      }).rejects.toThrow(ForexApplicationError);

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors gracefully', async () => {
      const pair = 'EUR/USD';
      const timeframe: Timeframe = '1h';

      // Simulate API error response
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      } as Response);

      await expect(async () => {
        await service.fetchData(pair, timeframe);
      }).rejects.toThrow(ForexApplicationError);

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
}); 