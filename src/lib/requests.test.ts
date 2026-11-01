import { describe, expect, it } from 'vitest';
import { requestSchema } from './requests.functions';
const input = { type: 'Booking', name: 'Visitor', email: 'visitor@example.com', phone: '', product: 'Diesel', quantity: '100', date: '2026-11-02', slot: '10:00', message: '' };
describe('Booking validation', () => {
  it('requires a date for bookings', () => { expect(requestSchema.safeParse({ ...input, date: '' }).success).toBe(false); });
  it('requires an hourly slot for bookings', () => { expect(requestSchema.safeParse({ ...input, slot: '10:30' }).success).toBe(false); });
  it('allows enquiries without reserving a date or slot', () => { expect(requestSchema.safeParse({ ...input, type: 'Enquiry', date: '', slot: '' }).success).toBe(true); });
});