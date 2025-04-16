import { TechnicalAnalysisData, QuantSignal } from '@/lib/types/types';

export interface ForexState {
  currentPair: string;
  timeframe: string;
  lastAnalysis: TechnicalAnalysisData | null;
  lastSignal: QuantSignal | null;
  error: string | null;
}

export const initialForexState: ForexState = {
  currentPair: 'EUR/USD',
  timeframe: '1h',
  lastAnalysis: null,
  lastSignal: null,
  error: null
};
