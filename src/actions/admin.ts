'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
    LacdpCatalogProduct,
    LacdpCatalogResult,
    LacdpImportResult,
    Order,
    Product,
    ProductCategory,
    StockSyncResult,
    StockSyncRunRecord,
} from '@/types';
import { fetchLacdpCatalog, buildCatalogMatchKey } from '@/lib/lacdp';
import { runStockSync } from '@/lib/stock-sync';
import { generateSlug } from '@/utils/slugHelpers';

// Initialize Service Role Client (Bypasses RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type AdminProductRow = Product & {
    image_url?: string | null;
    external_source?: string | null;
    external_id?: string | null;
    seo_slug?: string | null;
};

function serializeError(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

async function getAdminProductRows(): Promise<AdminProductRow[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminClient = supabaseAdmin as any;
    const { data, error } = await adminClient
        .from('products')
        .select('*')
        .order('name');

    if (error) {
        throw new Error(`Failed to load products: ${error.message}`);
    }

    return (data as AdminProductRow[]) ?? [];
}

function findExistingProductMatch(candidate: LacdpCatalogProduct, products: AdminProductRow[]) {
    const externalMatch = products.find(
        (product) => product.external_source === 'lacdp' && product.external_id === candidate.sourceId
    );
    if (externalMatch) {
        return { product: externalMatch, reason: 'external_id' as const };
    }

    const candidateKey = buildCatalogMatchKey(candidate.name, candidate.brand);
    const candidateNameOnlyKey = generateSlug(candidate.name);

    const nameMatch = products.find((product) => {
        const productKey = buildCatalogMatchKey(product.name, product.brand);
        return productKey === candidateKey || generateSlug(product.name) === candidateNameOnlyKey;
    });

    if (nameMatch) {
        return { product: nameMatch, reason: 'name_slug' as const };
    }

    return null;
}

function buildUniqueSeoSlug(name: string, products: AdminProductRow[]): string {
    const usedSlugs = new Set(
        products
            .map((product) => product.seo_slug || generateSlug(product.name))
            .filter(Boolean)
    );

    const baseSlug = generateSlug(name) || 'product';
    if (!usedSlugs.has(baseSlug)) return baseSlug;

    let suffix = 2;
    while (usedSlugs.has(`${baseSlug}-${suffix}`)) {
        suffix += 1;
    }

    return `${baseSlug}-${suffix}`;
}

function buildImportedDescription(candidate: LacdpCatalogProduct): string {
    const cleaned = candidate.description.replace(/\s+/g, ' ').trim();
    if (cleaned && cleaned !== candidate.name) {
        return cleaned;
    }

    const brandPart = candidate.brand ? ` de ${candidate.brand}` : '';
    return `${candidate.name}${brandPart} disponible sur Intimacy Wellness Maroc avec livraison discrète partout au Maroc.`;
}

function buildImportedSeoTitle(candidate: LacdpCatalogProduct): string {
    const brandPart = candidate.brand ? ` ${candidate.brand}` : '';
    return `${candidate.name}${brandPart} | Achat Maroc | Intimacy Wellness`;
}

function buildImportedSeoDescription(candidate: LacdpCatalogProduct, description: string): string {
    const normalized = description.replace(/\s+/g, ' ').trim();
    if (normalized.length <= 160) return normalized;

    return normalized.slice(0, 157).trimEnd() + '...';
}

async function insertImportedProduct(candidate: LacdpCatalogProduct, seoSlug: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminClient = supabaseAdmin as any;
    const description = buildImportedDescription(candidate);

    const basePayload = {
        name: candidate.name,
        description,
        price: candidate.price,
        category: candidate.category || ProductCategory.DIETARY_SUPPLEMENT,
        brand: candidate.brand ?? null,
        image_url: candidate.imageUrl ?? null,
        stock: candidate.stock,
        features: [],
        is_featured: false,
        show_on_homepage: false,
        seo_slug: seoSlug,
        seo_title: buildImportedSeoTitle(candidate),
        seo_description: buildImportedSeoDescription(candidate, description),
        external_source: 'lacdp',
        external_id: candidate.sourceId,
        external_image_url: candidate.imageUrl ?? null,
        source_payload: candidate.raw,
    };

    const { data, error } = await adminClient
        .from('products')
        .insert(basePayload)
        .select('id,name,seo_slug')
        .single();

    if (!error) {
        return data as { id: string; name: string; seo_slug?: string | null };
    }

    if (!/external_source|external_id|external_image_url|source_payload/i.test(error.message)) {
        throw error;
    }

    const legacyPayload = {
        name: basePayload.name,
        description: basePayload.description,
        price: basePayload.price,
        category: basePayload.category,
        brand: basePayload.brand,
        image_url: basePayload.image_url,
        stock: basePayload.stock,
        features: basePayload.features,
        is_featured: basePayload.is_featured,
        show_on_homepage: basePayload.show_on_homepage,
        seo_slug: basePayload.seo_slug,
        seo_title: basePayload.seo_title,
        seo_description: basePayload.seo_description,
    };

    const retry = await adminClient
        .from('products')
        .insert(legacyPayload)
        .select('id,name,seo_slug')
        .single();

    if (retry.error) {
        throw retry.error;
    }

    return retry.data as { id: string; name: string; seo_slug?: string | null };
}

async function requireAdminUser() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                    }
                },
            },
        }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error('Unauthorized');
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
        throw new Error('Forbidden: Admin access required');
    }

    return { supabase, user };
}

export async function getAdminOrders(): Promise<Order[]> {
    await requireAdminUser();

    const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching admin orders:', error);
        throw new Error('Failed to fetch orders');
    }

    return (data as Order[]) || [];
}

export async function getAdminDashboardStats() {
    await requireAdminUser();

    const { data: orders } = await supabaseAdmin.from('orders').select('total');
    const { count } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });

    const totalRevenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
    const totalOrders = orders?.length || 0;

    return {
        totalRevenue,
        totalOrders,
        activeUsers: count || 0
    };
}

function buildOrderStatusUpdateData(status: Order['status']) {
    const updateData: Record<string, string | null> = { status };
    const now = new Date().toISOString();

    switch (status) {
        case 'processing':
            updateData.confirmed_at = now;
            break;
        case 'shipped':
            updateData.shipped_at = now;
            break;
        case 'delivered':
            updateData.delivered_at = now;
            updateData.cancelled_at = null;
            updateData.returned_at = null;
            break;
        case 'cancelled':
            updateData.cancelled_at = now;
            updateData.delivered_at = null;
            updateData.returned_at = null;
            updateData.shipped_at = null;
            break;
        case 'returned':
            updateData.returned_at = now;
            updateData.cancelled_at = null;
            break;
        case 'pending':
            updateData.confirmed_at = null;
            updateData.shipped_at = null;
            updateData.delivered_at = null;
            updateData.cancelled_at = null;
            updateData.returned_at = null;
            break;
    }

    return updateData;
}

export async function updateAdminOrderStatus(orderId: string, status: Order['status']) {
    await requireAdminUser();

    const updateData = buildOrderStatusUpdateData(status);

    const { error } = await supabaseAdmin
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

    if (error) {
        console.error("Admin update failed:", error);
        throw new Error('Update failed');
    }

    return { success: true };
}

export async function bulkUpdateAdminOrderStatus(orderIds: string[], status: Order['status']) {
    await requireAdminUser();

    const uniqueOrderIds = [...new Set(orderIds)].filter(Boolean);
    if (uniqueOrderIds.length === 0) {
        return { success: true, updatedCount: 0 };
    }

    const updateData = buildOrderStatusUpdateData(status);

    const { error } = await supabaseAdmin
        .from('orders')
        .update(updateData)
        .in('id', uniqueOrderIds);

    if (error) {
        console.error('Bulk admin update failed:', error);
        throw new Error('Bulk update failed');
    }

    return { success: true, updatedCount: uniqueOrderIds.length };
}

export async function getStockSyncRuns(limit = 10): Promise<StockSyncRunRecord[]> {
    await requireAdminUser();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminClient = supabaseAdmin as any;
    const { data, error } = await adminClient
        .from('stock_sync_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching stock sync runs:', error);
        return [];
    }

    return (data as StockSyncRunRecord[]) || [];
}

export async function runManualStockSync(): Promise<StockSyncResult> {
    const { user } = await requireAdminUser();
    return runStockSync({ triggerSource: 'manual', initiatedBy: user.id });
}

export async function getLacdpCatalogProducts(): Promise<LacdpCatalogResult> {
    await requireAdminUser();

    try {
        const [catalog, products] = await Promise.all([
            fetchLacdpCatalog(),
            getAdminProductRows(),
        ]);

        const catalogProducts = catalog.products.map((candidate) => {
            const match = findExistingProductMatch(candidate, products);
            return {
                ...candidate,
                existingProductId: match?.product.id ?? null,
                existingProductName: match?.product.name ?? null,
                matchReason: match?.reason ?? null,
            };
        });

        return {
            success: true,
            fetchedAt: new Date().toISOString(),
            products: catalogProducts,
            meta: {
                ...catalog.meta,
                existingMatches: catalogProducts.filter((product) => product.existingProductId).length,
            },
        };
    } catch (error) {
        return {
            success: false,
            fetchedAt: new Date().toISOString(),
            products: [],
            error: serializeError(error),
        };
    }
}

export async function importLacdpCatalogProduct(candidate: LacdpCatalogProduct): Promise<LacdpImportResult> {
    await requireAdminUser();

    try {
        const products = await getAdminProductRows();
        const existingMatch = findExistingProductMatch(candidate, products);
        if (existingMatch) {
            return {
                success: true,
                imported: false,
                alreadyExists: true,
                productId: existingMatch.product.id,
                productName: existingMatch.product.name,
                productSlug: existingMatch.product.seo_slug || generateSlug(existingMatch.product.name),
            };
        }

        const seoSlug = buildUniqueSeoSlug(candidate.name, products);
        const inserted = await insertImportedProduct(candidate, seoSlug);

        revalidatePath('/');
        revalidatePath('/admin');
        revalidatePath('/shop');
        revalidatePath(`/product/${seoSlug}`);

        return {
            success: true,
            imported: true,
            alreadyExists: false,
            productId: inserted.id,
            productName: inserted.name,
            productSlug: inserted.seo_slug || seoSlug,
        };
    } catch (error) {
        return {
            success: false,
            imported: false,
            error: serializeError(error),
        };
    }
}
