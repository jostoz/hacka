import { z } from 'zod';
import type { BaseTool, ToolResult } from '@/lib/types/types';

// --- Herramientas de Clima ---
async function fetchWeatherFromAPI(location: string) {
  return {
    description: ['Soleado', 'Nublado', 'Lluvioso'][Math.floor(Math.random() * 3)],
    temperature: Math.round(Math.random() * 30 + 10)
  };
}

const weatherTools = {
  fetchWeather: {
    name: 'fetchWeather',
    description: "Obtiene el clima actual para una ubicación.",
    parameters: z.object({
      location: z.string().describe('Ubicación para obtener el clima')
    }),
    execute: async (args: Record<string, unknown>): Promise<ToolResult<unknown>> => {
      try {
        const { location } = args as { location: string };
        const weather = await fetchWeatherFromAPI(location);
        return {
          success: true,
          data: {
            location,
            ...weather
          }
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'WEATHER_ERROR',
            message: error instanceof Error ? error.message : 'Error desconocido'
          }
        };
      }
    }
  }
} satisfies Record<string, BaseTool>;

// --- Herramientas de Forex (Ejemplo) ---
const forexTools = {
  get_fx_data: {
    name: 'get_fx_data',
    description: "Obtiene datos históricos de un par de divisas.",
    parameters: z.object({
      pair: z.string().describe('Par de divisas, ej: EUR/USD'),
      timeframe: z.string().describe('Marco temporal, ej: 1h, 4h, 1d'),
      periods: z.number().describe('Número de periodos a obtener'),
    }),
    execute: async (args: Record<string, unknown>): Promise<ToolResult<unknown>> => {
      try {
        const { pair, timeframe, periods } = args as { pair: string; timeframe: string; periods: number };
        // Implementación real aquí
        return {
          success: true,
          data: {}
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'FX_DATA_ERROR',
            message: error instanceof Error ? error.message : 'Error desconocido'
          }
        };
      }
    },
  },
} satisfies Record<string, BaseTool>;

// --- Exportación Centralizada ---
export const tools = {
  weather: weatherTools,
  forex: forexTools,
  // Agrega más herramientas aquí (news, etc.)
};

export type ToolNamespace = keyof typeof tools; // Tipos para autocompletado