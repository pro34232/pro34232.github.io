import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { Enquiry } from "@/components/Enquiry";
import { Advisor } from "@/components/Advisor";
import { SiteHeader } from "@/components/SiteHeader";
import { Comparison } from "@/components/Comparison";
import { Link } from "@tanstack/react-router";
import { PRODUCTS } from "@/lib/prices";
import { PLANT_SPECS } from "@/lib/plant";
import { getLivePrices, type LivePrice } from "@/lib/market.functions";

const PlantViewer = lazy(() => import("@/components/plant/PlantViewer"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Eco Fuel — Microwave Plastic Pyrolysis, UAE" },
      { name: "description", content: "Eco Fuel turns waste plastic into diesel, kerosene, syngas, oxygen and nitrogen. Live MSRP in AED." },
      { property: "og:title", content: "Eco Fuel — Microwave Plastic Pyrolysis" },
      { property: "og:description", content: "Live AED prices for fuels made from waste plastic." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});


function Index() {
  const [live, setLive] = useState<{ prices: LivePrice[]; updated: number } | null>(null);
  const [feedDown, setFeedDown] = useState(false);
  const [litres, setLitres] = useState(1000);
  const [pid, setPid] = useState("diesel");
  useEffect(() => {
    const load = () => getLivePrices().then((d) => { setLive(d); setFeedDown(false); }).catch(() => setFeedDown(true));
    load();
    const i = setInterval(load, 60000);
    return () => clearInterval(i);
  }, []);
  const lp = (id: string) => live?.prices.find((x) => x.id === id);
  const price = (id: string, base: number) => lp(id)?.price ?? base;
  const sel = PRODUCTS.find((p) => p.id === pid) ?? PRODUCTS[0];
  if (!sel) return null;
  const total = price(sel.id, sel.base) * litres;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm uppercase text-primary">Microwave plastic pyrolysis · UAE</p>
        <h1 className="font-display mt-4 max-w-4xl text-4xl leading-tight sm:text-5xl md:text-7xl">Eco Fuel</h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">We produce, sell and operate fuel from recycled plastic — diesel, kerosene, syngas and industrial gases.</p>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">Fuel quality depends on feedstock, upgrading and batch testing.</p>
      </section>

      <section id="prices" className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-end">
          <h2 className="font-display text-3xl">Live MSRP</h2>
          <span className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 shrink-0 motion-safe:animate-pulse rounded-full bg-primary" />{feedDown ? "Market feed unavailable · showing indicative prices" : live ? `Market benchmark · updated ${new Date(live.updated).toLocaleString()} · AED` : "Loading market prices…"}</span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Prices update automatically every day with the market (checked every minute). Indicative prices: diesel uses a US ULSD futures benchmark, not a UAE retail quote. Margins and oxygen / nitrogen list prices await owner confirmation.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {PRODUCTS.map((p) => {
            const v = price(p.id, p.base);
            const q = lp(p.id);
            const ref = q?.prev ?? v;
            const up = v >= ref;
            return (
              <div key={p.id} className="min-w-0 rounded-lg border bg-card p-5">
                <p className="text-sm text-muted-foreground">{p.name}</p>
                <p className="font-display mt-2 text-3xl"><span className="text-base text-muted-foreground">AED</span> {v.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">per {p.unit}</p>
                <p className={`mt-3 text-xs ${up ? "text-primary" : "text-destructive"}`}>{q && !q.live ? "Fixed list price" : <>{up ? "▲" : "▼"} {(((v - ref) / ref) * 100).toFixed(2)}% today</>}</p>
              </div>
            );
          })}
        </div>
      </section>

      <Advisor />

      <section id="cost" className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-display text-3xl">Fuel cost calculator</h2>
        <div className="mt-6 grid gap-4 rounded-xl border bg-card p-6 md:grid-cols-3 md:items-end">
          <label className="text-sm">Product
            <select value={pid} onChange={(e) => setPid(e.target.value)} className="mt-2 w-full rounded-md border bg-background p-2">
              {PRODUCTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label className="text-sm">Quantity ({sel.unit})
            <input type="number" min={0} value={litres} onChange={(e) => setLitres(Number(e.target.value))} className="mt-2 w-full rounded-md border bg-background p-2" />
          </label>
          <div className="min-w-0"><p className="text-sm text-muted-foreground">Estimated total</p><p className="font-display break-words text-3xl text-primary">AED {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p></div>
        </div>
      </section>

      <section id="quality" className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-display text-3xl">Product quality</h2>
        <div className="mt-6 divide-y rounded-xl border bg-card">
          {PRODUCTS.map((p) => (
            <div key={p.id} className="grid gap-2 p-5 md:grid-cols-3">
              <span className="font-medium">{p.name}</span><span className="text-muted-foreground">{p.grade}</span><span className="text-sm text-muted-foreground">{p.spec}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="plant" className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-3xl">Plant specifications</h2>
          <Link to="/brochure" className="inline-block py-2 text-primary underline underline-offset-4">View plant brochure →</Link>
        </div>
        <ClientOnly fallback={<div className="h-[480px]" />}><Suspense fallback={<div className="flex h-[480px] items-center justify-center text-muted-foreground">Loading plant model…</div>}><PlantViewer /></Suspense></ClientOnly>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PLANT_SPECS.map(([k, v]) => (
            <div key={k} className="rounded-xl border bg-card p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">{k}</p><p className="mt-2 text-lg">{v}</p></div>
          ))}
        </div>
        <Link to="/brochure" className="mt-8 inline-flex min-h-16 w-full items-center justify-center rounded-lg bg-primary px-8 py-4 text-center text-lg font-medium text-primary-foreground hover:opacity-90 sm:w-auto">Layout, process flow, safety standards & specs — open the brochure</Link>
      </section>
      <Comparison />
      <section className="mx-auto grid max-w-6xl gap-5 border-t px-4 py-12 sm:px-6 md:grid-cols-2">
        <div><p className="text-sm text-primary">Responsible resource recovery</p><h2 className="font-display mt-2 text-3xl">Safety & sustainability</h2></div>
        <div className="min-w-0"><p className="leading-relaxed text-muted-foreground">Pyrolysis uses energy and can generate emissions and contaminated residues. Safe operation needs gas treatment, monitoring, trained operators and tested products—not just an oxygen-limited reactor.</p><Link to="/safety" className="mt-4 inline-block py-3 text-primary underline underline-offset-4">Read about industrial controls →</Link><br /><Link to="/faq" className="inline-block py-3 text-primary underline underline-offset-4">Explore pyrolysis FAQs →</Link></div>
      </section>
      <Enquiry />
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">© Eco Fuel · Prices are indicative MSRP in UAE Dirhams</footer>
    </main>
  );
}
