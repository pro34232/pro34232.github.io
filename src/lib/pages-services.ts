import type { MarketSnapshot } from './prices';
import { applyPriceSettings } from './market';
export type BookingSettings = { days: number[]; slots: string[]; capacity: number; blocked_dates: string[] };
const base = import.meta.env['VITE_ECOFUEL_BACKEND_URL'] || 'https://eco-fuel-circular-energy.lovable.app';
async function call<T>(operation: string, data?: unknown): Promise<T> {
  const response = await fetch(`${base.replace(/\/$/, '')}/api/public/services`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ operation, data }),
  });
  if (!response.ok) throw new Error('Eco Fuel service is unavailable');
  return response.json() as Promise<T>;
}
export const getLivePrices = async () => applyPriceSettings(await call<MarketSnapshot>('prices'), []);
export const getBookingSettings = () => call<BookingSettings>('settings');
export const getBookedSlots = (input: { data: { date: string } }) => call<string[]>('slots', input.data);
export const submitRequest = (input: { data: unknown }) => call<{ ok: true; reference: string } | { ok: false; reason: string }>('booking', input.data);
export const recommendFuel = (input: { data: { need: string } }) => call<{ ok: true; text: string } | { ok: false; error: string }>('advisor', input.data);