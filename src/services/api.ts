import { supabase, isSupabaseConfigured } from './supabase';
import { Product, Order, CartItem } from '../types';
import { generateSlug } from '../utils/slugHelpers';

// Helper to check for real UUIDs
const isUuidLike = (id: string) => id.length > 20;

// Helper to map DB row to Product with seo_slug fallback
const mapProduct = (p: any): Product => ({
    ...p,
    imageUrl: p.image_url || p.imageUrl || 'https://via.placeholder.com/400',
    seo_slug: p.seo_slug || generateSlug(p.name),
});

// --- Products ---

export const getProducts = async (): Promise<Product[]> => {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('price', { ascending: false });

    if (error) {
        console.error("Supabase fetch error:", error);
        return [];
    }

    if (!data) return [];

    return data.map(mapProduct);
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('show_on_homepage', true)
        .order('price', { ascending: false })
        .limit(8);

    if (error || !data) {
        return [];
    }

    return data.map(mapProduct);
};

export const getHomepageProducts = async (): Promise<Product[]> => {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('show_on_homepage', true)
        .order('price', { ascending: false })
        .limit(4);

    if (error || !data) {
        return [];
    }

    return data.map(mapProduct);
};

export const getRelatedProducts = async (category: string, currentId: string): Promise<Product[]> => {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .neq('id', currentId)
        .limit(4);

    if (error || !data) return [];

    return data.map(mapProduct);
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
    if (!isSupabaseConfigured()) return undefined;

    if (!isUuidLike(id)) return undefined;

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        return undefined;
    }

    return mapProduct(data);
};

export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
    if (!isSupabaseConfigured()) return undefined;

    // First try to find by seo_slug in the database
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seo_slug', slug)
        .single();

    if (!error && data) {
        return mapProduct(data);
    }

    // Fallback: search all products and match by generated slug from name
    const { data: allProducts, error: allError } = await supabase
        .from('products')
        .select('*');

    if (allError || !allProducts) return undefined;

    const match = allProducts.find((p: any) => generateSlug(p.name) === slug);
    return match ? mapProduct(match) : undefined;
};

export const getProductsByIds = async (ids: string[]): Promise<Product[]> => {
    if (!isSupabaseConfigured() || ids.length === 0) return [];

    const uniqueIds = Array.from(new Set(ids)).filter(id => id.length > 20); // Basic UUID check
    if (uniqueIds.length === 0) return [];

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', uniqueIds);

    if (error || !data) {
        console.error("Error fetching products by IDs:", error);
        return [];
    }

    return data.map(mapProduct);
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!isSupabaseConfigured()) throw new Error("Database not configured");

    const dbProduct = {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        brand: product.brand,
        image_url: product.imageUrl,
        stock: product.stock,
        features: product.features,
        is_featured: product.is_featured,
        show_on_homepage: product.show_on_homepage
    };

    const { error } = await supabase.from('products').insert([dbProduct]);
    if (error) throw error;
};

export const addBulkProducts = async (products: Omit<Product, 'id'>[]) => {
    if (!isSupabaseConfigured()) throw new Error("Database not configured");

    const dbProducts = products.map(product => ({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image_url: product.imageUrl,
        stock: product.stock,
        features: product.features,
        is_featured: product.is_featured || false
    }));

    const { error } = await supabase.from('products').insert(dbProducts);
    if (error) throw error;
};

export const updateProduct = async (product: Product) => {
    if (!isSupabaseConfigured()) throw new Error("Database not configured");

    const dbProduct = {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        brand: product.brand,
        image_url: product.imageUrl,
        stock: product.stock,
        features: product.features,
        is_featured: product.is_featured,
        show_on_homepage: product.show_on_homepage
    };

    const { error } = await supabase
        .from('products')
        .update(dbProduct)
        .eq('id', product.id);

    if (error) throw error;
};

export const deleteProduct = async (id: string) => {
    if (!isSupabaseConfigured()) throw new Error("Database not configured");

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
};

// --- Orders ---

export const createOrder = async (order: Omit<Order, 'id' | 'created_at'>): Promise<string | null> => {
    if (!isSupabaseConfigured()) throw new Error("Database not configured");


    // Use the secure RPC function to bypass RLS issues
    const { data, error } = await supabase.rpc('create_order', {
        p_user_id: order.user_id,
        p_items: order.items,
        p_total: order.total,
        p_shipping_info: order.shipping_info
    });

    if (error) {
        console.error("Error creating order:", error);
        throw error;
    }

    return data; // The function returns the UUID directly
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) return [];
    return data as Order[];
};

export const getAllOrders = async (): Promise<Order[]> => {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return [];
    return data as Order[];
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

    if (error || !data) return null;
    return data as Order;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
    if (!isSupabaseConfigured()) throw new Error("Database not configured");

    // Build update object with status and appropriate timestamp
    const updateData: any = { status };
    const now = new Date().toISOString();

    // Auto-set timestamp fields based on status
    // Also clear conflicting timestamps for terminal states
    switch (status) {
        case 'processing':
            updateData.confirmed_at = now;
            break;
        case 'shipped':
            updateData.shipped_at = now;
            break;
        case 'delivered':
            // Delivered is a terminal state - clear cancelled/returned
            updateData.delivered_at = now;
            updateData.cancelled_at = null;
            updateData.returned_at = null;
            break;
        case 'cancelled':
            // Cancelled is a terminal state - clear delivered/returned
            updateData.cancelled_at = now;
            updateData.delivered_at = null;
            updateData.returned_at = null;
            // Also clear shipping timestamps since order never shipped
            updateData.shipped_at = null;
            break;
        case 'returned':
            // Returned is a terminal state - clear cancelled/delivered
            updateData.returned_at = now;
            updateData.cancelled_at = null;
            // Keep delivered_at since you need to deliver before return
            break;
        case 'pending':
            // Reset to pending - clear all timestamps except created_at
            updateData.confirmed_at = null;
            updateData.shipped_at = null;
            updateData.delivered_at = null;
            updateData.cancelled_at = null;
            updateData.returned_at = null;
            break;
    }

    const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
    if (error) throw error;
};

/**
 * Link guest orders to a newly created user account
 * This is called automatically after signup to claim any orders placed with the same email
 */
export const linkGuestOrders = async (userId: string, email: string): Promise<number> => {
    if (!isSupabaseConfigured()) return 0;

    // Find all orders where shipping_info->guest_email matches the user's email
    // and user_id is null (guest orders)
    const { data: orders, error: fetchError } = await supabase
        .from('orders')
        .select('id, shipping_info')
        .is('user_id', null);

    if (fetchError || !orders) return 0;

    // Filter orders that match the email
    const matchingOrders = orders.filter(order =>
        order.shipping_info?.guest_email === email
    );

    if (matchingOrders.length === 0) return 0;

    // Update all matching orders to link them to the user
    const { error: updateError } = await supabase
        .from('orders')
        .update({ user_id: userId })
        .in('id', matchingOrders.map(o => o.id));

    if (updateError) {
        console.error('Error linking guest orders:', updateError);
        return 0;
    }

    return matchingOrders.length;
};

// --- Users ---

export const updateUserProfile = async (userId: string, updates: { full_name?: string, phone?: string, address?: string }) => {
    if (!isSupabaseConfigured()) throw new Error("Database not configured");

    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

    if (error) throw error;
};

// --- Dashboard Stats ---

export const getDashboardStats = async () => {
    if (!isSupabaseConfigured()) return { totalRevenue: 0, totalOrders: 0, activeUsers: 0 };

    const { data: orders } = await supabase.from('orders').select('total');

    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

    const totalRevenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
    const totalOrders = orders?.length || 0;

    return {
        totalRevenue,
        totalOrders,
        activeUsers: count || 0
    };
}

export const getWeeklySales = async () => {
    if (!isSupabaseConfigured()) return [];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: orders, error } = await supabase
        .from('orders')
        .select('created_at, total')
        .gte('created_at', sevenDaysAgo.toISOString());

    if (error || !orders) return [];

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = days[d.getDay()];
        const dateKey = d.toISOString().split('T')[0];

        const dayTotal = orders
            .filter((o: any) => o.created_at.startsWith(dateKey))
            .reduce((sum: number, o: any) => sum + o.total, 0);

        result.push({ name: dayName, sales: dayTotal });
    }

    return result;
};

// --- PSEO & Content Engine ---

export const getAllPseoPages = async () => {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('pseo_pages')
        .select(`
      *,
      problem:pseo_problems(name, gender, description)
    `)
        .eq('status', 'published') // Only show published pages
        .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
};

// --- BLOG & ARTICLES ---

export const getAllPosts = async () => {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false });

    if (error || !data) return [];
    return data;
};

export const getPostBySlug = async (slug: string) => {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

    if (error || !data) return null;
    return data;
};

// --- ADMIN PSEO MANAGEMENT ---

export const adminGetAllPseoPages = async () => {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('pseo_pages')
        .select(`
        *,
        problem:pseo_problems(name),
        category:pseo_categories(name)
      `)
        .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
};

export const adminUpdatePseoPage = async (id: string, updates: any) => {
    if (!isSupabaseConfigured()) throw new Error("Database not connected");

    const { error } = await supabase
        .from('pseo_pages')
        .update(updates)
        .eq('id', id);

    if (error) throw error;
};

export const getPseoPageBySlug = async (slug: string) => {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
        .from('pseo_pages')
        .select(`
      *,
      problem:pseo_problems(*),
      category:pseo_categories(*)
    `)
        .eq('slug', slug)
        .single();

    if (error || !data) return null;
    return data;
};

export const getEvidencePackByProblemId = async (problemId: string) => {
    if (!isSupabaseConfigured()) return null;

    // First find the finished research task for this problem
    const { data: task, error: taskError } = await supabase
        .from('research_tasks')
        .select('id')
        .eq('pseo_problem_id', problemId)
        .eq('status', 'done')
        .single();

    if (taskError || !task) return null;

    // Then get the evidence pack
    const { data: pack, error: packError } = await supabase
        .from('evidence_packs')
        .select('*')
        .eq('research_task_id', task.id)
        .single();

    if (packError || !pack) return null;

    try {
        return {
            ...pack,
            claims: JSON.parse(pack.claims_json)
        };
    } catch (e) {
        console.error("Error parsing evidence pack JSON:", e);
        return null;
    }
};

export const getPseoProducts = async (problemId: string): Promise<Product[]> => {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('product_pseo_problems')
        .select(`
      product_id,
      relevance_score,
      products:product_id (*)
    `)
        .eq('pseo_problem_id', problemId)
        .order('relevance_score', { ascending: false });

    if (error || !data) return [];

    return data.map((item: any) => mapProduct(item.products));
};

export const getMoroccanCities = async (): Promise<string[]> => {
    return [
        "Agadir", "Al Hoceima", "Assilah", "Azemmour", "Azrou",
        "Beni Mellal", "Benslimane", "Berkane", "Berrechid", "Bouskoura", "Bouznika",
        "Casablanca", "Chefchaouen",
        "Dakhla", "Dar Bouazza", "Drarga",
        "El Jadida", "El Kelaa des Sraghna", "Errachidia", "Essaouira",
        "Fes", "Fnideq", "Fquih Ben Salah",
        "Guelmim", "Guercif",
        "Ifrane", "Inezgane",
        "Kenitra", "Khemisset", "Khenifra", "Khouribga", "Ksar El Kebir",
        "Laayoune", "Larache",
        "Marrakech", "Martil", "Meknes", "Midelt", "Mohammedia",
        "Nador",
        "Ouarzazate", "Ouezzane", "Oujda",
        "Rabat",
        "Safi", "Sale", "Sefrou", "Settat", "Sidi Bennour", "Sidi Kacem", "Sidi Slimane", "Skhirat",
        "Tangier", "Tan-Tan", "Taroudant", "Taza", "Temara", "Tetouan", "Tiznit",
        "Youssoufia",
        "Zagora"
    ].sort();
};
