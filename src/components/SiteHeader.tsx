import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <Link to="/" className="font-display min-w-0 text-2xl">Eco<span className="text-primary">Fuel</span></Link>
        <Button variant="outline" className="h-11 w-11 border-border text-foreground lg:hidden" size="icon" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
        <nav id="site-navigation" aria-label="Main navigation" className={`${open ? "grid" : "hidden"} col-span-2 grid-cols-2 gap-2 text-sm text-muted-foreground lg:col-span-1 lg:flex lg:items-center lg:gap-3`} onClick={() => setOpen(false)}>
          {([['prices', 'Prices'], ['cost', 'Cost'], ['advisor', 'Advisor'], ['quality', 'Quality'], ['plant', 'Plant'], ['enquiry', 'Book']] as const).map(([hash, label]) => <Link key={hash} to="/" hash={hash} className="min-w-0 rounded-md px-2 py-3 hover:text-primary lg:py-2">{label}</Link>)}
          <Link to="/faq" className="px-2 py-3 hover:text-primary lg:py-2">FAQ</Link>
          <Link to="/safety" className="px-2 py-3 hover:text-primary lg:py-2">Safety</Link>
          <Link to="/admin" className="px-2 py-3 hover:text-primary lg:py-2">Owner</Link>
        </nav>
      </div>
    </header>
  );
}