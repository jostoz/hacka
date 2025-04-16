import { YahooFinanceService } from './yahoo';
import { CapitalService } from './capital';
import type { MarketDataProvider, MarketDataSource } from '@/lib/types/market-data';

export class MarketDataFactory {
  private static instance: MarketDataFactory;
  private providers: Map<MarketDataSource, MarketDataProvider>;

  private constructor() {
    this.providers = new Map();
  }

  static getInstance(): MarketDataFactory {
    if (!MarketDataFactory.instance) {
      MarketDataFactory.instance = new MarketDataFactory();
    }
    return MarketDataFactory.instance;
  }

  initialize(config: { capitalApiKey?: string } = {}) {
    // Inicializar Yahoo Finance
    this.providers.set('yahoo', new YahooFinanceService());

    // Inicializar Capital.com si se proporciona la API key
    if (config.capitalApiKey) {
      this.providers.set('capital', new CapitalService(config.capitalApiKey));
    }

    // Aquí podrías inicializar más proveedores en el futuro
  }

  getProvider(source: MarketDataSource): MarketDataProvider {
    const provider = this.providers.get(source);
    if (!provider) {
      throw new Error(`Proveedor de datos '${source}' no encontrado o no inicializado`);
    }
    return provider;
  }

  isProviderAvailable(source: MarketDataSource): boolean {
    return this.providers.has(source);
  }

  getAvailableProviders(): MarketDataSource[] {
    return Array.from(this.providers.keys());
  }
} 