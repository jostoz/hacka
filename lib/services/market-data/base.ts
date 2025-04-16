import type { 
  MarketDataProvider, 
  MarketDataParams, 
  MarketDataResult, 
  MarketDataError 
} from '@/lib/types/market-data';

export abstract class BaseMarketDataService implements MarketDataProvider {
  abstract readonly id: MarketDataProvider['id'];
  abstract readonly name: string;
  
  abstract fetchData(params: MarketDataParams): Promise<MarketDataResult>;
  
  protected handleError(error: unknown): MarketDataError {
    if (error instanceof Error) {
      return {
        code: 'PROVIDER_ERROR',
        message: error.message,
        details: error
      };
    }
    
    return {
      code: 'UNKNOWN_ERROR',
      message: 'Un error desconocido ha ocurrido',
      details: error
    };
  }

  protected validateParams(params: MarketDataParams): void {
    if (!params.symbol) {
      throw new Error('El símbolo es requerido');
    }
    if (!params.interval) {
      throw new Error('El intervalo es requerido');
    }
    if (!params.range) {
      throw new Error('El rango es requerido');
    }
  }
} 