import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Client component client (for use in client components)
export const createClientSupabase = () => createClientComponentClient();

// Server component client (for use in server components)
export const createServerSupabase = () => createServerComponentClient({ cookies });

// Service role client (for admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database schema types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'user' | 'admin' | 'staff';
          wallet_balance: number;
          affiliate_code: string;
          referrer_id: string | null;
          total_earnings: number;
          affiliate_earnings: number;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin' | 'staff';
          wallet_balance?: number;
          affiliate_code: string;
          referrer_id?: string | null;
          total_earnings?: number;
          affiliate_earnings?: number;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin' | 'staff';
          wallet_balance?: number;
          affiliate_code?: string;
          referrer_id?: string | null;
          total_earnings?: number;
          affiliate_earnings?: number;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          is_active: boolean;
          products_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          is_active?: boolean;
          products_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          is_active?: boolean;
          products_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          title: string;
          description: string;
          short_description: string | null;
          price: number;
          is_free: boolean;
          category_id: string;
          seller_id: string;
          image_url: string | null;
          preview_urls: string[] | null;
          file_url: string;
          file_size: number;
          file_type: string;
          downloads_count: number;
          likes_count: number;
          is_featured: boolean;
          is_active: boolean;
          tags: string[] | null;
          meta_title: string | null;
          meta_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          short_description?: string | null;
          price: number;
          is_free?: boolean;
          category_id: string;
          seller_id: string;
          image_url?: string | null;
          preview_urls?: string[] | null;
          file_url: string;
          file_size: number;
          file_type: string;
          downloads_count?: number;
          likes_count?: number;
          is_featured?: boolean;
          is_active?: boolean;
          tags?: string[] | null;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          short_description?: string | null;
          price?: number;
          is_free?: boolean;
          category_id?: string;
          seller_id?: string;
          image_url?: string | null;
          preview_urls?: string[] | null;
          file_url?: string;
          file_size?: number;
          file_type?: string;
          downloads_count?: number;
          likes_count?: number;
          is_featured?: boolean;
          is_active?: boolean;
          tags?: string[] | null;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          buyer_id: string;
          seller_id: string;
          product_id: string;
          amount: number;
          commission_amount: number;
          affiliate_id: string | null;
          affiliate_commission: number | null;
          cinetpay_transaction_id: string | null;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_method: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          seller_id: string;
          product_id: string;
          amount: number;
          commission_amount: number;
          affiliate_id?: string | null;
          affiliate_commission?: number | null;
          cinetpay_transaction_id?: string | null;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_method?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          buyer_id?: string;
          seller_id?: string;
          product_id?: string;
          amount?: number;
          commission_amount?: number;
          affiliate_id?: string | null;
          affiliate_commission?: number | null;
          cinetpay_transaction_id?: string | null;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_method?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type DbUser = Database['public']['Tables']['users']['Row'];
export type DbProduct = Database['public']['Tables']['products']['Row'];
export type DbCategory = Database['public']['Tables']['categories']['Row'];
export type DbTransaction = Database['public']['Tables']['transactions']['Row'];