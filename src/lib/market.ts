import type { MarketSnapshot } from './prices';
import uaeDiesel from './uae-diesel.json';

export type PriceSetting = { product: string; margin: number; list_price: number | null };
export function applyPriceSettings(snapshot: MarketSnapshot, settings: PriceSetting[], now = Date.now()): MarketSnapshot {
  const oldMargins: Record<string, number> = { diesel: 0.9, kerosene: 0.75, lpg: 0.45, syngas: 0.5 };
  const round = (value: number) => Math.round(value * 100) / 100;
  return { ...snapshot, prices: snapshot.prices.map(price => {
    if (price.id === 'diesel') return {
      ...price, price: uaeDiesel.price, prev: uaeDiesel.previousPrice, live: false,
      label: `${now >= Date.parse(uaeDiesel.validUntil) ? 'Last published UAE price' : 'UAE retail price'} · ${uaeDiesel.month}`,
      sourceUrl: uaeDiesel.sourceUrl,
    };
    const setting = settings.find(row => row.product === price.id);
    if (!setting) return price;
    if (setting.list_price !== null) return { ...price, price: setting.list_price, prev: setting.list_price, live: false };
    const margin = oldMargins[price.id];
    if (margin === undefined) return price;
    return { ...price, price: round(Math.max(0, price.price - margin + setting.margin)), prev: round(Math.max(0, price.prev - margin + setting.margin)) };
  }) };
}