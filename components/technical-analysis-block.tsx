// components/technical-analysis-block.tsx
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { type TechnicalAnalysisData } from '@/lib/types/types';
import { SignalCard } from './SignalCard';
import { createChart } from 'lightweight-charts';
import { useEffect } from 'react';

interface TechnicalAnalysisBlockProps {
  data: TechnicalAnalysisData;
}

export function TechnicalAnalysisBlock({ data }: TechnicalAnalysisBlockProps) {
  useEffect(() => {
    if (data.historicalData && data.indicators) {
      const chart = createChart('chart-container', { width: '100%', height: 400 });
      
      // Precio
      const priceSeries = chart.addLineSeries({ color: '#2962FF' });
      priceSeries.setData(data.historicalData.map(d => ({ time: d.time / 1000, value: d.value })));

      // SMA
      const smaSeries = chart.addLineSeries({ color: '#FF6D00', lineWidth: 2 });
      smaSeries.setData(data.historicalData.slice(-data.indicators.sma.length).map((d, i) => ({
        time: d.time / 1000,
        value: data.indicators.sma[i],
      })));

      return () => chart.remove();
    }
  }, [data]);

  return (
    <Card className="mt-4 border-border">
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold">Análisis Técnico</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gráfico (ej. TradingView Lightweight Charts) */}
        <div className="h-64 bg-muted rounded-md">
          {/* Lógica para renderizar gráficos */}
        </div>

        {/* Señales */}
        <div className="grid grid-cols-2 gap-2">
          {data.signals?.map((signal, index) => (
            <div key={index} className="p-2 bg-secondary rounded-md">
              <p className="font-medium">{signal.type}</p>
              <p className="text-sm text-muted-foreground">
                {signal.value} ({signal.confidence}%)
              </p>
            </div>
          ))}
        </div>

        {/* Recomendación */}
        {data.recommendation && (
          <div className="p-3 bg-primary/10 border-l-4 border-primary">
            <p className="font-medium">Recomendación: {data.recommendation}</p>
          </div>
        )}

        {/* Signal Card */}
        {data.signals && <SignalCard signal={data.signals[0]} />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {data.indicators?.rsi && (
            <div className="bg-background p-3 rounded-md">
              <h4 className="font-medium">RSI (14):</h4>
              <p>{data.indicators.rsi[data.indicators.rsi.length - 1].toFixed(2)}</p>
            </div>
          )}
          {data.indicators?.macd && (
            <div className="bg-background p-3 rounded-md">
              <h4 className="font-medium">MACD:</h4>
              <p>{data.indicators.macd[data.indicators.macd.length - 1].histogram.toFixed(4)}</p>
            </div>
          )}
          {data.indicators?.sma && (
            <div className="bg-background p-3 rounded-md">
              <h4 className="font-medium">SMA (20):</h4>
              <p>{data.indicators.sma[data.indicators.sma.length - 1].toFixed(4)}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function calculateIndicators(data: Array<{ value: number }>) {
  if (data.length < 26) throw new Error('Se requieren al menos 26 períodos');
  // ... cálculos
}