import { createServerFn } from "@tanstack/react-start";
import { PRODUCTS, type MarketPrice, type MarketSnapshot } from "./prices";

const AED_PER_USD = 3.6725;
const LITRES_PER_GALLON = 3.78541;
const LITRES_PER_BARREL = 158.987;
const MMBTU_PER_NM3 = 0.01137;
const SNAPSHOT_KEY = "ecofuel-market-snapshot";

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
    !Number.isFinite(meta.regularMarketPrice) ||
    !Number.isFinite(meta.chartPreviousClose) ||
    !Number.isFinite(meta.regularMarketTime)
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
      price: round(hoPerLitre(ho.price) + 0.9),
      prev: round(hoPerLitre(ho.previousClose) + 0.9),
      live: true,
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
  return { prices, updated: Math.max(ho.time, ng.time, brent.time), source: "yahoo" };
}

function isSnapshot(value: unknown): value is MarketSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<MarketSnapshot>;
  return (
    Number.isFinite(snapshot.updated) &&
    snapshot.source === "yahoo" &&
    Array.isArray(snapshot.prices) &&
    PRODUCTS.every((product) =>
      snapshot.prices?.some(
        (price) =>
          price.id === product.id && Number.isFinite(price.price) && Number.isFinite(price.prev),
      ),
    )
  );
}

function readCachedSnapshot(): MarketSnapshot | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const cached: unknown = JSON.parse(localStorage.getItem(SNAPSHOT_KEY) ?? "null");
    return isSnapshot(cached) ? { ...cached, stale: true } : null;
  } catch {
    return null;
  }
}

export const getLivePrices = createServerFn({ method: "GET" }).handler(
  async (): Promise<MarketSnapshot> => {
    if (typeof window !== "undefined") {
      try {
        const response = await fetch(`/market.json?t=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) throw new Error(`market snapshot returned ${response.status}`);
        const snapshot: unknown = await response.json();
        if (!isSnapshot(snapshot)) throw new Error("market snapshot returned invalid data");
        localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
        return snapshot;
      } catch (error) {
        const cached = readCachedSnapshot();
        if (cached) return cached;
        throw error;
      }
    }

    const [ho, ng, brent] = await Promise.all([
      fetchQuote("HO=F"),
      fetchQuote("NG=F"),
      fetchQuote("BZ=F"),
    ]);
    return createSnapshot(ho, ng, brent);
  },
);
