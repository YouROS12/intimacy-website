'use server';

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import { cookies } from 'next/headers';
import {
    SeoIndexStatus,
    SeoInsightsCacheMeta,
    SeoInsightsDashboard,
    SeoInsightsSummary,
    SeoKeywordIdeas,
    SeoPageInsight,
    SeoQueryInsight,
} from '@/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://intimacy.ma';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const SEARCH_CONSOLE_PROPERTY = process.env.GOOGLE_SEARCH_CONSOLE_PROPERTY || `${SITE_URL.replace(/\/$/, '')}/`;
const MOROCCO_COUNTRY_CODE = 'mar';
const MOROCCO_COUNTRY_NAME = 'Morocco';
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
const CACHE_TTL_MINUTES = 360;

let supabaseAdmin: ReturnType<typeof createClient> | null = null;

type SearchAnalyticsRow = {
    keys?: string[];
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
};

type SearchAnalyticsResponse = {
    rows?: SearchAnalyticsRow[];
};

type UrlInspectionResponse = {
    inspectionResult?: {
        indexStatusResult?: {
            verdict?: string;
            coverageState?: string;
            indexingState?: string;
            lastCrawlTime?: string;
            googleCanonical?: string;
            userCanonical?: string;
            robotsTxtState?: string;
        };
    };
};

type UrlInspectionIndexStatusResult = NonNullable<
    NonNullable<UrlInspectionResponse['inspectionResult']>['indexStatusResult']
>;

type SitemapEntry = {
    url: string;
    lastmod: number;
};

type SeoInsightsSnapshotPayload = {
    property: string;
    country: string;
    generatedAt: string;
    periodStart: string;
    periodEnd: string;
    summary: SeoInsightsSummary;
    pages: SeoPageInsight[];
    notes: string[];
};

type SeoInsightsSnapshotRecord = {
    property: string;
    country: string;
    period_start: string;
    period_end: string;
    generated_at: string;
    payload: SeoInsightsSnapshotPayload;
};

type GetSeoInsightsOptions = {
    page?: number;
    pageSize?: number;
    forceRefresh?: boolean;
};

type SeoInsightsActionResult =
    | { ok: true; data: SeoInsightsDashboard }
    | { ok: false; error: string };

type GoogleApiErrorResponse = {
    error?: {
        code?: number;
        message?: string;
        status?: string;
        errors?: Array<{
            message?: string;
            reason?: string;
        }>;
    };
};

type SearchConsoleAuthContext = {
    auth: InstanceType<typeof google.auth.JWT>;
    clientEmail: string;
};

function getSupabaseAdmin() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error('Missing Supabase admin configuration. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.');
    }

    if (!supabaseAdmin) {
        supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    }

    return supabaseAdmin;
}

function getPublicSupabaseConfig() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing public Supabase auth configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    return {
        supabaseUrl,
        supabaseAnonKey,
    };
}

function toPublicSeoInsightsError(error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load Morocco SEO insights.';

    if (/Unauthorized/i.test(message)) {
        return 'Your session expired. Sign in again to load SEO insights.';
    }

    if (/Forbidden/i.test(message)) {
        return 'Admin access is required to load SEO insights.';
    }

    if (
        /Missing public Supabase auth configuration/i.test(message)
        || /Missing Supabase admin configuration/i.test(message)
        || /GOOGLE_INDEXING_KEY/i.test(message)
        || /GOOGLE_SEARCH_CONSOLE_PROPERTY/i.test(message)
        || /Search Console/i.test(message)
        || /Google service account authentication failed/i.test(message)
        || /Failed to fetch sitemap/i.test(message)
        || /Failed to reach sitemap/i.test(message)
    ) {
        return message;
    }

    return 'Failed to load Morocco SEO insights. Check Search Console and Supabase configuration.';
}

async function requireAdminUser() {
    const cookieStore = await cookies();
    const { supabaseUrl, supabaseAnonKey } = getPublicSupabaseConfig();
    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch {
                    }
                },
            },
        },
    );

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error('Unauthorized');
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
        throw new Error('Forbidden: Admin access required');
    }
}

function getSearchConsoleAuth(): SearchConsoleAuthContext {
    const raw = process.env.GOOGLE_INDEXING_KEY;
    if (!raw) {
        throw new Error('Missing GOOGLE_INDEXING_KEY. The service account key is required for Search Console access.');
    }

    let key: { client_email?: string; private_key?: string };

    try {
        key = JSON.parse(raw);
    } catch {
        throw new Error('GOOGLE_INDEXING_KEY is not valid JSON.');
    }

    if (!key.client_email || !key.private_key) {
        throw new Error('GOOGLE_INDEXING_KEY must include client_email and private_key.');
    }

    return {
        auth: new google.auth.JWT({
            email: key.client_email,
            key: key.private_key.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
        }),
        clientEmail: key.client_email,
    };
}

function roundMetric(value: number | null, digits = 1) {
    if (value === null || Number.isNaN(value)) return null;
    return Number(value.toFixed(digits));
}

function formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
}

function addMinutes(isoDate: string, minutes: number) {
    return new Date(new Date(isoDate).getTime() + minutes * 60 * 1000).toISOString();
}

function normalizeProperty(property: string) {
    const trimmed = property.trim();

    if (!trimmed) {
        throw new Error('GOOGLE_SEARCH_CONSOLE_PROPERTY is empty. Use a URL-prefix property like https://intimacy.ma/ or a domain property like sc-domain:intimacy.ma.');
    }

    if (trimmed.startsWith('sc-domain:')) {
        return trimmed;
    }

    if (!/^https?:\/\//i.test(trimmed)) {
        throw new Error(`Invalid GOOGLE_SEARCH_CONSOLE_PROPERTY \"${trimmed}\". Use a URL-prefix property like https://intimacy.ma/ or a domain property like sc-domain:intimacy.ma.`);
    }

    return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

function getGoogleApiErrorDetails(error: unknown) {
    const errorRecord = error as {
        code?: number;
        message?: string;
        response?: {
            status?: number;
            data?: GoogleApiErrorResponse | string;
        };
    };

    const responseData = errorRecord.response?.data;
    const apiError = typeof responseData === 'string' ? undefined : responseData?.error;
    const apiReasons = apiError?.errors
        ?.map((item) => item.message || item.reason)
        .filter((value): value is string => Boolean(value));

    return {
        status: errorRecord.response?.status ?? apiError?.code ?? errorRecord.code,
        message: apiError?.message || apiReasons?.join('; ') || errorRecord.message || 'Unknown Google API error.',
    };
}

function getDomainPropertySuggestion(property: string) {
    if (property.startsWith('sc-domain:')) {
        return property;
    }

    try {
        const hostname = new URL(property).hostname;
        return hostname ? `sc-domain:${hostname}` : null;
    } catch {
        return null;
    }
}

async function fetchSitemapUrls(): Promise<SitemapEntry[]> {
    let response: Response;

    try {
        response = await fetch(SITEMAP_URL, { next: { revalidate: 0 } });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to reach sitemap at ${SITEMAP_URL}. Check NEXT_PUBLIC_SITE_URL and the public site deployment. ${message}`);
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch sitemap at ${SITEMAP_URL}: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    const entries: SitemapEntry[] = [];
    const urlBlocks = xml.split(/<url>|<\/url>/i);

    for (const block of urlBlocks) {
        const locMatch = block.match(/<loc>\s*(https?:\/\/[^<]+)\s*<\/loc>/i);
        if (!locMatch) continue;

        const lastmodMatch = block.match(/<lastmod>\s*([^<]+)\s*<\/lastmod>/i);
        entries.push({
            url: locMatch[1].trim(),
            lastmod: lastmodMatch ? new Date(lastmodMatch[1]).getTime() : 0,
        });
    }

    return entries.sort((left, right) => right.lastmod - left.lastmod);
}

async function querySearchConsole<T>(path: string, body: Record<string, unknown>) {
    const { auth, clientEmail } = getSearchConsoleAuth();
    const property = normalizeProperty(SEARCH_CONSOLE_PROPERTY);
    const domainPropertySuggestion = getDomainPropertySuggestion(property);

    try {
        const response = await auth.request<T>({
            url: `https://searchconsole.googleapis.com${path}`,
            method: 'POST',
            data: body,
        });

        return response.data;
    } catch (error) {
        const { status, message } = getGoogleApiErrorDetails(error);

        console.error('Search Console API request failed:', {
            path,
            property,
            status,
            message,
        });

        if (status === 403) {
            const propertyHint = domainPropertySuggestion && domainPropertySuggestion !== property
                ? ` If you verified the site as ${domainPropertySuggestion}, either set GOOGLE_SEARCH_CONSOLE_PROPERTY to ${domainPropertySuggestion} or add the same account to ${property}.`
                : '';

            throw new Error(`Search Console access denied for property ${property}. Grant ${clientEmail} Full or Owner access in Google Search Console.${propertyHint}`);
        }

        if (status === 401 || /invalid_grant|invalid_client|jwt/i.test(message)) {
            throw new Error(`Google service account authentication failed. Check GOOGLE_INDEXING_KEY. Google API said: ${message}`);
        }

        if (status === 404) {
            const propertyHint = domainPropertySuggestion && domainPropertySuggestion !== property
                ? ` If Search Console only has ${domainPropertySuggestion}, use that value for GOOGLE_SEARCH_CONSOLE_PROPERTY.`
                : '';

            throw new Error(`Search Console property ${property} was not found. Verify GOOGLE_SEARCH_CONSOLE_PROPERTY matches the exact property in Google Search Console.${propertyHint}`);
        }

        if (status === 400) {
            throw new Error(`Search Console request failed for property ${property} (400). Verify GOOGLE_SEARCH_CONSOLE_PROPERTY matches the exact property in Google Search Console. URL-prefix properties must include the full URL and trailing slash. Google API said: ${message}`);
        }

        if (status) {
            throw new Error(`Search Console request failed for property ${property} (${status}). Google API said: ${message}`);
        }

        throw new Error(`Search Console request failed for property ${property}. ${message}`);
    }
}

async function fetchPagePerformance(periodStart: string, periodEnd: string) {
    const property = encodeURIComponent(normalizeProperty(SEARCH_CONSOLE_PROPERTY));
    const response = await querySearchConsole<SearchAnalyticsResponse>(
        `/webmasters/v3/sites/${property}/searchAnalytics/query`,
        {
            startDate: periodStart,
            endDate: periodEnd,
            dimensions: ['page'],
            rowLimit: 5000,
            dimensionFilterGroups: [
                {
                    filters: [
                        {
                            dimension: 'country',
                            operator: 'equals',
                            expression: MOROCCO_COUNTRY_CODE,
                        },
                    ],
                },
            ],
        },
    );

    return response.rows ?? [];
}

async function fetchPageQueries(periodStart: string, periodEnd: string) {
    const property = encodeURIComponent(normalizeProperty(SEARCH_CONSOLE_PROPERTY));
    const response = await querySearchConsole<SearchAnalyticsResponse>(
        `/webmasters/v3/sites/${property}/searchAnalytics/query`,
        {
            startDate: periodStart,
            endDate: periodEnd,
            dimensions: ['page', 'query'],
            rowLimit: 5000,
            dimensionFilterGroups: [
                {
                    filters: [
                        {
                            dimension: 'country',
                            operator: 'equals',
                            expression: MOROCCO_COUNTRY_CODE,
                        },
                    ],
                },
            ],
        },
    );

    return response.rows ?? [];
}

function getPathKeywordSeeds(url: string) {
    const pathname = new URL(url).pathname;
    const segments = pathname.split('/').filter(Boolean);
    const rawSeed = decodeURIComponent(segments[segments.length - 1] || '')
        .replace(/[-_]+/g, ' ')
        .replace(/\b(product|guide|education|solution|shop|about|faq|legal|privacy|terms|returns)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

    const seeds = rawSeed ? [rawSeed] : [];
    if (rawSeed.split(' ').length > 2) {
        seeds.push(rawSeed.split(' ').slice(0, 2).join(' '));
    }

    return [...new Set(seeds.filter(Boolean))];
}

function buildKeywordIdeas(url: string, topQueries: SeoQueryInsight[]): SeoKeywordIdeas {
    const shortTailQueries = topQueries
        .filter((query) => query.query.trim().split(/\s+/).length <= 3)
        .sort((left, right) => right.impressions - left.impressions)
        .map((query) => query.query);

    const longTailQueries = topQueries
        .filter((query) => query.query.trim().split(/\s+/).length >= 4)
        .sort((left, right) => right.impressions - left.impressions)
        .map((query) => query.query);

    const quickWins = topQueries
        .filter((query) => query.impressions >= 20 && query.position >= 8 && query.position <= 20)
        .map((query) => query.query);

    const seeds = getPathKeywordSeeds(url);
    const pathname = new URL(url).pathname;
    const isCommercePage = pathname.includes('/product/') || pathname.includes('/shop');
    const isGuidePage = pathname.includes('/guide/') || pathname.includes('/education/');

    const modifiers = isCommercePage
        ? ['maroc', 'prix maroc', 'acheter maroc', 'livraison maroc', 'المغرب', 'السعر', 'شراء المغرب', 'morocco', 'price morocco']
        : isGuidePage
            ? ['au maroc', 'casablanca', 'comment', 'guide maroc', 'المغرب', 'كيف', 'symptomes maroc', 'morocco guide']
            : ['maroc', 'المغرب', 'morocco'];

    const heuristicLongTail = seeds.flatMap((seed) => modifiers.map((modifier) => `${seed} ${modifier}`));
    const heuristicShortTail = seeds.slice(0, 3);

    return {
        shortTail: [...new Set([...shortTailQueries, ...heuristicShortTail])].slice(0, 5),
        longTail: [...new Set([...longTailQueries, ...heuristicLongTail])].slice(0, 5),
        quickWins: [...new Set(quickWins)].slice(0, 5),
    };
}

function mapIndexStatus(result?: UrlInspectionIndexStatusResult): SeoIndexStatus {
    if (!result) return 'unknown';

    const verdict = (result.verdict || '').toLowerCase();
    const coverage = (result.coverageState || '').toLowerCase();
    const robotsState = (result.robotsTxtState || '').toLowerCase();
    const indexingState = (result.indexingState || '').toLowerCase();

    if (robotsState.includes('blocked') || coverage.includes('blocked')) return 'blocked';
    if (coverage.includes('indexed') || verdict.includes('pass')) return 'indexed';
    if (coverage.includes('not indexed') || coverage.includes('discovered') || indexingState.includes('not')) return 'not_indexed';
    return 'unknown';
}

async function inspectUrl(url: string) {
    try {
        const response = await querySearchConsole<UrlInspectionResponse>('/v1/urlInspection/index:inspect', {
            inspectionUrl: url,
            siteUrl: normalizeProperty(SEARCH_CONSOLE_PROPERTY),
            languageCode: 'fr-FR',
        });

        const result = response.inspectionResult?.indexStatusResult;
        return {
            indexStatus: mapIndexStatus(result),
            indexCoverageState: result?.coverageState || null,
            lastCrawlTime: result?.lastCrawlTime || null,
            googleCanonical: result?.googleCanonical || null,
            userCanonical: result?.userCanonical || null,
            inspectionError: null,
        } satisfies Pick<SeoPageInsight, 'indexStatus' | 'indexCoverageState' | 'lastCrawlTime' | 'googleCanonical' | 'userCanonical' | 'inspectionError'>;
    } catch (error) {
        return {
            indexStatus: 'error',
            indexCoverageState: null,
            lastCrawlTime: null,
            googleCanonical: null,
            userCanonical: null,
            inspectionError: error instanceof Error ? error.message : String(error),
        } satisfies Pick<SeoPageInsight, 'indexStatus' | 'indexCoverageState' | 'lastCrawlTime' | 'googleCanonical' | 'userCanonical' | 'inspectionError'>;
    }
}

async function processInBatches<T, R>(items: T[], batchSize: number, handler: (item: T) => Promise<R>) {
    const output: R[] = [];

    for (let index = 0; index < items.length; index += batchSize) {
        const batch = items.slice(index, index + batchSize);
        const results = await Promise.all(batch.map(handler));
        output.push(...results);
    }

    return output;
}

function buildCacheMeta(source: SeoInsightsCacheMeta['source'], generatedAt: string): SeoInsightsCacheMeta {
    return {
        source,
        snapshotCreatedAt: generatedAt,
        cacheAgeMinutes: Math.max(0, Math.round((Date.now() - new Date(generatedAt).getTime()) / 60000)),
        expiresAt: addMinutes(generatedAt, CACHE_TTL_MINUTES),
    };
}

function paginateSnapshot(
    snapshot: SeoInsightsSnapshotPayload,
    page: number,
    pageSize: number,
    source: SeoInsightsCacheMeta['source'],
): SeoInsightsDashboard {
    const totalUrls = snapshot.pages.length;
    const totalPages = totalUrls === 0 ? 1 : Math.ceil(totalUrls / pageSize);
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const startOffset = (currentPage - 1) * pageSize;
    const currentPages = snapshot.pages.slice(startOffset, startOffset + pageSize);
    const startIndex = totalUrls === 0 ? 0 : startOffset + 1;
    const endIndex = startOffset + currentPages.length;

    return {
        ...snapshot,
        pages: currentPages,
        pagination: {
            page: currentPage,
            pageSize,
            totalPages,
            totalUrls,
            startIndex,
            endIndex,
            hasPrevious: currentPage > 1,
            hasNext: currentPage < totalPages,
        },
        cache: buildCacheMeta(source, snapshot.generatedAt),
    };
}

function isCacheUsable(record: SeoInsightsSnapshotRecord | null, periodStart: string, periodEnd: string) {
    if (!record) return false;
    if (record.period_start !== periodStart || record.period_end !== periodEnd) return false;
    return Date.now() - new Date(record.generated_at).getTime() <= CACHE_TTL_MINUTES * 60 * 1000;
}

async function getCachedSnapshot(periodStart: string, periodEnd: string): Promise<SeoInsightsSnapshotRecord | null> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabaseAdmin = getSupabaseAdmin() as any;
        const { data, error } = await supabaseAdmin
            .from('seo_insights_snapshots')
            .select('property, country, period_start, period_end, generated_at, payload')
            .eq('property', normalizeProperty(SEARCH_CONSOLE_PROPERTY))
            .eq('country', MOROCCO_COUNTRY_NAME)
            .single();

        if (error) {
            if (error.code === 'PGRST116' || /does not exist/i.test(error.message)) {
                return null;
            }

            console.error('Error reading SEO insights cache:', error);
            return null;
        }

        const record = data as SeoInsightsSnapshotRecord;
        return isCacheUsable(record, periodStart, periodEnd) ? record : null;
    } catch (error) {
        console.error('Unexpected SEO insights cache read error:', error);
        return null;
    }
}

async function saveSnapshot(snapshot: SeoInsightsSnapshotPayload) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabaseAdmin = getSupabaseAdmin() as any;
        const { error } = await supabaseAdmin.from('seo_insights_snapshots').upsert(
            {
                property: snapshot.property,
                country: snapshot.country,
                period_start: snapshot.periodStart,
                period_end: snapshot.periodEnd,
                generated_at: snapshot.generatedAt,
                payload: snapshot,
                updated_at: new Date().toISOString(),
            },
            {
                onConflict: 'property,country',
            },
        );

        if (error && !/does not exist/i.test(error.message)) {
            console.error('Error writing SEO insights cache:', error);
        }
    } catch (error) {
        console.error('Unexpected SEO insights cache write error:', error);
    }
}

async function buildSnapshot(periodStart: string, periodEnd: string): Promise<SeoInsightsSnapshotPayload> {
    const [sitemapUrls, pageRows, pageQueryRows] = await Promise.all([
        fetchSitemapUrls(),
        fetchPagePerformance(periodStart, periodEnd),
        fetchPageQueries(periodStart, periodEnd),
    ]);

    const performanceByPage = new Map<string, SearchAnalyticsRow>();
    for (const row of pageRows) {
        const page = row.keys?.[0];
        if (!page) continue;
        performanceByPage.set(page, row);
    }

    const queriesByPage = new Map<string, SeoQueryInsight[]>();
    for (const row of pageQueryRows) {
        const page = row.keys?.[0];
        const query = row.keys?.[1];
        if (!page || !query) continue;

        const queryInsight: SeoQueryInsight = {
            query,
            clicks: row.clicks ?? 0,
            impressions: row.impressions ?? 0,
            ctr: roundMetric(row.ctr ?? 0, 3) ?? 0,
            position: roundMetric(row.position ?? 0, 1) ?? 0,
        };

        const pageQueries = queriesByPage.get(page) ?? [];
        pageQueries.push(queryInsight);
        queriesByPage.set(page, pageQueries);
    }

    for (const [page, queries] of queriesByPage.entries()) {
        queries.sort((left, right) => right.impressions - left.impressions);
        queriesByPage.set(page, queries.slice(0, 6));
    }

    const priorityPages = [...performanceByPage.entries()]
        .sort((left, right) => (right[1].impressions ?? 0) - (left[1].impressions ?? 0))
        .map(([page]) => page);

    const selectedPages = [...new Set([...priorityPages, ...sitemapUrls.map((entry) => entry.url)])];

    const inspections = await processInBatches(selectedPages, 5, async (page) => ({
        page,
        ...(await inspectUrl(page)),
    }));

    const inspectionByPage = new Map(inspections.map((inspection) => [inspection.page, inspection]));

    const pages: SeoPageInsight[] = selectedPages.map((page) => {
        const performance = performanceByPage.get(page);
        const topQueries = queriesByPage.get(page) ?? [];
        const inspection = inspectionByPage.get(page);

        return {
            url: page,
            clicks: performance?.clicks ?? 0,
            impressions: performance?.impressions ?? 0,
            ctr: roundMetric(performance?.ctr ?? 0, 3) ?? 0,
            position: performance?.position !== undefined ? roundMetric(performance.position, 1) : null,
            topQueries,
            keywordIdeas: buildKeywordIdeas(page, topQueries),
            indexStatus: inspection?.indexStatus ?? 'unknown',
            indexCoverageState: inspection?.indexCoverageState ?? null,
            lastCrawlTime: inspection?.lastCrawlTime ?? null,
            googleCanonical: inspection?.googleCanonical ?? null,
            userCanonical: inspection?.userCanonical ?? null,
            inspectionError: inspection?.inspectionError ?? null,
        };
    });

    const totalClicks = pages.reduce((sum, page) => sum + page.clicks, 0);
    const totalImpressions = pages.reduce((sum, page) => sum + page.impressions, 0);
    const pagesWithPosition = pages.filter((page) => page.position !== null);
    const averagePosition = pagesWithPosition.length > 0
        ? roundMetric(
            pagesWithPosition.reduce((sum, page) => sum + (page.position ?? 0), 0) / pagesWithPosition.length,
            1,
        )
        : null;

    return {
        property: normalizeProperty(SEARCH_CONSOLE_PROPERTY),
        country: MOROCCO_COUNTRY_NAME,
        generatedAt: new Date().toISOString(),
        periodStart,
        periodEnd,
        summary: {
            selectedPages: pages.length,
            pagesWithPerformance: pages.filter((page) => page.impressions > 0).length,
            inspectedPages: pages.filter((page) => page.indexStatus !== 'error').length,
            indexedPages: pages.filter((page) => page.indexStatus === 'indexed').length,
            notIndexedPages: pages.filter((page) => page.indexStatus === 'not_indexed').length,
            blockedPages: pages.filter((page) => page.indexStatus === 'blocked').length,
            totalClicks,
            totalImpressions,
            averagePosition,
            quickWinPages: pages.filter((page) => page.keywordIdeas.quickWins.length > 0).length,
            ctrOpportunityPages: pages.filter((page) => page.impressions >= 50 && (page.position ?? 99) <= 10 && page.ctr < 0.03).length,
        },
        pages,
        notes: [
            'Morocco performance is filtered with country code MAR in Google Search Console.',
            'Full-site snapshots are cached in Supabase for faster reloads and lower URL Inspection usage.',
            'Potential keywords are heuristic suggestions based on Search Console queries, URL slugs, and Morocco-focused modifiers.',
            'The service account from GOOGLE_INDEXING_KEY must have access to the Search Console property to load this data.',
        ],
    };
}

export async function getSeoInsights(options: GetSeoInsightsOptions = {}): Promise<SeoInsightsActionResult> {
    try {
        await requireAdminUser();

        const requestedPageSize = Number.isFinite(options.pageSize) ? Number(options.pageSize) : DEFAULT_PAGE_SIZE;
        const pageSize = Math.max(10, Math.min(requestedPageSize, MAX_PAGE_SIZE));
        const requestedPage = Number.isFinite(options.page) ? Number(options.page) : 1;
        const page = Math.max(1, requestedPage);
        const forceRefresh = options.forceRefresh === true;

        const periodEndDate = new Date();
        periodEndDate.setDate(periodEndDate.getDate() - 2);

        const periodStartDate = new Date(periodEndDate);
        periodStartDate.setDate(periodStartDate.getDate() - 27);

        const periodStart = formatDate(periodStartDate);
        const periodEnd = formatDate(periodEndDate);

        if (!forceRefresh) {
            const cachedSnapshot = await getCachedSnapshot(periodStart, periodEnd);
            if (cachedSnapshot?.payload) {
                return {
                    ok: true,
                    data: paginateSnapshot(cachedSnapshot.payload, page, pageSize, 'cache'),
                };
            }
        }

        const snapshot = await buildSnapshot(periodStart, periodEnd);
        await saveSnapshot(snapshot);

        return {
            ok: true,
            data: paginateSnapshot(snapshot, page, pageSize, 'live'),
        };
    } catch (error) {
        console.error('Failed to load SEO insights:', error);

        return {
            ok: false,
            error: toPublicSeoInsightsError(error),
        };
    }
}