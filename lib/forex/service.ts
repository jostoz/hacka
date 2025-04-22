import type { FxData, Signal, Forecast, TechnicalAnalysisData, ForexResponse, ForexError } from './types';
import { isValidForexPair, isValidTimeframe } from './constants';

// Mock API endpoint - replace with actual API in production
const API_BASE_URL = process.env.FOREX_API_URL || 'https://api.example.com/forex';

async function fetchFromAPI<T>(endpoint: string, params: Record<string, string>): Promise<ForexResponse<T>> {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/${endpoint}?${queryString}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    const forexError: ForexError = {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'API_ERROR'
    };
    return { success: false, error: forexError };
  }
}

export async function getMarketData(pair: string, timeframe: string, periods: number): Promise<ForexResponse<FxData[]>> {
  if (!isValidForexPair(pair)) {
    return {
      success: false,
      error: { message: 'Invalid forex pair', code: 'INVALID_PAIR' }
    };
  }

  if (!isValidTimeframe(timeframe)) {
    return {
      success: false,
      error: { message: 'Invalid timeframe', code: 'INVALID_TIMEFRAME' }
    };
  }

  return fetchFromAPI<FxData[]>('market-data', {
    pair,
    timeframe,
    periods: periods.toString()
  });
}

export async function calculateSignal(data: FxData[], symbol: string): Promise<Signal> {
  // Placeholder implementation - replace with actual signal calculation logic
  const lastPrice = data[data.length - 1].close;
  return {
    symbol,
    type: 'BUY',
    price: lastPrice,
    stopLoss: lastPrice * 0.99,
    takeProfit: lastPrice * 1.01,
    timestamp: Date.now(),
    confidence: 0.75,
    reason: 'Technical analysis based signal'
  };
}

export async function generateForecast(data: FxData[], symbol?: string): Promise<ForexResponse<Forecast>> {
  if (data.length < 2) {
    return {
      success: false,
      error: {
        message: 'Insufficient data for forecast',
        code: 'INSUFFICIENT_DATA'
      }
    };
  }

  // Implement forecast generation logic here
  // This is a placeholder implementation
  const lastPrice = data[data.length - 1].close;
  const prevPrice = data[data.length - 2].close;
  
  const forecast: Forecast = {
    symbol: symbol || 'EUR/USD', // Use provided symbol or default
    nextPrice: lastPrice * (1 + (Math.random() - 0.5) * 0.01),
    confidence: 0.75,
    timestamp: new Date().toISOString()
  };

  return { success: true, data: forecast };
}

export function getTechnicalAnalysis(data: FxData[], symbol = 'EUR/USD'): ForexResponse<TechnicalAnalysisData> {
  try {
    if (data.length < 14) {
      throw new Error('Insufficient data points for technical analysis');
    }

    const prices = data.map(d => d.close);
    
    // Calculate RSI
    const changes = prices.slice(1).map((price, i) => price - prices[i]);
    const gains = changes.map(c => c > 0 ? c : 0);
    const losses = changes.map(c => c < 0 ? -c : 0);
    
    const avgGain = gains.slice(-14).reduce((a, b) => a + b) / 14;
    const avgLoss = losses.slice(-14).reduce((a, b) => a + b) / 14;
    
    const rs = avgGain / (avgLoss || 1);
    const rsiValue = 100 - (100 / (1 + rs));

    // Calculate MACD
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macdLine = ema12 - ema26;
    const signalLine = calculateEMA([macdLine], 9);
    const histogram = macdLine - signalLine;

    // Calculate SMAs
    const fastSMA = calculateSMA(prices, 10);
    const slowSMA = calculateSMA(prices, 20);

    // Generate signals based on indicators
    const signals: Signal[] = [];
    if (rsiValue < 30) {
      signals.push({
        symbol,
        type: 'TECHNICAL',
        price: prices[prices.length - 1],
        stopLoss: prices[prices.length - 1] * 0.99,
        timestamp: Date.now(),
        confidence: 0.7,
        reason: `RSI: ${rsiValue.toFixed(2)}`
      });
    }

    const analysis: TechnicalAnalysisData = {
      symbol,
      timestamp: Date.now(),
      signals: [{
        symbol,
        type: 'TECHNICAL',
        price: prices[prices.length - 1],
        stopLoss: prices[prices.length - 1] * 0.98,
        timestamp: Date.now(),
        confidence: 0.75,
        reason: `RSI: ${rsiValue.toFixed(2)}, MACD: ${histogram.toFixed(4)}`
      }],
      historicalData: data,
      indicators: {
        rsi: [rsiValue],
        macd: [{
          macdLine,
          signalLine,
          histogram,
          trend: macdLine > signalLine ? 'bullish' : 'bearish'
        }],
        sma: [fastSMA, slowSMA]
      },
      summary: `Technical analysis based on ${data.length} data points`
    };

    return {
      success: true,
      data: analysis
    };
  } catch (error) {
    const forexError: ForexError = {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'TECHNICAL_ANALYSIS_ERROR'
    };
    return { success: false, error: forexError };
  }
}

// Helper functions for technical analysis
function calculateEMA(prices: number[], periods: number): number {
  const k = 2 / (periods + 1);
  return prices.reduce((ema, price, i) => {
    if (i === 0) return price;
    return price * k + ema * (1 - k);
  }, prices[0]);
}

function calculateSMA(prices: number[], periods: number): number {
  return prices.slice(-periods).reduce((a, b) => a + b) / periods;
} 