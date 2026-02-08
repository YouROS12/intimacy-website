
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
    isAnonymous?: boolean; // True if user is signed in anonymously (not yet converted to permanent)
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
    confirmed_at?: string; // When admin confirmed order
    shipped_at?: string; // When order was shipped
    delivered_at?: string; // When order was delivered
    cancelled_at?: string; // When order was cancelled
    returned_at?: string; // When order was returned
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

// Base interface
interface BaseBlock {
    id?: string; // Optional (Supabase JSON might not have it)
}

// Specific Block Interfaces
export interface HeroBlock extends BaseBlock {
    type: 'hero';
    heading: string;
    subheading?: string;
    image?: string;
}

export interface TextBlock extends BaseBlock {
    type: 'text';
    content: string; // HTML string
    title?: string;
}

export interface QuoteBlock extends BaseBlock {
    type: 'quote';
    content: string;
    author?: string;
    role?: string;
}

export interface ProductGridBlock extends BaseBlock {
    type: 'product_grid';
    productIds: string[];
    title?: string;
}

export interface AlertBlock extends BaseBlock {
    type: 'alert';
    variant: 'info' | 'warning' | 'tip';
    content: string;
}

export interface ImageGroupBlock extends BaseBlock {
    type: 'image_group';
    images: { url: string; caption?: string }[];
}

// Discriminated Union
export type BlogBlock =
    | HeroBlock
    | TextBlock
    | QuoteBlock
    | ProductGridBlock
    | AlertBlock
    | ImageGroupBlock;

export interface BlogReference {
    text: string;
    url?: string;
}

export interface BlogContent {
    theme: BlogTheme;
    blocks: BlogBlock[];
    references?: BlogReference[];
}
