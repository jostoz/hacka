import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { forexTools } from '@/lib/tools/forex';
import { ForexToolError, ErrorCodes } from '@/lib/tools/forex/errors';
import { logger } from '@/lib/utils/logger';
import type { ToolResult } from '@/lib/types/types';

type ForexToolArgs = Record<string, unknown>;

export function useForexTools() {
  const queryClient = useQueryClient();
  
  const executeForexTool = useCallback(async <T,>(
    toolName: keyof typeof forexTools,
    args: ForexToolArgs
  ): Promise<ToolResult<T>> => {
    try {
      const tool = forexTools[toolName];
      if (!tool) {
        throw new ForexToolError(
          `Herramienta "${toolName}" no encontrada`,
          ErrorCodes.TOOL_EXECUTION_ERROR
        );
      }

      // Validar argumentos
      try {
        tool.parameters.parse(args);
      } catch (error) {
        throw new ForexToolError(
          'Argumentos inválidos',
          ErrorCodes.VALIDATION_ERROR,
          error
        );
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

      if (error instanceof ForexToolError) {
        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details
          }
        };
      }
      
      return {
        success: false,
        error: {
          code: ErrorCodes.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
    }
  }, [queryClient]);

  const invalidateToolCache = useCallback(async (
    toolName: keyof typeof forexTools,
    args?: ForexToolArgs
  ) => {
    if (args) {
      await queryClient.invalidateQueries([toolName, JSON.stringify(args)]);
    } else {
      await queryClient.invalidateQueries([toolName]);
    }
  }, [queryClient]);

  return { 
    executeForexTool,
    invalidateToolCache
  };
} 