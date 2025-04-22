import { z } from 'zod';

export interface MarketDataConfig {
  apiKey: string;
  baseUrl: string;
}

export interface HistoricalDataParams {
  symbol: string;
  interval: string;
  from: number;
  to: number;
}

interface CapitalCandle {
  timestamp: number;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  closePrice: string;
  volume: string;
}

interface CapitalAPIResponse {
  candles: CapitalCandle[];
}

export class CapitalAPI {
  private config: MarketDataConfig;

  constructor(config: MarketDataConfig) {
    this.config = config;
    
    // Validar la configuración
    if (!this.config.apiKey) {
      throw new Error('Capital.com API key is required');
    }
    
    if (!this.config.baseUrl) {
      throw new Error('Capital.com base URL is required');
    }
  }

  private getHeaders(): HeadersInit {
    return {
      'X-CAP-API-KEY': this.config.apiKey,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  async getHistoricalData(params: HistoricalDataParams): Promise<CapitalCandle[]> {
    try {
      const { symbol, interval, from, to } = params;
      
      // Validar parámetros
      if (!symbol || !interval || !from || !to) {
        throw new Error('Missing required parameters');
      }

      // Formatear el símbolo correctamente (reemplazar / por _)
      const formattedSymbol = symbol.replace('/', '_');
      
      // Construir la URL
      const url = new URL(`${this.config.baseUrl}/api/v1/prices/${formattedSymbol}`);
      
      // Añadir parámetros
      url.searchParams.append('granularity', interval);
      url.searchParams.append('from', new Date(from).toISOString());
      url.searchParams.append('to', new Date(to).toISOString());

      console.log('Capital.com API Request:', {
        url: url.toString(),
        symbol: formattedSymbol,
        interval,
        from: new Date(from).toISOString(),
        to: new Date(to).toISOString(),
        headers: this.getHeaders()
      });

      // Realizar la petición
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        const errorDetails = {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
          headers: Object.fromEntries(response.headers.entries())
        };
        
        console.error('Capital.com API Error:', errorDetails);
        
        let errorMessage = `Capital.com API Error (${response.status})`;
        if (response.status === 401) {
          errorMessage = 'Invalid or missing API key';
        } else if (response.status === 403) {
          errorMessage = 'API key does not have sufficient permissions';
        } else if (response.status === 400) {
          errorMessage = 'Invalid request parameters';
        }
        
        throw new Error(`${errorMessage}: ${errorText}`);
      }

      const data = await response.json() as CapitalAPIResponse;
      
      if (!data || !Array.isArray(data.candles)) {
        console.error('Invalid API Response:', data);
        throw new Error('Invalid response format from Capital.com API');
      }

      return data.candles.map(candle => ({
        timestamp: new Date(candle.timestamp).getTime(),
        open: Number.parseFloat(candle.openPrice),
        high: Number.parseFloat(candle.highPrice),
        low: Number.parseFloat(candle.lowPrice),
        close: Number.parseFloat(candle.closePrice),
        volume: Number.parseFloat(candle.volume)
      }));
    } catch (error) {
      console.error('Error in getHistoricalData:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      throw error instanceof Error 
        ? error 
        : new Error('Unknown error fetching historical data');
    }
  }
} 