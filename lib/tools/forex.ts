// lib/tools/forex.ts
import { z } from 'zod';
import { BaseTool, FxData, QuantSignal, Forecast, TechnicalAnalysisData } from '@/lib/types/types';
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

// Funciones de API
async function getFxDataFromAPI(pair: string, timeframe: string, periods: number): Promise<FxData[]> {
  // Implementar llamada a API real
  const timestamp = Date.now(); // Usar timestamp numérico
  return [{
    timestamp,
    open: 0,
    high: 0,
    low: 0,
    close: 0,
    volume: 0
  }];
}

function calculateSignal(data: FxData[], capital: number, riskPercent: number): QuantSignal {
  const lastPrice = data[data.length - 1].close;
  
  return {
    pair: 'EUR/USD', // Par por defecto si no está en FxData
    signal: 'hold',
    confidence: 0.5,
    positionSize: capital * (riskPercent / 100),
    stopLoss: lastPrice * 0.99,
    justification: 'Análisis basado en últimos precios',
    type: 'signal',
    value: lastPrice.toString()
  };
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

// Función para calcular indicadores
function calculateIndicators(data: FxData[]) {
  const values = data.map(d => d.close);
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
  // Generar datos históricos para FxData
  const fxData: FxData[] = Array.from({ length: 100 }, (_, i) => ({
    timestamp: Date.now() - (i * 60000), // Usar timestamp numérico
    open: 1.2000 + Math.random() * 0.0100,
    high: 1.2050 + Math.random() * 0.0100,
    low: 1.1950 + Math.random() * 0.0100,
    close: 1.2000 + Math.random() * 0.0100,
    volume: Math.floor(Math.random() * 1000000)
  }));

  // Generar datos históricos para el gráfico
  const historicalData = fxData.map(d => ({
    timestamp: d.timestamp,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
    volume: d.volume
  }));

  const { rsi, macd, sma } = calculateIndicators(fxData);
  
  if (!macd?.length || !rsi?.length || !sma?.length) {
    throw new Error('Failed to calculate indicators');
  }

  const lastMacd = macd[macd.length - 1];
  const lastRsi = rsi[rsi.length - 1];
  const lastSma = sma[sma.length - 1];

  if (!lastMacd || typeof lastRsi !== 'number' || typeof lastSma !== 'number') {
    throw new Error('Invalid indicator values');
  }

  const histogram = lastMacd.histogram || 0;

  return {
    pair,
    timestamp: Date.now(),
    signals: [{
      pair,
      signal: histogram > 0 ? 'buy' : histogram < 0 ? 'sell' : 'hold',
      confidence: Math.min(Math.abs(lastRsi - 50) / 50, 1),
      positionSize: 1000,
      stopLoss: lastSma * 0.98,
      justification: `RSI: ${lastRsi.toFixed(2)}, MACD: ${histogram.toFixed(4)}`
    }],
    historicalData,
    indicators: {
      rsi: rsi,
      macd: macd.map((m) => {
        const hist = m.histogram || 0;
        return {
          macdLine: m.MACD || 0,
          signalLine: m.signal || 0,
          histogram: hist,
          trend: hist > 0 ? 'bullish' : hist < 0 ? 'bearish' : 'neutral'
        };
      }),
      sma
    },
    summary: `Analysis for ${pair} shows ${histogram > 0 ? 'bullish' : 'bearish'} momentum`
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
    execute: async (args: Record<string, unknown>) => {
      const { pair, timeframe, periods } = args as { pair: string; timeframe: string; periods: number };
      const data = await getFxDataFromAPI(pair, timeframe, periods);
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
    execute: async (args: Record<string, unknown>) => {
      const { data, capital, risk_percent } = args as { data: FxData[]; capital: number; risk_percent: number };
      const signal = calculateSignal(data, capital, risk_percent);
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
    execute: async (args: Record<string, unknown>) => {
      const { data } = args as { data: FxData[] };
      const forecast = generateForecast(data);
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
    execute: async (args: Record<string, unknown>) => {
      const { pair } = args as { pair: string };
      const analysis = await fetchTechnicalAnalysisFromAPI(pair);
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