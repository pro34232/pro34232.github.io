import { useState } from "react";
import { ArrowLeftRight, Recycle, Zap, FlaskConical, ShieldCheck, Check, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Waste recovery", Icon: Recycle, benefit: "A route for suitable hard-to-recycle plastics", advantage: "Selected plastic waste can be converted into oil, gas and solid residues when mechanical recycling is not practical.", limitation: "Not a solution for every plastic", constraint: "Sorting, drying and feedstock testing are essential. PVC, PET, flame retardants and contamination can reduce quality or introduce hazardous compounds." },
  { title: "Energy use", Icon: Zap, benefit: "Process gas can supply some heat", advantage: "After treatment, combustible process gas may be recovered for heat, reducing the need for external fuel.", limitation: "Energy input is still required", constraint: "Heating, microwave equipment, drying and refining consume energy. Actual savings depend on efficiency, electricity supply and gas recovery; energy independence is not guaranteed." },
  { title: "Product quality", Icon: FlaskConical, benefit: "Useful chemical and fuel feedstocks", advantage: "Liquid fractions can be separated and upgraded for specific industrial uses, subject to testing and customer requirements.", limitation: "Raw oil is not ready-to-use diesel", constraint: "Pyrolysis oil varies with feedstock. Distillation, contaminant removal and sometimes hydrotreatment are needed before fuel specifications can be met." },
  { title: "Environmental impact", Icon: ShieldCheck, benefit: "Potential to divert waste from disposal", advantage: "A well-controlled plant can recover resources from selected waste streams and capture process gases for treatment.", limitation: "Not zero-emission or automatically sustainable", constraint: "Leaks, combustion, wastewater and contaminated residues need controls. Burning the fuel releases CO₂; a lifecycle assessment is needed to compare alternatives." },
];

function ComparisonCard({ item }: { item: typeof items[number] }) {
  const [limitation, setLimitation] = useState(false);
  const { Icon } = item;
  return (
    <article className="flex min-w-0 flex-col rounded-lg border bg-card p-5 sm:p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><h3 className="font-display min-w-0 text-xl">{item.title}</h3><Icon className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" /></div>
      <p className="mt-6 flex items-center gap-2 text-xs font-medium uppercase text-primary">{limitation ? <TriangleAlert className="h-4 w-4" /> : <Check className="h-4 w-4" />}{limitation ? "Limitation" : "Advantage"}</p>
      <div className="mt-3 flex-1"><h4 className="text-lg font-medium">{limitation ? item.limitation : item.benefit}</h4><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{limitation ? item.constraint : item.advantage}</p></div>
      <Button variant="outline" className="mt-6 min-h-11 w-full border-border whitespace-normal text-foreground hover:bg-background hover:text-primary" aria-label={`${limitation ? 'Show advantage' : 'Show limitation'}: ${item.title}`} aria-pressed={limitation} onClick={() => setLimitation(!limitation)}><ArrowLeftRight />{limitation ? "View advantage" : "View limitation"}</Button>
    </article>
  );
}

export function Comparison() {
  return <section aria-labelledby="comparison-title" className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><p className="text-sm text-primary">A balanced perspective</p><h2 id="comparison-title" className="font-display mt-2 text-3xl">Advantages vs. limitations</h2><div className="mt-6 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map(item => <ComparisonCard key={item.title} item={item} />)}</div></section>;
}