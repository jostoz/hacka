// lib/tools/forex.ts
import { z } from 'zod';
import { BaseTool, FxData, QuantSignal, Forecast, TechnicalAnalysis } from '@/lib/types/types';
import { getFxData, calculateQuantSignal, getSimpleForecast, getTechnicalAnalysis } from '@/lib/forex/api';
import { RSI, MACD, SMA } from 'technicalindicators';
import { FOREX_PAIRS, TIMEFRAMES } from '@/lib/forex/constants';

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

// Asegurarnos de que los tipos de retorno están correctamente definidos
interface ToolResult<T> {
  type: string;
  data: T;
}

// Funciones de API
async function getFxDataFromAPI(pair: string, timeframe: string, periods: number): Promise<FxData> {
  // Implementar llamada a API real
  return {
    pair,
    timeframe,
    data: [] // Datos reales de la API
  };
}

function calculateSignal(data: FxData, capital: number, riskPercent: number): QuantSignal {
  // Implementar lógica de señal cuantitativa
  return {
    pair: data.pair,
    signal: 'hold',
    confidence: 0.5,
    positionSize: 0,
    stopLoss: 0,
    takeProfit: 0,
    riskRewardRatio: 0
  };
}

function generateForecast(data: FxData): Forecast {
  // Implementar lógica de pronóstico
  return {
    pair: data.pair,
    predictions: []
  };
}

// Función para calcular indicadores
function calculateIndicators(data: Array<{ value: number }>) {
  const values = data.map(d => d.value);
  return {
    rsi: RSI.calculate({ values, period: 14 }),
    macd: MACD.calculate({
      values,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    }),
    sma: SMA.calculate({ values, period: 20 })
  };
}

// Actualizar fetchTechnicalAnalysisFromAPI
async function fetchTechnicalAnalysisFromAPI(pair: string): Promise<TechnicalAnalysisData> {
  const response = await fetch(`https://api.example.com/data?pair=${pair}`);
  const rawData = await response.json();

  const { rsi, macd, sma } = calculateIndicators(rawData) as IndicatorResult;
  
  // Ensure we have data
  if (!macd?.length || !rsi?.length || !sma?.length) {
    throw new Error('Failed to calculate indicators');
  }

  const lastMacd = macd[macd.length - 1];
  const lastRsi = rsi[rsi.length - 1];
  const lastSma = sma[sma.length - 1];

  if (!lastMacd || !lastRsi || typeof lastSma !== 'number') {
    throw new Error('Invalid indicator values');
  }

  return {
    pair,
    timestamp: Date.now(),
    signals: [{
      pair,
      signal: lastMacd.histogram > 0 ? 'buy' as const : lastMacd.histogram < 0 ? 'sell' as const : 'hold' as const,
      confidence: Math.min(Math.abs(lastRsi - 50) / 50, 1),
      positionSize: 1000,
      stopLoss: lastSma * 0.98,
      justification: `RSI: ${lastRsi.toFixed(2)}, MACD: ${lastMacd.histogram.toFixed(4)}`,
    }],
    historicalData: rawData.map((d: {
      timestamp: string | number;
      open: number;
      high: number;
      low: number;
      close: number;
      volume?: number;
    }) => ({
      ...d,
      timestamp: typeof d.timestamp === 'string' ? new Date(d.timestamp).getTime() : d.timestamp
    })),
    indicators: {
      rsi,
      macd: macd.map((m) => ({
        macdLine: m.value,
        signalLine: m.signal,
        histogram: m.histogram,
        trend: m.histogram > 0 ? 'bullish' as const : m.histogram < 0 ? 'bearish' as const : 'neutral' as const
      })),
      sma
    },
    summary: `Analysis for ${pair} shows ${lastMacd.histogram > 0 ? 'bullish' : 'bearish'} momentum`
  };
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
    execute: async ({ pair, timeframe, periods }: { pair: string; timeframe: string; periods: number }) => {
      const data = await getFxData(pair, timeframe, periods);
      return {
        type: 'fx-data',
        data
      };
    }
  },

  calculate_quant_signal: {
    name: 'calculate_quant_signal',
    description: 'Calculate quantitative trading signals based on historical data',
    parameters: z.object({
      data: z.array(z.any()).describe('Historical price data'),
      capital: z.number().describe('Trading capital amount'),
      risk_percent: z.number().describe('Risk percentage per trade')
    }),
    execute: async ({ data, capital, risk_percent }: { data: FxData[]; capital: number; risk_percent: number }) => {
      const signal = await calculateQuantSignal(data, capital, risk_percent);
      return {
        type: 'quant-signal',
        data: signal
      };
    }
  },

  get_simple_forecast: {
    name: 'get_simple_forecast',
    description: 'Get a simple price forecast based on historical data',
    parameters: z.object({
      data: z.array(z.any()).describe('Historical price data')
    }),
    execute: async ({ data }: { data: FxData[] }) => {
      const forecast = await getSimpleForecast(data);
      return {
        type: 'forecast',
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
    execute: async ({ pair }: { pair: string }) => {
      const analysis = await getTechnicalAnalysis(pair);
      return {
        type: 'technical-analysis',
        data: analysis
      };
    }
  }
} satisfies Record<string, BaseTool>;

export type ForexTools = typeof forexTools;

const validateForexParams = (params: any) => {
  const errors: string[] = [];
  
  if (!FOREX_PAIRS.includes(params.pair)) {
    errors.push(`Par inválido: ${params.pair}`);
  }
  
  if (!TIMEFRAMES.includes(params.timeframe)) {
    errors.push(`Timeframe inválido: ${params.timeframe}`);
  }
  
  if (params.periods < 10 || params.periods > 1000) {
    errors.push(`Número de períodos inválido: ${params.periods}`);
  }
  
  return errors;
};