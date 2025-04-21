// components/SignalCard.tsx
import { Button } from '@/components/ui/button';
import type { Signal } from '@/lib/types/types';
import type { ButtonProps } from '@/components/ui/button';

interface SignalCardProps {
  signal: Signal;
  onCopy?: () => void;
  onExecute?: () => void;
}

export function SignalCard({ signal, onCopy, onExecute }: SignalCardProps) {
  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{signal.pair}</h3>
        <span className={`px-2 py-1 rounded ${
          signal.signal === 'buy' ? 'bg-green-100 text-green-800' :
          signal.signal === 'sell' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {signal.signal.toUpperCase()}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Confidence</p>
          <p>{(signal.confidence * 100).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-gray-500">Position Size</p>
          <p>{signal.positionSize} units</p>
        </div>
        <div>
          <p className="text-gray-500">Stop Loss</p>
          <p>{signal.stopLoss}</p>
        </div>
        {signal.takeProfit && (
          <div>
            <p className="text-gray-500">Take Profit</p>
            <p>{signal.takeProfit}</p>
          </div>
        )}
      </div>

      <div>
        <p className="text-gray-500">Justification</p>
        <p className="text-sm">{signal.justification}</p>
      </div>

      <div className="flex gap-2 mt-4">
        {onCopy && (
          <Button 
            onClick={onCopy} 
            variant="outline" 
            size="sm"
            type="button"
          >
            Copy Signal
          </Button>
        )}
        {onExecute && (
          <Button 
            onClick={onExecute} 
            size="sm"
            type="button"
          >
            Execute Order
          </Button>
        )}
      </div>
    </div>
  );
}