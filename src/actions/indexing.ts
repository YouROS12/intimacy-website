'use server';

import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://intimacy.ma';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

// Use private SUPABASE_URL if available, fallback to public (not ideal but works)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase URL or Service Role Key missing.");
}

// Initialize Supabase Admin Client (Service Role)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// --- Types ---
export type QueueItem = {
    id: string;
    url: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'retry';
    updated_at: string;
    created_at: string;
    priority?: 'high' | 'normal' | 'low';
    publish_attempted_at?: string;
    next_retry_at?: string;
    last_error?: string;
    response_status?: number;
};

// --- Helper: Google Auth Client ---
function getGoogleAuth() {
    const raw = process.env.GOOGLE_INDEXING_KEY;
    if (!raw) throw new Error("Missing GOOGLE_INDEXING_KEY.");

    const key = JSON.parse(raw); // Let it throw if invalid JSON

    if (!key.client_email || !key.private_key) {
        throw new Error("GOOGLE_INDEXING_KEY must include client_email and private_key.");
    }

    // Fix newlines in private key
    const privateKey = key.private_key.replace(/\\n/g, "\n");

    return new google.auth.JWT({
        email: key.client_email,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/indexing"],
    });
}

// 1. Fetch Sitemap URLs
export async function getSitemapUrls(): Promise<{ url: string; lastmod: number }[]> {
    console.log(`🔍 Fetching sitemap from ${SITEMAP_URL}...`);
    try {
        const response = await fetch(SITEMAP_URL, { next: { revalidate: 0 } });
        if (!response.ok) throw new Error(`Failed to fetch sitemap: ${response.statusText}`);
        const xml = await response.text();

        const items: { url: string; lastmod: number }[] = [];

        // Robust extraction: split by <url>
        const urlBlocks = xml.split(/<\/?url>/);

        for (const block of urlBlocks) {
            if (!block.trim()) continue;

            const locMatch = block.match(/<loc>\s*(https?:\/\/[^<]+)\s*<\/loc>/i);
            const modMatch = block.match(/<lastmod>\s*([^<]+)\s*<\/lastmod>/i);

            if (locMatch) {
                const url = locMatch[1].trim();
                const lastmod = modMatch ? new Date(modMatch[1]).getTime() : 0;
                items.push({ url, lastmod });
            }
        }
        // return sorted by newest
        return items.sort((a, b) => b.lastmod - a.lastmod);
    } catch (e: any) {
        console.error("Error fetching sitemap:", e);
        throw new Error(e.message);
    }
}

// 2. Add URLs to Queue
// Internal helper for queuing with Priority
async function internalQueueItems(items: { url: string; priority?: 'high' | 'normal' | 'low' }[]) {
    if (!items.length) return { success: true, count: 0 };

    const rows = items.map(item => ({
        url: item.url,
        status: 'pending',
        priority: item.priority || 'normal'
    }));

    const { error } = await supabaseAdmin
        .from('indexing_queue')
        .upsert(rows, { onConflict: 'url', ignoreDuplicates: true });

    if (error) throw new Error(error.message);
    return { success: true, count: items.length };
}

// 2. Add URLs to Queue (Public wrapper)
export async function addToQueue(urls: string[]) {
    return internalQueueItems(urls.map(url => ({ url })));
}

// 3. Get Queue Stats
export async function getQueueStats() {
    const { data, error } = await supabaseAdmin.from('indexing_queue').select('status');
    if (error) throw new Error(error.message);

    const stats: Record<string, number> = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        retry: 0,
        total: data.length
    };

    data.forEach((row: any) => {
        const s = row.status || 'pending';
        stats[s] = (stats[s] || 0) + 1;
    });

    return stats;
}

// 4. Get Queue Items (for List)
export async function getQueueItems(statusFilter: string = 'all', limit: number = 50) {
    let query = supabaseAdmin
        .from('indexing_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as QueueItem[];
}

// 5. PROCESS QUEUE BATCH (Production Hardened)
export async function processQueueBatch(limit: number = 10) {
    // A. Check Rolling 24h Quota (Correct Google Logic)
    // We count actual attempts made in the last 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { count: attemptsLast24h, error: countError } = await supabaseAdmin
        .from('indexing_queue')
        .select('*', { count: 'exact', head: true })
        // We need to count rows where publish_attempted_at > 24h ago
        // Note: Multiple attempts on same row technically count as multiple quota hits, 
        // but our basic schema tracks only the *last* attempt timestamp. 
        // This is an acceptable approximation: if we retry a row, the old timestamp is overwritten, 
        // so we might *under-count* slightly if we retry same URL multiple times in 24h.
        // For a perfect system we'd need a separate 'indexing_logs' table.
        // Given complexity constraints, we stick to this approximation which is vastly better than counting 'completed'.
        .gte('publish_attempted_at', oneDayAgo);

    if (countError) throw new Error(countError.message);

    const DAILY_LIMIT = 200;
    const remaining = DAILY_LIMIT - (attemptsLast24h || 0);

    if (remaining <= 0) {
        return { success: false, message: "Daily quota exhausted (200 attempts in last 24h). Try again later." };
    }

    // Logic: process at most `limit` or `remaining`, whichever is smaller
    const effectiveLimit = Math.min(limit, remaining);
    if (effectiveLimit <= 0) return { success: true, processed: 0, message: "Quota reached." };

    // B. Atomic Claim via RPC (Prioritized & Retry-Aware)
    // claim_indexing_tasks logic: status='pending' OR status='retry' and next_retry_at <= now()
    const { data: claims, error: claimError } = await supabaseAdmin
        .rpc('claim_indexing_tasks', { limit_count: effectiveLimit });

    if (claimError) throw new Error(claimError.message);
    if (!claims || claims.length === 0) {
        return { success: true, processed: 0, message: "No actionable items (pending or ready for retry)." };
    }

    // C. Auth (Robust: Client Request)
    const jwtClient = getGoogleAuth();
    // No explicit authorize() call needed for request(), it handles token refresh.

    let successCount = 0;
    let failCount = 0;
    let quotaHit = false;

    // D. Sequential Processing
    for (const item of claims) {
        if (quotaHit) {
            // Release remaining claimed items back to their previous state
            // Simplest: set to 'pending' so they are picked up next time (or 'retry' if they were retries?)
            // We'll set to 'pending' to be safe.
            await supabaseAdmin.from('indexing_queue').update({ status: 'pending' }).eq('id', item.id);
            continue;
        }

        try {
            // 1. Mark attempt timestamp (for quota tracking)
            await supabaseAdmin.from('indexing_queue').update({
                publish_attempted_at: new Date().toISOString()
            }).eq('id', item.id);

            // 2. Make Request
            const res = await jwtClient.request({
                url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
                method: 'POST',
                data: {
                    url: item.url,
                    type: 'URL_UPDATED',
                }
            });

            const status = res.status;

            if (status === 200) {
                await supabaseAdmin.from('indexing_queue').update({
                    status: 'completed',
                    updated_at: new Date().toISOString(),
                    response_status: 200,
                    last_error: null
                }).eq('id', item.id);
                successCount++;
            } else if (status === 429) {
                // QUOTA HIT (Deadlock Fix)
                quotaHit = true;
                // Schedule retry 8 hours from now (Pacific midnight approximation or just safe backoff)
                const nextRetry = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

                await supabaseAdmin.from('indexing_queue').update({
                    status: 'retry',
                    updated_at: new Date().toISOString(),
                    response_status: 429,
                    last_error: "Daily Quota Exceeded (429)",
                    next_retry_at: nextRetry
                }).eq('id', item.id);
                failCount++;
            } else {
                // Other Error (403, 500, etc)
                // For 403 (Forbidden), it might be permanent. 
                // For 5xx, it might be transient.
                // Simple logic: 403 -> Failed, 5xx -> Retry (short backoff)? 
                // Let's stick to 'failed' for non-429 to be safe, user can manually re-queue.
                const statusText = res.statusText || 'Unknown Error';
                await supabaseAdmin.from('indexing_queue').update({
                    status: 'failed',
                    updated_at: new Date().toISOString(),
                    response_status: status,
                    last_error: `${status}: ${statusText}`.substring(0, 500)
                }).eq('id', item.id);
                failCount++;
            }
        } catch (e: any) {
            // Network error / Auth error
            // If it's a GaxiosError, it might have a response
            const status = e.response?.status || 500;
            const msg = e.message || 'Unknown Error';

            if (status === 429) {
                quotaHit = true;
                const nextRetry = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
                await supabaseAdmin.from('indexing_queue').update({
                    status: 'retry',
                    updated_at: new Date().toISOString(),
                    response_status: 429,
                    last_error: `Quota (Exception): ${msg}`,
                    next_retry_at: nextRetry
                }).eq('id', item.id);
            } else {
                await supabaseAdmin.from('indexing_queue').update({
                    status: 'failed',
                    updated_at: new Date().toISOString(),
                    last_error: msg
                }).eq('id', item.id);
            }
            failCount++;
        }
    }

    return {
        success: true,
        processed: claims.length,
        successCount,
        failCount,
        message: quotaHit
            ? `Stopped due to Quota Limit. Success: ${successCount}`
            : `Processed ${claims.length}. Success: ${successCount}, Failed: ${failCount}`
    };
}

// 6. Delete item
export async function deleteQueueItem(id: string) {
    const { error } = await supabaseAdmin.from('indexing_queue').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

// 7. Schedule Fresh Content (The "Brain")
export async function scheduleFreshUrls(limit: number = 50) {
    // 1. Claim candidates via RPC
    const { data: candidates, error } = await supabaseAdmin
        .rpc('claim_fresh_candidates', { limit_count: limit });

    if (error) throw new Error(error.message);
    if (!candidates || candidates.length === 0) {
        return { success: true, count: 0, message: "No fresh content found." };
    }

    // 2. Construct URLs
    // Note: Adjust URL pattern based on your actual routes
    const items = candidates.map((c: any) => ({
        url: `${SITE_URL}/product/${c.seo_slug || c.id}`,
        priority: c.priority
    }));

    // 3. Queue them
    await internalQueueItems(items);

    return { success: true, count: items.length, message: `Scheduled ${items.length} fresh items.` };
}
