
export enum UserRole {
    GUEST = 'guest',
    USER = 'user',
    ADMIN = 'admin'
}

export interface User {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
    phone?: string;
    address?: string;
    isAnonymous?: boolean; // True if user is signed in anonymously (not yet converted to permanent)
}

export enum ProductCategory {
    LUBRICANT = 'Lubricant',
    CONDOMS = 'Condoms',
    DELAY = 'Delay Spray/Cream',
    KIT = 'Wellness Kit',
    INTIMATE_GEL = 'Intimate Gel',
    DIETARY_SUPPLEMENT = 'Dietary Supplement'
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: ProductCategory;
    brand?: string;
    imageUrl?: string;
    image_url?: string; // Supabase convention
    stock: number;
    features: string[];
    is_featured?: boolean;
    show_on_homepage?: boolean;
    seo_title?: string;
    seo_description?: string;
    seo_slug?: string;
    external_source?: string;
    external_id?: string;
    external_image_url?: string;
    source_payload?: Record<string, unknown>;
    created_at?: string;
    updated_at?: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Order {
    id: string;
    user_id: string | null; // null for guest orders
    items: CartItem[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    created_at: string;
    confirmed_at?: string; // When admin confirmed order
    shipped_at?: string; // When order was shipped
    delivered_at?: string; // When order was delivered
    cancelled_at?: string; // When order was cancelled
    returned_at?: string; // When order was returned
    shipping_info?: {
        first_name: string;
        last_name: string;
        address: string;
        city: string;
        phone: string;
        guest_email?: string; // For guest orders with optional account creation
    };
}

export type StockSyncTriggerSource = 'cron' | 'manual';

export interface StockSyncStats {
    updated: number;
    skipped: number;
    failed: number;
    total: number;
    outOfStockTotal?: number;
}

export interface StockSyncLogEntry {
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    scope: 'system' | 'lacdp' | 'supabase' | 'telegram';
    message: string;
    meta?: Record<string, string | number | boolean | null>;
}

export interface StockSyncRunRecord {
    id: number;
    trigger_source: StockSyncTriggerSource;
    initiated_by: string | null;
    status: 'running' | 'success' | 'error';
    started_at: string;
    completed_at: string | null;
    stats: StockSyncStats | null;
    orders_count: number;
    rupture_products: string[];
    error_message: string | null;
    log_lines: StockSyncLogEntry[];
    created_at: string;
}

export interface StockSyncResult {
    success: boolean;
    runId: number | null;
    startedAt: string;
    completedAt: string;
    triggerSource: StockSyncTriggerSource;
    stats: StockSyncStats;
    ordersCount: number;
    ruptureProducts: string[];
    error?: string;
}

export interface LacdpCatalogMeta {
    queryMode: 'empty-search' | 'alpha-sweep';
    rawCount: number;
    uniqueCount: number;
    existingMatches?: number;
}

export interface LacdpCatalogProduct {
    id: string;
    sourceId: string;
    name: string;
    normalizedName: string;
    description: string;
    category: ProductCategory;
    brand?: string;
    imageUrl?: string;
    price: number;
    stock: number;
    raw: Record<string, unknown>;
    existingProductId?: string | null;
    existingProductName?: string | null;
    matchReason?: 'external_id' | 'name_slug' | null;
}

export interface LacdpCatalogResult {
    success: boolean;
    fetchedAt: string;
    products: LacdpCatalogProduct[];
    meta?: LacdpCatalogMeta;
    error?: string;
}

export interface LacdpImportResult {
    success: boolean;
    imported: boolean;
    alreadyExists?: boolean;
    productId?: string;
    productName?: string;
    productSlug?: string;
    error?: string;
}

export type SeoIndexStatus = 'indexed' | 'not_indexed' | 'blocked' | 'unknown' | 'error';

export interface SeoQueryInsight {
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

export interface SeoKeywordIdeas {
    shortTail: string[];
    longTail: string[];
    quickWins: string[];
}

export interface SeoPageInsight {
    url: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number | null;
    topQueries: SeoQueryInsight[];
    keywordIdeas: SeoKeywordIdeas;
    indexStatus: SeoIndexStatus;
    indexCoverageState: string | null;
    lastCrawlTime: string | null;
    googleCanonical: string | null;
    userCanonical: string | null;
    inspectionError: string | null;
}

export interface SeoInsightsSummary {
    selectedPages: number;
    pagesWithPerformance: number;
    inspectedPages: number;
    indexedPages: number;
    notIndexedPages: number;
    blockedPages: number;
    totalClicks: number;
    totalImpressions: number;
    averagePosition: number | null;
    quickWinPages: number;
    ctrOpportunityPages: number;
}

export interface SeoInsightsPagination {
    page: number;
    pageSize: number;
    totalPages: number;
    totalUrls: number;
    startIndex: number;
    endIndex: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

export interface SeoInsightsCacheMeta {
    source: 'live' | 'cache';
    snapshotCreatedAt: string | null;
    cacheAgeMinutes: number | null;
    expiresAt: string | null;
}

export interface SeoInsightsDashboard {
    property: string;
    country: string;
    generatedAt: string;
    periodStart: string;
    periodEnd: string;
    summary: SeoInsightsSummary;
    pages: SeoPageInsight[];
    notes: string[];
    pagination: SeoInsightsPagination;
    cache: SeoInsightsCacheMeta;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

// --- JSON Blog Engine Types ---

// Re-export Zod inferred types to ensure Single Source of Truth
// We import generic types but we don't want to import the run-time schemas here to keep types.ts pure if possible.
// However, since we need z.infer, we must import the schema or the type.
// Let's import the TYPES from validation, assuming they are exported.
import { SafeBlogContent, SafeBlogBlock } from './lib/validation';

export type BlogTheme = 'educational_deep_dive' | 'product_showcase' | 'listicle';

// Alias for backward compatibility
export type BlogContent = SafeBlogContent;
export type BlogBlock = SafeBlogBlock;

// We can keep specific block interfaces if needed for component props, 
// by extracting then from the Union if possible, or just defining them as aliases to the Specific Zod types.
// For now, components can accept `SafeBlogBlock` or cast.

// Re-defining these strictly for the Block Components to use
export interface HeroBlock {
    type: 'hero';
    heading: string;
    subheading?: string;
    image?: string;
    id?: string;
}

export interface TextBlock {
    type: 'text';
    content: string;
    title?: string;
    id?: string;
}

export interface QuoteBlock {
    type: 'quote';
    content: string;
    author?: string;
    role?: string;
    id?: string;
}

export interface ProductGridBlock {
    type: 'product_grid';
    productIds: string[];
    title?: string;
    id?: string;
}

export interface AlertBlock {
    type: 'alert';
    variant: 'info' | 'warning' | 'tip';
    content: string;
    id?: string;
}

export interface ImageGroupBlock {
    type: 'image_group';
    images: { url: string; caption?: string }[];
    id?: string;
}
