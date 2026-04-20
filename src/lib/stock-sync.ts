import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type {
  StockSyncLogEntry,
  StockSyncResult,
  StockSyncRunRecord,
  StockSyncStats,
  StockSyncTriggerSource,
} from '@/types';

const LACDP_BASE = 'https://webdash.lacdp.ma';
const LOGIN_URL = `${LACDP_BASE}/login`;
const FILTER_URL = `${LACDP_BASE}/client_dash/filter_product`;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0.0.0 Intimacy/1.0';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? '';

const LACDP_CREDS = [
  { username: process.env.LACDP_USER_1 ?? '', password: process.env.LACDP_PASS_1 ?? '' },
  { username: process.env.LACDP_USER_2 ?? '', password: process.env.LACDP_PASS_2 ?? '' },
];

const CONCURRENCY = 3;
const DELAY_MS = 150;
const ORDERS_WINDOW_H = 12;

let supabaseAdmin:
  | ReturnType<typeof createClient>
  | null = null;

type LogLevel = StockSyncLogEntry['level'];
type LogScope = StockSyncLogEntry['scope'];

interface LacdpSession {
  cookieStr: string;
  basicAuth: string;
}

interface SupabaseProduct {
  id: string;
  name: string;
  stock: number | null;
}

interface ShippingInfo {
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  city?: string;
  address?: string;
}

interface SupabaseOrder {
  id: string;
  total: number;
  status: string;
  created_at: string;
  shipping_info: ShippingInfo | null;
  items: Array<{ quantity?: number }> | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabaseAdminClient(): any {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase env vars missing');
  }

  if (!supabaseAdmin) {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdmin;
}

function serializeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function createLogger() {
  const entries: StockSyncLogEntry[] = [];

  const push = (
    level: LogLevel,
    scope: LogScope,
    message: string,
    meta?: StockSyncLogEntry['meta'],
  ) => {
    const entry: StockSyncLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      scope,
      message,
      ...(meta ? { meta } : {}),
    };

    entries.push(entry);

    const payload = meta ? ` ${JSON.stringify(meta)}` : '';
    if (level === 'error') {
      console.error(`[sync-stock][${scope}] ${message}${payload}`);
      return;
    }
    if (level === 'warn') {
      console.warn(`[sync-stock][${scope}] ${message}${payload}`);
      return;
    }
    console.log(`[sync-stock][${scope}] ${message}${payload}`);
  };

  return { entries, push };
}

function extractSetCookies(response: Response): string[] {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof headers.getSetCookie === 'function') {
    return headers.getSetCookie();
  }

  const raw = response.headers.get('set-cookie') ?? '';
  if (!raw) return [];

  return raw.split(/,\s*(?=[A-Za-z_][A-Za-z0-9_\-]*=)/);
}

function parseCookieMap(cookieLines: string[]): Record<string, string> {
  const map: Record<string, string> = {};

  for (const line of cookieLines) {
    const pair = line.split(';')[0].trim();
    const eqIndex = pair.indexOf('=');
    if (eqIndex === -1) continue;

    const name = pair.slice(0, eqIndex).trim();
    const value = pair.slice(eqIndex + 1).trim();
    map[name] = value;
  }

  return map;
}

function cookieMapToString(map: Record<string, string>): string {
  return Object.entries(map)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
}

async function createRunLog(
  triggerSource: StockSyncTriggerSource,
  initiatedBy: string | null,
  startedAt: string,
  logLines: StockSyncLogEntry[],
): Promise<number | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;

  try {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from('stock_sync_runs')
      .insert({
        trigger_source: triggerSource,
        initiated_by: initiatedBy,
        status: 'running',
        started_at: startedAt,
        log_lines: logLines,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[sync-stock] Failed to create sync log row:', error.message);
      return null;
    }

    return data.id as number;
  } catch (error) {
    console.error('[sync-stock] Failed to create sync log row:', serializeError(error));
    return null;
  }
}

async function completeRunLog(params: {
  runId: number | null;
  status: StockSyncRunRecord['status'];
  completedAt: string;
  stats: StockSyncStats;
  ordersCount: number;
  ruptureProducts: string[];
  logLines: StockSyncLogEntry[];
  errorMessage?: string;
}): Promise<void> {
  if (!params.runId || !SUPABASE_URL || !SUPABASE_KEY) return;

  try {
    const client = getSupabaseAdminClient();
    const { error } = await client
      .from('stock_sync_runs')
      .update({
        status: params.status,
        completed_at: params.completedAt,
        stats: params.stats,
        orders_count: params.ordersCount,
        rupture_products: params.ruptureProducts,
        log_lines: params.logLines,
        error_message: params.errorMessage ?? null,
      })
      .eq('id', params.runId);

    if (error) {
      console.error('[sync-stock] Failed to finalize sync log row:', error.message);
    }
  } catch (error) {
    console.error('[sync-stock] Failed to finalize sync log row:', serializeError(error));
  }
}

async function loginLacdp(
  username: string,
  password: string,
  log: ReturnType<typeof createLogger>['push'],
): Promise<LacdpSession> {
  const pageRes = await fetch(LOGIN_URL, {
    cache: 'no-store',
    headers: { 'User-Agent': USER_AGENT },
  });
  log('info', 'lacdp', 'Fetched LACDP login page', { status: pageRes.status, username });

  const initialCookieLines = extractSetCookies(pageRes);
  const html = await pageRes.text();
  const tokenMatch = html.match(/name="_token"\s+value="([^"]+)"/);
  if (!tokenMatch) {
    throw new Error('LACDP CSRF token not found in login page');
  }

  const formToken = tokenMatch[1];
  const cookieMap = parseCookieMap(initialCookieLines);

  const loginRes = await fetch(LOGIN_URL, {
    method: 'POST',
    redirect: 'manual',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
      'X-Requested-With': 'XMLHttpRequest',
      Cookie: cookieMapToString(cookieMap),
      Referer: LOGIN_URL,
    },
    body: new URLSearchParams({
      _token: formToken,
      username,
      password,
      remember: '1',
    }).toString(),
  });
  log('info', 'lacdp', 'Submitted LACDP login', { status: loginRes.status, username });

  const sessionCookieLines = extractSetCookies(loginRes);
  const sessionMap = parseCookieMap(sessionCookieLines);
  const finalMap = { ...cookieMap, ...sessionMap };

  if (!finalMap.laravel_session) {
    throw new Error(`LACDP login failed for ${username} (HTTP ${loginRes.status})`);
  }

  return {
    cookieStr: cookieMapToString(finalMap),
    basicAuth: Buffer.from(`${username}:${password}`).toString('base64'),
  };
}

async function fetchStockForProduct(
  session: LacdpSession,
  product: SupabaseProduct,
  log: ReturnType<typeof createLogger>['push'],
): Promise<number | null> {
  const variants: string[] = [product.name];

  if (product.name.includes(' – ')) {
    variants.push(product.name.split(' – ')[0].trim());
  } else if (product.name.includes(' - ')) {
    variants.push(product.name.split(' - ')[0].trim());
  }

  const words = product.name.split(/[\s\-–]+/).filter(Boolean);
  if (words.length >= 3) variants.push(words.slice(0, 3).join(' '));
  if (words.length >= 2) variants.push(words.slice(0, 2).join(' '));

  const seen = new Set<string>();
  const dedupedVariants = variants.filter((variant) => variant && !seen.has(variant) && seen.add(variant));

  for (const variant of dedupedVariants) {
    const url = new URL(FILTER_URL);
    url.searchParams.set('title', variant);

    try {
      const res = await fetch(url.toString(), {
        cache: 'no-store',
        headers: {
          Cookie: session.cookieStr,
          Authorization: `Basic ${session.basicAuth}`,
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        log('warn', 'lacdp', 'LACDP stock request returned non-OK status', {
          productName: product.name,
          status: res.status,
          variant,
        });
        continue;
      }

      const data: unknown = await res.json();
      const items = Array.isArray(data) ? (data as Array<Record<string, unknown>>) : [];
      const matchCount = items.length;
      if (matchCount === 0) {
        log('info', 'lacdp', 'No LACDP match for variant', {
          productName: product.name,
          status: res.status,
          variant,
        });
        continue;
      }

      const item = items[0];
      const rawStock = item.stock_1 ?? item.stock;
      const stock = Number.parseInt(String(rawStock ?? ''), 10);
      if (Number.isNaN(stock)) {
        log('warn', 'lacdp', 'LACDP returned invalid stock payload', {
          matchCount,
          productName: product.name,
          status: res.status,
          variant,
        });
        continue;
      }

      log('info', 'lacdp', 'Resolved product stock from LACDP', {
        matchCount,
        productName: product.name,
        status: res.status,
        stock,
        variant,
      });
      return stock;
    } catch (error) {
      log('error', 'lacdp', 'LACDP stock request failed', {
        error: serializeError(error),
        productName: product.name,
        variant,
      });
    }
  }

  log('warn', 'lacdp', 'No stock match found after trying all variants', {
    productName: product.name,
  });
  return null;
}

async function getSupabaseProducts(
  log: ReturnType<typeof createLogger>['push'],
): Promise<SupabaseProduct[]> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from('products')
    .select('id,name,stock')
    .order('name');

  if (error) {
    throw new Error(`Supabase products fetch failed: ${error.message}`);
  }

  log('info', 'supabase', 'Loaded products for sync', { count: data?.length ?? 0 });
  return (data as SupabaseProduct[]) ?? [];
}

async function patchStock(
  productId: string,
  productName: string,
  stock: number,
  log: ReturnType<typeof createLogger>['push'],
): Promise<boolean> {
  const client = getSupabaseAdminClient();
  const { error } = await client
    .from('products')
    .update({ stock, updated_at: new Date().toISOString() })
    .eq('id', productId);

  if (error) {
    log('error', 'supabase', 'Failed to patch product stock', {
      error: error.message,
      productId,
      productName,
      stock,
    });
    return false;
  }

  log('info', 'supabase', 'Patched product stock', {
    productId,
    productName,
    stock,
  });
  return true;
}

async function getNewOrders(
  sinceIso: string,
  log: ReturnType<typeof createLogger>['push'],
): Promise<SupabaseOrder[]> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from('orders')
    .select('id,total,status,shipping_info,items,created_at')
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: false });

  if (error) {
    log('error', 'supabase', 'Failed to fetch recent orders', {
      error: error.message,
      sinceIso,
    });
    return [];
  }

  log('info', 'supabase', 'Loaded recent orders for Telegram notification', {
    count: data?.length ?? 0,
    sinceIso,
  });
  return (data as SupabaseOrder[]) ?? [];
}

async function processInBatches<T>(
  items: T[],
  batchSize: number,
  delayMs: number,
  handler: (item: T) => Promise<void>,
): Promise<void> {
  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize);
    await Promise.all(batch.map(handler));

    if (index + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

function splitMessage(text: string, limit = 4000): string[] {
  if (text.length <= limit) return [text];

  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = start + limit;
    if (end < text.length) {
      const newlineIndex = text.lastIndexOf('\n', end);
      if (newlineIndex > start) end = newlineIndex;
    }
    chunks.push(text.slice(start, end));
    start = end;
  }

  return chunks;
}

async function sendTelegram(
  message: string,
  log: ReturnType<typeof createLogger>['push'],
): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    log('warn', 'telegram', 'Telegram env vars missing, skipping notification');
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  for (const chunk of splitMessage(message)) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: chunk }),
      });

      if (!res.ok) {
        log('warn', 'telegram', 'Telegram send failed', {
          length: chunk.length,
          status: res.status,
        });
        continue;
      }

      log('info', 'telegram', 'Telegram message sent', {
        length: chunk.length,
        status: res.status,
      });
    } catch (error) {
      log('error', 'telegram', 'Telegram send failed', {
        error: serializeError(error),
      });
    }
  }
}

function formatCustomerName(shippingInfo: ShippingInfo | null): string {
  if (!shippingInfo) return 'N/A';
  if (shippingInfo.name) return shippingInfo.name;

  const fullName = [shippingInfo.first_name, shippingInfo.last_name]
    .filter(Boolean)
    .join(' ')
    .trim();

  return fullName || 'N/A';
}

export async function runStockSync(params: {
  triggerSource: StockSyncTriggerSource;
  initiatedBy?: string | null;
}): Promise<StockSyncResult> {
  const startedAt = new Date().toISOString();
  const logger = createLogger();
  const stats: StockSyncStats = { updated: 0, skipped: 0, failed: 0, total: 0 };
  const ruptureProducts: string[] = [];
  let ordersCount = 0;
  let runId: number | null = null;

  logger.push('info', 'system', 'Stock sync started', {
    triggerSource: params.triggerSource,
  });

  runId = await createRunLog(
    params.triggerSource,
    params.initiatedBy ?? null,
    startedAt,
    logger.entries,
  );

  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Supabase env vars missing');
    }

    const availableCreds = LACDP_CREDS.filter((cred) => cred.username && cred.password);
    if (availableCreds.length === 0) {
      throw new Error('No LACDP credentials configured');
    }

    let session: LacdpSession | null = null;
    for (const cred of availableCreds) {
      try {
        session = await loginLacdp(cred.username, cred.password, logger.push);
        logger.push('info', 'lacdp', 'Authenticated with LACDP', { username: cred.username });
        break;
      } catch (error) {
        logger.push('error', 'lacdp', 'LACDP login failed', {
          error: serializeError(error),
          username: cred.username,
        });
      }
    }

    if (!session) {
      throw new Error('All LACDP credentials failed');
    }

    const products = await getSupabaseProducts(logger.push);
    stats.total = products.length;
    logger.push('info', 'system', 'Starting product stock sync', {
      concurrency: CONCURRENCY,
      totalProducts: products.length,
    });

    await processInBatches(products, CONCURRENCY, DELAY_MS, async (product) => {
      const stock = await fetchStockForProduct(session as LacdpSession, product, logger.push);

      if (stock === null) {
        stats.skipped += 1;
        return;
      }

      const ok = await patchStock(product.id, product.name, stock, logger.push);
      if (!ok) {
        stats.failed += 1;
        return;
      }

      stats.updated += 1;
      if ((product.stock ?? 0) > 0 && stock === 0) {
        ruptureProducts.push(product.name);
      }
    });

    const now = new Date();
    const since = new Date(now.getTime() - ORDERS_WINDOW_H * 60 * 60 * 1000);
    const timeLabel = now.toLocaleTimeString('fr-MA', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Casablanca',
    });

    const newOrders = await getNewOrders(since.toISOString(), logger.push);
    ordersCount = newOrders.length;

    if (newOrders.length > 0) {
      const lines = newOrders.map((order) => {
        const qty = Array.isArray(order.items)
          ? order.items.reduce((sum, item) => sum + (item.quantity ?? 1), 0)
          : '?';

        return [
          `🛒 #${order.id.slice(0, 8)} — ${order.total} MAD`,
          `👤 ${formatCustomerName(order.shipping_info)}  📍 ${order.shipping_info?.city ?? 'N/A'}  📞 ${order.shipping_info?.phone ?? 'N/A'}`,
          `📦 ${qty} article(s) [${order.status}]`,
        ].join('\n');
      });

      await sendTelegram(
        `🆕 Nouvelles commandes — ${timeLabel} (${newOrders.length})\n\n${lines.join('\n\n')}`,
        logger.push,
      );
    }

    if (ruptureProducts.length > 0) {
      await sendTelegram(
        `🔴 Rupture de stock — ${timeLabel} (${ruptureProducts.length} produits)\n\n${ruptureProducts.map((name) => `• ${name}`).join('\n')}`,
        logger.push,
      );
    }

    if (newOrders.length === 0 && ruptureProducts.length === 0) {
      await sendTelegram(
        `✅ Sync stock — ${timeLabel}\nMis à jour: ${stats.updated} | Ignorés: ${stats.skipped} | Échecs: ${stats.failed}`,
        logger.push,
      );
    }

    const completedAt = new Date().toISOString();
    logger.push('info', 'system', 'Stock sync completed', {
      failed: stats.failed,
      ordersCount,
      ruptureCount: ruptureProducts.length,
      skipped: stats.skipped,
      updated: stats.updated,
    });

    await completeRunLog({
      runId,
      status: 'success',
      completedAt,
      stats,
      ordersCount,
      ruptureProducts,
      logLines: logger.entries,
    });

    return {
      success: true,
      runId,
      startedAt,
      completedAt,
      triggerSource: params.triggerSource,
      stats,
      ordersCount,
      ruptureProducts,
    };
  } catch (error) {
    const completedAt = new Date().toISOString();
    const errorMessage = serializeError(error);

    logger.push('error', 'system', 'Stock sync failed', {
      error: errorMessage,
    });

    await completeRunLog({
      runId,
      status: 'error',
      completedAt,
      stats,
      ordersCount,
      ruptureProducts,
      logLines: logger.entries,
      errorMessage,
    });

    return {
      success: false,
      runId,
      startedAt,
      completedAt,
      triggerSource: params.triggerSource,
      stats,
      ordersCount,
      ruptureProducts,
      error: errorMessage,
    };
  }
}