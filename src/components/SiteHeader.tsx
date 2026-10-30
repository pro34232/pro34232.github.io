import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Flame, Menu, Recycle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const links = [
  ["#prices", "Market"],
  ["#process", "Process"],
  ["#plant", "Plant"],
  ["#advisor", "Advisor"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#101613]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link to="/" className="group flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="relative grid size-9 place-items-center rounded-full bg-[#c4f542] text-[#101613]" aria-label="EcoFuel circular energy">
            <Recycle className="size-5 stroke-[2.5]" aria-hidden="true" />
            <Flame className="absolute -bottom-0.5 -right-0.5 size-3.5 fill-[#101613] stroke-[#c4f542]" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-white">Eco<span className="text-[#c4f542]">Fuel</span></span>
        </Link>
        <nav className={`${open ? "absolute inset-x-4 top-[76px] grid rounded-2xl border border-white/10 bg-[#17201b] p-3 shadow-2xl" : "hidden"} gap-1 lg:static lg:flex lg:items-center lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}>
          {links.map(([hash, label]) => (
            <Link key={hash} to="/" hash={hash.slice(1)} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm text-white/65 transition hover:bg-white/5 hover:text-white lg:py-2">{label}</Link>
          ))}
          <Link to="/faq" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm text-white/65 transition hover:bg-white/5 hover:text-white lg:py-2">FAQ</Link>
          <Link to="/safety" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm text-white/65 transition hover:bg-white/5 hover:text-white lg:py-2">Safety</Link>
          <Link to="/" hash="enquiry" onClick={() => setOpen(false)} className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#c4f542] px-4 py-3 text-sm font-semibold text-[#101613] transition hover:bg-[#d8ff72] lg:ml-3 lg:mt-0 lg:py-2">Start a conversation <ArrowUpRight className="size-4" /></Link>
        </nav>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white lg:hidden" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
      </div>
    </header>
  );
}
