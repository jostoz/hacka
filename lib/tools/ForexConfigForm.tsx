import { useState } from 'react';
import { ForexConfigForm } from './ForexConfigForm';
import { SignalCard } from './SignalCard';

export function ForexAnalysis() {
  const [signal, setSignal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfigSubmit = async (config) => {
    setLoading(true);
    setError(null);
    
    try {
      // Obtener datos del mercado
      const marketData = await forexTools.get_fx_data.function({
        pair: config.pair,
        timeframe: config.timeframe,
        periods: config.periods
      });

      // Calcular señal
      const tradingSignal = await forexTools.calculate_quant_signal.function({
        data: marketData.data,
        capital: config.capital,
        risk_percent: config.riskPercent
      });

      setSignal(tradingSignal.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ForexConfigForm onSubmit={handleConfigSubmit} />
      
      {loading && <div>Analizando mercado...</div>}
      
      {error && (
        <div className="text-red-500">
          Error: {error}
        </div>
      )}
      
      {signal && (
        <SignalCard
          pair={signal.pair}
          signal={signal.signal}
          confidence={signal.confidence}
          positionSize={signal.positionSize}
          stopLoss={signal.stopLoss}
          takeProfit={signal.takeProfit}
          riskRewardRatio={signal.riskRewardRatio}
        />
      )}
    </div>
  );
}
