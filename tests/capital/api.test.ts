import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CapitalAPI, MarketDataConfig, HistoricalDataParams } from '../../lib/capital/api';

describe('CapitalAPI', () => {
  let api: CapitalAPI;
  const mockConfig: MarketDataConfig = {
    apiKey: 'test-api-key',
    baseUrl: 'https://test-api.capital.com'
  };

  beforeEach(() => {
    // Reset fetch mock before each test
    vi.resetAllMocks();
    
    // Mock global fetch
    global.fetch = vi.fn();
    
    // Create new instance
    api = new CapitalAPI(mockConfig);
  });

  describe('constructor', () => {
    it('should throw error if apiKey is missing', () => {
      expect(() => new CapitalAPI({ ...mockConfig, apiKey: '' }))
        .toThrow('Capital.com API key is required');
    });

    it('should throw error if baseUrl is missing', () => {
      expect(() => new CapitalAPI({ ...mockConfig, baseUrl: '' }))
        .toThrow('Capital.com base URL is required');
    });

    it('should create instance with valid config', () => {
      expect(() => new CapitalAPI(mockConfig)).not.toThrow();
    });
  });

  describe('getHistoricalData', () => {
    const mockParams: HistoricalDataParams = {
      symbol: 'EUR/USD',
      interval: '1h',
      from: 1609459200000, // 2021-01-01
      to: 1609545600000   // 2021-01-02
    };

    const mockResponse = {
      candles: [
        {
          timestamp: '2021-01-01T00:00:00.000Z',
          openPrice: '1.2000',
          highPrice: '1.2100',
          lowPrice: '1.1900',
          closePrice: '1.2050',
          volume: '1000'
        }
      ]
    };

    it('should validate required parameters', async () => {
      const invalidParams = { ...mockParams, symbol: '' };
      await expect(api.getHistoricalData(invalidParams))
        .rejects
        .toThrow('Missing required parameters');
    });

    it('should format symbol correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await api.getHistoricalData(mockParams);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/EUR_USD'),
        expect.any(Object)
      );
    });

    it('should set correct headers', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await api.getHistoricalData(mockParams);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'X-CAP-API-KEY': mockConfig.apiKey,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      );
    });

    it('should handle successful response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.getHistoricalData(mockParams);

      expect(result).toEqual([{
        timestamp: new Date('2021-01-01T00:00:00.000Z').getTime(),
        open: 1.2000,
        high: 1.2100,
        low: 1.1900,
        close: 1.2050,
        volume: 1000
      }]);
    });

    it('should handle 401 error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('Invalid API key'),
        headers: new Headers()
      });

      await expect(api.getHistoricalData(mockParams))
        .rejects
        .toThrow('Invalid or missing API key');
    });

    it('should handle 403 error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: () => Promise.resolve('Insufficient permissions'),
        headers: new Headers()
      });

      await expect(api.getHistoricalData(mockParams))
        .rejects
        .toThrow('API key does not have sufficient permissions');
    });

    it('should handle invalid response format', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invalid: 'format' })
      });

      await expect(api.getHistoricalData(mockParams))
        .rejects
        .toThrow('Invalid response format from Capital.com API');
    });

    it('should handle network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(api.getHistoricalData(mockParams))
        .rejects
        .toThrow('Network error');
    });
  });
}); 