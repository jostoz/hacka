import { z } from 'zod';
import { CoreToolMessage as AICoreToolMessage } from 'ai';

// Message types
export type MessageType = 
  | 'fx-data' 
  | 'quant-signal' 
  | 'forecast' 
  | 'technical-analysis' 
  | 'weather' 
  | 'text';

// Base interfaces
export interface BaseTool {
  name: string;
  description: string;
  execute: (args: Record<string, unknown>) => Promise<ToolResult>;
}

export interface ToolResult {
  type: MessageType;
  data: unknown;
}

export interface ToolResultPart {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  result: ToolResult;
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
  timestamp: string;
  indicators: TechnicalAnalysisBlock[];
  summary: string;
}

// Re-export CoreToolMessage from ai package
export type { AICoreToolMessage as CoreToolMessage };