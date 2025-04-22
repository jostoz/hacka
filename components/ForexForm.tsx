// components/ForexForm.tsx
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { forexTools } from '@/lib/tools/forex';
import { SignalCard } from './SignalCard';
import type { Signal, Forecast, TechnicalAnalysisData } from '@/lib/types/types';
import type { Timeframe, FxData } from '@/lib/forex/types';
import type { MouseEventHandler } from 'react';

// Constantes para las opciones del formulario
const TIMEFRAME_OPTIONS = [
  { value: '1m', label: '1 minute' },
  { value: '5m', label: '5 minutes' },
  { value: '15m', label: '15 minutes' },
  { value: '1h', label: '1 hour' },
  { value: '4h', label: '4 hours' },
  { value: '1d', label: '1 day' }
] as const;

const FOREX_PAIRS = [
  { value: 'EUR/USD', label: 'EUR/USD' },
  { value: 'GBP/USD', label: 'GBP/USD' },
  { value: 'USD/JPY', label: 'USD/JPY' },
  { value: 'USD/CHF', label: 'USD/CHF' },
  { value: 'AUD/USD', label: 'AUD/USD' },
  { value: 'USD/CAD', label: 'USD/CAD' }
] as const;

// Tipos de análisis disponibles
type AnalysisType = 'signal' | 'forecast' | 'technical';

interface FormConfig {
  symbol: string;
  timeframe: Timeframe;
  periods: number;
  capital: number;
  riskPercent: number;
}

export function ForexForm() {
  // Estado para la configuración
  const [config, setConfig] = useState<FormConfig>({
    symbol: 'EUR/USD',
    timeframe: '1h',
    periods: 100,
    capital: 10000,
    riskPercent: 2
  });

  // Estados para los resultados
  const [marketData, setMarketData] = useState<{ type: string; data: FxData[] } | null>(null);
  const [signal, setSignal] = useState<Signal | null>(null);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [technicalAnalysis, setTechnicalAnalysis] = useState<TechnicalAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para manejar el análisis
  const handleAnalysis = async (type: AnalysisType) => {
    if (!config.symbol || !config.timeframe || !config.periods || !config.capital || !config.riskPercent) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const marketData = await forexTools.get_fx_data.execute({
        pair: config.symbol,
        timeframe: config.timeframe,
        periods: config.periods
      });

      if (!marketData?.data) {
        throw new Error('Failed to fetch market data');
      }

      switch (type) {
        case 'signal': {
          const tradingSignal = await forexTools.calculate_quant_signal.execute({
            data: marketData.data,
            capital: config.capital,
            risk_percent: config.riskPercent
          });

          if (tradingSignal.data) {
            const quantSignal = tradingSignal.data as Signal;
            const lastPrice = marketData.data[marketData.data.length - 1]?.close ?? 0;
            
            setSignal({
              symbol: config.symbol,
              type: quantSignal.type,
              price: lastPrice,
              confidence: quantSignal.confidence,
              stopLoss: quantSignal.stopLoss,
              takeProfit: quantSignal.takeProfit,
              timestamp: Date.now(),
              reason: `Signal generated based on quantitative analysis for ${config.symbol} on ${config.timeframe} timeframe`
            });
          }
          break;
        }
        case 'forecast': {
          const forecast = await forexTools.get_simple_forecast.execute({
            pair: config.symbol
          });
          setForecast(forecast.data as Forecast);
          break;
        }
        case 'technical': {
          const technicalAnalysis = await forexTools.fetchTechnicalAnalysis.execute({
            pair: config.symbol
          });
          setTechnicalAnalysis(technicalAnalysis.data as TechnicalAnalysisData);
          break;
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignalClick: MouseEventHandler<HTMLButtonElement> = () => handleAnalysis('signal');

  return (
    <Card className="p-6">
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="symbol">Currency Pair</Label>
          <Select
            value={config.symbol}
            onValueChange={(value) => setConfig({ ...config, symbol: value })}
          >
            {FOREX_PAIRS.map((pair) => (
              <option key={pair.value} value={pair.value}>
                {pair.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeframe">Timeframe</Label>
          <Select
            value={config.timeframe}
            onValueChange={(value) => setConfig({ ...config, timeframe: value as Timeframe })}
          >
            {TIMEFRAME_OPTIONS.map((tf) => (
              <option key={tf.value} value={tf.value}>
                {tf.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="periods">Analysis Periods</Label>
          <Input
            id="periods"
            type="number"
            min="10"
            max="1000"
            value={config.periods}
            onChange={(e) => setConfig({ ...config, periods: Number.parseInt(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capital">Available Capital ($)</Label>
          <Input
            id="capital"
            type="number"
            min="100"
            step="100"
            value={config.capital}
            onChange={(e) => setConfig({ ...config, capital: Number.parseInt(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="riskPercent">Risk Percentage (%)</Label>
          <Input
            id="riskPercent"
            type="number"
            min="0.1"
            max="10"
            step="0.1"
            value={config.riskPercent}
            onChange={(e) => setConfig({ ...config, riskPercent: Number.parseFloat(e.target.value) })}
          />
        </div>

        <div className="flex gap-2">
          <Button 
            type="button" 
            onClick={handleSignalClick}
            disabled={loading}
          >
            Generate Signal
          </Button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {signal && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Trading Signal</h3>
          <SignalCard signal={signal} />
        </div>
      )}

      {forecast && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Price Forecast</h3>
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Next Price</p>
                <p className="font-medium">{forecast.nextPrice.toFixed(5)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Confidence</p>
                <p className="font-medium">{(forecast.confidence * 100).toFixed(1)}%</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {technicalAnalysis && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Technical Analysis</h3>
          <Card className="p-4">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(technicalAnalysis, null, 2)}
            </pre>
          </Card>
        </div>
      )}
    </Card>
  );
}