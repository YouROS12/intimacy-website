/**
 * LACDP → Supabase stock sync endpoint
 *
 * Called by cron at 07:00 and 19:00 Morocco time (06:00 / 18:00 UTC).
 *
 * Auth: pass the CRON_SECRET via:
 *   - Header:  Authorization: Bearer <secret>
 *   - Query:   ?secret=<secret>
 *
 * Environment variables required:
 *   CRON_SECRET       — shared secret for cron caller
 *   LACDP_USER_1      — C035275
 *   LACDP_PASS_1      — 2387@13
 *   LACDP_USER_2      — C036544
 *   LACDP_PASS_2      — 3522@15
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 */

import { NextRequest, NextResponse } from 'next/server';

// ─── LACDP endpoints ─────────────────────────────────────────────────────────
const LACDP_BASE        = 'https://webdash.lacdp.ma';
const LOGIN_URL         = `${LACDP_BASE}/login`;
const FILTER_URL        = `${LACDP_BASE}/client_dash/filter_product`;

// ─── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const CRON_SECRET   = process.env.CRON_SECRET ?? '';

const LACDP_CREDS = [
  { username: process.env.LACDP_USER_1 ?? '', password: process.env.LACDP_PASS_1 ?? '' },
  { username: process.env.LACDP_USER_2 ?? '', password: process.env.LACDP_PASS_2 ?? '' },
];

const CONCURRENCY = 3;   // parallel LACDP requests
const DELAY_MS    = 150; // ms between batches

// ─── Types ───────────────────────────────────────────────────────────────────
interface LacdpSession {
  cookieStr: string;
  basicAuth: string;
}

interface SupabaseProduct {
  id: string;
  name: string;
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────
function extractSetCookies(response: Response): string[] {
  // Use getSetCookie() when available (Node 20+ / undici 6+)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const headers = response.headers as any;
  if (typeof headers['getSetCookie'] === 'function') {
    return headers.getSetCookie() as string[];
  }
  // Fallback: split by ", " only at cookie-name boundaries
  const raw = response.headers.get('set-cookie') ?? '';
  if (!raw) return [];
  return raw.split(/,\s*(?=[A-Za-z_][A-Za-z0-9_\-]*=)/);
}

function parseCookieMap(cookieLines: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const line of cookieLines) {
    const pair = line.split(';')[0].trim();
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) continue;
    const name  = pair.slice(0, eqIdx).trim();
    const value = pair.slice(eqIdx + 1).trim();
    map[name] = value;
  }
  return map;
}

function cookieMapToString(map: Record<string, string>): string {
  return Object.entries(map)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

// ─── LACDP auth ───────────────────────────────────────────────────────────────
async function loginLacdp(username: string, password: string): Promise<LacdpSession> {
  // Step 1 — GET /login to obtain CSRF token + initial cookies
  const pageRes = await fetch(LOGIN_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Intimacy/1.0)' },
  });

  const initialCookieLines = extractSetCookies(pageRes);
  const html = await pageRes.text();

  const tokenMatch = html.match(/name="_token"\s+value="([^"]+)"/);
  if (!tokenMatch) throw new Error('LACDP: CSRF _token not found in login page');

  const formToken = tokenMatch[1];
  const cookieMap = parseCookieMap(initialCookieLines);

  // Step 2 — POST credentials
  const loginRes = await fetch(LOGIN_URL, {
    method:   'POST',
    redirect: 'manual',
    headers: {
      'Content-Type':     'application/x-www-form-urlencoded',
      'User-Agent':       'Mozilla/5.0 (compatible; Intimacy/1.0)',
      'X-Requested-With': 'XMLHttpRequest',
      'Cookie':           cookieMapToString(cookieMap),
      'Referer':          LOGIN_URL,
    },
    body: new URLSearchParams({
      _token:   formToken,
      username,
      password,
      remember: '1',
    }).toString(),
  });

  const sessionCookieLines = extractSetCookies(loginRes);
  const sessionMap = parseCookieMap(sessionCookieLines);

  // Merge: session cookies override initial
  const finalMap = { ...cookieMap, ...sessionMap };

  if (!finalMap['laravel_session']) {
    throw new Error(`LACDP: login failed for ${username} — no laravel_session (HTTP ${loginRes.status})`);
  }

  return {
    cookieStr: cookieMapToString(finalMap),
    basicAuth: Buffer.from(`${username}:${password}`).toString('base64'),
  };
}

// ─── Stock lookup ─────────────────────────────────────────────────────────────
async function fetchStockForProduct(
  session: LacdpSession,
  name: string,
): Promise<number | null> {
  // Build name variants (mirrors vitasana tracker.py logic)
  const variants: string[] = [name];

  if (name.includes(' – '))      variants.push(name.split(' – ')[0].trim());
  else if (name.includes(' - ')) variants.push(name.split(' - ')[0].trim());

  const words = name.split(/[\s\-–]+/).filter(Boolean);
  if (words.length >= 3) variants.push(words.slice(0, 3).join(' '));
  if (words.length >= 2) variants.push(words.slice(0, 2).join(' '));

  const seen  = new Set<string>();
  const dedup = variants.filter(v => v && !seen.has(v) && seen.add(v));

  for (const variant of dedup) {
    try {
      const url = new URL(FILTER_URL);
      url.searchParams.set('title', variant);

      const res = await fetch(url.toString(), {
        headers: {
          'Cookie':           session.cookieStr,
          'Authorization':    `Basic ${session.basicAuth}`,
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent':       'Mozilla/5.0 (compatible; Intimacy/1.0)',
          'Accept':           'application/json',
        },
      });

      if (!res.ok) continue;

      const data: unknown = await res.json();
      if (!Array.isArray(data) || data.length === 0) continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const item = data[0] as Record<string, any>;
      const raw  = item['stock_1'] ?? item['stock'];
      const stock = parseInt(String(raw ?? ''), 10);
      if (!isNaN(stock)) return stock;
    } catch {
      // try next variant
    }
  }

  return null; // no LACDP match → skip
}

// ─── Supabase helpers ──────────────────────────────────────────────────────────
async function getSupabaseProducts(): Promise<SupabaseProduct[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=id,name&order=name`,
    {
      headers: {
        apikey:        SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    },
  );
  if (!res.ok) throw new Error(`Supabase products fetch failed: ${res.status}`);
  return res.json();
}

async function patchStock(productId: string, stock: number): Promise<boolean> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/products?id=eq.${productId}`,
    {
      method: 'PATCH',
      headers: {
        apikey:          SUPABASE_KEY,
        Authorization:   `Bearer ${SUPABASE_KEY}`,
        'Content-Type':  'application/json',
        Prefer:          'return=minimal',
      },
      body: JSON.stringify({ stock, updated_at: new Date().toISOString() }),
    },
  );
  return res.ok;
}

// ─── Concurrency helper ───────────────────────────────────────────────────────
async function processInBatches<T, R>(
  items: T[],
  batchSize: number,
  delayMs: number,
  handler: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(handler));
    results.push(...batchResults);
    if (i + batchSize < items.length) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return results;
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // ── Auth check
  const authHeader = req.headers.get('authorization') ?? '';
  const querySecret = req.nextUrl.searchParams.get('secret') ?? '';
  const providedSecret = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : querySecret;

  if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: 'Supabase env vars missing' }, { status: 500 });
  }

  const startedAt = new Date().toISOString();
  console.log(`[sync-stock] Starting at ${startedAt}`);

  // ── Authenticate with LACDP (try accounts in order)
  let session: LacdpSession | null = null;
  for (const cred of LACDP_CREDS) {
    if (!cred.username || !cred.password) continue;
    try {
      session = await loginLacdp(cred.username, cred.password);
      console.log(`[sync-stock] Authenticated as ${cred.username}`);
      break;
    } catch (err) {
      console.error(`[sync-stock] Login failed for ${cred.username}:`, err);
    }
  }

  if (!session) {
    return NextResponse.json(
      { error: 'All LACDP credentials failed' },
      { status: 503 },
    );
  }

  // ── Fetch products from Supabase
  const products = await getSupabaseProducts();
  console.log(`[sync-stock] ${products.length} products to sync`);

  const stats = { updated: 0, skipped: 0, failed: 0, total: products.length };
  const sess  = session; // capture for closure

  await processInBatches(products, CONCURRENCY, DELAY_MS, async (product) => {
    const stock = await fetchStockForProduct(sess, product.name);

    if (stock === null) {
      stats.skipped++;
      return;
    }

    const ok = await patchStock(product.id, stock);
    if (ok) {
      stats.updated++;
    } else {
      stats.failed++;
      console.warn(`[sync-stock] Failed to patch ${product.name}`);
    }
  });

  const completedAt = new Date().toISOString();
  console.log(
    `[sync-stock] Done: ${stats.updated} updated, ${stats.skipped} skipped, ${stats.failed} failed`,
  );

  return NextResponse.json({ success: true, startedAt, completedAt, ...stats });
}
