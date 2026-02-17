
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
    created_at?: string;
    updated_at?: string;
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

// Re-export Zod inferred types to ensure Single Source of Truth
// We import generic types but we don't want to import the run-time schemas here to keep types.ts pure if possible.
// However, since we need z.infer, we must import the schema or the type.
// Let's import the TYPES from validation, assuming they are exported.
import { SafeBlogContent, SafeBlogBlock, SafeBlogBlockType } from './lib/validation';

export type BlogTheme = 'educational_deep_dive' | 'product_showcase' | 'listicle';

// Alias for backward compatibility
export type BlogContent = SafeBlogContent;
export type BlogBlock = SafeBlogBlock;

// We can keep specific block interfaces if needed for component props, 
// by extracting then from the Union if possible, or just defining them as aliases to the Specific Zod types.
// For now, components can accept `SafeBlogBlock` or cast.

// Re-defining these strictly for the Block Components to use
export interface HeroBlock {
    type: 'hero';
    heading: string;
    subheading?: string;
    image?: string;
    id?: string;
}

export interface TextBlock {
    type: 'text';
    content: string;
    title?: string;
    id?: string;
}

export interface QuoteBlock {
    type: 'quote';
    content: string;
    author?: string;
    role?: string;
    id?: string;
}

export interface ProductGridBlock {
    type: 'product_grid';
    productIds: string[];
    title?: string;
    id?: string;
}

export interface AlertBlock {
    type: 'alert';
    variant: 'info' | 'warning' | 'tip';
    content: string;
    id?: string;
}

export interface ImageGroupBlock {
    type: 'image_group';
    images: { url: string; caption?: string }[];
    id?: string;
}
