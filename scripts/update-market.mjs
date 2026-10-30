import { mkdir, writeFile } from "node:fs/promises";

const AED = 3.6725;
const L_PER_GAL = 3.78541;
const L_PER_BBL = 158.987;
const MMBTU_PER_NM3 = 0.01137;
const quotes = { ho: "HO=F", ng: "NG=F", brent: "BZ=F" };

async function quote(symbol) {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`,
    { headers: { "User-Agent": "Eco-Fuel-GitHub-Action/1.0" } },
  );
  if (!response.ok) throw new Error(`quote ${symbol} returned ${response.status}`);
  const json = await response.json();
  const meta = json.chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice || !meta.chartPreviousClose) {
    throw new Error(`quote ${symbol} returned no usable data`);
  }
  return {
    price: meta.regularMarketPrice,
    prev: meta.chartPreviousClose,
    time: meta.regularMarketTime * 1000,
  };
}

const [ho, ng, brent] = await Promise.all(Object.values(quotes).map(quote));
const round = (value) => Math.round(value * 100) / 100;
const hoL = (value) => (value * AED) / L_PER_GAL;
const ngM = (value) => value * AED * MMBTU_PER_NM3;
const brentL = (value) => (value * AED) / L_PER_BBL;

const market = {
  updated: Math.max(ho.time, ng.time, brent.time),
  prices: [
    {
      id: "diesel",
      price: round(hoL(ho.price) + 0.9),
      prev: round(hoL(ho.prev) + 0.9),
      live: true,
    },
    {
      id: "kerosene",
      price: round(hoL(ho.price) * 0.97 + 0.75),
      prev: round(hoL(ho.prev) * 0.97 + 0.75),
      live: true,
    },
    {
      id: "lpg",
      price: round(brentL(brent.price) * 0.8 + 0.45),
      prev: round(brentL(brent.prev) * 0.8 + 0.45),
      live: true,
    },
    {
      id: "syngas",
      price: round(ngM(ng.price) + 0.5),
      prev: round(ngM(ng.prev) + 0.5),
      live: true,
    },
    { id: "oxygen", price: 1.6, prev: 1.6, live: false },
    { id: "nitrogen", price: 1.2, prev: 1.2, live: false },
  ],
};

await mkdir("public", { recursive: true });
await writeFile("public/market.json", `${JSON.stringify(market, null, 2)}\n`);
