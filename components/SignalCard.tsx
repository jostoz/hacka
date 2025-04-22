// components/SignalCard.tsx
import { Card } from '@/components/ui/card';
import type { Signal } from '@/lib/types/types';

interface SignalCardProps {
  signal: Signal;
  onCopy?: () => void;
  onExecute?: () => void;
}

export function SignalCard({ signal, onCopy, onExecute }: SignalCardProps) {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{signal.symbol}</h3>
          <p className={`text-sm font-medium ${signal.type === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
            {signal.type}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Confidence</p>
          <p className="font-medium">{(signal.confidence * 100).toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Entry Price</p>
          <p className="font-medium">{signal.price.toFixed(5)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Stop Loss</p>
          <p className="font-medium">{signal.stopLoss.toFixed(5)}</p>
        </div>
        {signal.takeProfit && (
          <div>
            <p className="text-sm text-gray-600">Take Profit</p>
            <p className="font-medium">{signal.takeProfit.toFixed(5)}</p>
          </div>
        )}
      </div>

      {signal.reason && (
        <div>
          <p className="text-sm text-gray-600">Reason</p>
          <p className="text-sm">{signal.reason}</p>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        {onCopy && (
          <button
            onClick={onCopy}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Copy
          </button>
        )}
        {onExecute && (
          <button
            onClick={onExecute}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Execute
          </button>
        )}
      </div>
    </Card>
  );
}