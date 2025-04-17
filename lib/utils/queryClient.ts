import { QueryClient } from '@tanstack/react-query';
import { logger } from './logger';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos (antes cacheTime)
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error: Error) => {
        logger.error('Query error', error);
      }
    },
    mutations: {
      retry: 1,
      onError: (error: Error) => {
        logger.error('Mutation error', error);
      }
    }
  }
}); 