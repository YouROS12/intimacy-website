import { supabase, isSupabaseConfigured } from './supabase';
import { Product, Order, CartItem } from '../types';
import { MOCK_PRODUCTS } from './mockData';

// Helper to check for real UUIDs
const isUuid = (id: string) => id.length > 20;

// --- Products ---

export const getProducts = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error("Supabase fetch error:", error);
    return [];
  }

  if (!data) return [];

  return data.map((p: any) => ({
    ...p,
    imageUrl: p.image_url || p.imageUrl || 'https://via.placeholder.com/400'
  }));
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(4);

  if (error || !data) {
    return [];
  }

  return data.map((p: any) => ({
    ...p,
    imageUrl: p.image_url || p.imageUrl || 'https://via.placeholder.com/400'
  }));
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
  
  return data.map((p: any) => ({
    ...p,
    imageUrl: p.image_url || p.imageUrl || 'https://via.placeholder.com/400'
  }));
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  if (!isSupabaseConfigured()) return undefined;

  if (!isUuid(id)) return undefined;

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
     return undefined;
  }

  return {
    ...data,
    imageUrl: data.image_url || data.imageUrl
  };
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!isSupabaseConfigured()) throw new Error("Database not configured");
    
    const dbProduct = {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image_url: product.imageUrl,
        stock: product.stock,
        features: product.features
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
        features: product.features
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
        image_url: product.imageUrl,
        stock: product.stock,
        features: product.features
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

export const seedDatabase = async () => {
    if (!isSupabaseConfigured()) throw new Error("Database not configured");
    
    // We use MOCK_PRODUCTS strictly as a seed source here
    const productsToInsert = MOCK_PRODUCTS.map(({ id, imageUrl, ...p }) => ({
        ...p,
        image_url: imageUrl
    }));

    const { error } = await supabase.from('products').insert(productsToInsert);
    if (error) throw error;
    return true;
}

// --- Orders ---

export const createOrder = async (order: Omit<Order, 'id' | 'created_at'>): Promise<string | null> => {
  if (!isSupabaseConfigured()) throw new Error("Database not configured");

  const { data, error } = await supabase
    .from('orders')
    .insert([{
      user_id: order.user_id,
      items: order.items,
      total: order.total,
      status: order.status,
      shipping_info: order.shipping_info
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating order:", error);
    throw error;
  }
  return data.id;
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

export const updateOrderStatus = async (orderId: string, status: string) => {
    if (!isSupabaseConfigured()) throw new Error("Database not configured");
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) throw error;
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
    
    for(let i=6; i>=0; i--) {
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

// --- Locations ---

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