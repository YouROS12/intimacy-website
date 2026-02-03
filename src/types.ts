
export enum UserRole {
    GUEST = 'guest',
    USER = 'user',
    ADMIN = 'admin'
}

export interface User {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
    phone?: string;
    address?: string;
}

export enum ProductCategory {
    LUBRICANT = 'Lubricant',
    CONDOMS = 'Condoms',
    DELAY = 'Delay Spray/Cream',
    KIT = 'Wellness Kit'
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: ProductCategory;
    brand?: string;
    imageUrl?: string;
    image_url?: string; // Supabase convention
    stock: number;
    features: string[];
    is_featured?: boolean;
    show_on_homepage?: boolean;
    seo_title?: string;
    seo_description?: string;
    seo_slug?: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Order {
    id: string;
    user_id: string | null; // null for guest orders
    items: CartItem[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    created_at: string;
    shipping_info?: {
        first_name: string;
        last_name: string;
        address: string;
        city: string;
        phone: string;
        guest_email?: string; // For guest orders with optional account creation
    };
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

// --- JSON Blog Engine Types ---

export type BlogTheme = 'educational_deep_dive' | 'product_showcase' | 'listicle';

export type BlogBlockType = 'hero' | 'text' | 'quote' | 'product_grid' | 'alert' | 'image_group';

export interface BlogBlock {
    type: BlogBlockType;
    id?: string;
    // Hero
    heading?: string;
    subheading?: string;
    image?: string;
    // Text
    content?: string; // HTML string for rich text within the block
    title?: string; // Section headers
    // Quote
    author?: string;
    role?: string;
    // Product Grid
    productIds?: string[];
    // Alert
    variant?: 'info' | 'warning' | 'tip';
    // Image Group
    images?: { url: string; caption?: string }[];
}

export interface BlogReference {
    text: string;
    url?: string;
}

export interface BlogContent {
    theme: BlogTheme;
    blocks: BlogBlock[];
    references?: BlogReference[]; // For citations
}
