import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  style_score: number;
  body_type?: string;
  color_tone?: string;
  is_admin: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  tags: string[];
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  total_amount: number;
  status: string;
  shipping_address?: any;
  stripe_payment_id?: string;
  created_at: string;
}

export interface SavedOutfit {
  id: string;
  user_id: string;
  outfit_name: string;
  product_ids: string[];
  ai_score: number;
  event_type?: string;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
  product?: Product;
}
