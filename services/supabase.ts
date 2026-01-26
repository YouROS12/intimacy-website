import { createClient } from '@supabase/supabase-js';

// Helper to safely access environment variables in various environments (Vite, CRA, etc.)
const getEnv = (key: string, viteKey?: string) => {
    // Check import.meta.env (Vite)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        const val = import.meta.env[viteKey || key] || import.meta.env[key];
        if (val) return val;
    }
    
    // Check process.env (Node/CRA)
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
        // @ts-ignore
        const val = process.env[key];
        if (val) return val;
    }

    return '';
};

const supabaseUrl = getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL');
const supabaseKey = getEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: Supabase credentials missing. Please check your .env file and ensure it is loaded.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const isSupabaseConfigured = () => {
    return supabaseUrl.length > 0 && supabaseKey.length > 0;
};