import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { recommendFuel } from "@/lib/advisor.functions";

export function Advisor() {
  const [need, setNeed] = useState("");
  const [answer, setAnswer] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const ask = useServerFn(recommendFuel);

  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    if (need.trim().length < 5) return setErr("Tell us a bit more about what you need.");
    setErr(""); setAnswer(""); setBusy(true);
    try {
      const r = await ask({ data: { need } });
      if (r.ok) setAnswer(r.text); else setErr(r.error);
    } catch { setErr("Connection problem. Please try again."); }
    finally { setBusy(false); }
  };

  return (
    <section id="advisor" className="mx-auto max-w-6xl px-6 py-12">
      <h2 className="font-display text-3xl">Fuel advisor</h2>
      <p className="mt-2 text-muted-foreground">Describe what you need fuel for and we'll recommend the right Eco Fuel product.</p>
      <form onSubmit={go} className="mt-6 rounded-xl border bg-card p-6">
        <textarea rows={3} maxLength={1000} value={need} onChange={(e) => setNeed(e.target.value)}
          placeholder="e.g. Running two 500 kVA generators at a construction site, about 4,000 litres a month"
          className="w-full rounded-md border bg-background p-3" />
        <button disabled={busy} className="mt-4 rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground disabled:opacity-60">
          {busy ? "Thinking…" : "Get recommendation"}
        </button>
        {err && <p className="mt-4 text-sm text-destructive">{err}</p>}
        {answer && (
          <div className="mt-6 whitespace-pre-wrap rounded-md border border-primary p-4 text-sm">
            {answer.split(/(\*\*[^*]+\*\*)/).map((s, i) => s.startsWith("**") ? <b key={i}>{s.slice(2, -2)}</b> : s)}
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">AI suggestion — please confirm with our team before ordering.</p>
      </form>
    </section>
  );
}
