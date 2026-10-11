import { createFileRoute, Link } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SiteHeader } from "@/components/SiteHeader";
import { Comparison } from "@/components/Comparison";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [
    { title: "Plastic pyrolysis FAQs · Eco Fuel" },
    { name: "description", content: "Understand plastic pyrolysis, suitable feedstocks, fuel upgrading, advantages and limitations with Eco Fuel." },
    { property: "og:title", content: "Plastic pyrolysis FAQs · Eco Fuel" },
    { property: "og:description", content: "Melting vs pyrolysis, plastic suitability and why raw output needs treatment." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: FAQPage,
});

const faqs = [
  ["Is pyrolysis the same as melting?", "No. Melting changes a plastic's physical state without intentionally breaking its polymer chains. Pyrolysis chemically breaks those chains into smaller molecules using heat in an oxygen-limited environment. Microwave heating is a way to supply energy, not a different definition of pyrolysis. Conventional plastic pyrolysis typically uses temperatures substantially above 100–200 °C; a listed operating range alone does not demonstrate conversion or fuel quality."],
  ["Can every type of plastic be processed?", "No. PE and PP are commonly used, and PS can also be processed in suitable systems. PVC can release corrosive chlorine-containing gases; PET can generate oxygenated compounds and complicate product quality. Mixed plastics, moisture, metals, additives and flame retardants require assessment, sorting and appropriate treatment. Acceptance must be based on the actual plant design and feedstock testing."],
  ["Is the output automatically clean fuel?", "No. Raw pyrolysis oil is a variable mixture, not certified diesel or kerosene. It may contain sulfur, chlorine, metals, unstable compounds and other contaminants. Separation, filtration, distillation and further upgrading may be required. Each batch needs laboratory testing against the intended fuel standard and equipment requirements before sale or use."],
  ["Does pyrolysis produce oxygen and nitrogen?", "Plastic pyrolysis mainly produces liquid oil, combustible gas and solid residues. Saleable high-purity oxygen and nitrogen are not standard direct pyrolysis outputs; they require separate gas production or supply arrangements. Ask Eco Fuel for each product's source and certificate of analysis."],
  ["Is pyrolysis emission-free?", "No. An oxygen-limited reactor is not an emission-free facility. Fugitive vapours, gas handling and combustion can release pollutants, and using the resulting fuel releases CO₂. Environmental performance depends on energy use, feedstock, treatment equipment and verified operating data."],
];

function FAQPage() {
  return <main className="min-h-screen bg-background text-foreground"><SiteHeader /><section className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><p className="text-sm text-primary">Eco Fuel · Knowledge</p><h1 className="font-display mt-3 text-4xl sm:text-5xl">Pyrolysis FAQs</h1><p className="mt-4 max-w-2xl text-muted-foreground">Clear answers about the process, its products and its boundaries.</p><Accordion type="multiple" className="mt-8 max-w-3xl border-t">{faqs.map(([question, answer], i) => <AccordionItem key={question} value={`faq-${i}`}><AccordionTrigger className="min-h-14 gap-4 text-base">{question}</AccordionTrigger><AccordionContent className="max-w-2xl text-base leading-relaxed text-muted-foreground">{answer}</AccordionContent></AccordionItem>)}</Accordion><Link to="/safety" className="mt-8 inline-block py-3 text-primary underline underline-offset-4">Safety and sustainability →</Link></section><Comparison /></main>;
}