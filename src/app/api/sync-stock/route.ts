import { NextRequest, NextResponse } from 'next/server';
import { runStockSync } from '@/lib/stock-sync';

const CRON_SECRET = process.env.CRON_SECRET ?? '';

// ─── Route handler ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // ── Auth check
  const authHeader = req.headers.get('authorization') ?? '';
  const querySecret = req.nextUrl.searchParams.get('secret') ?? '';
  const providedSecret = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : querySecret;

  if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runStockSync({ triggerSource: 'cron' });
  return NextResponse.json(result, { status: result.success ? 200 : 503 });
}
