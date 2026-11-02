import { z } from 'zod';

export const requestSchema = z.object({
  type: z.enum(['Enquiry', 'Booking']),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30),
  product: z.string().max(50),
  quantity: z.string().trim().max(30),
  date: z.string().max(20),
  slot: z.string().max(10),
  message: z.string().trim().max(1000),
}).superRefine((data, ctx) => {
  if (data.type === 'Booking' && (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || !/^\d{2}:00$/.test(data.slot))) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please choose a booking date and hourly slot' });
  }
});