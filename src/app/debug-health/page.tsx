import { supabase } from '@/services/supabase';

export const dynamic = 'force-dynamic';

export default async function DebugHealthPage() {
    const checks: any = {};

    // 1. Env Vars
    checks.env = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'DEFINED' : 'MISSING',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DEFINED' : 'MISSING',
        NODE_ENV: process.env.NODE_ENV
    };

    // 2. Supabase Connection
    try {
        const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
        checks.supabase = {
            status: error ? 'ERROR' : 'OK',
            message: error?.message,
            count: data || 'N/A' // head: true returns null data mostly but count
        };
    } catch (e: any) {
        checks.supabase = {
            status: 'CRASH',
            message: e.message
        };
    }

    return (
        <div className="p-10 font-mono text-sm">
            <h1 className="text-xl font-bold mb-6">System Health Check</h1>
            <pre className="bg-slate-100 p-4 rounded border border-slate-300">
                {JSON.stringify(checks, null, 2)}
            </pre>
        </div>
    );
}
