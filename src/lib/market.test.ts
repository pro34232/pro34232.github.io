import { describe, expect, it } from 'vitest';
import { applyPriceSettings } from './market';
import type { MarketSnapshot } from './prices';
const snapshot: MarketSnapshot = { source: 'yahoo', updated: 1, prices: [{ id: 'diesel', price: 3.9, prev: 3.7, live: true }, { id: 'oxygen', price: 1.6, prev: 1.6, live: false }] };
describe('Saved prices', () => {
  it('uses the configured margin instead of the copied default', () => {
    expect(applyPriceSettings(snapshot, [{ product: 'diesel', margin: 1.2, list_price: null }]).prices[0]?.price).toBe(4.2);
  });
  it('uses the fixed owner price when supplied', () => {
    expect(applyPriceSettings(snapshot, [{ product: 'oxygen', margin: 0, list_price: 2.5 }]).prices[1]?.price).toBe(2.5);
  });
});