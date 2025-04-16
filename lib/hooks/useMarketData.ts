import { useState, useEffect } from 'react';
import { MarketDataFactory } from '@/lib/services/market-data/factory';
import type { 
  MarketDataParams, 
  MarketDataResponse 
} from '@/lib/types/market-data';

interface UseMarketDataResult {
  data: MarketDataResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMarketData(params?: MarketDataParams): UseMarketDataResult {
  const [data, setData] = useState<MarketDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!params) {
        setData(null);
        setError(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const factory = MarketDataFactory.getInstance();
        
        if (!factory.isProviderAvailable(params.source)) {
          throw new Error(`Proveedor de datos '${params.source}' no disponible`);
        }

        const provider = factory.getProvider(params.source);
        const result = await provider.fetchData(params);

        if (!result.success || !result.data) {
          throw new Error(result.error?.message || 'Error al obtener datos');
        }

        if (isMounted) {
          setData(result.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
          setData(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.symbol, params?.interval, params?.range, params?.source]);

  const refetch = async () => {
    if (!params) return;
    
    setIsLoading(true);
    try {
      const factory = MarketDataFactory.getInstance();
      const provider = factory.getProvider(params.source);
      const result = await provider.fetchData(params);
      
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Error al obtener datos');
      }
      
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch
  };
} 