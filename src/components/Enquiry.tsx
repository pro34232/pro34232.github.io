import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { PRODUCTS } from "@/lib/prices";
import { getBookedSlots, getBookingSettings, submitRequest, type BookingSettings } from "@/lib/requests.functions";

export const CONTACT_EMAIL = "info@ecofuel.com";
const MAILBOX = "abeljomy2012@gmail.com";

const schema = z.object({
  type: z.enum(["Enquiry", "Booking"]),
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(30),
  product: z.string().max(50),
  quantity: z.string().trim().max(30),
  date: z.string().max(20),
  slot: z.string().max(10),
  message: z.string().trim().max(1000),
});

const input = "mt-2";
const DAY = 86400000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const dow = (d: string) => new Date(d + "T00:00:00Z").getUTCDay();
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const firstOpen = (days: number[]) => {
  for (let i = 1; i <= 14; i++) { const d = iso(Date.now() + i * DAY); if (days.includes(dow(d))) return d; }
  return iso(Date.now() + DAY);
};
type Status = { s: "idle" } | { s: "sending" } | { s: "ok"; ref: string; type: string } | { s: "fail"; msg: string };

export function Enquiry() {
  const [f, setF] = useState({ type: "Enquiry", name: "", email: "", phone: "", product: "Diesel", quantity: "", date: "", slot: "", message: "" });
  const [err, setErr] = useState("");
  const [status, setStatus] = useState<Status>({ s: "idle" });
  const [booked, setBooked] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [cfg, setCfg] = useState<BookingSettings | null>(null);
  const loadCfg = useServerFn(getBookingSettings);
  useEffect(() => { loadCfg().then(setCfg).catch(() => setCfg(null)); }, []);
  const tomorrow = () => firstOpen(cfg?.days ?? [0, 1, 2, 3, 4, 5, 6]);
  const closed = !!(cfg && f.date && !cfg.days.includes(dow(f.date)));
  const fetchSlots = useServerFn(getBookedSlots);
  const send = useServerFn(submitRequest);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF((current) => ({ ...current, [k]: e.target.value }));
  const visit = f.type === "Booking";

  const loadSlots = (date: string) => {
    setSlotsLoading(true);
    fetchSlots({ data: { date } }).then(setBooked).catch(() => setBooked([])).finally(() => setSlotsLoading(false));
  };
  useEffect(() => { if (visit && f.date) loadSlots(f.date); }, [visit, f.date]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    if (!r.success) return setErr(r.error.issues[0]?.message ?? "Invalid input");
    if (f.type === "Booking" && !f.date) return setErr("Please choose a date");
    if (closed) return setErr("We're closed that day — please choose another date");
    if (visit && !f.slot) return setErr("Please choose a time slot");
    setErr("");
    setStatus({ s: "sending" });
    try {
      const res = await send({ data: r.data });
      if (res.ok) {
        setStatus({ s: "ok", ref: res.reference, type: f.type });
      } else if (res.reason === "slot") {
        setStatus({ s: "fail", msg: "That time slot was just taken. Please pick another slot and send again." });
        setF((current) => ({ ...current, slot: "" }));
        loadSlots(f.date);
      } else {
        setStatus({ s: "fail", msg: "We couldn't save your request. Please check your details and press Send again." });
      }
    } catch {
      setStatus({ s: "fail", msg: "Connection problem — your request has NOT reached Eco Fuel yet. Check your internet and press Send again." });
    }
  };

  if (status.s === "ok") {
    return (
      <section id="enquiry" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 pb-24">
        <div role="status" className="rounded-lg border border-primary bg-card p-5 sm:p-8">
          <p className="text-sm text-primary">✓ Received by Eco Fuel</p>
          <h2 className="font-display mt-2 break-words text-3xl">Thank you, {f.name}</h2>
          <p className="mt-3 break-words text-muted-foreground">Your {status.type.toLowerCase()} has been received{visit ? ` for ${f.date} at ${f.slot}` : ""}. Our team will reply to {f.email}.</p>
          <p className="mt-6 text-sm text-muted-foreground">Your booking reference</p>
          <p className="font-display text-4xl tracking-wider">{status.ref}</p>
          <p className="mt-2 text-xs text-muted-foreground">Keep this reference and quote it if you contact us at {CONTACT_EMAIL}.</p>
          <Button variant="outline" onClick={() => { setStatus({ s: "idle" }); setF({ ...f, message: "", slot: "" }); }} className="mt-6 rounded-md border px-5 py-2 text-sm">Send another request</Button>
        </div>
      </section>
    );
  }

  return (
    <section id="enquiry" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 pb-24">
      <h2 className="font-display text-3xl">Enquiry & booking</h2>
      <p className="mt-2 text-muted-foreground">Ask a question, request a quote, or book a fuel order or plant visit. Or email <a className="text-primary" href={`mailto:${MAILBOX}`}>{CONTACT_EMAIL}</a>.</p>
      <form onSubmit={submit} className="mt-6 grid gap-4 rounded-lg border bg-card p-4 sm:p-6 md:grid-cols-2">
        <div className="flex gap-2 md:col-span-2">
          {["Enquiry", "Booking"].map((t) => (
            <Button variant="outline" type="button" key={t} onClick={() => setF((current) => ({ ...current, type: t, date: t === "Booking" && !current.date ? tomorrow() : current.date, slot: "" }))}
              className={`min-h-11 border-border rounded-md border px-5 py-2 text-sm ${f.type === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t}</Button>
          ))}
        </div>
        <label className="min-w-0 text-sm">Name<Input className={input} value={f.name} onChange={set("name")} maxLength={100} /></label>
        <label className="min-w-0 text-sm">Email<Input type="email" className={input} value={f.email} onChange={set("email")} maxLength={255} /></label>
        <label className="min-w-0 text-sm">Phone<Input className={input} value={f.phone} onChange={set("phone")} maxLength={30} /></label>
        <label className="min-w-0 text-sm">Product
          <select className={input} value={f.product} onChange={set("product")}>
            {PRODUCTS.map((p) => <option key={p.id}>{p.name}</option>)}
            <option>Plant visit</option>
          </select>
        </label>
        {f.product !== "Plant visit" && <label className="min-w-0 text-sm">Quantity<Input className={input} value={f.quantity} onChange={set("quantity")} maxLength={30} /></label>}
        {f.type === "Booking" && <label className="min-w-0 text-sm">{f.product === "Plant visit" ? "Visit date" : "Delivery / collection date"}<Input type="date" min={iso(Date.now() + DAY)} className={input} value={f.date} onChange={(e) => setF((current) => ({ ...current, date: e.target.value, slot: "" }))} /></label>}
        {visit && (
          <div className="min-w-0 text-sm md:col-span-2">
            Time slot
            {cfg && <span className="ml-2 text-xs text-muted-foreground">Open {cfg.days.map((d) => DAY_NAMES[d]).join(", ")}</span>}
            {!f.date ? <p className="mt-2 text-muted-foreground">Choose a date to see available times.</p> : closed ? <p className="mt-2 text-destructive">Closed on {DAY_NAMES[dow(f.date)]}s — please pick another date.</p> : !cfg ? <p className="mt-2 text-muted-foreground">Loading times…</p> : (
              <div className="mt-2 flex flex-wrap gap-2">
                {cfg.slots.map((s) => {
                  const taken = booked.includes(s);
                  return (
                    <Button variant="outline" type="button" key={s} disabled={taken || slotsLoading} onClick={() => setF((current) => ({ ...current, slot: s }))}
                      className={`min-h-11 border-border rounded-md border px-4 py-2 ${f.slot === s ? "bg-primary text-primary-foreground" : ""} ${taken ? "cursor-not-allowed line-through opacity-40" : ""}`}>
                      {s}{taken ? " · full" : ""}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        )}
        <label className="min-w-0 text-sm md:col-span-2">Message<Textarea rows={4} className={input} value={f.message} onChange={set("message")} maxLength={1000} /></label>
        {err && <p className="text-sm text-destructive md:col-span-2">{err}</p>}
        {status.s === "fail" && <p role="alert" className="rounded-md border border-destructive p-3 text-sm text-destructive md:col-span-2">✕ Not sent. {status.msg} If it keeps failing, email us directly at {CONTACT_EMAIL}.</p>}
        <Button disabled={status.s === "sending"} type="submit" className="h-auto min-h-11 rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground disabled:opacity-60 md:col-span-2 md:justify-self-start">
          {status.s === "sending" ? "Sending…" : status.s === "fail" ? `Try again` : `Send ${f.type.toLowerCase()}`}
        </Button>
        <p className="text-xs text-muted-foreground md:col-span-2">{status.s === "sending" ? "Delivering your request to Eco Fuel…" : "Once Eco Fuel receives your request you'll see a confirmation with a booking reference here."}</p>
      </form>
    </section>
  );
}
