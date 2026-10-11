import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Owner settings · Eco Fuel" },
      { name: "description", content: "Eco Fuel owner settings for booking days, time slots and requests." },
      { property: "og:title", content: "Owner settings · Eco Fuel" },
      { property: "og:description", content: "Manage Eco Fuel bookings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`);
const input = "mt-2 min-w-0 min-h-11 w-full rounded-md border bg-background p-2";

function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  if (!ready) return <Shell><p className="text-muted-foreground">Loading…</p></Shell>;
  return <Shell>{session ? <Owner userId={session.user.id} /> : <SignIn />}</Shell>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <a href="/" className="text-sm text-muted-foreground">← Back to site</a>
        <h1 className="font-display mt-4 text-4xl">Owner settings</h1>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}

function SignIn() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) setMsg(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      setMsg(error ? error.message : "Check your inbox and click the confirmation link, then sign in.");
    }
  };
  return (
    <form onSubmit={go} className="max-w-sm space-y-4 rounded-lg border bg-card p-4 sm:p-6">
      <p className="text-sm text-muted-foreground">{mode === "in" ? "Sign in with your owner account." : "Create your owner account using abeljomy2012@gmail.com."}</p>
      <label className="block text-sm">Email<input type="email" required className={input} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label className="block text-sm">Password<input type="password" required minLength={8} className={input} value={pw} onChange={(e) => setPw(e.target.value)} /></label>
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
      <Button className="w-full rounded-md bg-primary py-2 font-medium text-primary-foreground">{mode === "in" ? "Sign in" : "Create account"}</Button>
      <Button variant="link" type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="h-auto min-h-11 w-full whitespace-normal text-sm text-muted-foreground">
        {mode === "in" ? "First time? Create owner account" : "Have an account? Sign in"}
      </Button>
    </form>
  );
}

type Req = { reference: string; kind: string; name: string; email: string; phone: string; product: string; quantity: string; visit_date: string | null; visit_slot: string | null; message: string; created_at: string };

function Owner({ userId }: { userId: string }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [days, setDays] = useState<number[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [capacity, setCapacity] = useState(1);
  const [status, setStatus] = useState("");
  const [reqs, setReqs] = useState<Req[]>([]);

  useEffect(() => {
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
    supabase.from("booking_settings").select("days, slots, capacity").eq("id", 1).single().then(({ data }) => {
      if (data) { setDays(data.days); setSlots(data.slots); setCapacity(data.capacity); }
    });
    supabase.from("requests").select("*").order("created_at", { ascending: false }).limit(100).then(({ data }) => setReqs((data ?? []) as Req[]));
  }, [userId]);

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const save = async () => {
    if (!days.length || !slots.length) return setStatus("Choose at least one day and one time slot.");
    setStatus("Saving…");
    const { error } = await supabase.from("booking_settings")
      .update({ days: [...days].sort(), slots: [...slots].sort(), capacity, updated_at: new Date().toISOString() }).eq("id", 1);
    setStatus(error ? "Couldn't save — please try again." : "✓ Saved. The booking form now uses these settings.");
  };

  const signOut = <Button onClick={() => supabase.auth.signOut()} className="text-sm text-muted-foreground underline">Sign out</Button>;
  if (isAdmin === null) return <p className="text-muted-foreground">Loading…</p>;
  if (!isAdmin) return <div className="space-y-3"><p>This account isn't the site owner.</p>{signOut}</div>;

  return (
    <div className="space-y-8">
      <section className="rounded-lg border bg-card p-4 sm:p-6">
        <h2 className="font-display text-2xl">Booking days</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {DAYS.map((d, i) => (
            <Button variant="outline" key={d} onClick={() => setDays(toggle(days, i))} className={`min-h-11 border-border rounded-md border px-4 py-2 text-sm ${days.includes(i) ? "bg-primary text-primary-foreground" : ""}`}>{d}</Button>
          ))}
        </div>
      </section>
      <section className="rounded-lg border bg-card p-4 sm:p-6">
        <h2 className="font-display text-2xl">Hourly time slots</h2>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {HOURS.map((h) => (
            <Button variant="outline" key={h} onClick={() => setSlots(toggle(slots, h))} className={`min-h-11 border-border rounded-md border px-2 py-2 text-sm ${slots.includes(h) ? "bg-primary text-primary-foreground" : ""}`}>{h}</Button>
          ))}
        </div>
      </section>
      <section className="rounded-lg border bg-card p-4 sm:p-6">
        <h2 className="font-display text-2xl">Requests per slot</h2>
        <input type="number" min={1} max={100} value={capacity} onChange={(e) => setCapacity(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} className={`${input} max-w-32`} />
      </section>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap">
        <Button onClick={save} className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground">Save settings</Button>
        <span role="status" className="col-span-2 min-w-0 break-words text-sm text-muted-foreground sm:order-none">{status}</span>
        <span className="col-start-2 row-start-1 shrink-0 sm:ml-auto">{signOut}</span>
      </div>
      <section className="rounded-lg border bg-card p-4 sm:p-6">
        <h2 className="font-display text-2xl">Requests ({reqs.length})</h2>
        <div className="mt-4 space-y-3">
          {reqs.length === 0 && <p className="text-sm text-muted-foreground">No requests yet.</p>}
          {reqs.map((r) => (
            <div key={r.reference} className="min-w-0 break-words rounded-md border p-3 text-sm">
              <p><b>{r.reference}</b> · {r.kind} · {r.product} · {new Date(r.created_at).toLocaleString()}</p>
              <p className="text-muted-foreground">{r.name} · {r.email}{r.phone ? ` · ${r.phone}` : ""}{r.quantity ? ` · Qty ${r.quantity}` : ""}{r.visit_date ? ` · ${r.visit_date} ${r.visit_slot ?? ""}` : ""}</p>
              {r.message && <p className="mt-1">{r.message}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
