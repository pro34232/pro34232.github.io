import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";


function client() {
  return import("@supabase/supabase-js").then(({ createClient }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    return createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
  });
}

export const getBookedSlots = createServerFn({ method: "GET" })
  .inputValidator((d: { date: string }) => z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).parse(d))
  .handler(async ({ data }) => {
    const sb = await client();
    const { data: rows, error } = await sb.rpc("get_booked_slots", { _date: data.date });
    if (error) throw new Error("Could not load slots");
    return (rows ?? []) as string[];
  });

const schema = z.object({
  type: z.enum(["Enquiry", "Booking"]),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30),
  product: z.string().max(50),
  quantity: z.string().trim().max(30),
  date: z.string().max(20),
  slot: z.string().max(10),
  message: z.string().trim().max(1000),
});

export const submitRequest = createServerFn({ method: "POST" })
  .inputValidator((d: z.input<typeof schema>) => schema.parse(d))
  .handler(async ({ data }) => {
    const visit = data.type === "Booking" && data.product === "Plant visit";
    const sb = await client();
    const { data: ref, error } = await sb.rpc("submit_request", {
      _kind: data.type, _name: data.name, _email: data.email, _phone: data.phone, _product: data.product,
      _quantity: data.quantity, _visit_date: data.type === "Booking" && data.date ? data.date : null,
      _visit_slot: visit ? data.slot : null, _message: data.message,
    } as never);
    if (error) return { ok: false as const, reason: error.message.includes("slot") ? "slot" : "error" };
    return { ok: true as const, reference: ref as unknown as string };
  });

export type BookingSettings = { days: number[]; slots: string[]; capacity: number };

export const getBookingSettings = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await client();
  const { data, error } = await sb.from("booking_settings").select("days, slots, capacity").eq("id", 1).single();
  if (error || !data) throw new Error("Could not load booking settings");
  return data as BookingSettings;
});
