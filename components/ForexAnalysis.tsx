// components/ForexAnalysis.tsx
import { useState } from 'react';
import { forexTools } from '@/lib/tools/forex';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SignalCard } from './SignalCard';
import type { Signal, Forecast, TechnicalAnalysisData, FxData, ToolResult } from '@/lib/types/types';
import { TechnicalAnalysisBlock } from './technical-analysis-block';

interface ForexAnalysisProps {
  symbol: string;
  timeframe: string;
  periods: number;
}

interface ForexConfig {
  capital: number;
  riskPercent: number;
}

interface FxDataResult extends ToolResult<FxData[]> {}

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
  { value: 'USD/CAD', label: 'USD/CAD' },
  { value: 'USD/MXN', label: 'USD/MXN' }
];

export const ForexAnalysis: React.FC<ForexAnalysisProps> = ({ symbol, timeframe, periods }) => {
  const [config, setConfig] = useState<ForexConfig>({
    capital: 10000,
    riskPercent: 2
  });

  const [marketData, setMarketData] = useState<FxDataResult | null>(null);
  const [signal, setSignal] = useState<ToolResult<Signal> | null>(null);
  const [forecast, setForecast] = useState<ToolResult<Forecast> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [technicalAnalysis, setTechnicalAnalysis] = useState<ToolResult<TechnicalAnalysisData> | null>(null);

  const fetchMarketData = async (): Promise<FxDataResult> => {
    try {
      const result = await forexTools.get_fx_data.execute({
        pair: symbol,
        timeframe: timeframe,
        periods: periods
      });
      
      if (!result.success) {
        throw new Error('Error al obtener datos del mercado');
      }
      
      const typedResult: FxDataResult = result;
      setMarketData(typedResult);
      return typedResult;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al obtener datos: ${errorMessage}`);
      throw err;
    }
  };

  const generateSignal = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = marketData || await fetchMarketData();
      if (!data.success || !data.data) {
        throw new Error('No hay datos de mercado disponibles');
      }

      const tradingSignal = await forexTools.calculate_quant_signal.execute({
        data: data.data,
        capital: config.capital,
        risk_percent: config.riskPercent
      });

      if (!tradingSignal.success || !tradingSignal.data) {
        throw new Error('Error al calcular la señal de trading');
      }

      const signalData: Signal = {
        symbol,
        type: tradingSignal.data.type || 'BUY',
        price: data.data[data.data.length - 1].close,
        stopLoss: tradingSignal.data.stopLoss,
        takeProfit: tradingSignal.data.takeProfit,
        timestamp: Date.now(),
        confidence: tradingSignal.data.confidence,
        reason: tradingSignal.data.reason
      };

      setSignal({ success: true, data: signalData });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al generar señal: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const generateForecast = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = marketData || await fetchMarketData();
      if (!data.success || !data.data) {
        throw new Error('No hay datos de mercado disponibles');
      }

      const forecastResult = await forexTools.get_simple_forecast.execute({
        data: data.data
      });

      if (!forecastResult.success) {
        throw new Error('Error al generar el pronóstico');
      }

      setForecast(forecastResult);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al generar pronóstico: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicalAnalysisData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await forexTools.fetchTechnicalAnalysis.execute({
        pair: symbol,
        timeframe: timeframe,
        periods: periods
      });

      if (!result.success) {
        const errorMessage = result.error?.message || 'Error desconocido en el análisis técnico';
        const errorCode = result.error?.code || 'UNKNOWN_ERROR';
        
        console.error('Error en análisis técnico:', {
          message: errorMessage,
          code: errorCode,
          details: result.error?.details
        });
        
        throw new Error(`${errorMessage} (${errorCode})`);
      }

      setTechnicalAnalysis(result);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(`Error en análisis técnico: ${errorMessage}`);
      console.error('Error detallado:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="capital">Capital Disponible ($)</Label>
          <Input
            id="capital"
            type="number"
            min="100"
            step="100"
            value={config.capital}
            onChange={(e) => setConfig({ ...config, capital: Number(e.target.value) })}
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
            onChange={(e) => setConfig({ ...config, riskPercent: Number(e.target.value) })}
          />
        </div>

        <div className="flex space-x-4">
          <Button
            type="button"
            onClick={fetchTechnicalAnalysisData}
            disabled={loading}
          >
            {loading ? 'Analizando...' : 'Análisis Técnico'}
          </Button>

          <Button
            type="button"
            onClick={generateSignal}
            disabled={loading}
          >
            {loading ? 'Generando...' : 'Generar Señal'}
          </Button>

          <Button
            type="button"
            onClick={generateForecast}
            disabled={loading}
          >
            {loading ? 'Calculando...' : 'Generar Pronóstico'}
          </Button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {technicalAnalysis?.data && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Análisis Técnico</h3>
          <TechnicalAnalysisBlock data={technicalAnalysis.data} />
        </div>
      )}

      {signal?.data && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Señal de Trading</h3>
          <SignalCard signal={signal.data} />
        </div>
      )}

      {forecast?.data && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Pronóstico</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            {JSON.stringify(forecast.data, null, 2)}
          </pre>
        </div>
      )}
    </Card>
  );
};

export default ForexAnalysis;