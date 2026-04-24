import 'server-only';

import { generateSlug } from '@/utils/slugHelpers';
import { LacdpCatalogMeta, LacdpCatalogProduct, ProductCategory } from '@/types';

const LACDP_BASE = 'https://webdash.lacdp.ma';
const LOGIN_URL = `${LACDP_BASE}/login`;
const FILTER_URL = `${LACDP_BASE}/client_dash/filter_product`;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0.0.0 Intimacy/1.0';
const SWEEP_QUERIES = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
const SWEEP_BATCH_SIZE = 4;
const SWEEP_BATCH_DELAY_MS = 100;

const LACDP_CREDS = [
    { username: process.env.LACDP_USER_1 ?? '', password: process.env.LACDP_PASS_1 ?? '' },
    { username: process.env.LACDP_USER_2 ?? '', password: process.env.LACDP_PASS_2 ?? '' },
];

interface LacdpSession {
    cookieStr: string;
    basicAuth: string;
}

type LacdpRawProduct = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
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

function pickFirstString(item: LacdpRawProduct, keys: string[]): string | null {
    for (const key of keys) {
        const value = item[key];
        if (typeof value === 'string' && value.trim()) return value.trim();
        if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    }

    return null;
}

function parseNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value !== 'string') return null;

    const cleaned = value.replace(/[^0-9,.-]/g, '').trim();
    if (!cleaned) return null;

    const normalized = cleaned.includes(',') && cleaned.includes('.')
        ? cleaned.replace(/,/g, '')
        : cleaned.replace(',', '.');
    const parsed = Number.parseFloat(normalized);

    return Number.isFinite(parsed) ? parsed : null;
}

function pickFirstNumber(item: LacdpRawProduct, keys: string[]): number | null {
    for (const key of keys) {
        const parsed = parseNumber(item[key]);
        if (parsed !== null) return parsed;
    }

    return null;
}

function normalizeWhitespace(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
}

function toAbsoluteLacdpUrl(value: string | null): string | undefined {
    if (!value) return undefined;

    if (value.startsWith('http://') || value.startsWith('https://')) {
        return value;
    }

    if (value.startsWith('//')) {
        return `https:${value}`;
    }

    return `${LACDP_BASE}/${value.replace(/^\/+/, '')}`;
}

async function loginLacdp(username: string, password: string): Promise<LacdpSession> {
    const pageRes = await fetch(LOGIN_URL, {
        cache: 'no-store',
        headers: { 'User-Agent': USER_AGENT },
    });

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

async function createLacdpSession(): Promise<LacdpSession> {
    const availableCreds = LACDP_CREDS.filter((cred) => cred.username && cred.password);
    if (availableCreds.length === 0) {
        throw new Error('No LACDP credentials configured');
    }

    for (const cred of availableCreds) {
        try {
            return await loginLacdp(cred.username, cred.password);
        } catch {
            continue;
        }
    }

    throw new Error('All LACDP credentials failed');
}

async function fetchCatalogQuery(session: LacdpSession, title: string): Promise<LacdpRawProduct[]> {
    const url = new URL(FILTER_URL);
    url.searchParams.set('title', title);

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
        throw new Error(`LACDP catalog request failed (HTTP ${res.status})`);
    }

    const data: unknown = await res.json();
    if (Array.isArray(data)) {
        return data.filter(isRecord);
    }

    if (isRecord(data) && Array.isArray(data.data)) {
        return data.data.filter(isRecord);
    }

    return [];
}

async function wait(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

async function sweepCatalogQueries(session: LacdpSession): Promise<LacdpRawProduct[]> {
    const allItems: LacdpRawProduct[] = [];

    for (let index = 0; index < SWEEP_QUERIES.length; index += SWEEP_BATCH_SIZE) {
        const batch = SWEEP_QUERIES.slice(index, index + SWEEP_BATCH_SIZE);
        const batchResults = await Promise.all(
            batch.map((query) => fetchCatalogQuery(session, query).catch(() => []))
        );

        allItems.push(...batchResults.flat());

        if (index + SWEEP_BATCH_SIZE < SWEEP_QUERIES.length) {
            await wait(SWEEP_BATCH_DELAY_MS);
        }
    }

    return allItems;
}

function buildSourceId(item: LacdpRawProduct, name: string, brand?: string): string {
    const explicitId = pickFirstString(item, [
        'id',
        'product_id',
        'item_id',
        'reference',
        'ref',
        'sku',
        'code',
    ]);

    if (explicitId) return explicitId;

    const fallback = generateSlug([brand, name].filter(Boolean).join(' '));
    return fallback || generateSlug(name) || `lacdp-${Date.now()}`;
}

function normalizeCatalogProduct(item: LacdpRawProduct): LacdpCatalogProduct | null {
    const name = pickFirstString(item, [
        'title',
        'name',
        'product_name',
        'designation',
        'label',
        'product',
    ]);

    if (!name) return null;

    const brand = pickFirstString(item, ['brand', 'marque', 'brand_name', 'manufacturer', 'supplier']) ?? undefined;
    const sourceId = buildSourceId(item, name, brand);
    const normalizedName = generateSlug(name);
    const description = normalizeWhitespace(
        pickFirstString(item, ['description', 'details', 'short_description', 'content'])
            ?? `${name} importé depuis LACDP.`
    );
    const imageUrl = toAbsoluteLacdpUrl(
        pickFirstString(item, ['image_url', 'image', 'photo', 'thumbnail', 'img', 'picture'])
    );
    const price = Math.max(0, pickFirstNumber(item, ['price', 'price_1', 'public_price', 'sale_price', 'prix']) ?? 0);
    const stock = Math.max(0, Math.trunc(pickFirstNumber(item, ['stock_1', 'stock', 'quantity', 'qty', 'qte']) ?? 0));

    return {
        id: `lacdp-${sourceId}`,
        sourceId,
        name: normalizeWhitespace(name),
        normalizedName,
        description,
        category: ProductCategory.DIETARY_SUPPLEMENT,
        brand,
        imageUrl,
        price,
        stock,
        raw: item,
    };
}

export function buildCatalogMatchKey(name: string, brand?: string | null): string {
    return generateSlug([brand ?? '', name].filter(Boolean).join(' ')) || generateSlug(name);
}

export async function fetchLacdpCatalog(): Promise<{
    products: LacdpCatalogProduct[];
    meta: LacdpCatalogMeta;
}> {
    const session = await createLacdpSession();
    let rawItems: LacdpRawProduct[] = [];
    let queryMode: LacdpCatalogMeta['queryMode'] = 'empty-search';

    try {
        rawItems = await fetchCatalogQuery(session, '');
    } catch {
        rawItems = [];
    }

    if (rawItems.length === 0) {
        queryMode = 'alpha-sweep';
        rawItems = await sweepCatalogQueries(session);
    }

    const deduped = new Map<string, LacdpCatalogProduct>();
    for (const item of rawItems) {
        const normalized = normalizeCatalogProduct(item);
        if (!normalized) continue;

        const dedupeKey = `${normalized.sourceId}::${buildCatalogMatchKey(normalized.name, normalized.brand)}`;
        if (!deduped.has(dedupeKey)) {
            deduped.set(dedupeKey, normalized);
        }
    }

    const products = Array.from(deduped.values()).sort((left, right) =>
        left.name.localeCompare(right.name, 'fr', { sensitivity: 'base' })
    );

    return {
        products,
        meta: {
            queryMode,
            rawCount: rawItems.length,
            uniqueCount: products.length,
        },
    };
}