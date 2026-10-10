import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PRODUCTS } from "./prices";
import { getLivePrices } from "./market.functions";

export const recommendFuel = createServerFn({ method: "POST" })
  .inputValidator((d: { need: string }) => z.object({ need: z.string().trim().min(5).max(1000) }).parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false as const, error: "The advisor isn't configured yet." };
    let live: Record<string, number> = {};
    try { live = Object.fromEntries((await getLivePrices()).prices.map((p) => [p.id, p.price])); } catch { /* fall back to list prices */ }
    const catalog = PRODUCTS.map((p) => `- ${p.name}: AED ${(live[p.id] ?? p.base).toFixed(2)} per ${p.unit}; grade ${p.grade}; ${p.spec}`).join("\n");

    const [{ createOpenAI }, { streamText }] = await Promise.all([import("@ai-sdk/openai"), import("ai")]);
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        instructions: `You are Eco Fuel's product advisor in the UAE. Recommend ONLY from this catalog (prices in AED):\n${catalog}\n\nReply in under 120 words: name the best product in bold, explain why using its price and quality specs, give a rough AED cost estimate if the visitor mentioned a quantity, and mention one alternative if relevant. If the need is unclear, ask one short question. Plain text with **bold** only.`,
        messages: [{ role: "user", content: data.need }],
        providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] } },
      });
      const text = await result.text;
      if (!text.trim()) return { ok: false as const, error: "The advisor couldn't answer that. Please describe your need differently or contact us." };
      return { ok: true as const, text };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 429) return { ok: false as const, error: "The advisor is busy. Please try again in a minute." };
      if (status === 402) return { ok: false as const, error: "The advisor is temporarily unavailable." };
      console.error(e);
      return { ok: false as const, error: "The advisor is unavailable right now. Please try again later." };
    }
  });
