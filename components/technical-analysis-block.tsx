// components/technical-analysis-block.tsx
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { type TechnicalAnalysisData } from '@/lib/types/types';
import { SignalCard } from './SignalCard';
import { createChart } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

interface TechnicalAnalysisBlockProps {
  data: TechnicalAnalysisData;
}

export function TechnicalAnalysisBlock({ data }: TechnicalAnalysisBlockProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data.historicalData) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
    });

    const candlestickSeries = chart.addCandlestickSeries();
    candlestickSeries.setData(
      data.historicalData.map(d => ({
        time: d.timestamp,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
    );

    return () => chart.remove();
  }, [data.historicalData]);

  return (
    <Card>
      <CardHeader>
        <h3>Technical Analysis: {data.pair}</h3>
      </CardHeader>
      <CardContent>
        <div ref={chartContainerRef} />
        {data.signals.map((signal, index) => (
          <SignalCard key={index} signal={signal} />
        ))}
        <div className="mt-4">
          <h4>Indicators Summary</h4>
          <p>{data.summary}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateIndicators(data: Array<{ value: number }>) {
  if (data.length < 26) throw new Error('Se requieren al menos 26 períodos');
  // ... cálculos
}