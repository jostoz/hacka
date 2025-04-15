import { z } from 'zod';

// Tipos base para las herramientas
export interface BaseTool<T = any> {
  description: string;
  parameters: z.ZodObject<any>;
  function: (args: T) => Promise<ToolResponse>;
}

// Tipos de respuesta de las herramientas
export interface ToolResponse {
  type: 'technical-analysis' | 'weather' | 'text';
  data: any;
}

// Tipos específicos para forex
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