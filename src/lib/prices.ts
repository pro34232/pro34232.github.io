export type Product = {
  id: string;
  name: string;
  unit: string;
  base: number;
  grade: string;
  spec: string;
};

export type MarketPrice = {
  id: string;
  price: number;
  prev: number;
  live: boolean;
};

export type MarketSnapshot = {
  updated: number;
  prices: MarketPrice[];
  source: "yahoo";
  stale?: boolean;
};

export const PRODUCTS: Product[] = [
  {
    id: "diesel",
    name: "Diesel",
    unit: "litre",
    base: 3.05,
    grade: "EN 590 equivalent",
    spec: "Cetane 48–52 · Sulfur < 50 ppm",
  },
  {
    id: "kerosene",
    name: "Kerosene",
    unit: "litre",
    base: 2.85,
    grade: "Industrial grade",
    spec: "Flash point > 38°C · Low aromatics",
  },
  {
    id: "syngas",
    name: "Syngas",
    unit: "Nm³",
    base: 0.95,
    grade: "H₂ + CO rich",
    spec: "Calorific value ~12 MJ/Nm³",
  },
  {
    id: "lpg",
    name: "LPG",
    unit: "litre",
    base: 2.4,
    grade: "Propane / butane mix",
    spec: "Bulk LPG · For cooking, heating & forklifts",
  },
  {
    id: "oxygen",
    name: "Oxygen",
    unit: "m³",
    base: 1.6,
    grade: "Industrial 99.5%",
    spec: "Purity ≥ 99.5% · Dry",
  },
  {
    id: "nitrogen",
    name: "Nitrogen",
    unit: "m³",
    base: 1.2,
    grade: "High purity 99.9%",
    spec: "Purity ≥ 99.9% · Inert blanketing",
  },
];
