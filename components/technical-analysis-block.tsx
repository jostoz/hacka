// components/technical-analysis-block.tsx
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { TechnicalAnalysisData } from '@/lib/types/types';
import { SignalCard } from './SignalCard';
import { 
  createChart, 
  CandlestickSeries, 
  LineSeries, 
  HistogramSeries,
  ColorType,
  LineStyle,
  CrosshairMode,
  type Time,
} from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';

interface TechnicalAnalysisBlockProps {
  data: TechnicalAnalysisData;
}

export function TechnicalAnalysisBlock({ data }: TechnicalAnalysisBlockProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data.historicalData) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 600,
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#333',
        fontSize: 12,
        fontFamily: 'geist, sans-serif',
      },
      grid: {
        vertLines: { color: '#f0f0f0', style: LineStyle.Dotted },
        horzLines: { color: '#f0f0f0', style: LineStyle.Dotted },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#9B9B9B',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#9B9B9B',
        },
        horzLine: {
          color: '#9B9B9B',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#9B9B9B',
        },
      },
      timeScale: {
        borderColor: '#D1D4DC',
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        barSpacing: 12,
        minBarSpacing: 8,
      },
      rightPriceScale: {
        borderColor: '#D1D4DC',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
        autoScale: true,
        mode: 2,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      priceFormat: {
        type: 'price',
        precision: 5,
        minMove: 0.00001,
      },
    });

    candlestickSeries.setData(
      data.historicalData.map(d => ({
        time: (d.timestamp / 1000) as Time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
    );

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceScaleId: 'volume',
      priceFormat: {
        type: 'volume',
      },
    });

    const avgVolume = data.historicalData.reduce((sum, d) => sum + d.volume, 0) / data.historicalData.length;

    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.9,
        bottom: 0,
      },
      visible: true,
    });

    volumeSeries.setData(
      data.historicalData.map(d => ({
        time: (d.timestamp / 1000) as Time,
        value: d.volume,
        color: d.volume > avgVolume * 1.5 ? '#ef5350' : '#26a69a'
      }))
    );

    if (data.indicators.rsi.length > 0) {
      const rsiSeries = chart.addSeries(LineSeries, {
        color: '#2962FF',
        lineWidth: 2,
        priceScaleId: 'rsi',
        priceFormat: {
          type: 'price',
          precision: 2,
        },
      });

      const overboughtLine = chart.addSeries(LineSeries, {
        color: '#ef5350',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        priceScaleId: 'rsi',
      });

      const oversoldLine = chart.addSeries(LineSeries, {
        color: '#26a69a',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        priceScaleId: 'rsi',
      });

      chart.priceScale('rsi').applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0.5,
        },
        visible: true,
      });

      const rsiData = data.indicators.rsi.map((value, index) => ({
        time: (data.historicalData[index].timestamp / 1000) as Time,
        value,
      }));

      rsiSeries.setData(rsiData);
      
      const timeRange = data.historicalData.map(d => d.timestamp / 1000 as Time);
      overboughtLine.setData(timeRange.map(time => ({ time, value: 70 })));
      oversoldLine.setData(timeRange.map(time => ({ time, value: 30 })));
    }

    if (data.indicators.macd.length > 0) {
      const macdSeries = chart.addSeries(HistogramSeries, {
        priceScaleId: 'macd',
      });

      chart.priceScale('macd').applyOptions({
        scaleMargins: {
          top: 0.2,
          bottom: 0.1,
        },
        visible: true,
      });

      macdSeries.setData(
        data.indicators.macd.map((value, index) => ({
          time: (data.historicalData[index].timestamp / 1000) as Time,
          value: value.histogram,
          color: value.histogram > 0 
            ? value.histogram > value.macdLine ? '#1B5E20' : '#66BB6A' 
            : value.histogram < value.macdLine ? '#B71C1C' : '#EF5350',
        }))
      );
    }

    if (data.levels?.support) {
      const supportLine = chart.addSeries(LineSeries, {
        color: '#2196F3',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        title: 'Soporte',
      });
      
      supportLine.setData([
        { time: data.historicalData[0].timestamp / 1000 as Time, value: data.levels.support },
        { time: data.historicalData[data.historicalData.length - 1].timestamp / 1000 as Time, value: data.levels.support }
      ]);
    }

    if (data.levels?.resistance) {
      const resistanceLine = chart.addSeries(LineSeries, {
        color: '#FF5252',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        title: 'Resistencia',
      });
      
      resistanceLine.setData([
        { time: data.historicalData[0].timestamp / 1000 as Time, value: data.levels.resistance },
        { time: data.historicalData[data.historicalData.length - 1].timestamp / 1000 as Time, value: data.levels.resistance }
      ]);
    }

    const visibleLogicalRange = chart.timeScale().getVisibleLogicalRange();
    if (visibleLogicalRange !== null) {
      chart.timeScale().setVisibleLogicalRange({
        from: Math.max(0, data.historicalData.length - 30),
        to: data.historicalData.length - 1,
      });
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data.historicalData, data.indicators, data.levels]);

  const trendStrength = data.indicators.macd[data.indicators.macd.length - 1]?.histogram || 0;
  const trend = trendStrength > 0 ? 'Alcista' : trendStrength < 0 ? 'Bajista' : 'Neutral';
  const strength = Math.min(Math.abs(trendStrength * 10), 10).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Análisis Técnico: {data.pair}</h3>
          <div className="flex gap-4 items-center">
            <Badge variant={trend === 'Alcista' ? 'success' : trend === 'Bajista' ? 'destructive' : 'secondary'}>
              {trend}
            </Badge>
            <span className="text-sm">Fuerza: {strength}/10</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">Niveles Clave</h4>
            {data.levels && (
              <>
                <div className="text-green-600">Soporte: {data.levels.support?.toFixed(4)}</div>
                <div className="text-red-600">Resistencia: {data.levels.resistance?.toFixed(4)}</div>
              </>
            )}
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">Indicadores</h4>
            <div>RSI: {data.indicators.rsi[data.indicators.rsi.length - 1]?.toFixed(2)}</div>
            <div>MACD: {data.indicators.macd[data.indicators.macd.length - 1]?.histogram.toFixed(4)}</div>
          </div>
        </div>

        <div ref={chartContainerRef} className="mb-4" />

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded">
            <h4 className="font-medium mb-2">Resumen del Análisis</h4>
            <p className="text-sm text-gray-600">{data.summary}</p>
          </div>

          {data.signals.map((signal) => (
            <SignalCard 
              key={`${signal.pair}-${signal.signal}-${signal.confidence}-${signal.stopLoss}`}
              signal={signal}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function calculateIndicators(data: Array<{ value: number }>) {
  if (data.length < 26) throw new Error('Se requieren al menos 26 períodos');
  // ... cálculos
}