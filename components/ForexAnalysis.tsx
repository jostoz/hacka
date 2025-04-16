// components/ForexAnalysis.tsx
import { useState } from 'react';
import { forexTools } from '@/lib/tools/forex';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SignalCard } from './SignalCard';
import type { QuantSignal, Forecast, TechnicalAnalysisData } from '@/lib/types/types';

// Define the return type of the forex tools' functions
type FxDataResponse = ReturnType<typeof forexTools.get_fx_data.function>;
type ToolResultWithData<T> = { type: string; data: T };

interface ForexConfig {
  pair: string;
  timeframe: string;
  periods: number;
  capital: number;
  riskPercent: number;
}

const TIMEFRAME_OPTIONS = [
  { value: '1m', label: '1 minuto' },
  { value: '5m', label: '5 minutos' },
  { value: '15m', label: '15 minutos' },
  { value: '1h', label: '1 hora' },
  { value: '4h', label: '4 horas' },
  { value: '1d', label: '1 día' }
];

const FOREX_PAIRS = [
  { value: 'EUR/USD', label: 'EUR/USD' },
  { value: 'GBP/USD', label: 'GBP/USD' },
  { value: 'USD/JPY', label: 'USD/JPY' },
  { value: 'USD/CHF', label: 'USD/CHF' },
  { value: 'AUD/USD', label: 'AUD/USD' },
  { value: 'USD/CAD', label: 'USD/CAD' }
];

export function ForexAnalysis() {
  // Estados para configuración
  const [config, setConfig] = useState<ForexConfig>({
    pair: 'EUR/USD',
    timeframe: '1h',
    periods: 100,
    capital: 10000,
    riskPercent: 2
  });

  // Estados para resultados con tipos correctos
  const [marketData, setMarketData] = useState<any | null>(null);
  const [signal, setSignal] = useState<ToolResultWithData<QuantSignal> | null>(null);
  const [forecast, setForecast] = useState<ToolResultWithData<Forecast> | null>(null);
  const [technicalAnalysis, setTechnicalAnalysis] = useState<ToolResultWithData<TechnicalAnalysisData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener datos del mercado
  const fetchMarketData = async () => {
    try {
      const data = await forexTools.get_fx_data.function({
        pair: config.pair,
        timeframe: config.timeframe,
        periods: config.periods
      });
      setMarketData(data);
      return data;
    } catch (err) {
      setError('Error al obtener datos: ' + err.message);
      throw err;
    }
  };

  // Generar señal de trading
  const generateSignal = async () => {
    setLoading(true);
    try {
      const data = marketData || await fetchMarketData();
      const tradingSignal = await forexTools.calculate_quant_signal.function({
        data: data.data,
        capital: config.capital,
        risk_percent: config.riskPercent
      });
      setSignal(tradingSignal);
    } catch (err) {
      setError('Error al generar señal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generar pronóstico
  const generateForecast = async () => {
    setLoading(true);
    try {
      const data = marketData || await fetchMarketData();
      const forecastData = await forexTools.get_simple_forecast.function({
        data: data.data
      });
      setForecast(forecastData);
    } catch (err) {
      setError('Error al generar pronóstico: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Realizar análisis técnico
  const generateTechnicalAnalysis = async () => {
    setLoading(true);
    try {
      const analysis = await forexTools.fetchTechnicalAnalysis.function({
        pair: config.pair
      });
      setTechnicalAnalysis(analysis);
    } catch (err) {
      setError('Error en análisis técnico: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pair">Par de Divisas</Label>
          <Select
            id="pair"
            value={config.pair}
            onValueChange={(value) => setConfig({ ...config, pair: value })}
          >
            {FOREX_PAIRS.map((pair) => (
              <option key={pair.value} value={pair.value}>
                {pair.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeframe">Marco Temporal</Label>
          <Select
            id="timeframe"
            value={config.timeframe}
            onValueChange={(value) => setConfig({ ...config, timeframe: value })}
          >
            {TIMEFRAME_OPTIONS.map((tf) => (
              <option key={tf.value} value={tf.value}>
                {tf.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="periods">Períodos a Analizar</Label>
          <Input
            id="periods"
            type="number"
            min="10"
            max="1000"
            value={config.periods}
            onChange={(e) => setConfig({ ...config, periods: parseInt(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capital">Capital Disponible ($)</Label>
          <Input
            id="capital"
            type="number"
            min="100"
            step="100"
            value={config.capital}
            onChange={(e) => setConfig({ ...config, capital: parseInt(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="riskPercent">Porcentaje de Riesgo (%)</Label>
          <Input
            id="riskPercent"
            type="number"
            min="0.1"
            max="10"
            step="0.1"
            value={config.riskPercent}
            onChange={(e) => setConfig({ ...config, riskPercent: parseFloat(e.target.value) })}
          />
        </div>

        <div className="flex gap-2">
          <Button 
            type="button" 
            onClick={generateSignal}
            disabled={loading}
          >
            Generar Señal
          </Button>
          <Button 
            type="button" 
            onClick={generateForecast}
            disabled={loading}
            variant="outline"
          >
            Pronóstico
          </Button>
          <Button 
            type="button" 
            onClick={generateTechnicalAnalysis}
            disabled={loading}
            variant="outline"
          >
            Análisis Técnico
          </Button>
        </div>
      </form>

      {loading && (
        <div className="mt-4 text-center">
          Analizando mercado...
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-500">
          {error}
        </div>
      )}
      
      {signal && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Señal de Trading</h3>
          <SignalCard
            pair={signal.data.pair}
            signal={signal.data.signal}
            confidence={signal.data.confidence}
            positionSize={signal.data.positionSize}
            stopLoss={signal.data.stopLoss}
            takeProfit={signal.data.takeProfit}
            riskRewardRatio={signal.data.riskRewardRatio}
          />
        </div>
      )}

      {forecast && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Pronóstico</h3>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(forecast.data, null, 2)}
          </pre>
        </div>
      )}

      {technicalAnalysis && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Análisis Técnico</h3>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(technicalAnalysis.data, null, 2)}
          </pre>
        </div>
      )}
    </Card>
  );
}