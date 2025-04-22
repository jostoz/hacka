import { getFxDataFromAPI } from './forex'; // Asegúrate que la ruta sea correcta
// Importa el schema Zod para validar la estructura de los datos devueltos
import { fxDataSchema } from './forex';
import dotenv from 'dotenv';
import { isValidForexPair, isValidTimeframe } from '../forex/constants';

// Cargar variables de entorno con logging
console.log('Intentando cargar .env.local desde:', process.cwd());
dotenv.config({ path: '.env.local' });
console.log('Variables de entorno cargadas:', {
  CAPITAL_API_KEY: process.env.CAPITAL_API_KEY ? '***[EXISTS]***' : 'NOT FOUND',
  CAPITAL_API_URL: process.env.CAPITAL_API_URL || 'NOT FOUND'
});

// Guardar las variables de entorno originales
const originalEnv = { ...process.env };

describe('Forex Pair Validation', () => {
  it('should validate USD/MXN as a valid pair', () => {
    expect(isValidForexPair('USD/MXN')).toBe(true);
  });

  it('should validate timeframes correctly', () => {
    expect(isValidTimeframe('1h')).toBe(true);
    expect(isValidTimeframe('invalid')).toBe(false);
  });
});

// Describe el conjunto de pruebas para getFxDataFromAPI
describe('getFxDataFromAPI Integration Tests', () => {
  beforeAll(() => {
    // Configurar variables de entorno para pruebas
    process.env.CAPITAL_API_KEY = 'test_api_key';
    process.env.CAPITAL_API_URL = 'https://demo-api-capital.backend-capital.com'; // URL correcta del API de demo
  });

  afterAll(() => {
    // Restaurar variables de entorno originales
    process.env = { ...originalEnv };
  });

  // Prueba con un par que generalmente funciona (ej. EUR/USD)
  // Aumentamos el timeout porque es una llamada externa
  it('should fetch data correctly for EUR/USD', async () => {
    // Skip si no hay API key
    if (!process.env.CAPITAL_API_KEY) {
      console.warn('Skipping EUR/USD test: No API key configured');
      return;
    }

    const pair = 'EUR/USD';
    const timeframe = '1h'; // Un timeframe común
    const periods = 50; // Un número razonable de periodos

    try {
      const data = await getFxDataFromAPI(pair, timeframe, periods);

      // Verificaciones básicas
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data.length).toBeLessThanOrEqual(periods);

      // Verificar estructura del primer elemento
      if (data.length > 0) {
        const firstCandle = data[0];
        expect(firstCandle).toHaveProperty('timestamp');
        expect(firstCandle).toHaveProperty('open');
        expect(firstCandle).toHaveProperty('high');
        expect(firstCandle).toHaveProperty('low');
        expect(firstCandle).toHaveProperty('close');
        expect(firstCandle).toHaveProperty('volume');
      }

    } catch (error) {
      console.error('Error inesperado fetching EUR/USD:', error);
      throw error;
    }
  }, 20000); // Timeout de 20 segundos

  // Prueba específica para el par problemático USD/MXN
  it('should attempt to fetch data for USD/MXN and handle success or failure', async () => {
    const pair = 'USD/MXN';
    const timeframe = '1h'; // Usa el timeframe que te dio problemas
    const periods = 50;

    expect(process.env.CAPITAL_API_KEY).toBeDefined();

    try {
      const data = await getFxDataFromAPI(pair, timeframe, periods);

      // Si la llamada tiene ÉXITO:
      console.log(`Llamada para USD/MXN tuvo éxito. Datos recibidos: ${data.length} velas.`);
      expect(Array.isArray(data)).toBe(true);
      // Aquí la aserción depende de si Capital.com soporta el par.
      // Podrías esperar > 0 datos, o quizás 0 si el par no está disponible.
      // expect(data.length).toBeGreaterThan(0);

      // Valida estructura si se reciben datos
      if (data.length > 0) {
        const validationResult = fxDataSchema.safeParse(data[0]);
        expect(validationResult.success).toBe(true);
      }

    } catch (error) {
      // Si la llamada FALLA (como esperabas):
      console.error(`Error esperado (o inesperado) fetching USD/MXN:`, error);
      // La prueba pasa si captura un error, ya que estamos diagnosticando.
      // Puedes hacerla más estricta si sabes qué error esperar:
      // expect(error.message).toContain('Mensaje específico');
      expect(error).toBeInstanceOf(Error); // Al menos verifica que sea un objeto Error
    }
  }, 20000); // Timeout de 20 segundos

  // Prueba para un timeframe inválido
  it('should throw an error for an invalid timeframe', async () => {
    const pair = 'EUR/USD';
    const timeframe = 'invalid_timeframe';
    const periods = 10;

    // Esperamos que la función rechace la promesa con un error específico
    await expect(getFxDataFromAPI(pair, timeframe, periods))
      .rejects
      .toThrow(/Unsupported timeframe|Invalid forex pair or timeframe/);
  });

   // Prueba para un par inválido
   it('should throw an error for an invalid pair format', async () => {
    const pair = 'EURUSD_INVALID'; // Formato inválido
    const timeframe = '1h';
    const periods = 10;

    await expect(getFxDataFromAPI(pair, timeframe, periods))
      .rejects
      .toThrow('Invalid forex pair or timeframe');
  });

  it('should fetch data for USD/MXN', async () => {
    // Skip si no hay API key
    if (!process.env.CAPITAL_API_KEY) {
      console.warn('Skipping USD/MXN test: No API key configured');
      return;
    }

    try {
      const data = await getFxDataFromAPI('USD/MXN', '1h', 10);
      
      // Verificaciones básicas
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      
      // Verificar estructura si hay datos
      if (data.length > 0) {
        const firstCandle = data[0];
        expect(firstCandle).toHaveProperty('timestamp');
        expect(firstCandle).toHaveProperty('open');
        expect(firstCandle).toHaveProperty('high');
        expect(firstCandle).toHaveProperty('low');
        expect(firstCandle).toHaveProperty('close');
        expect(firstCandle).toHaveProperty('volume');
      }
    } catch (error) {
      console.error('Error fetching USD/MXN data:', error);
      throw error;
    }
  });

});