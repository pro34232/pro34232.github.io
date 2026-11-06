import { CircleGauge, ArrowUpRight } from "lucide-react";
import type { MarketPrice, Product } from "@/lib/prices";

export function MarketPriceCard({ product, rate }: { product: Product; rate?: MarketPrice }) {
  const reference = rate?.reference;
  const amount = rate?.price ?? reference?.amount;
  return (
    <article className={`min-w-0 rounded-lg border p-5 ${product.id === "diesel" ? "border-primary/45 bg-primary/10" : "border-border bg-card"}`}>
      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <h3>{product.name}</h3><CircleGauge className="size-4 shrink-0" />
      </div>
      <p className="mt-6 font-display text-2xl font-semibold text-foreground">
        {amount == null ? "Price on request" : `AED ${amount.toFixed(2)}`}
      </p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {reference ? reference.unit : rate?.price != null ? `per ${product.unit}` : "No verified published UAE price"}
      </p>
      <p className="mt-5 text-xs font-medium text-primary">
        {reference ? "Third-party UAE web listing" : rate?.label ?? "Bulk price on request"}
      </p>
      {reference && <>
        <p className="mt-2 text-sm text-foreground">{reference.supplier}</p>
        <p className="mt-1 text-xs text-muted-foreground">Checked {reference.checkedOn}</p>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">{reference.note}</p>
        <p className="mt-3 text-xs text-primary">Eco Fuel bulk price on request</p>
      </>}
      {rate?.sourceUrl && <a href={rate.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-primary underline underline-offset-4">
        {reference ? "View supplier listing" : rate.price != null ? "View published rate" : "Ask UAE supplier"}<ArrowUpRight className="size-4" />
      </a>}
    </article>
  );
}