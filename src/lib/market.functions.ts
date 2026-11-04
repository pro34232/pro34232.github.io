import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { PRODUCTS, type MarketPrice, type MarketSnapshot } from "./prices";
import { applyPriceSettings } from './market';
import { publicClient } from './public-client.server';
import uaeDiesel from './uae-diesel.json';

const AED_PER_USD = 3.6725;
const LITRES_PER_GALLON = 3.78541;
const LITRES_PER_BARREL = 158.987;
const MMBTU_PER_NM3 = 0.01137;

type Quote = {
  price: number;
  previousClose: number;
  time: number;
};

type YahooResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        regularMarketTime?: number;
      };
    }>;
  };
};

async function fetchQuote(symbol: string): Promise<Quote> {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`,
    { headers: { "User-Agent": "Eco-Fuel-Market-Worker/1.0" } },
  );
  if (!response.ok) throw new Error(`quote ${symbol} returned ${response.status}`);

  const data = (await response.json()) as YahooResponse;
  const meta = data.chart?.result?.[0]?.meta;
  if (
    !meta ||
    typeof meta.regularMarketPrice !== 'number' || !Number.isFinite(meta.regularMarketPrice) ||
    typeof meta.chartPreviousClose !== 'number' || !Number.isFinite(meta.chartPreviousClose) ||
    typeof meta.regularMarketTime !== 'number' || !Number.isFinite(meta.regularMarketTime)
  ) {
    throw new Error(`quote ${symbol} returned invalid data`);
  }

  return {
    price: meta.regularMarketPrice,
    previousClose: meta.chartPreviousClose,
    time: meta.regularMarketTime * 1000,
  };
}

const round = (value: number) => Math.round(value * 100) / 100;

function createSnapshot(ho: Quote, ng: Quote, brent: Quote): MarketSnapshot {
  const hoPerLitre = (value: number) => (value * AED_PER_USD) / LITRES_PER_GALLON;
  const ngPerNm3 = (value: number) => value * AED_PER_USD * MMBTU_PER_NM3;
  const brentPerLitre = (value: number) => (value * AED_PER_USD) / LITRES_PER_BARREL;
  const prices: MarketPrice[] = [
    {
      id: "diesel",
      price: uaeDiesel.price,
      prev: uaeDiesel.previousPrice,
      live: false,
    },
    {
      id: "kerosene",
      price: round(hoPerLitre(ho.price) * 0.97 + 0.75),
      prev: round(hoPerLitre(ho.previousClose) * 0.97 + 0.75),
      live: true,
    },
    {
      id: "lpg",
      price: round(brentPerLitre(brent.price) * 0.8 + 0.45),
      prev: round(brentPerLitre(brent.previousClose) * 0.8 + 0.45),
      live: true,
    },
    {
      id: "syngas",
      price: round(ngPerNm3(ng.price) + 0.5),
      prev: round(ngPerNm3(ng.previousClose) + 0.5),
      live: true,
    },
    { id: "oxygen", price: 1.6, prev: 1.6, live: false },
    { id: "nitrogen", price: 1.2, prev: 1.2, live: false },
  ];

  return {
    prices,
    updated: Math.max(ho.time, ng.time, brent.time),
    source: "yahoo",
  };
}

function isSnapshot(value: unknown): value is MarketSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<MarketSnapshot>;
  const prices = snapshot.prices;
  return (
    Number.isFinite(snapshot.updated) &&
    snapshot.source === "yahoo" &&
    Array.isArray(prices) &&
    PRODUCTS.every((product) =>
      prices.some(
        (price) =>
          price.id === product.id && Number.isFinite(price.price) && Number.isFinite(price.prev),
      ),
    )
  );
}

function serviceClient() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function persistSnapshot(snapshot: MarketSnapshot): Promise<void> {
  const sb = serviceClient();
  if (!sb) return;
  try {
    await sb.from('market_cache').upsert(
      { id: 1, snapshot, updated_at: new Date().toISOString() },
      { onConflict: 'id' },
    );
  } catch {
    // Best-effort — the cache is a fallback, not a primary path.
  }
}

async function readDbCache(): Promise<MarketSnapshot | null> {
  const sb = serviceClient();
  if (!sb) return null;
  try {
    const { data } = await sb.from('market_cache').select('snapshot').eq('id', 1).maybeSingle();
    const cached = data?.snapshot as unknown;
    return isSnapshot(cached) ? { ...cached, stale: true } : null;
  } catch {
    return null;
  }
}

export const getLivePrices = createServerFn({ method: "GET" }).handler(
  async (): Promise<MarketSnapshot> => {
    const { data: settings, error } = await publicClient().from('price_settings').select('product, margin, list_price');
    if (error) throw new Error('Could not load product prices');
    let snapshot: MarketSnapshot;
    let live = false;
    try {
      const [ho, ng, brent] = await Promise.all([fetchQuote('HO=F'), fetchQuote('NG=F'), fetchQuote('BZ=F')]);
      snapshot = createSnapshot(ho, ng, brent);
      live = true;
    } catch {
      const dbCache = await readDbCache();
      if (dbCache) {
        snapshot = dbCache;
      } else {
        const { default: saved } = await import('../../public/market.json');
        if (!isSnapshot(saved)) throw new Error('Market data unavailable');
        snapshot = { ...saved, stale: true };
      }
    }
    if (live) void persistSnapshot(snapshot);
    return applyPriceSettings(snapshot, settings ?? []);
  },
);
