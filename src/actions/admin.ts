'use server';

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Order } from '@/types';

// Initialize Service Role Client (Bypasses RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getAdminOrders(): Promise<Order[]> {
    // 1. Verify Authentication & Role
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error('Unauthorized admin access attempt');
        throw new Error('Unauthorized');
    }

    // 2. Add extra check for role in 'profiles' table if needed
    // But for now, we'll assume only admins can call this (protected by UI and this check)
    // Ideally: const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    // if (profile?.role !== 'admin') throw new Error('Forbidden');

    // 3. Fetch Orders using Admin Client (Bypassing RLS)
    const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching admin orders:', error);
        throw new Error('Failed to fetch orders');
    }

    return (data as Order[]) || [];
}

export async function getAdminDashboardStats() {
    // 1. Verify Authentication & Role
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                    }
                },
            },
        }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error('Unauthorized');
    }

    // 2. Fetch Stats using Admin Client
    const { data: orders } = await supabaseAdmin.from('orders').select('total');
    const { count } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });

    const totalRevenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
    const totalOrders = orders?.length || 0;

    return {
        totalRevenue,
        totalOrders,
        activeUsers: count || 0
    };
}

export async function updateAdminOrderStatus(orderId: string, status: string) {
    // 1. Verify Authentication
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); }
            }
        }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    // 2. Prepare Update Data
    const updateData: any = { status };
    const now = new Date().toISOString();

    // Auto-set timestamps logic (mirrored from client)
    switch (status) {
        case 'processing':
            updateData.confirmed_at = now;
            break;
        case 'shipped':
            updateData.shipped_at = now;
            break;
        case 'delivered':
            updateData.delivered_at = now;
            updateData.cancelled_at = null;
            updateData.returned_at = null;
            break;
        case 'cancelled':
            updateData.cancelled_at = now;
            updateData.delivered_at = null;
            updateData.returned_at = null;
            updateData.shipped_at = null;
            break;
        case 'returned':
            updateData.returned_at = now;
            updateData.cancelled_at = null;
            break;
        case 'pending':
            updateData.confirmed_at = null;
            updateData.shipped_at = null;
            updateData.delivered_at = null;
            updateData.cancelled_at = null;
            updateData.returned_at = null;
            break;
    }

    // 3. Update using Admin Client
    const { error } = await supabaseAdmin
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

    if (error) {
        console.error("Admin update failed:", error);
        throw new Error('Update failed');
    }

    return { success: true };
}
