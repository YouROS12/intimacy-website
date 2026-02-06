import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
    return !!supabaseUrl && !!supabaseKey;
};

// Create a placeholder client that won't throw during build time
// When env vars are missing, we use placeholder values
// The isSupabaseConfigured() check should be used before any Supabase operations
let supabase: SupabaseClient;

if (isSupabaseConfigured()) {
    supabase = createBrowserClient(supabaseUrl!, supabaseKey!);
} else {
    // Create a dummy client with placeholder URL to prevent build errors
    // This client should never be used - always check isSupabaseConfigured() first
    supabase = createBrowserClient(
        'https://placeholder.supabase.co',
        'placeholder-key'
    );

    if (typeof window !== 'undefined') {
        console.warn('Supabase credentials missing. Check environment variables.');
    }
}

export { supabase };
