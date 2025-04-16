// components/SignalCard.tsx
import { Button } from '@/components/ui/button';
import { type Signal } from '@/lib/types/types'; // Importar el tipo consolidado

interface SignalCardProps {
    /**
     * Datos de la señal, incluyendo par, acción, confianza, etc.
     */
    signal: Signal;
    /**
     * Callback al hacer clic en "Ejecutar orden".
     */
    onExecute?: () => void;
  }
  
  export function SignalCard({ signal, onExecute }: SignalCardProps) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md space-y-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{signal.pair}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            signal.signal === 'buy' ? 'bg-green-100 text-green-800' :
            signal.signal === 'sell' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {signal.signal.toUpperCase()}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Confianza:</span>
            <span>{Math.round(signal.confidence * 100)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Tamaño de posición:</span>
            <span>{signal.positionSize.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Stop Loss:</span>
            <span>{signal.stopLoss.toFixed(4)}</span>
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Justificación:</h4>
          <p className="text-sm text-gray-600">{signal.justification}</p>
        </div>
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm">
            Copiar señal
          </Button>
          <Button size="sm">Ejecutar orden</Button>
        </div>
      </div>
    );
  }