import { z } from 'zod';
import type { ForexPair, Timeframe } from '@/lib/forex/constants';
import { FOREX_PAIRS, TIMEFRAMES } from '@/lib/forex/constants';
import type { FxData, Signal, TechnicalAnalysisData } from '@/lib/types/types';

// Esquemas de validación base
export const FxDataSchema = z.object({
  timestamp: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number().optional()
});

export const SignalSchema = z.object({
  symbol: z.string(),
  type: z.enum(['BUY', 'SELL', 'HOLD']),
  price: z.number(),
  stopLoss: z.number(),
  takeProfit: z.number().optional(),
  timestamp: z.number(),
  confidence: z.number().min(0).max(1),
  reason: z.string()
});

export const TechnicalAnalysisSchema = z.object({
  symbol: z.string(),
  timestamp: z.number(),
  signals: z.array(SignalSchema),
  historicalData: z.array(FxDataSchema),
  indicators: z.object({
    rsi: z.array(z.number()),
    macd: z.array(z.object({
      macdLine: z.number(),
      signalLine: z.number(),
      histogram: z.number(),
      trend: z.enum(['bullish', 'bearish', 'neutral'])
    })),
    sma: z.array(z.number())
  }),
  levels: z.object({
    support: z.number(),
    resistance: z.number()
  }),
  summary: z.string()
});

// Type guards mejorados con mensajes de error
export class ValidationError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateForexPair(value: unknown): asserts value is ForexPair {
  if (typeof value !== 'string') {
    throw new ValidationError(
      'INVALID_TYPE',
      `El par de divisas debe ser un string, recibido: ${typeof value}`
    );
  }
  
  if (!FOREX_PAIRS.includes(value as ForexPair)) {
    throw new ValidationError(
      'INVALID_PAIR',
      `Par de divisas no soportado: ${value}. Pares válidos: ${FOREX_PAIRS.join(', ')}`
    );
  }
}

export function validateTimeframe(value: unknown): asserts value is Timeframe {
  if (typeof value !== 'string') {
    throw new ValidationError(
      'INVALID_TYPE',
      `El timeframe debe ser un string, recibido: ${typeof value}`
    );
  }

  if (!TIMEFRAMES.includes(value as Timeframe)) {
    throw new ValidationError(
      'INVALID_TIMEFRAME',
      `Timeframe no soportado: ${value}. Timeframes válidos: ${TIMEFRAMES.join(', ')}`
    );
  }
}

// Validadores de datos
export function validateFxData(data: unknown): asserts data is FxData {
  try {
    FxDataSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'INVALID_FX_DATA',
        `Datos FX inválidos: ${error.message}`,
        error.issues
      );
    }
    throw error;
  }
}

export function validateSignal(signal: unknown): asserts signal is Signal {
  try {
    SignalSchema.parse(signal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'INVALID_SIGNAL',
        `Señal inválida: ${error.message}`,
        error.issues
      );
    }
    throw error;
  }
}

export function validateTechnicalAnalysis(analysis: unknown): asserts analysis is TechnicalAnalysisData {
  try {
    TechnicalAnalysisSchema.parse(analysis);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'INVALID_TECHNICAL_ANALYSIS',
        `Análisis técnico inválido: ${error.message}`,
        error.issues
      );
    }
    throw error;
  }
}

// Validadores de configuración
export function validateForexConfig(config: unknown): void {
  const ForexConfigSchema = z.object({
    capital: z.number().min(100, 'El capital mínimo debe ser 100'),
    riskPercent: z.number().min(0.1, 'El riesgo mínimo es 0.1%').max(10, 'El riesgo máximo es 10%')
  });

  try {
    ForexConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'INVALID_CONFIG',
        `Configuración inválida: ${error.message}`,
        error.issues
      );
    }
    throw error;
  }
}

// Validador de respuesta de API
export function validateApiResponse<T>(
  response: unknown,
  schema: z.ZodSchema<T>
): asserts response is T {
  try {
    schema.parse(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'INVALID_API_RESPONSE',
        `Respuesta de API inválida: ${error.message}`,
        error.issues
      );
    }
    throw error;
  }
} 