export function FxRatesToolResult({ result }: { result: { pair: string; pipValue: number } }) {
  return (
    <div className="p-4 bg-muted rounded-lg">
      <p>Par: {result.pair}</p>
      <p>Valor del pip: ${result.pipValue.toFixed(2)}</p>
    </div>
  );
}
