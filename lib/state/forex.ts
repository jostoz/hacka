import type { TechnicalAnalysisData, Signal } from '@/lib/types/types';

export interface ForexState {
  currentPair: string;
  timeframe: string;
  lastAnalysis: TechnicalAnalysisData | null;
  lastSignal: Signal | null;
  error: string | null;
}

export const initialForexState: ForexState = {
  currentPair: 'EUR/USD',
  timeframe: '1h',
  lastAnalysis: null,
  lastSignal: null,
  error: null
};
