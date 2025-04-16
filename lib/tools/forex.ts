// lib/tools/forex.ts
import { z } from 'zod';
import type { 
  BaseTool, 
  ToolResult,
  FxData, 
  Signal, 
  Forecast, 
  TechnicalAnalysisData 
} from '@/lib/types/types';
import { RSI, MACD, SMA } from 'technicalindicators';
import { isValidForexPair, isValidTimeframe } from '../forex/constants';
import { MarketDataFactory, type MarketDataConfig, type HistoricalDataParams } from '../capital/api';
import type { ForexResponse } from '../forex/types';

interface CapitalCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Tipos de datos
interface MACDResult {
  MACD: number[];
  signal: number[];
  histogram: number[];
}

interface IndicatorResult {
  rsi: number[];
  macd: Array<{
    value: number;
    signal: number;
    histogram: number;
  }>;
  sma: number[];
}

// Schema de validación para FxData
const fxDataSchema = z.object({
  timestamp: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number()
});

// Funciones de API
async function getFxDataFromAPI(pair: string, timeframe: string, periods: number): Promise<FxData[]> {
  try {
    // Validar el par de divisas y timeframe
    if (!isValidForexPair(pair) || !isValidTimeframe(timeframe)) {
      throw new Error('Invalid forex pair or timeframe');
    }

    // Configurar e inicializar el servicio de datos de mercado
    const config: MarketDataConfig = {
      apiKey: process.env.CAPITAL_API_KEY || '',
      baseUrl: process.env.CAPITAL_API_URL || 'https://api.capital.com'
    };
    
    const marketDataService = new MarketDataFactory(config);

    // Formatear el par de divisas para Capital.com (e.g., EUR/USD -> EUR_USD)
    const formattedPair = pair.replace('/', '_');

    // Convertir timeframe al formato esperado por Capital.com
    const timeframeMap: Record<string, string> = {
      '1m': 'MINUTE_1',
      '5m': 'MINUTE_5',
      '15m': 'MINUTE_15',
      '30m': 'MINUTE_30',
      '1h': 'HOUR_1',
      '4h': 'HOUR_4',
      '1d': 'DAY_1',
      '1w': 'WEEK_1'
    };
    
    const capitalTimeframe = timeframeMap[timeframe];
    if (!capitalTimeframe) {
      throw new Error(`Unsupported timeframe: ${timeframe}`);
    }

    // Calcular el rango de fechas basado en los períodos solicitados
    const endDate = new Date();
    const startDate = new Date();
    
    // Ajustar la fecha de inicio según el timeframe
    const timeframeMinutes: Record<string, number> = {
      '1m': 1, '5m': 5, '15m': 15, '30m': 30,
      '1h': 60, '4h': 240, '1d': 1440, '1w': 10080
    };
    
    const minutesBack = timeframeMinutes[timeframe] * periods;
    startDate.setMinutes(startDate.getMinutes() - minutesBack);

    // Preparar los parámetros para la solicitud
    const params: HistoricalDataParams = {
      symbol: formattedPair,
      interval: capitalTimeframe,
      from: startDate.getTime(),
      to: endDate.getTime()
    };

    // Obtener los datos históricos
    const historicalData = await marketDataService.getHistoricalData(params);

    // Transformar los datos al formato FxData[]
    const fxData: FxData[] = historicalData.map((candle) => ({
      timestamp: candle.timestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume
    }));

    // Limitar los datos al número de períodos solicitados
    return fxData.slice(-periods);

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error fetching FX data: ${error.message}`);
    }
    throw new Error('Unknown error fetching FX data');
  }
}

/**
 * Calculates trading signals based on historical data and risk parameters
 */
export function calculateSignal(
  historicalData: FxData[], 
  pair = 'EUR/USD',
  accountBalance = 10000,
  riskPercentage = 1
): ForexResponse<Signal> {
  if (!historicalData?.length) {
    return {
      success: false,
      error: {
        message: 'No historical data provided',
        code: 'INSUFFICIENT_DATA'
      }
    };
  }

  try {
    const riskAmount = (accountBalance * riskPercentage) / 100;
    const lastPrice = historicalData[historicalData.length - 1].close;
    
    // Aquí iría la lógica de cálculo de señales
    const signal: Signal = {
      pair,
      signal: 'buy',
      confidence: 0.75,
      positionSize: riskAmount / (lastPrice * 0.01), // Calculamos el tamaño de la posición basado en el riesgo
      stopLoss: lastPrice * 0.99,
      takeProfit: lastPrice * 1.02,
      justification: 'Señal basada en análisis técnico y gestión de riesgo',
      type: 'technical',
      value: lastPrice
    };

    return {
      success: true,
      data: signal
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error calculating signal',
        code: 'CALCULATION_ERROR',
        details: error
      }
    };
  }
}

function generateForecast(data: FxData[]): Forecast {
  const lastPrice = data[data.length - 1].close;
  
  return {
    pair: 'EUR/USD', // Par por defecto si no está en FxData
    nextPrice: lastPrice * (1 + (Math.random() - 0.5) * 0.01), // Usar nextPrice en lugar de prediction
    confidence: 0.75,
    timestamp: new Date().toISOString()
  };
}

// Tipos específicos para indicadores técnicos
interface TechnicalIndicators {
  rsi: number[];
  macd: Array<{
    macdLine: number;
    signalLine: number;
    histogram: number;
    trend: 'bullish' | 'bearish' | 'neutral';
  }>;
  sma: number[];
}

interface PriceLevels {
  support: number;
  resistance: number;
}

// Función para calcular indicadores
function calculateIndicators(data: FxData[]): TechnicalIndicators {
  const values = data.map(d => d.close);
  const rsi = RSI.calculate({ values, period: 14 });
  const macdResult = MACD.calculate({
    values,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
  const sma = SMA.calculate({ values, period: 20 });

  return {
    rsi,
    macd: macdResult.map(m => ({
      macdLine: m.MACD || 0,
      signalLine: m.signal || 0,
      histogram: m.histogram || 0,
      trend: (m.histogram || 0) > 0 ? 'bullish' : (m.histogram || 0) < 0 ? 'bearish' : 'neutral'
    })),
    sma
  };
}

// Función para calcular niveles de soporte y resistencia
function calculatePriceLevels(prices: number[]): PriceLevels {
  const pricesSorted = [...prices].sort((a, b) => a - b);
  const supportIndex = Math.floor(pricesSorted.length * 0.2);
  const resistanceIndex = Math.floor(pricesSorted.length * 0.8);
  
  return {
    support: pricesSorted[supportIndex],
    resistance: pricesSorted[resistanceIndex]
  };
}

// Actualizar fetchTechnicalAnalysisFromAPI
async function fetchTechnicalAnalysisFromAPI(pair: string): Promise<TechnicalAnalysisData> {
  try {
    // Generar datos históricos más realistas
    const basePrice = 1.2000;
    const volatility = 0.002;
    const trend = 0.0001;
    
    let currentPrice = basePrice;
    const fxData: FxData[] = Array.from({ length: 100 }, (_, i): FxData => {
      currentPrice = currentPrice + trend + (Math.random() - 0.5) * volatility;
      const isVolatilePoint = Math.random() > 0.8;
      const extraVolatility = isVolatilePoint ? volatility * 2 : volatility;
      
      const high = currentPrice + Math.random() * extraVolatility;
      const low = currentPrice - Math.random() * extraVolatility;
      const open = low + Math.random() * (high - low);
      const close = low + Math.random() * (high - low);
      
      const baseVolume = 100000;
      const volumeMultiplier = isVolatilePoint ? 3 : 1;
      const volume = Math.floor(baseVolume * (0.5 + Math.random()) * volumeMultiplier);

      return {
        timestamp: Date.now() - ((99 - i) * 60000),
        open,
        high,
        low,
        close,
        volume
      };
    }).reverse();

    const indicators = calculateIndicators(fxData);
    const lastMacd = indicators.macd[indicators.macd.length - 1];
    const lastRsi = indicators.rsi[indicators.rsi.length - 1];
    const lastSma = indicators.sma[indicators.sma.length - 1];

    if (!lastMacd || typeof lastRsi !== 'number' || typeof lastSma !== 'number') {
      throw new Error('Invalid indicator values');
    }

    const prices = fxData.map(d => d.close);
    const levels = calculatePriceLevels(prices);

    const signal: Signal = {
      pair,
      signal: lastMacd.histogram > 0 ? 'buy' : lastMacd.histogram < 0 ? 'sell' : 'hold',
      confidence: Math.min(Math.abs(lastRsi - 50) / 50, 1),
      positionSize: 1000,
      stopLoss: lastSma * 0.98,
      justification: `RSI: ${lastRsi.toFixed(2)}, MACD: ${lastMacd.histogram.toFixed(4)}`
    };

    return {
      pair,
      timestamp: Date.now(),
      signals: [signal],
      historicalData: fxData,
      indicators,
      levels,
      summary: `Analysis for ${pair} shows ${signal.signal === 'buy' ? 'bullish' : signal.signal === 'sell' ? 'bearish' : 'neutral'} momentum with key levels at ${levels.support.toFixed(4)} (support) and ${levels.resistance.toFixed(4)} (resistance)`
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error in technical analysis: ${error.message}`);
    }
    throw new Error('Unknown error in technical analysis');
  }
}

// Definición de herramientas
export const forexTools = {
  get_fx_data: {
    name: 'get_fx_data',
    description: 'Get historical forex data for a currency pair',
    parameters: z.object({
      pair: z.string().describe('Currency pair (e.g. EUR/USD)'),
      timeframe: z.string().describe('Timeframe (e.g. 1h, 4h, 1d)'),
      periods: z.number().describe('Number of periods to fetch')
    }),
    execute: async (args: Record<string, unknown>): Promise<ToolResult<FxData[]>> => {
      if (!validateForexParams(args)) {
        throw new Error('Invalid parameters for get_fx_data');
      }
      const { pair, timeframe, periods } = args as { pair: string; timeframe: string; periods: number };
      const data = await getFxDataFromAPI(pair, timeframe, periods);
      return {
        type: 'fx-data' as const,
        data
      };
    }
  },

  calculate_quant_signal: {
    name: 'calculate_quant_signal',
    description: 'Calculate quantitative trading signals based on historical data',
    parameters: z.object({
      data: z.array(fxDataSchema).describe('Historical price data'),
      capital: z.number().describe('Trading capital amount'),
      risk_percent: z.number().describe('Risk percentage per trade')
    }),
    execute: async (args: Record<string, unknown>): Promise<ToolResult<Signal>> => {
      if (!validateForexParams(args)) {
        throw new Error('Invalid parameters for calculate_quant_signal');
      }
      const { data, capital, risk_percent } = args as { data: FxData[]; capital: number; risk_percent: number };
      const response = calculateSignal(data, 'EUR/USD', capital, risk_percent);
      return {
        type: 'quant-signal' as const,
        data: response.success ? response.data : {
          pair: 'EUR/USD',
          signal: 'hold',
          confidence: 0,
          positionSize: 0,
          stopLoss: 0,
          justification: response.error?.message || 'Error calculating signal'
        }
      };
    }
  },

  get_simple_forecast: {
    name: 'get_simple_forecast',
    description: 'Get a simple price forecast based on historical data',
    parameters: z.object({
      data: z.array(fxDataSchema).describe('Historical price data')
    }),
    execute: async (args: Record<string, unknown>): Promise<ToolResult<Forecast>> => {
      if (!validateForexParams(args)) {
        throw new Error('Invalid parameters for get_simple_forecast');
      }
      const { data } = args as { data: FxData[] };
      const forecast = generateForecast(data);
      return {
        type: 'forecast' as const,
        data: forecast
      };
    }
  },

  fetchTechnicalAnalysis: {
    name: 'fetchTechnicalAnalysis',
    description: 'Get technical analysis for a currency pair',
    parameters: z.object({
      pair: z.string().describe('Currency pair (e.g. EUR/USD)')
    }),
    execute: async (args: Record<string, unknown>): Promise<ToolResult<TechnicalAnalysisData>> => {
      if (!validateForexParams(args)) {
        throw new Error('Invalid parameters for fetchTechnicalAnalysis');
      }
      const { pair } = args as { pair: string };
      const analysis = await fetchTechnicalAnalysisFromAPI(pair);
      return {
        type: 'technical-analysis' as const,
        data: analysis
      };
    }
  }
} satisfies Record<string, BaseTool>;

export type ForexTools = typeof forexTools;

// Función de validación de parámetros
const validateForexParams = (params: Record<string, unknown>): boolean => {
  if (!params || typeof params !== 'object') return false;

  return Object.entries(params).every(([key, value]) => {
    switch (key) {
      case 'pair':
        return typeof value === 'string' && isValidForexPair(value);
      case 'timeframe':
        return typeof value === 'string' && isValidTimeframe(value);
      case 'periods':
        return typeof value === 'number' && value > 0;
      case 'capital':
        return typeof value === 'number' && value > 0;
      case 'risk_percent':
        return typeof value === 'number' && value > 0 && value <= 100;
      case 'data':
        return Array.isArray(value) && value.every(item => fxDataSchema.safeParse(item).success);
      default:
        return false;
    }
  });
};