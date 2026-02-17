'use server';

import { google } from 'googleapis';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://intimacy.ma';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

export async function triggerGoogleIndexing() {
    try {
        if (!process.env.GOOGLE_INDEXING_KEY) {
            return { success: false, message: 'Missing GOOGLE_INDEXING_KEY environment variable.' };
        }

        const key = JSON.parse(process.env.GOOGLE_INDEXING_KEY) as any;
        // @ts-ignore
        const jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            ['https://www.googleapis.com/auth/indexing'],
            null
        );

        // Fetch Sitemap
        console.log(`🔍 Fetching sitemap from ${SITEMAP_URL}...`);
        const response = await fetch(SITEMAP_URL, { next: { revalidate: 0 } }); // Ensure fresh fetch
        if (!response.ok) throw new Error(`Failed to fetch sitemap: ${response.statusText}`);
        const xml = await response.text();

        // Extract URLs and LastMod using Regex
        // Sitemap format: <url><loc>...</loc><lastmod>...</lastmod></url>
        const items: { url: string; lastmod: number }[] = [];
        // Regex to capture content of <url> blocks might be tricky with simple regex if nested, 
        // but standard sitemaps are flat.
        // Let's use a simpler approach: split by <url>, then parse inside.

        const urlBlocks = xml.split('<url>');
        for (const block of urlBlocks) {
            if (!block.includes('</url>')) continue;

            const locMatch = block.match(/<loc>(https:\/\/[^<]+)<\/loc>/);
            const modMatch = block.match(/<lastmod>([^<]+)<\/lastmod>/);

            if (locMatch) {
                const url = locMatch[1];
                const lastmod = modMatch ? new Date(modMatch[1]).getTime() : 0;
                items.push({ url, lastmod });
            }
        }

        if (items.length === 0) {
            return { success: true, message: 'No URLs found in sitemap.' };
        }

        // Sort by lastmod DESC (newest first)
        items.sort((a, b) => b.lastmod - a.lastmod);

        // Cap at 200 (Daily Quota)
        const BATCH_SIZE = 200;
        const itemsToProcess = items.slice(0, BATCH_SIZE);

        // Authenticate
        const tokens = await jwtClient.authorize();

        let successCount = 0;
        let failCount = 0;

        // Parallelize requests in chunks of 50 to speed up but respect rate limits
        const CHUNK_SIZE = 20;

        for (let i = 0; i < itemsToProcess.length; i += CHUNK_SIZE) {
            const chunk = itemsToProcess.slice(i, i + CHUNK_SIZE);
            await Promise.all(chunk.map(async (item) => {
                try {
                    const result = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${tokens.access_token}`,
                        },
                        body: JSON.stringify({
                            url: item.url,
                            type: 'URL_UPDATED',
                        }),
                    });

                    if (result.status === 200) {
                        successCount++;
                    } else {
                        failCount++;
                        console.error(`Failed ${item.url}:`, await result.text());
                    }
                } catch (e) {
                    failCount++;
                    console.error(`Error ${item.url}:`, e);
                }
            }));

            // tiny delay between chunks if needed, but 20 is small enough.
        }

        return {
            success: true,
            message: `Optimized Indexing: Submitted ${successCount} most recent URLs. (${failCount} failed). (Total found: ${items.length}, Capped at ${BATCH_SIZE})`
        };

    } catch (error: any) {
        console.error('Indexing Error:', error);
        return { success: false, message: error.message || 'Unknown error occurred.' };
    }
}
