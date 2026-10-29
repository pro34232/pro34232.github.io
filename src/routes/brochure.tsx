import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer, ShieldCheck, Flame, Gauge, HardHat, Leaf, ClipboardCheck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { PLANT_SPECS } from "@/lib/plant";
import { PRODUCTS } from "@/lib/prices";

const URL = "https://ecofuelpyrolysis.lovable.app/brochure";

export const Route = createFileRoute("/brochure")({
  head: () => ({
    meta: [
      { title: "Plant brochure · Eco Fuel microwave pyrolysis" },
      { name: "description", content: "Eco Fuel plant layout, process flow from plastic to fuel, safety standards and technical specifications." },
      { property: "og:title", content: "Plant brochure · Eco Fuel" },
      { property: "og:description", content: "Layout, process flow, safety standards and technical specs of the Eco Fuel pyrolysis plant." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: BrochurePage,
});

// Units match the numbered parts of the 3D model on the home page.
const UNITS = [
  { n: 1, name: "Pyrolysis reactor", role: "Microwave heating breaks shredded plastic down into hot vapour in a low-oxygen chamber." },
  { n: 2, name: "Condenser", role: "Cools the treated vapour so the oil fractions turn back into liquid." },
  { n: 3, name: "Catalyst chamber", role: "Vapour from the reactor passes over a catalyst that cracks heavy molecules into lighter fuel ranges." },
  { n: 4, name: "Fuel collector tank", role: "Collects the condensed liquid oil before refining; gases that don't condense go to treatment." },
  { n: 5, name: "Fractional distillation column", role: "Separates the oil by boiling range into lighter and heavier fuel fractions." },
];

const FLOW = [
  { step: "Reception & sorting", text: "PP, PE and PS plastic is checked, sorted and PVC / PET removed." },
  { step: "Shredding & drying", text: "Plastic is shredded and dried to lower moisture before heating." },
  { step: "Pyrolysis · unit 1", text: "Microwave heating in a low-oxygen reactor turns plastic into vapour." },
  { step: "Catalysis · unit 3", text: "Vapour is upgraded over the catalyst bed." },
  { step: "Condensing · unit 2", text: "Vapour is cooled into liquid oil." },
  { step: "Collection · unit 4", text: "Oil is collected; non-condensable gas is treated and can supply heat." },
  { step: "Distillation · unit 5", text: "Oil is separated into fuel fractions and batch-tested before sale." },
];

const STANDARDS = [
  { Icon: Flame, title: "Fire & explosion protection", text: "Hazardous-area classification and equipment suited to it (ATEX / IECEx approach), flame arrestors, gas detection and inerting with nitrogen." },
  { Icon: Gauge, title: "Pressure & process safety", text: "Pressure vessels and piping designed to recognised codes such as ASME, with relief valves, interlocks and emergency shutdown." },
  { Icon: HardHat, title: "People & operations", text: "Trained operators, permit-to-work, PPE and emergency plans following ISO 45001 occupational health and safety principles." },
  { Icon: Leaf, title: "Environment", text: "Emission capture, scrubbing and monitoring, wastewater treatment and licensed residue handling following ISO 14001 environmental management principles." },
  { Icon: ClipboardCheck, title: "Local approvals", text: "UAE Civil Defence fire and life safety approval and environmental permits from the relevant emirate authority before operation." },
  { Icon: ShieldCheck, title: "Product quality", text: "Every batch is tested against the customer's specification before delivery; certificates available on request." },
];

function LayoutDiagram() {
  const box = "fill-card stroke-primary";
  const label = "fill-foreground text-[13px]";
  const num = "fill-primary font-semibold text-[14px]";
  return (
    <svg viewBox="0 0 760 300" className="h-auto w-full" role="img" aria-labelledby="layout-title layout-desc">
      <title id="layout-title">Plant layout</title>
      <desc id="layout-desc">Pyrolysis reactor feeds the catalyst chamber, then the condenser, the fuel collector tank and the fractional distillation column.</desc>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" className="fill-primary" />
        </marker>
      </defs>
      <rect x="1" y="1" width="758" height="298" rx="10" className="fill-muted/40 stroke-border" />
      {/* 1 reactor */}
      <rect x="30" y="170" width="230" height="80" rx="40" className={box} strokeWidth="2" />
      <text x="145" y="205" textAnchor="middle" className={num}>1</text>
      <text x="145" y="226" textAnchor="middle" className={label}>Pyrolysis reactor</text>
      {/* 3 catalyst */}
      <rect x="40" y="40" width="110" height="80" rx="12" className={box} strokeWidth="2" />
      <text x="95" y="72" textAnchor="middle" className={num}>3</text>
      <text x="95" y="94" textAnchor="middle" className={label}>Catalyst</text>
      {/* 2 condenser */}
      <rect x="230" y="40" width="120" height="80" rx="12" className={box} strokeWidth="2" />
      <text x="290" y="72" textAnchor="middle" className={num}>2</text>
      <text x="290" y="94" textAnchor="middle" className={label}>Condenser</text>
      {/* 4 collector */}
      <circle cx="440" cy="200" r="52" className={box} strokeWidth="2" />
      <text x="440" y="195" textAnchor="middle" className={num}>4</text>
      <text x="440" y="216" textAnchor="middle" className={label}>Collector</text>
      {/* 5 column */}
      <rect x="570" y="30" width="70" height="240" rx="12" className={box} strokeWidth="2" />
      <text x="605" y="140" textAnchor="middle" className={num}>5</text>
      <text x="605" y="162" textAnchor="middle" className={label}>Column</text>
      {/* flows */}
      <path d="M95 170 L95 124" className="stroke-primary" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
      <path d="M150 80 L226 80" className="stroke-primary" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
      <path d="M350 80 Q440 80 440 144" className="stroke-primary" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
      <path d="M492 200 L566 200" className="stroke-primary" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
      <path d="M640 70 L740 70 M640 140 L740 140 M640 230 L740 230" className="stroke-primary" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
      <text x="690" y="62" textAnchor="middle" className="fill-muted-foreground text-[11px]">Light</text>
      <text x="690" y="132" textAnchor="middle" className="fill-muted-foreground text-[11px]">Middle</text>
      <text x="690" y="222" textAnchor="middle" className="fill-muted-foreground text-[11px]">Heavy</text>
      <path d="M440 252 L440 285 L145 285 L145 254" className="stroke-muted-foreground" strokeWidth="1.5" strokeDasharray="5 4" fill="none" markerEnd="url(#arrow)" />
      <text x="292" y="279" textAnchor="middle" className="fill-muted-foreground text-[11px]">Treated gas → heat</text>
    </svg>
  );
}

function BrochurePage() {
  const fuels = PRODUCTS.filter((p) => ["diesel", "kerosene", "lpg", "syngas"].includes(p.id));
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="print:hidden"><SiteHeader /></div>
      <article className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 border-b pb-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:items-end">
          <div className="min-w-0">
            <p className="text-sm uppercase text-primary">Eco Fuel · Plant brochure</p>
            <h1 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">From waste plastic to tested fuel</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">A 20 tonne-per-day microwave pyrolysis plant in the UAE that turns sorted plastic waste into diesel, kerosene, LPG and syngas.</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end print:hidden">
            <Button onClick={() => window.print()} className="min-h-11"><Printer /> Print or save as PDF</Button>
            <Button asChild variant="outline" className="min-h-11 border-border text-foreground"><Link to="/" hash="enquiry">Book a plant visit</Link></Button>
          </div>
        </div>

        <section aria-labelledby="layout" className="py-12">
          <p className="text-sm text-primary">01</p>
          <h2 id="layout" className="font-display mt-1 text-3xl">Plant layout</h2>
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="min-w-0 overflow-x-auto"><div className="min-w-[520px]"><LayoutDiagram /></div></div>
            <ol className="min-w-0 space-y-4">
              {UNITS.map((u) => (
                <li key={u.n} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                  <span className="font-display text-xl text-primary">{String(u.n).padStart(2, "0")}</span>
                  <div><p className="font-medium">{u.name}</p><p className="text-sm leading-relaxed text-muted-foreground">{u.role}</p></div>
                </li>
              ))}
            </ol>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Schematic only — not to scale. See the <Link to="/" hash="plant" className="text-primary underline underline-offset-4">3D model</Link> for the physical arrangement.</p>
        </section>

        <section aria-labelledby="flow" className="border-t py-12">
          <p className="text-sm text-primary">02</p>
          <h2 id="flow" className="font-display mt-1 text-3xl">Process flow</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((f, i) => (
              <li key={f.step} className="min-w-0 rounded-lg border bg-card p-5">
                <p className="text-xs font-medium uppercase text-primary">Step {i + 1}</p>
                <p className="font-display mt-2 text-lg">{f.step}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </li>
            ))}
            <li className="min-w-0 rounded-lg border border-primary bg-card p-5">
              <p className="text-xs font-medium uppercase text-primary">Products</p>
              <ul className="mt-2 space-y-1">{fuels.map((p) => <li key={p.id} className="font-display text-lg">{p.name}</li>)}</ul>
            </li>
          </ol>
        </section>

        <section aria-labelledby="standards" className="border-t py-12">
          <p className="text-sm text-primary">03</p>
          <h2 id="standards" className="font-display mt-1 text-3xl">Safety standards</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">The frameworks a plant like ours is designed, built and permitted against. Certificates and approvals are shared on request.</p>
          <div className="mt-6 grid gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
            {STANDARDS.map(({ Icon, title, text }) => (
              <div key={title} className="min-w-0 border-l-2 border-primary pl-4">
                <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="font-display mt-3 text-xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
          <Link to="/safety" className="mt-6 inline-block py-3 text-primary underline underline-offset-4 print:hidden">Read more about emissions and controls →</Link>
        </section>

        <section aria-labelledby="specs" className="border-t py-12">
          <p className="text-sm text-primary">04</p>
          <h2 id="specs" className="font-display mt-1 text-3xl">Technical specifications</h2>
          <dl className="mt-6 divide-y rounded-xl border bg-card">
            {PLANT_SPECS.map(([k, v]) => (
              <div key={k} className="grid gap-1 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-4">
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">{k}</dt><dd>{v}</dd>
              </div>
            ))}
          </dl>
          <h3 className="font-display mt-10 text-2xl">Product grades</h3>
          <dl className="mt-4 divide-y rounded-xl border bg-card">
            {PRODUCTS.map((p) => (
              <div key={p.id} className="grid gap-1 p-4 sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium">{p.name}</dt><dd className="text-muted-foreground">{p.grade}</dd><dd className="text-sm text-muted-foreground">{p.spec}</dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="border-t pt-8 text-sm text-muted-foreground">Eco Fuel · info@ecofuel.com · Figures are indicative and depend on feedstock and batch testing.</footer>
      </article>
    </main>
  );
}
