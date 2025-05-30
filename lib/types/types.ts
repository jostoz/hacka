import type { z } from 'zod';
import type { CoreToolMessage as AICoreToolMessage } from 'ai';

// Message types
export type MessageType = 
  | 'fx-data' 
  | 'quant-signal' 
  | 'forecast' 
  | 'technical-analysis' 
  | 'weather' 
  | 'text'
  | 'tool-result';

// Base interfaces
export interface BaseTool {
  name: string;
  description: string;
  parameters: z.ZodObject<z.ZodRawShape>;
  execute: (args: Record<string, unknown>) => Promise<ToolResult<unknown>>;
}

export interface ToolResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ToolResultPart {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  result: ToolResult<unknown>;
  isError?: boolean;
}

// Forex Data Types
export interface FxData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Trading Signal Types
export interface Signal {
  symbol: string;
  type: 'BUY' | 'SELL' | 'HOLD' | 'TECHNICAL';
  price: number;
  stopLoss: number;
  takeProfit?: number;
  timestamp: number;
  confidence: number;
  reason?: string;
  entryPrice?: number;
}

// Forecast Types
export interface Forecast {
  symbol: string;
  nextPrice: number;
  confidence: number;
  timestamp: string;
}

// Technical Analysis Types
export interface TechnicalAnalysisBlock {
  type: string;
  value: string | number;
  interpretation: string;
}

export interface TechnicalAnalysisData {
  symbol: string;
  timestamp: number;
  signals: Signal[];
  historicalData: FxData[];
  indicators: {
    rsi: number[];
    macd: Array<{
      macdLine: number;
      signalLine: number;
      histogram: number;
      trend?: 'bullish' | 'bearish' | 'neutral';
    }>;
    sma: number[];
  };
  levels?: {
    support: number;
    resistance: number;
  };
  summary: string;
}

// For TypeScript type checking in route.ts
export interface ToolCallMessage {
  role: 'tool';
  function_call: {
    name: string;
    arguments: string;
  };
}

// Re-export CoreToolMessage from ai package
export type { AICoreToolMessage as CoreToolMessage };