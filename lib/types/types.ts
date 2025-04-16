import { z } from 'zod';
import { CoreToolMessage as AICoreToolMessage } from 'ai';

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
  parameters: z.ZodObject<any>;
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

// Forex specific interfaces
export interface FxData {
  pair: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Signal {
  pair: string;
  signal: 'buy' | 'sell' | 'hold';
  confidence: number;
  positionSize: number;
  stopLoss: number;
  justification: string;
  type?: string;
  value?: string | number;
}

export type QuantSignal = Signal;

export interface Forecast {
  pair: string;
  prediction: number;
  confidence: number;
  timestamp: string;
}

export interface TechnicalAnalysisBlock {
  type: string;
  value: string | number;
  interpretation: string;
}

export interface TechnicalAnalysisData {
  pair: string;
  timestamp: number;
  signals: Array<{
    pair: string;
    signal: 'buy' | 'sell' | 'hold';
    confidence: number;
    positionSize: number;
    stopLoss: number;
    justification: string;
  }>;
  historicalData: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
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