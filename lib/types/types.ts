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

export interface ToolResult<T = unknown> {
  type: MessageType | string;
  data: T;
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
  pair: string;
  signal: 'buy' | 'sell' | 'hold';  // Using 'signal' instead of 'direction' to match existing code
  confidence: number;
  positionSize: number;
  stopLoss: number;
  takeProfit?: number;
  justification: string;
  type?: string;
  value?: string | number;
}

export type QuantSignal = Signal;

// Forecast Types
export interface Forecast {
  pair: string;
  nextPrice: number;  // Changed from 'prediction' to 'nextPrice' for consistency
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
  pair: string;
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