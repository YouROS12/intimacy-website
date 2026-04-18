/**
 * Next.js Instrumentation — runs once when the server starts.
 * Used here to register the LACDP stock sync cron job.
 *
 * How it works on Railway:
 *  - Railway starts the Next.js server as a long-running process.
 *  - Next.js calls register() once on boot (Node.js runtime only).
 *  - node-cron keeps the schedule alive inside that same process.
 *  - No separate service or external scheduler needed.
 *
 * Schedule (Morocco time = UTC+1):
 *  - "0 6 * * *"  → 07:00 Morocco
 *  - "0 18 * * *" → 19:00 Morocco
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run in the Node.js server process, not in the Edge runtime.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const cron      = await import('node-cron');
  const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const SECRET    = process.env.CRON_SECRET ?? '';

  if (!SECRET) {
    console.warn('[cron] CRON_SECRET is not set — stock sync cron will not start.');
    return;
  }

  async function runStockSync() {
    const start = new Date().toISOString();
    console.log(`[cron] Stock sync started at ${start}`);
    try {
      const res = await fetch(`${SITE_URL}/api/sync-stock`, {
        headers: { Authorization: `Bearer ${SECRET}` },
      });
      const body = await res.json();
      console.log(`[cron] Stock sync result:`, JSON.stringify(body));
    } catch (err) {
      console.error('[cron] Stock sync error:', err);
    }
  }

  // 07:00 Morocco (UTC+1) = 06:00 UTC
  cron.default.schedule('0 6 * * *', runStockSync, { timezone: 'UTC' });

  // 19:00 Morocco (UTC+1) = 18:00 UTC
  cron.default.schedule('0 18 * * *', runStockSync, { timezone: 'UTC' });

  console.log('[cron] Stock sync scheduled: 07:00 and 19:00 Morocco time');
}
