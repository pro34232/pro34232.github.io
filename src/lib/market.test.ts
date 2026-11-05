import { describe, expect, it } from 'vitest';
import { getUaePrices, applyPriceSettings, priceTotal, advisorCatalog } from './market';
describe('UAE pricing', () => {
 it('uses November diesel at AED 4.75 even when an old hosted response says 5.29', () => {
 const snapshot = { source: 'yahoo' as const, updated: 1, prices: [{ id: 'diesel', price: 5.29, prev: 5.55, live: true }] };
 expect(applyPriceSettings(snapshot, [{ product: 'diesel', margin: 2, list_price: 6 }]).prices[0]?.price).toBe(4.75);
 });
 for (const id of ['kerosene', 'lpg', 'syngas', 'oxygen', 'nitrogen']) it(`${id} has no invented UAE price or total`, () => {
 const row = getUaePrices().prices.find(p => p.id === id);
 expect(row?.price).toBeNull(); expect(priceTotal(row?.price ?? null, 1000)).toBeNull();
 });
 it('calculates AED 4750 for 1000 litres of diesel', () => { expect(priceTotal(4.75, 1000)).toBe(4750); });
 it('marks expired rates as last published', () => { expect(getUaePrices(Date.parse('2026-12-01')).stale).toBe(true); });
 it('gives the advisor quote-only pricing for all non-diesel products', () => {
 expect(advisorCatalog().split('\n').filter(line => line.includes('Price on request'))).toHaveLength(5);
 });
});
