/**
 * Manual trigger for stock sync — for testing or one-off runs.
 * Usage:
 *   $env:CRON_SECRET="your-secret"; node scripts/trigger-stock-sync.js
 *
 * Or against production:
 *   $env:SITE_URL="https://intimacy.ma"; $env:CRON_SECRET="your-secret"; node scripts/trigger-stock-sync.js
 */

const SITE_URL    = process.env.SITE_URL   ?? 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET ?? '';

if (!CRON_SECRET) {
  console.error('Error: CRON_SECRET env var is required');
  process.exit(1);
}

async function main() {
  const url = `${SITE_URL}/api/sync-stock`;
  console.log(`Calling ${url} ...`);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${CRON_SECRET}` },
  });

  const body = await res.json();
  console.log('Status:', res.status);
  console.log(JSON.stringify(body, null, 2));
}

main().catch(console.error);
