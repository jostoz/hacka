// components/technical-analysis-block.tsx
'use client';

import type { TechnicalAnalysisData, FxData } from '@/lib/types/types';
import { SignalCard } from '@/components/SignalCard';
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
import type { MarketDataParams, MarketDataResponse } from '@/lib/types/market-data';

interface TechnicalAnalysisBlockProps {
  symbol?: string;
  source?: MarketDataParams['source'];
  data?: TechnicalAnalysisData;
}

// Type guard para distinguir entre TechnicalAnalysisData y MarketDataResponse
function isTechnicalAnalysisData(data: TechnicalAnalysisData | MarketDataResponse): data is TechnicalAnalysisData {
  return 'historicalData' in data && 'indicators' in data;
}

export function TechnicalAnalysisBlock({ 
  symbol, 
  source = 'yahoo',
  data: providedData
}: TechnicalAnalysisBlockProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Usar directamente los datos proporcionados
  const data = providedData;
  
  useEffect(() => {
    if (!chartContainerRef.current || !data) {
      console.warn('No chart container or data available');
      return;
    }

    const container = chartContainerRef.current;

    try {
      // Obtener los datos OHLCV
      const ohlcvData: FxData[] = data.historicalData;

      if (!Array.isArray(ohlcvData) || ohlcvData.length === 0) {
        console.error('Invalid or empty OHLCV data');
        return;
      }

      const chart = createChart(container, {
        width: container.clientWidth,
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
            bottom: 0.3,
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

      // Filter out any invalid OHLCV data points
      const validOHLCVData = ohlcvData.filter(d => (
        d.timestamp != null &&
        d.open != null && !Number.isNaN(d.open) &&
        d.high != null && !Number.isNaN(d.high) &&
        d.low != null && !Number.isNaN(d.low) &&
        d.close != null && !Number.isNaN(d.close)
      ));

      if (validOHLCVData.length === 0) {
        console.error('No valid OHLCV data points found');
        return;
      }

      candlestickSeries.setData(
        validOHLCVData.map(d => ({
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

      const avgVolume = ohlcvData.reduce((sum, d) => sum + d.volume, 0) / ohlcvData.length;

      chart.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
        visible: true,
      });

      volumeSeries.setData(
        ohlcvData.map(d => ({
          time: (d.timestamp / 1000) as Time,
          value: d.volume,
          color: d.volume > avgVolume * 1.5 ? '#ef5350' : '#26a69a'
        }))
      );

      // Solo mostrar indicadores si tenemos TechnicalAnalysisData
      if (isTechnicalAnalysisData(data)) {
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
              top: 0.1,
              bottom: 0.8,
            },
            visible: true,
          });

          const rsiData = data.indicators.rsi.map((value, index) => ({
            time: (ohlcvData[index].timestamp / 1000) as Time,
            value,
          }));

          rsiSeries.setData(rsiData);
          
          const timeRange = ohlcvData.map(d => d.timestamp / 1000 as Time);
          overboughtLine.setData(timeRange.map(time => ({ time, value: 70 })));
          oversoldLine.setData(timeRange.map(time => ({ time, value: 30 })));
        }

        if (data.indicators.macd.length > 0) {
          const macdSeries = chart.addSeries(HistogramSeries, {
            priceScaleId: 'macd',
          });

          chart.priceScale('macd').applyOptions({
            scaleMargins: {
              top: 0.7,
              bottom: 0.1,
            },
            visible: true,
          });

          macdSeries.setData(
            data.indicators.macd.map((value, index) => ({
              time: (ohlcvData[index].timestamp / 1000) as Time,
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
            { time: ohlcvData[0].timestamp / 1000 as Time, value: data.levels.support },
            { time: ohlcvData[ohlcvData.length - 1].timestamp / 1000 as Time, value: data.levels.support }
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
            { time: ohlcvData[0].timestamp / 1000 as Time, value: data.levels.resistance },
            { time: ohlcvData[ohlcvData.length - 1].timestamp / 1000 as Time, value: data.levels.resistance }
          ]);
        }
      }

      const visibleLogicalRange = chart.timeScale().getVisibleLogicalRange();
      if (visibleLogicalRange !== null) {
        chart.timeScale().setVisibleLogicalRange({
          from: Math.max(0, ohlcvData.length - 30),
          to: ohlcvData.length - 1,
        });
      }

      const handleResize = () => {
        if (container) {
          chart.applyOptions({
            width: container.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

    } catch (error) {
      console.error('Error creating chart:', error);
    }

    // Cleanup function
    return () => {
      try {
        if (container) {
          container.innerHTML = '';
        }
      } catch (error) {
        console.error('Error cleaning up chart:', error);
      }
    };
  }, [data, symbol]); // Dependencias del efecto

  if (!data) {
    return <div>No hay datos disponibles para mostrar</div>;
  }

  return (
    <div className="space-y-4">
      <div ref={chartContainerRef} className="w-full h-[600px] bg-white" />
      {data.signals && data.signals.length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold mb-2">Señales</h4>
          {data.signals.map((signal) => (
            <SignalCard 
              key={`${signal.pair}-${signal.signal}-${signal.confidence}`} 
              signal={signal} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function calculateIndicators(data: Array<{ value: number }>) {
  if (data.length < 26) throw new Error('Se requieren al menos 26 períodos');
  // ... cálculos
}