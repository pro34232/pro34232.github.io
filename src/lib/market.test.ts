import { describe, expect, it } from 'vitest';
import { applyPriceSettings } from './market';
import type { MarketSnapshot } from './prices';
const snapshot: MarketSnapshot = { source: 'yahoo', updated: 1, prices: [{ id: 'kerosene', price: 3.9, prev: 3.7, live: true }, { id: 'oxygen', price: 1.6, prev: 1.6, live: false }, { id: 'diesel', price: 5.28, prev: 5.55, live: true }] };
describe('Saved prices', () => {
  it('uses the configured margin instead of the copied default', () => {
    expect(applyPriceSettings(snapshot, [{ product: 'kerosene', margin: 1.05, list_price: null }]).prices[0]?.price).toBe(4.2);
  });
  it('uses the fixed owner price when supplied', () => {
    expect(applyPriceSettings(snapshot, [{ product: 'oxygen', margin: 0, list_price: 2.5 }]).prices[1]?.price).toBe(2.5);
  });
  it('uses November UAE diesel at AED 4.75 without adding an owner margin or fixed override', () => {
    const diesel = applyPriceSettings(snapshot, [{ product: 'diesel', margin: 2, list_price: 6 }], Date.parse('2026-11-04')).prices[2];
    expect(diesel?.price).toBe(4.75);
    expect(diesel?.prev).toBe(4.80);
  });
  it('marks the November rate as last published once December begins', () => {
    expect(applyPriceSettings(snapshot, [], Date.parse('2026-12-01')).prices[2]?.label).toContain('Last published UAE price');
  });
});