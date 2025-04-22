import type { FxData, Signal, Forecast, TechnicalAnalysisData, ForexResponse } from './types';

// API endpoint for forex data
const FOREX_API_ENDPOINT = process.env.FOREX_API_ENDPOINT || 'https://api.example.com/forex';

/**
 * Fetches historical forex data for a given pair and timeframe
 */
export async function getFxData(
  pair: string,
  timeframe: string,
  periods: number
): Promise<ForexResponse<FxData[]>> {
  try {
    const response = await fetch(
      `${FOREX_API_ENDPOINT}/historical?pair=${pair}&timeframe=${timeframe}&periods=${periods}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      data: data as FxData[]
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch forex data'
      }
    };
  }
}

/**
 * Calculates trading signals based on historical data and risk parameters
 */
export function calculateSignal(
  historicalData: FxData[], 
  pair = 'EUR/USD',
  accountBalance = 10000,
  riskPercentage = 1
): ForexResponse<Signal> {
  if (!historicalData?.length) {
    return {
      success: false,
      error: {
        message: 'No historical data provided',
        code: 'INSUFFICIENT_DATA'
      }
    };
  }

  try {
    const riskAmount = (accountBalance * riskPercentage) / 100;
    const lastPrice = historicalData[historicalData.length - 1].close;
    
    // Aquí iría la lógica de cálculo de señales
    const signal: Signal = {
      symbol: pair,
      entryPrice: lastPrice,
      signal: 'buy',
      confidence: 0.75,
      positionSize: riskAmount / (lastPrice * 0.01), // Calculamos el tamaño de la posición basado en el riesgo
      stopLoss: lastPrice * 0.99,
      takeProfit: lastPrice * 1.02,
      justification: 'Señal basada en análisis técnico y gestión de riesgo',
      type: 'technical',
      value: lastPrice
    };

    return {
      success: true,
      data: signal
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error calculating signal',
        code: 'CALCULATION_ERROR',
        details: error
      }
    };
  }
}

/**
 * Generates a simple price forecast using linear regression
 */
export function getSimpleForecast(data: FxData[]): ForexResponse<Forecast> {
  try {
    if (data.length < 5) {
      throw new Error('Insufficient data points for forecast');
    }

    const prices = data.map(d => d.close);
    const timestamps = data.map(d => d.timestamp);
    
    // Simple linear regression
    const n = prices.length;
    const sumX = timestamps.reduce((a, b) => a + b, 0);
    const sumY = prices.reduce((a, b) => a + b, 0);
    const sumXY = timestamps.reduce((sum, x, i) => sum + x * prices[i], 0);
    const sumXX = timestamps.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const nextTimestamp = timestamps[timestamps.length - 1] + 
      (timestamps[1] - timestamps[0]);
    const nextPrice = slope * nextTimestamp + 
      (sumY - slope * sumX) / n;
    
    const confidence = Math.min(0.95, Math.abs(slope));

    return {
      success: true,
      data: {
        pair: 'EURUSD', // This should come from parameters
        nextPrice,
        confidence,
        timestamp: new Date(nextTimestamp).toISOString()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to generate forecast'
      }
    };
  }
}

/**
 * Performs technical analysis on the forex data
 */
export function getTechnicalAnalysis(data: FxData[]): ForexResponse<TechnicalAnalysisData> {
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
        symbol: 'EURUSD', // This should come from parameters
        entryPrice: prices[prices.length - 1],
        signal: 'buy',
        confidence: 0.7,
        positionSize: 1,
        stopLoss: prices[prices.length - 1] * 0.99,
        justification: 'RSI indicates oversold conditions',
        type: 'RSI',
        value: rsiValue
      });
    }

    return {
      success: true,
      data: {
        pair: 'EURUSD', // This should come from parameters
        timestamp: data[data.length - 1].timestamp,
        signals,
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
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to perform technical analysis'
      }
    };
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