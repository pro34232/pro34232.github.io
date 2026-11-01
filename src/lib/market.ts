import type { MarketSnapshot } from './prices';

export type PriceSetting = { product: string; margin: number; list_price: number | null };
export function applyPriceSettings(snapshot: MarketSnapshot, settings: PriceSetting[]): MarketSnapshot {
  const oldMargins: Record<string, number> = { diesel: 0.9, kerosene: 0.75, lpg: 0.45, syngas: 0.5 };
  const round = (value: number) => Math.round(value * 100) / 100;
  return { ...snapshot, prices: snapshot.prices.map(price => {
    const setting = settings.find(row => row.product === price.id);
    if (!setting) return price;
    if (setting.list_price !== null) return { ...price, price: setting.list_price, prev: setting.list_price, live: false };
    const margin = oldMargins[price.id];
    if (margin === undefined) return price;
    return { ...price, price: round(Math.max(0, price.price - margin + setting.margin)), prev: round(Math.max(0, price.prev - margin + setting.margin)) };
  }) };
}