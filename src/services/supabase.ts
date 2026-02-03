import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    if (typeof window !== 'undefined') { // Only warn on client side to avoid build noise
        console.warn('Supabase credentials missing. Check .env.local');
    }
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseKey || ''
);

export const isSupabaseConfigured = () => {
    return !!supabaseUrl && !!supabaseKey;
};
