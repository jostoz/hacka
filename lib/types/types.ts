import { z } from 'zod';

// Tipos base para las herramientas
export interface BaseTool<T = any> {
  description: string;
  parameters: z.ZodObject<any>;
  function: (args: T) => Promise<ToolResult<any>>;
}

// Tipos de respuesta de las herramientas
export interface ToolResult<T> {
  type: 'fx-data' | 'quant-signal' | 'forecast' | 'technical-analysis' | 'weather' | 'text';
  data: T;
}

// Tipos específicos para forex
export interface FxData {
  pair: string;
  timeframe: string;
  data: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

export interface QuantSignal {
  pair: string;
  signal: 'buy' | 'sell' | 'hold';
  confidence: number;
  positionSize: number;
  stopLoss: number;
  takeProfit: number;
  riskRewardRatio: number;
}

export interface Forecast {
  pair: string;
  predictions: Array<{
    timestamp: number;
    value: number;
    confidenceInterval: [number, number];
  }>;
}

export interface Signal {
  pair: string;
  signal: 'buy' | 'sell' | 'hold';
  confidence: number;
  positionSize: number;
  stopLoss: number;
  justification: string;
  type?: string;  // Opcional para compatibilidad con TechnicalAnalysisBlock
  value?: string | number;  // Opcional para compatibilidad
}

export interface TechnicalAnalysisData {
  signals?: Signal[];
  recommendation?: string;
  historicalData?: Array<{ time: number; value: number }>; // Para gráficos
  indicators?: {
    rsi: number[];
    macd: Array<{ histogram: number }>;
    sma: number[];
  };
}

export type MessageType = 
  | 'fx-data' 
  | 'quant-signal' 
  | 'forecast' 
  | 'technical-analysis' 
  | 'weather' 
  | 'text';

export interface ToolContent {
  type: 'tool-result';
  toolCallId: string;
  result: ToolResult<any>;
}

export interface CoreToolMessage {
  role: 'tool';
  name: string;
  content: ToolContent[];
}