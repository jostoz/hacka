import { getFxDataFromAPI } from './forex'; // Asegúrate que la ruta sea correcta
// Importa el schema Zod para validar la estructura de los datos devueltos
import { fxDataSchema } from './forex';
import dotenv from 'dotenv';

// Carga las variables de entorno (¡Importante para la API Key y URL!)
// Asegúrate que la ruta a tu archivo .env sea correcta (ej. .env.local)
dotenv.config({ path: '.env.local' });

// Describe el conjunto de pruebas para getFxDataFromAPI
describe('getFxDataFromAPI Integration Tests', () => {

  // Prueba con un par que generalmente funciona (ej. EUR/USD)
  // Aumentamos el timeout porque es una llamada externa
  it('should fetch data correctly for EUR/USD', async () => {
    const pair = 'EUR/USD';
    const timeframe = '1h'; // Un timeframe común
    const periods = 50; // Un número razonable de periodos

    // Verifica que la API key esté cargada desde el entorno
    expect(process.env.CAPITAL_API_KEY).toBeDefined();
    expect(process.env.CAPITAL_API_KEY?.length).toBeGreaterThan(0);

    try {
      const data = await getFxDataFromAPI(pair, timeframe, periods);

      // Asersiones básicas sobre los datos recibidos
      expect(Array.isArray(data)).toBe(true); // Debe ser un array
      expect(data.length).toBeGreaterThan(0); // Debería devolver algunos datos
      // No debería devolver más periodos de los solicitados (puede devolver menos si no hay suficientes datos históricos)
      expect(data.length).toBeLessThanOrEqual(periods);

      // Valida la estructura del primer elemento usando el schema Zod
      if (data.length > 0) {
        const validationResult = fxDataSchema.safeParse(data[0]);
        expect(validationResult.success).toBe(true); // Debe cumplir el schema FxData
         // Puedes añadir más aserciones específicas aquí si es necesario
        // expect(typeof data[0].timestamp).toBe('number');
      }

    } catch (error) {
      // Si falla la prueba del par "bueno", loguea el error y falla el test
      console.error(`Error inesperado fetching EUR/USD:`, error);
      throw error; // Falla explícitamente el test
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

});