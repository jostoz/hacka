import { z } from 'zod';
import type { BaseTool } from './types';

async function fetchWeatherFromAPI(location: string) {
  return {
    description: ['Soleado', 'Nublado', 'Lluvioso'][Math.floor(Math.random() * 3)],
    temperature: Math.round(Math.random() * 30 + 10)
  };
}

export const weatherTools = {
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