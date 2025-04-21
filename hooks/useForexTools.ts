import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { tools } from '@/lib/tools';
import { logger } from '@/lib/utils/logger';
import type { ToolResult } from '@/lib/types/types';

type ForexToolArgs = Record<string, unknown>;

interface CustomError extends Error {
  code?: string;
  details?: unknown;
}

export function useForexTools() {
  const queryClient = useQueryClient();
  const forexTools = tools.forex;
  
  const executeForexTool = useCallback(async <T,>(
    toolName: keyof typeof forexTools,
    args: ForexToolArgs
  ): Promise<ToolResult<T>> => {
    try {
      const tool = forexTools[toolName];
      if (!tool) {
        throw new Error(`Herramienta "${toolName}" no encontrada`);
      }

      // Validar argumentos
      try {
        tool.parameters.parse(args);
      } catch (error) {
        throw new Error('Argumentos inválidos');
      }

      const result = await tool.execute(args);
      
      // Actualizar caché
      queryClient.setQueryData([toolName, JSON.stringify(args)], result);
      
      return {
        success: true,
        data: result as T
      };
    } catch (error) {
      logger.error(`Error executing forex tool ${toolName}`, error, { args });

      const customError = error as CustomError;
      
      return {
        success: false,
        error: {
          code: customError.code || 'UNKNOWN_ERROR',
          message: customError.message || 'Error desconocido',
          details: customError.details
        }
      };
    }
  }, [queryClient, forexTools]);

  const invalidateToolCache = useCallback(async (
    toolName: keyof typeof forexTools,
    args?: ForexToolArgs
  ) => {
    if (args) {
      await queryClient.invalidateQueries({
        queryKey: [toolName, JSON.stringify(args)]
      });
    } else {
      await queryClient.invalidateQueries({
        queryKey: [toolName]
      });
    }
  }, [queryClient]);

  return { 
    executeForexTool,
    invalidateToolCache
  };
} 