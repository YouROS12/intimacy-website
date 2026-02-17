
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://intimacy.ma';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

// Check for Service Account Key
if (!process.env.GOOGLE_INDEXING_KEY) {
    console.error('❌ Error: GOOGLE_INDEXING_KEY environment variable is missing.');
    console.error('Please add your Google Cloud Service Account JSON key as an env var.');
    process.exit(1);
}

const key = JSON.parse(process.env.GOOGLE_INDEXING_KEY);
const jwtClient = new google.auth.JWT(
    key.client_email,
    undefined,
    key.private_key,
    ['https://www.googleapis.com/auth/indexing'],
    undefined
);

async function getSitemapUrls(): Promise<string[]> {
    try {
        console.log(`🔍 Fetching sitemap from ${SITEMAP_URL}...`);
        const response = await fetch(SITEMAP_URL);
        if (!response.ok) throw new Error(`Failed to fetch sitemap: ${response.statusText}`);
        const xml = await response.text();

        // Simple regex to extract URLs
        const urls: string[] = [];
        const regex = /<loc>(https:\/\/[^<]+)<\/loc>/g;
        let match;
        while ((match = regex.exec(xml)) !== null) {
            urls.push(match[1]);
        }
        return urls;
    } catch (error) {
        console.error('Failed to parse sitemap:', error);
        return [];
    }
}

async function submitUrl(url: string) {
    try {
        const tokens = await jwtClient.authorize();
        const result = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${tokens.access_token}`,
            },
            body: JSON.stringify({
                url: url,
                type: 'URL_UPDATED',
            }),
        });

        if (result.status === 200) {
            console.log(`✅ Submitted: ${url}`);
        } else {
            const error = await result.json();
            console.error(`❌ Failed: ${url}`, error);
        }
    } catch (error) {
        console.error(`❌ Error submitting ${url}:`, error);
    }
}

async function main() {
    console.log('🚀 Starting Google Indexing submission...');

    const urls = await getSitemapUrls();
    if (urls.length === 0) {
        console.log('⚠️ No URLs found in sitemap.');
        return;
    }

    console.log(`Found ${urls.length} URLs to submit.`);

    // Submit in batches to avoid hitting rate limits too hard (though strict quota is daily)
    // Google recommends batching, but for simplicity we'll do sequential with delay if needed.
    // Actually, we'll just slice the first 50 to stay safe on quota for now, or just all.
    // Quota is typically 200/day. Let's submit all but catch errors.

    // We'll process in chunks of 10
    const CHUNK_SIZE = 10;
    for (let i = 0; i < urls.length; i += CHUNK_SIZE) {
        const chunk = urls.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(url => submitUrl(url)));
        console.log(`Processed ${Math.min(i + CHUNK_SIZE, urls.length)} / ${urls.length}`);
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('🏁 Indexing submission complete.');
}

main().catch(console.error);
