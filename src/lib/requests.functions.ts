import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requestBookingSlot } from "./booking";
import { publicClient } from './public-client.server';


function client() {
  return publicClient();
}

export const getBookedSlots = createServerFn({ method: "GET" })
  .inputValidator((d: { date: string }) => z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).parse(d))
  .handler(async ({ data }) => {
    const sb = await client();
    const { data: rows, error } = await sb.rpc("get_booked_slots", { _date: data.date });
    if (error) throw new Error("Could not load slots");
    return (rows ?? []) as string[];
  });

export const requestSchema = z.object({
  type: z.enum(["Enquiry", "Booking"]),
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

export const submitRequest = createServerFn({ method: "POST" })
  .inputValidator((d: z.input<typeof requestSchema>) => requestSchema.parse(d))
  .handler(async ({ data }) => {
    if (data.type === "Booking" && !data.slot) return { ok: false as const, reason: "slot" };
    const sb = await client();
    const { data: ref, error } = await sb.rpc("submit_request", {
      _kind: data.type, _name: data.name, _email: data.email, _phone: data.phone, _product: data.product,
      _quantity: data.quantity, _visit_date: data.type === "Booking" && data.date ? data.date : null,
      _visit_slot: requestBookingSlot(data.type, data.slot), _message: data.message,
    } as never);
    if (error) return { ok: false as const, reason: error.message.includes("slot") ? "slot" : "error" };
    return { ok: true as const, reference: ref as unknown as string };
  });

export type BookingSettings = { days: number[]; slots: string[]; capacity: number; blocked_dates: string[] };

export const getBookingSettings = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await client();
  const { data, error } = await sb.from("booking_settings").select("days, slots, capacity, blocked_dates").eq("id", 1).limit(1);
  const settings = data?.[0];
  if (error || !settings) throw new Error("Could not load booking settings");
  return settings as BookingSettings;
});
