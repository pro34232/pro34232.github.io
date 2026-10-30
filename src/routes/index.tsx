import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Check, ChevronRight, CircleGauge, Factory, Leaf, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Advisor } from "@/components/Advisor";
import { Comparison } from "@/components/Comparison";
import { Enquiry } from "@/components/Enquiry";
import { SiteHeader } from "@/components/SiteHeader";
import { PRODUCTS } from "@/lib/prices";
import { PLANT_SPECS } from "@/lib/plant";
import { getLivePrices, type LivePrice } from "@/lib/market.functions";

const PlantViewer = lazy(() => import("@/components/plant/PlantViewer"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EcoFuel — Turn waste into usable energy" },
      { name: "description", content: "EcoFuel turns difficult plastic waste into useful fuel products through controlled microwave pyrolysis." },
    ],
  }),
  component: Home,
});

function Home() {
  const [live, setLive] = useState<{ prices: LivePrice[]; updated: number } | null>(null);
  const [litres, setLitres] = useState(1000);
  const [pid, setPid] = useState("diesel");
  useEffect(() => {
    const load = () => getLivePrices().then(setLive).catch(() => undefined);
    load();
    const timer = setInterval(load, 60_000);
    return () => clearInterval(timer);
  }, []);
  const quote = (id: string, base: number) => live?.prices.find((p) => p.id === id)?.price ?? base;
  const selected = PRODUCTS.find((p) => p.id === pid) ?? PRODUCTS[0];
  const total = selected ? quote(selected.id, selected.base) * litres : 0;

  return (
    <main className="min-h-screen overflow-hidden bg-[#101613] text-white">
      <SiteHeader />
      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="pointer-events-none absolute -right-32 top-0 size-[32rem] rounded-full bg-[#c4f542]/10 blur-[120px]" />
        <div className="relative grid items-end gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#c4f542]/30 bg-[#c4f542]/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[.18em] text-[#c4f542]"><span className="size-1.5 rounded-full bg-[#c4f542]" /> Circular energy, engineered</div>
            <h1 className="max-w-4xl font-display text-5xl font-bold leading-[.98] tracking-[-.05em] text-white sm:text-7xl lg:text-[6.6rem]">Waste plastic.<br /><span className="text-[#c4f542]">Useful energy.</span></h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-white/60">We design, operate and supply practical fuel systems for the materials the world struggles to recycle.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/" hash="enquiry" className="inline-flex items-center gap-2 rounded-xl bg-[#c4f542] px-5 py-3.5 font-semibold text-[#101613] transition hover:bg-[#d8ff72]">Talk to the team <ArrowUpRight className="size-4" /></Link>
              <Link to="/" hash="process" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3.5 font-semibold text-white transition hover:bg-white/5">See how it works <ArrowDownRight className="size-4" /></Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-5 text-sm text-white/45">
              <span className="flex items-center gap-2"><Check className="size-4 text-[#c4f542]" /> Modular systems</span>
              <span className="flex items-center gap-2"><Check className="size-4 text-[#c4f542]" /> Batch-tested outputs</span>
              <span className="flex items-center gap-2"><Check className="size-4 text-[#c4f542]" /> UAE-focused support</span>
            </div>
          </div>
          <div className="relative min-h-[25rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[#1a241e] p-5 sm:min-h-[31rem]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_35%,rgba(196,245,66,.22),transparent_35%),linear-gradient(145deg,#24352b,#111815)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between"><span className="text-xs uppercase tracking-[.2em] text-white/40">System 01 / overview</span><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">Live concept</span></div>
              <div className="relative mx-auto flex w-full max-w-sm items-center justify-center py-8">
                <div className="absolute size-56 rounded-full border border-[#c4f542]/20 shadow-[0_0_100px_rgba(196,245,66,.18)] sm:size-72" />
                <div className="absolute size-40 rounded-full border border-dashed border-[#c4f542]/30 sm:size-52" />
                <div className="grid size-28 place-items-center rounded-[2rem] border border-[#c4f542]/50 bg-[#c4f542] text-center text-[#101613] shadow-[0_0_60px_rgba(196,245,66,.25)] sm:size-36"><span className="font-display text-3xl font-bold">W→E</span><span className="-mt-7 text-[10px] uppercase tracking-widest">Waste to energy</span></div>
                <Factory className="absolute left-2 top-8 size-8 text-white/35 sm:left-4" />< Zap className="absolute right-4 top-4 size-7 text-[#c4f542] sm:right-8" />< Leaf className="absolute bottom-8 left-8 size-7 text-[#c4f542]/60 sm:left-16" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[["01", "Feedstock"], ["02", "Conversion"], ["03", "Products"]].map(([n, label]) => <div key={n} className="rounded-xl border border-white/10 bg-black/10 p-3"><span className="text-xs text-[#c4f542]">{n}</span><p className="mt-2 text-sm text-white/70">{label}</p></div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#151d18]">
        <div className="mx-auto grid max-w-7xl gap-0 px-5 sm:grid-cols-3 lg:px-8">
          {[["01", "Recover", "Give difficult plastic a productive next step."], ["02", "Refine", "Control the process, test every batch, improve the output."], ["03", "Replace", "Put useful local fuel and industrial gases back to work."]].map(([n, title, copy]) => <div key={n} className="border-b border-white/10 py-7 sm:border-b-0 sm:border-r sm:px-7 sm:first:pl-0 sm:last:border-r-0"><span className="text-xs text-[#c4f542]">{n}</span><h2 className="mt-2 font-display text-xl font-semibold">{title}</h2><p className="mt-2 max-w-xs text-sm leading-6 text-white/45">{copy}</p></div>)}
        </div>
      </section>

      <section id="prices" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs uppercase tracking-[.2em] text-[#c4f542]">Market intelligence</p><h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Know your benchmark.</h2></div><p className="max-w-sm text-sm leading-6 text-white/45">{live ? `Updated ${new Date(live.updated).toLocaleString()} · AED` : "Loading market snapshot…"}<br />Reference pricing for planning, not a retail quote.</p></div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PRODUCTS.slice(0, 5).map((product, index) => <div key={product.id} className={`rounded-2xl border p-5 ${index === 0 ? "border-[#c4f542]/45 bg-[#c4f542]/10" : "border-white/10 bg-[#151d18]"}`}><div className="flex items-center justify-between text-xs text-white/40"><span>{product.name}</span><CircleGauge className="size-4" /></div><p className="mt-6 font-display text-3xl font-semibold">AED {quote(product.id, product.base).toFixed(2)}</p><p className="mt-1 text-xs text-white/40">per {product.unit}</p><p className="mt-5 text-xs text-[#c4f542]">{live?.prices.find((p) => p.id === product.id)?.live ? "Market linked" : "Indicative benchmark"}</p></div>)}
        </div>
      </section>

      <section id="process" className="bg-[#c4f542] px-5 py-20 text-[#101613] lg:px-8">
        <div className="mx-auto max-w-7xl"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-xs uppercase tracking-[.2em] text-[#31521b]">The operating model</p><h2 className="mt-4 max-w-md font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">A cleaner loop for a messy material.</h2><p className="mt-6 max-w-sm leading-7 text-[#31521b]">The technology is only useful when the whole operating system works: feedstock, conversion, upgrading, testing and people.</p></div><div className="grid gap-3 sm:grid-cols-2">{[["01", "Prepare", "Sort and condition the feedstock for a stable, predictable run."], ["02", "Convert", "Use controlled microwave pyrolysis to break down long-chain plastics."], ["03", "Upgrade", "Separate, treat and test outputs for their intended application."], ["04", "Operate", "Support your team with practical controls, safety and service."]].map(([n, title, copy]) => <div key={n} className="rounded-2xl border border-[#31521b]/20 bg-white/25 p-5"><span className="text-sm font-bold">{n}</span><h3 className="mt-12 font-display text-2xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#31521b]">{copy}</p></div>)}</div></div></div>
      </section>

      <section id="cost" className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="grid items-start gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-xs uppercase tracking-[.2em] text-[#c4f542]">Run the numbers</p><h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">What could your output look like?</h2><p className="mt-5 max-w-sm leading-7 text-white/50">Use the current benchmark to build a simple first-pass estimate. Our team can help turn it into a site-specific model.</p></div><div className="rounded-3xl border border-white/10 bg-[#151d18] p-6 sm:p-8"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm text-white/55">Product<select value={pid} onChange={(e) => setPid(e.currentTarget.value)} className="native-field mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#101613] px-3 text-white outline-none focus:border-[#c4f542]">{PRODUCTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label className="text-sm text-white/55">Quantity ({selected?.unit})<input type="number" min={0} value={litres} onChange={(e) => setLitres(Number(e.currentTarget.value))} className="native-field mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#101613] px-3 text-white outline-none focus:border-[#c4f542]" /></label></div><div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-6"><div><p className="text-sm text-white/45">Estimated benchmark value</p><p className="mt-1 font-display text-4xl font-semibold text-[#c4f542]">AED {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p></div><Link to="/" hash="enquiry" className="inline-flex items-center gap-2 rounded-xl bg-[#c4f542] px-4 py-3 text-sm font-semibold text-[#101613]">Request a model <ChevronRight className="size-4" /></Link></div></div></div></section>

      <section id="plant" className="border-t border-white/10 bg-[#151d18] px-5 py-20 lg:px-8"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[.2em] text-[#c4f542]">Built for the real world</p><h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">The plant, made legible.</h2></div><Link to="/brochure" className="inline-flex items-center gap-2 text-sm text-[#c4f542] underline underline-offset-4">Open technical brochure <ArrowUpRight className="size-4" /></Link></div><ClientOnly fallback={<div className="mt-10 h-[420px] rounded-3xl bg-[#101613]" />}><Suspense fallback={<div className="mt-10 flex h-[420px] items-center justify-center rounded-3xl bg-[#101613] text-white/40">Loading plant viewer…</div>}><PlantViewer /></Suspense></ClientOnly><div className="mt-8 grid gap-3 sm:grid-cols-3">{PLANT_SPECS.map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-[#101613] p-5"><p className="text-xs uppercase tracking-[.16em] text-white/35">{label}</p><p className="mt-3 text-lg text-white/80">{value}</p></div>)}</div></div></section>
      <Comparison />
      <Advisor />
      <Enquiry />
      <footer className="border-t border-white/10 px-5 py-10 lg:px-8"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-sm text-white/35"><span>© EcoFuel · Circular energy systems</span><span className="flex items-center gap-4"><Link to="/faq" className="hover:text-white">FAQ</Link><Link to="/safety" className="hover:text-white">Safety</Link><Link to="/brochure" className="hover:text-white">Brochure</Link></span></div></footer>
    </main>
  );
}
