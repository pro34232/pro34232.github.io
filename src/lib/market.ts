import { PRODUCTS, type MarketSnapshot } from './prices';
import uaeDiesel from './uae-diesel.json';
import uaeListings from './uae-listings.json';
export type PriceSetting = { product: string; margin: number; list_price: number | null };
export function applyPriceSettings(_snapshot: MarketSnapshot, _settings: PriceSetting[], now = Date.now()): MarketSnapshot { return getUaePrices(now); }
export function getUaePrices(now = Date.now()): MarketSnapshot {
  const expired = now >= Date.parse(uaeDiesel.validUntil);
  return { source: 'uae', updated: Date.parse(uaeDiesel.validFrom), stale: expired,
    prices: PRODUCTS.map(product => product.id === 'diesel' ? {
      id: product.id, price: uaeDiesel.price, prev: uaeDiesel.previousPrice, live: false,
      label: `${expired ? 'Last published UAE price' : 'UAE retail price'} · ${uaeDiesel.month}`, sourceUrl: uaeDiesel.sourceUrl,
    } : { id: product.id, price: null, prev: null, live: false, label: 'Bulk price on request',
      ...(() => {
        const reference = uaeListings.find(listing => listing.id === product.id);
        if (reference) return { reference, sourceUrl: reference.sourceUrl };
        return product.id === 'syngas' ? { sourceUrl: 'https://vertexprimepetro.com/product-273-synthetic-gas.html' } : {};
      })(),
    }) };
}
export function priceTotal(price: number | null, quantity: number): number | null { return price === null ? null : price * quantity; }
export function advisorCatalog(): string {
  const snapshot = getUaePrices();
  return PRODUCTS.map(product => {
    const rate = snapshot.prices.find(row => row.id === product.id);
    const pricing = rate?.price == null ? 'Price on request — UAE supplier quote; never estimate a price or total' : `AED ${rate.price.toFixed(2)} per ${product.unit}; ${rate.label}; UAE pump reference, not an Eco Fuel selling quote`;
    const reference = rate?.reference;
    const webListing = reference ? `; third-party web listing: AED ${reference.amount.toFixed(2)}, ${reference.unit}, ${reference.supplier}, checked ${reference.checkedOn}; ${reference.note} Never use this listing as Eco Fuel's selling price or to calculate a bulk total.` : '';
    return `- ${product.name}: ${pricing}${webListing}; grade ${product.grade}; ${product.spec}`;
  }).join('\n');
}
