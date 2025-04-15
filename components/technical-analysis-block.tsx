// components/technical-analysis-block.tsx
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { type TechnicalAnalysisData } from '@/lib/types';
import { SignalCard } from './SignalCard';
import { createChart } from 'lightweight-charts';
import { useEffect } from 'react';

interface TechnicalAnalysisBlockProps {
  data: TechnicalAnalysisData;
}

export function TechnicalAnalysisBlock({ data }: TechnicalAnalysisBlockProps) {
  useEffect(() => {
    const chart = createChart(document.getElementById('chart-container'), {
      width: '100%',
      height: 300,
    });
    const lineSeries = chart.addLineSeries();
    lineSeries.setData(data.historicalData || []);
    return () => chart.remove();
  }, [data.historicalData]);

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
      </CardContent>
    </Card>
  );
}