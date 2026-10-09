import { useState } from "react";
import { z } from "zod";
import { PRODUCTS } from "@/lib/prices";

export const CONTACT_EMAIL = "info@ecofuel.ae";

const schema = z.object({
  type: z.enum(["Enquiry", "Booking"]),
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(30),
  product: z.string().max(50),
  quantity: z.string().trim().max(30),
  date: z.string().max(20),
  message: z.string().trim().max(1000),
});

const input = "mt-2 w-full rounded-md border bg-background p-2";

export function Enquiry() {
  const [f, setF] = useState({ type: "Enquiry", name: "", email: "", phone: "", product: "Diesel", quantity: "", date: "", message: "" });
  const [err, setErr] = useState("");
  const set = (k: string) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    if (!r.success) return setErr(r.error.issues[0].message);
    setErr("");
    const d = r.data;
    const body = `Type: ${d.type}\nName: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone}\nProduct: ${d.product}\nQuantity: ${d.quantity}\n${d.type === "Booking" ? `Preferred date: ${d.date}\n` : ""}\n${d.message}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`${d.type} – ${d.product} – ${d.name}`)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section id="enquiry" className="mx-auto max-w-6xl px-6 py-12 pb-24">
      <h2 className="font-display text-3xl">Enquiry & booking</h2>
      <p className="mt-2 text-muted-foreground">Ask a question, request a quote, or book a fuel order or plant visit. Or email <a className="text-primary" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
      <form onSubmit={submit} className="mt-6 grid gap-4 rounded-xl border bg-card p-6 md:grid-cols-2">
        <div className="flex gap-2 md:col-span-2">
          {["Enquiry", "Booking"].map((t) => (
            <button type="button" key={t} onClick={() => setF({ ...f, type: t })}
              className={`rounded-full border px-5 py-2 text-sm ${f.type === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t}</button>
          ))}
        </div>
        <label className="text-sm">Name<input className={input} value={f.name} onChange={set("name")} maxLength={100} /></label>
        <label className="text-sm">Email<input type="email" className={input} value={f.email} onChange={set("email")} maxLength={255} /></label>
        <label className="text-sm">Phone<input className={input} value={f.phone} onChange={set("phone")} maxLength={30} /></label>
        <label className="text-sm">Product
          <select className={input} value={f.product} onChange={set("product")}>
            {PRODUCTS.map((p) => <option key={p.id}>{p.name}</option>)}
            <option>Plant visit</option>
          </select>
        </label>
        <label className="text-sm">Quantity<input className={input} value={f.quantity} onChange={set("quantity")} maxLength={30} /></label>
        {f.type === "Booking" && <label className="text-sm">Preferred date<input type="date" className={input} value={f.date} onChange={set("date")} /></label>}
        <label className="text-sm md:col-span-2">Message<textarea rows={4} className={input} value={f.message} onChange={set("message")} maxLength={1000} /></label>
        {err && <p className="text-sm text-destructive md:col-span-2">{err}</p>}
        <button className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground md:col-span-2 md:justify-self-start">Send {f.type.toLowerCase()}</button>
      </form>
    </section>
  );
}
