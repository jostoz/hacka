import { QueryClient } from '@tanstack/react-query';
import { logger } from './logger';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos (antes cacheTime)
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    },
    mutations: {
      retry: 1
    }
  }
});

// Configurar manejadores de errores globales
queryClient.getQueryCache().subscribe(() => {
  const queries = queryClient.getQueryCache().findAll();
  queries.forEach(query => {
    if (query.state.error instanceof Error) {
      logger.error('Query error', query.state.error);
    }
  });
});

queryClient.getMutationCache().subscribe(() => {
  const mutations = queryClient.getMutationCache().getAll();
  mutations.forEach(mutation => {
    if (mutation.state.error instanceof Error) {
      logger.error('Mutation error', mutation.state.error);
    }
  });
}); 