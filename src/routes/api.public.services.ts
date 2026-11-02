import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { getLivePrices } from '@/lib/market.functions';
import { getBookingSettings, getBookedSlots, submitRequest } from '@/lib/requests.functions';
import { requestSchema } from '@/lib/request-schema';
import { recommendFuel } from '@/lib/advisor.functions';

const allowed = new Set(['https://pro34232.github.io', 'https://eco-fuel-circular-energy.lovable.app', 'http://localhost:8080']);
export const Route = createFileRoute('/api/public/services')({
  server: { handlers: {
    OPTIONS: ({ request }) => handle(request, true),
    POST: ({ request }) => handle(request),
  } },
});
async function handle(request: Request, preflight = false) {
  const origin = request.headers.get('Origin');
  const headers = new Headers({ 'Content-Type': 'application/json', 'Vary': 'Origin', 'Cache-Control': 'no-store' });
  if (origin && !allowed.has(origin) && origin !== new URL(request.url).origin) return Response.json({ error: 'Origin not allowed' }, { status: 403, headers });
  if (origin) headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  if (preflight) return new Response(null, { status: 204, headers });
  if (Number(request.headers.get('Content-Length') || 0) > 8192) return Response.json({ error: 'Request too large' }, { status: 413, headers });
  try {
    const body = await request.text();
    if (body.length > 8192) return Response.json({ error: 'Request too large' }, { status: 413, headers });
    const { operation, data } = z.object({ operation: z.enum(['prices', 'settings', 'slots', 'booking', 'advisor']), data: z.unknown().optional() }).parse(JSON.parse(body));
    let result: unknown;
    if (operation === 'prices') result = await getLivePrices();
    else if (operation === 'settings') result = await getBookingSettings();
    else if (operation === 'slots') result = await getBookedSlots({ data: z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).parse(data) });
    else if (operation === 'booking') result = await submitRequest({ data: requestSchema.parse(data) });
    else result = await recommendFuel({ data: z.object({ need: z.string().trim().min(5).max(1000) }).parse(data) });
    return Response.json(result, { headers });
  } catch (error) {
    return Response.json({ error: error instanceof z.ZodError ? 'Invalid request details' : 'Service unavailable. Please try again later.' }, { status: error instanceof z.ZodError ? 400 : 503, headers });
  }
}