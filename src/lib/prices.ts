export type Product = {
  id: string;
  name: string;
  unit: string;
  base: number;
  grade: string;
  spec: string;
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

// Deterministic daily fallback: same price for every visitor on a given day.
export function marketPrice(base: number, seed: string, t = Date.now()) {
  const day = Math.floor(t / 86400000);
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) % 1000;
  const wave = Math.sin(day / 90 + h) * 0.04 + Math.sin(day / 7 + h * 2) * 0.012;
  return Math.round(base * (1 + wave) * 100) / 100;
}
