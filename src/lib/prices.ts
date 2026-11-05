import uaeDiesel from './uae-diesel.json';

export type Product = {
  id: string;
  name: string;
  unit: string;
  base: number | null;
  grade: string;
  spec: string;
};

export type MarketPrice = {
  id: string;
  price: number | null;
  prev: number | null;
  live: boolean;
  label?: string;
  sourceUrl?: string;
  reference?: {
    amount: number;
    unit: string;
    supplier: string;
    sourceUrl: string;
    checkedOn: string;
    note: string;
  };
};

export type MarketSnapshot = {
  updated: number;
  prices: MarketPrice[];
  source: "yahoo" | "uae";
  stale?: boolean;
};

export const PRODUCTS: Product[] = [
  {
    id: "diesel",
    name: "Diesel",
    unit: "litre",
    base: uaeDiesel.price,
    grade: "EN 590 equivalent",
    spec: "Cetane 48–52 · Sulfur < 50 ppm",
  },
  {
    id: "kerosene",
    name: "Kerosene",
    unit: "litre",
    base: null,
    grade: "Industrial grade",
    spec: "Flash point > 38°C · Low aromatics",
  },
  {
    id: "syngas",
    name: "Syngas",
    unit: "Nm³",
    base: null,
    grade: "H₂ + CO rich",
    spec: "Calorific value ~12 MJ/Nm³",
  },
  {
    id: "lpg",
    name: "LPG",
    unit: "litre",
    base: null,
    grade: "Propane / butane mix",
    spec: "Bulk LPG · For cooking, heating & forklifts",
  },
  {
    id: "oxygen",
    name: "Oxygen",
    unit: "m³",
    base: null,
    grade: "Industrial 99.5%",
    spec: "Purity ≥ 99.5% · Dry",
  },
  {
    id: "nitrogen",
    name: "Nitrogen",
    unit: "m³",
    base: null,
    grade: "High purity 99.9%",
    spec: "Purity ≥ 99.9% · Inert blanketing",
  },
];
