// components/ForexForm.tsx
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { forexTools } from '@/lib/tools/forex';
import { SignalCard } from './SignalCard';
import type { Signal } from '@/lib/types/types';

// Constantes para las opciones del formulario
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

// Tipos de análisis disponibles
type AnalysisType = 'signal' | 'forecast' | 'technical';

export function ForexForm() {
  // Estado para la configuración
  const [config, setConfig] = useState({
    pair: 'EUR/USD',
    timeframe: '1h',
    periods: 100,
    capital: 10000,
    riskPercent: 2
  });

  // Estados para los resultados
  const [signal, setSignal] = useState<Signal | null>(null);
  const [forecast, setForecast] = useState<any | null>(null);
  const [technicalAnalysis, setTechnicalAnalysis] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para manejar el análisis
  const handleAnalysis = async (type: AnalysisType) => {
    setLoading(true);
    setError(null);
    
    try {
      // Primero obtenemos los datos del mercado
      const marketData = await forexTools.get_fx_data.execute({
        pair: config.pair,
        timeframe: config.timeframe,
        periods: config.periods
      });

      // Dependiendo del tipo de análisis solicitado
      switch (type) {
        case 'signal':
          const tradingSignal = await forexTools.calculate_quant_signal.execute({
            data: marketData.data,
            capital: config.capital,
            risk_percent: config.riskPercent
          });
          
          // Convert QuantSignal to Signal
          const signalData: Signal = {
            pair: config.pair,
            signal: tradingSignal.data.signal,
            confidence: tradingSignal.data.confidence || 0.5,
            positionSize: tradingSignal.data.positionSize || 0,
            stopLoss: tradingSignal.data.stopLoss || 0,
            justification: `Señal generada basada en análisis cuantitativo para ${config.pair} en timeframe ${config.timeframe}`
          };
          
          setSignal(signalData);
          break;

        case 'forecast':
          const forecastData = await forexTools.get_simple_forecast.execute({
            data: marketData.data
          });
          setForecast(forecastData.data);
          break;

        case 'technical':
          const analysis = await forexTools.fetchTechnicalAnalysis.execute({
            pair: config.pair
          });
          setTechnicalAnalysis(analysis.data);
          break;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
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
            onClick={() => handleAnalysis('signal')}
            disabled={loading}
          >
            Generar Señal
          </Button>
          <Button 
            type="button" 
            onClick={() => handleAnalysis('forecast')}
            disabled={loading}
            variant="outline"
          >
            Generar Pronóstico
          </Button>
          <Button 
            type="button" 
            onClick={() => handleAnalysis('technical')}
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
          Error: {error}
        </div>
      )}

      {signal && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Señal de Trading</h3>
          <SignalCard signal={signal} />
        </div>
      )}

      {forecast && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Pronóstico</h3>
          {/* Aquí puedes agregar un componente para mostrar el pronóstico */}
        </div>
      )}

      {technicalAnalysis && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Análisis Técnico</h3>
          {/* Aquí puedes agregar un componente para mostrar el análisis técnico */}
        </div>
      )}
    </Card>
  );
}