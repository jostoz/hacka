// components/technical-analysis-block.tsx
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { type TechnicalAnalysisData } from '@/lib/types/types';
import { SignalCard } from './SignalCard';
import { 
  createChart, 
  CandlestickSeries, 
  LineSeries, 
  HistogramSeries,
  ColorType,
  Time,
  UTCTimestamp
} from 'lightweight-charts';
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
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
    });

    // Crear la serie de velas usando la nueva API
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Establecer los datos de las velas
    candlestickSeries.setData(
      data.historicalData.map(d => ({
        time: (d.timestamp / 1000) as Time,  // Convertir a segundos y usar como Time
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
    );

    // Agregar serie RSI
    const rsiSeries = chart.addSeries(LineSeries, {
      color: '#2962FF',
      lineWidth: 2,
      priceScaleId: 'rsi',
      priceFormat: {
        type: 'price',
        precision: 2,
      },
    });

    // Agregar serie MACD
    const macdSeries = chart.addSeries(HistogramSeries, {
      color: '#2962FF',
      priceScaleId: 'macd',
    });

    // Configurar escalas de precio adicionales
    chart.priceScale('rsi').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
      visible: true,
    });

    chart.priceScale('macd').applyOptions({
      scaleMargins: {
        top: 0.6,
        bottom: 0.2,
      },
      visible: true,
    });

    // Establecer datos de RSI
    if (data.indicators.rsi.length > 0) {
      rsiSeries.setData(
        data.indicators.rsi.map((value, index) => ({
          time: (data.historicalData[index].timestamp / 1000) as Time,  // Convertir a segundos y usar como Time
          value,
        }))
      );
    }

    // Establecer datos de MACD
    if (data.indicators.macd.length > 0) {
      macdSeries.setData(
        data.indicators.macd.map((value, index) => ({
          time: (data.historicalData[index].timestamp / 1000) as Time,  // Convertir a segundos y usar como Time
          value: value.histogram,
          color: value.histogram > 0 ? '#26a69a' : '#ef5350',
        }))
      );
    }

    // Ajustar el contenido al área visible
    chart.timeScale().fitContent();

    // Cleanup
    return () => chart.remove();
  }, [data.historicalData, data.indicators]);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Technical Analysis: {data.pair}</h3>
      </CardHeader>
      <CardContent>
        <div ref={chartContainerRef} className="mb-4" />
        <div className="space-y-4">
          {data.signals.map((signal, index) => (
            <SignalCard key={index} signal={signal} />
          ))}
          <div className="mt-4">
            <h4 className="text-md font-medium mb-2">Indicators Summary</h4>
            <p className="text-sm text-gray-600">{data.summary}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateIndicators(data: Array<{ value: number }>) {
  if (data.length < 26) throw new Error('Se requieren al menos 26 períodos');
  // ... cálculos
}