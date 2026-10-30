import { createServerFn } from "@tanstack/react-start";
import { PRODUCTS, marketPrice } from "./prices";

// USD is pegged to AED at 3.6725.
const AED = 3.6725;
const L_PER_GAL = 3.78541;
const L_PER_BBL = 158.987; // barrels to litres
const MMBTU_PER_NM3_SYNGAS = 0.01137; // ~12 MJ/Nm³

type Quote = { price: number; prev: number; time: number };

async function quote(symbol: string): Promise<Quote> {
  const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!r.ok) throw new Error(`quote ${symbol} ${r.status}`);
  const j = (await r.json()) as { chart: { result: { meta: { regularMarketPrice: number; chartPreviousClose: number; regularMarketTime: number } }[] } };
  const m = j.chart.result[0]?.meta;
  if (!m) throw new Error(`no quote ${symbol}`);
  return { price: m.regularMarketPrice, prev: m.chartPreviousClose, time: m.regularMarketTime * 1000 };
}

export type LivePrice = { id: string; price: number; prev: number; live: boolean };

export const getLivePrices = createServerFn({ method: "GET" }).handler(async () => {
  if (typeof window !== "undefined") {
    try {
      const response = await fetch(`/market.json?t=${Math.floor(Date.now() / 3600000)}`);
      if (!response.ok) throw new Error(`market snapshot returned ${response.status}`);
      return (await response.json()) as { prices: LivePrice[]; updated: number };
    } catch {
      const updated = Date.now();
      return {
        prices: PRODUCTS.map((product) => ({
          id: product.id,
          price: marketPrice(product.base, product.id, updated),
          prev: marketPrice(product.base, product.id, updated - 86400000),
          live: false,
        })),
        updated,
      };
    }
  }

  const [ho, ng, brent] = await Promise.all([quote("HO=F"), quote("NG=F"), quote("BZ=F")]);
  const hoL = (v: number) => (v * AED) / L_PER_GAL; // ULSD futures, AED per litre
  const ngM = (v: number) => v * AED * MMBTU_PER_NM3_SYNGAS;
  const brentL = (v: number) => (v * AED) / L_PER_BBL; // Brent crude, AED per litre
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const prices: LivePrice[] = [
    { id: "diesel", price: r2(hoL(ho.price) + 0.9), prev: r2(hoL(ho.prev) + 0.9), live: true },
    { id: "kerosene", price: r2(hoL(ho.price) * 0.97 + 0.75), prev: r2(hoL(ho.prev) * 0.97 + 0.75), live: true },
    { id: "lpg", price: r2(brentL(brent.price) * 0.8 + 0.45), prev: r2(brentL(brent.prev) * 0.8 + 0.45), live: true },
    { id: "syngas", price: r2(ngM(ng.price) + 0.5), prev: r2(ngM(ng.prev) + 0.5), live: true },
    { id: "oxygen", price: 1.6, prev: 1.6, live: false },
    { id: "nitrogen", price: 1.2, prev: 1.2, live: false },
  ];
  return { prices, updated: Math.max(ho.time, ng.time) };
});
