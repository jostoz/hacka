export function ForexToolResult({ result }: { result: { pair: string; pipValue: number } }) {
  return (
    <div className="p-4 bg-muted rounded-lg border-l-4 border-blue-500">
      <p className="font-medium">Par: <span className="text-blue-600">{result.pair}</span></p>
      <p className="font-medium">Valor del pip: <span className="text-green-600">${result.pipValue.toFixed(2)} USD</span></p>
    </div>
  );
}
