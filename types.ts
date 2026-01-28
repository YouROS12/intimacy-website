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
  imageUrl?: string;
  image_url?: string; // Supabase convention
  stock: number;
  features: string[];
  is_featured?: boolean;
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
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