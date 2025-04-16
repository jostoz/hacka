import { z } from 'zod';
import type { BaseTool } from '@/lib/types/types';

// --- Herramientas de Clima ---
async function fetchWeatherFromAPI(location: string) {
  return {
    description: ['Soleado', 'Nublado', 'Lluvioso'][Math.floor(Math.random() * 3)],
    temperature: Math.round(Math.random() * 30 + 10)
  };
}

const weatherTools = {
  fetchWeather: {
    description: "Obtiene el clima actual para una ubicación.",
    parameters: z.object({
      location: z.string().describe('Ubicación para obtener el clima')
    }),
    function: async ({ location }: { location: string }) => {
      const weather = await fetchWeatherFromAPI(location);
      return {
        type: 'weather',
        data: {
          location,
          ...weather
        }
      };
    }
  }
} satisfies Record<string, BaseTool>;

// --- Herramientas de Forex (Ejemplo) ---
const forexTools = {
  get_fx_data: {
    description: "Obtiene datos históricos de un par de divisas.",
    parameters: z.object({
      pair: z.string().describe('Par de divisas, ej: EUR/USD'),
      timeframe: z.string().describe('Marco temporal, ej: 1h, 4h, 1d'),
      periods: z.number().describe('Número de periodos a obtener'),
    }),
    function: async ({ pair, timeframe, periods }) => {
      // Implementación real aquí
      return { type: 'fx-data', data: {} };
    },
  },
} satisfies Record<string, BaseTool>;

// --- Exportación Centralizada ---
export const tools = {
  weather: weatherTools,
  forex: forexTools,
  // Agrega más herramientas aquí (crypto, news, etc.)
};

export type ToolNamespace = keyof typeof tools; // Tipos para autocompletado