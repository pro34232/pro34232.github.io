import { mkdir, readFile, writeFile } from 'node:fs/promises';
const rate = JSON.parse(await readFile(new URL('../src/lib/uae-diesel.json', import.meta.url), 'utf8'));
const listings = JSON.parse(await readFile(new URL('../src/lib/uae-listings.json', import.meta.url), 'utf8'));
const expired = Date.now() >= Date.parse(rate.validUntil);
const market = { source: 'uae', updated: Date.parse(rate.validFrom), stale: expired,
 prices: ['diesel', 'kerosene', 'syngas', 'lpg', 'oxygen', 'nitrogen'].map(id => id === 'diesel' ? { id, price: rate.price, prev: rate.previousPrice, live: false, label: `${expired ? 'Last published UAE price' : 'UAE retail price'} · ${rate.month}`, sourceUrl: rate.sourceUrl } : { id, price: null, prev: null, live: false, label: 'Bulk price on request', reference: listings.find(listing => listing.id === id), sourceUrl: id === 'syngas' ? 'https://vertexprimepetro.com/product-273-synthetic-gas.html' : listings.find(listing => listing.id === id)?.sourceUrl }) };
await mkdir('public', { recursive: true });
await writeFile('public/market.json', JSON.stringify(market, null, 2) + '\n');
