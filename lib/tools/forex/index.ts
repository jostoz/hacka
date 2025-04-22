import type { Signal } from "@/lib/types/types";
import yahooFinance from "yahoo-finance2";

export type ForexPair = {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  timestamp: number;
};

export async function getForexPrice(symbol: string): Promise<ForexPair | null> {
  try {
    const quote = await yahooFinance.quote(symbol);
    if (!quote || !quote.bid || !quote.ask) return null;

    return {
      symbol,
      bid: quote.bid,
      ask: quote.ask,
      spread: Number((quote.ask - quote.bid).toFixed(5)),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Error fetching forex price:", error);
    return null;
  }
}

export async function getForexPrices(symbols: string[]): Promise<ForexPair[]> {
  const prices = await Promise.all(
    symbols.map((symbol) => getForexPrice(symbol)),
  );
  return prices.filter((price): price is ForexPair => price !== null);
}

export async function validateSignal(signal: Signal): Promise<boolean> {
  try {
    const price = await getForexPrice(signal.symbol);
    if (!price) return false;

    // Validate that the entry price is within a reasonable range of current price
    const currentPrice = (price.ask + price.bid) / 2;
    const entryPrice = signal.entryPrice ?? signal.price;
    const priceDiff = Math.abs(currentPrice - entryPrice);
    const maxAllowedDiff = currentPrice * 0.02; // 2% tolerance

    return priceDiff <= maxAllowedDiff;
  } catch (error) {
    console.error("Error validating signal:", error);
    return false;
  }
} 