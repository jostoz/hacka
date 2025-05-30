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
import { MarketDataFactory } from '@/lib/services/market-data/factory';
import type { ForexResponse } from '../forex/types';
import type { TimeInterval } from '@/lib/types/market-data';

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
export const fxDataSchema = z.object({
  timestamp: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number()
});

// Función para convertir timeframe al formato de Capital.com
function convertTimeframe(timeframe: string): string {
  const timeframeMap: Record<string, string> = {
    '1m': 'MINUTE_1',
    '5m': 'MINUTE_5',
    '15m': 'MINUTE_15',
    '30m': 'MINUTE_30',
    '1h': 'HOUR_1',
    '4h': 'HOUR_4',
    'D': 'DAY_1',
    'W': 'WEEK_1'
  };
  
  const capitalTimeframe = timeframeMap[timeframe];
  if (!capitalTimeframe) {
    throw new Error(`Unsupported timeframe: ${timeframe}`);
  }
  return capitalTimeframe;
}

// Funciones de API
export async function getFxDataFromAPI(pair: string, timeframe: string, periods: number): Promise<FxData[]> {
  try {
    // Validar el par de divisas y timeframe
    if (!isValidForexPair(pair) || !isValidTimeframe(timeframe)) {
      throw new Error('Invalid forex pair or timeframe');
    }

    const factory = MarketDataFactory.getInstance();
    
    // Usar el proveedor de Capital.com
    const provider = factory.getProvider('capital');
    
    // Calcular el rango de fechas basado en los períodos solicitados
    const endDate = new Date();
    const startDate = new Date();
    
    // Ajustar la fecha de inicio según el timeframe
    const timeframeMinutes: Record<string, number> = {
      '1m': 1, '5m': 5, '15m': 15, '30m': 30,
      '1h': 60, '4h': 240, 'D': 1440, 'W': 10080
    };
    
    const minutesBack = timeframeMinutes[timeframe] * periods;
    startDate.setMinutes(startDate.getMinutes() - minutesBack);

    const result = await provider.fetchData({
      symbol: pair,
      interval: timeframe as TimeInterval,
      range: '1mo', // Valor por defecto
      source: 'capital'
    });

    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Error fetching market data');
    }

    return result.data.data;

  } catch (error) {
    // ADD: Log detailed error information
    console.error('Error details during getFxDataFromAPI:', { 
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      // ADD: Log the cause if available (useful for fetch errors)
      cause: error instanceof Error ? error.cause : undefined,
      // ADD: Log the stack trace
      stack: error instanceof Error ? error.stack : undefined,
      // ADD: Log additional context 
      context: { pair, timeframe, periods }
    });

    if (error instanceof Error) {
      // Modify the re-thrown error to include more context potentially
      throw new Error(`Error fetching FX data for ${pair} (${timeframe}): ${error.message}`, { cause: error });
    } 
    // Keep the generic throw for truly unknown errors
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
    const rsiValue = RSI.calculate({ 
      values: historicalData.map(d => d.close), 
      period: 14 
    });

    const lastRsi = rsiValue[rsiValue.length - 1];
    
    if (lastRsi < 30) {
      const signal: Signal = {
        symbol: pair,
        type: 'BUY',
        price: lastPrice,
        stopLoss: lastPrice * 0.99,
        takeProfit: lastPrice * 1.02,
        timestamp: Date.now(),
        confidence: 0.75,
        reason: 'Señal basada en análisis técnico y gestión de riesgo'
      };

      return {
        success: true,
        data: signal
      };
    }

    // Si no hay señal clara, devolver hold
    const holdSignal: Signal = {
      symbol: pair,
      type: 'HOLD',
      price: lastPrice,
      stopLoss: lastPrice * 0.99,
      timestamp: Date.now(),
      confidence: 0.5,
      reason: 'No clear signal detected'
    };

    return {
      success: true,
      data: holdSignal
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
    symbol: 'EUR/USD', // Par por defecto si no está en FxData
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
  if (data.length < 26) { // Necesitamos al menos 26 períodos para MACD
    throw new Error('Insufficient data for technical indicators calculation');
  }

  const values = data.map(d => d.close);
  
  // Calcular RSI
  const rsi = RSI.calculate({ 
    values, 
    period: 14 
  });

  // Calcular MACD
  const macdResult = MACD.calculate({
    values,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });

  // Calcular SMAs
  const smaFast = SMA.calculate({ values, period: 10 });
  const smaSlow = SMA.calculate({ values, period: 20 });

  // Formatear resultados
  return {
    rsi,
    macd: macdResult.map(m => ({
      macdLine: m.MACD || 0,
      signalLine: m.signal || 0,
      histogram: m.histogram || 0,
      trend: (m.histogram || 0) > 0 ? 'bullish' : (m.histogram || 0) < 0 ? 'bearish' : 'neutral'
    })),
    sma: [...smaFast, ...smaSlow]
  };
}

// Función para calcular niveles de soporte y resistencia
function calculatePriceLevels(data: FxData[]): PriceLevels {
  const prices = data.map(d => d.close);
  const pricesSorted = [...prices].sort((a, b) => a - b);
  const supportIndex = Math.floor(pricesSorted.length * 0.2);
  const resistanceIndex = Math.floor(pricesSorted.length * 0.8);
  
  return {
    support: pricesSorted[supportIndex],
    resistance: pricesSorted[resistanceIndex]
  };
}

/**
 * Fetches and analyzes technical indicators for a forex pair
 */
export async function fetchTechnicalAnalysisFromAPI(
  pair: string, 
  timeframe: string, 
  periods: number
): Promise<TechnicalAnalysisData | undefined> {
  try {
    // Obtener datos históricos
    const historicalData = await getFxDataFromAPI(pair, timeframe, periods);
    
    if (!historicalData || historicalData.length < 26) {
      return undefined;
    }

    // Calcular indicadores técnicos
    const indicators = calculateIndicators(historicalData);
    const priceLevels = calculatePriceLevels(historicalData);
    
    // Obtener el último precio
    const lastPrice = historicalData[historicalData.length - 1].close;
    const lastRsi = indicators.rsi[indicators.rsi.length - 1];
    const lastMacd = indicators.macd[indicators.macd.length - 1];
    
    // Determinar señal basada en indicadores
    let signalType: 'buy' | 'sell' | 'hold' = 'hold';
    let confidence = 0.5;
    
    // Lógica de señales
    if (lastRsi < 30 && lastMacd.trend === 'bullish') {
      signalType = 'buy';
      confidence = 0.8;
    } else if (lastRsi > 70 && lastMacd.trend === 'bearish') {
      signalType = 'sell';
      confidence = 0.8;
    }

    // Crear objeto de análisis técnico
    const technicalAnalysis: TechnicalAnalysisData = {
      symbol: pair,
      timestamp: Date.now(),
      signals: [{
        symbol: pair,
        type: signalType === 'buy' ? 'BUY' : signalType === 'sell' ? 'SELL' : 'HOLD',
        price: lastPrice,
        stopLoss: signalType === 'buy' ? priceLevels.support : priceLevels.resistance,
        timestamp: Date.now(),
        confidence,
        reason: `RSI: ${lastRsi.toFixed(2)}, MACD trend: ${lastMacd.trend}, Price: ${lastPrice}`
      }],
      historicalData,
      indicators: {
        rsi: indicators.rsi,
        macd: indicators.macd,
        sma: indicators.sma
      },
      levels: priceLevels,
      summary: `Technical analysis for ${pair} shows ${lastMacd.trend} momentum with RSI at ${lastRsi.toFixed(2)}`
    };

    return technicalAnalysis;

  } catch (error) {
    console.error('Error in technical analysis:', error);
    return undefined;
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
      const { pair, timeframe, periods } = args as { pair: string; timeframe: string; periods: number };
      const data = await getFxDataFromAPI(pair, timeframe, periods);
      return {
        success: true,
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
      const { data, capital, risk_percent } = args as { data: FxData[]; capital: number; risk_percent: number };
      const response = calculateSignal(data, 'EUR/USD', capital, risk_percent);
      return {
        success: response.success,
        data: response.success ? response.data : {
          symbol: 'EUR/USD',
          type: 'HOLD',
          price: 0,
          stopLoss: 0,
          timestamp: Date.now(),
          confidence: 0,
          reason: response.error?.message || 'Error calculating signal'
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
      const { data } = args as { data: FxData[] };
      const forecast = generateForecast(data);
      return {
        success: true,
        data: forecast
      };
    }
  },

  fetchTechnicalAnalysis: {
    name: 'fetchTechnicalAnalysis',
    description: 'Get technical analysis for a currency pair with historical data',
    parameters: z.object({
      pair: z.string().describe('Currency pair (e.g. EUR/USD)'),
      timeframe: z.string().describe('Timeframe (e.g. 1h, 4h, 1d)'),
      periods: z.number().describe('Number of periods to fetch')
    }),
    execute: async (args: Record<string, unknown>): Promise<ToolResult<TechnicalAnalysisData>> => {
      try {
      const { pair, timeframe, periods } = args as { pair: string; timeframe: string; periods: number };
        
        // Validar el par de divisas
        if (!isValidForexPair(pair)) {
          return {
            success: false,
            error: {
              message: `Par de divisas no soportado: ${pair}`,
              code: 'UNSUPPORTED_PAIR'
            }
          };
        }

        // Validar el timeframe
        if (!isValidTimeframe(timeframe)) {
          return {
            success: false,
            error: {
              message: `Timeframe no válido: ${timeframe}`,
              code: 'INVALID_TIMEFRAME'
            }
          };
        }

        // Obtener análisis técnico
      const analysis = await fetchTechnicalAnalysisFromAPI(pair, timeframe, periods);
        
        if (!analysis) {
          return {
            success: false,
            error: {
              message: 'No se pudo obtener el análisis técnico',
              code: 'ANALYSIS_FAILED'
            }
          };
        }

      return {
          success: true,
        data: analysis
      };
      } catch (error) {
        console.error('Error en fetchTechnicalAnalysis:', error);
        return {
          success: false,
          error: {
            message: error instanceof Error ? error.message : 'Error desconocido en análisis técnico',
            code: 'TECHNICAL_ANALYSIS_ERROR',
            details: error
          }
        };
      }
    }
  }
} satisfies Record<string, BaseTool>;

export type ForexTools = typeof forexTools;

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | 'D' | 'W';

export function isTimeframe(value: string): value is Timeframe {
  return ['1m', '5m', '15m', '30m', '1h', '4h', 'D', 'W'].includes(value);
}