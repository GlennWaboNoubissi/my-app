export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'staff';
  wallet_balance: number;
  affiliate_code: string;
  referrer_id?: string;
  total_earnings: number;
  affiliate_earnings: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  price: number;
  is_free: boolean;
  category_id: string;
  seller_id: string;
  image_url?: string;
  preview_urls?: string[];
  file_url: string;
  file_size: number;
  file_type: string;
  downloads_count: number;
  likes_count: number;
  is_featured: boolean;
  is_active: boolean;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
  seller?: User;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  products_count: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  amount: number;
  commission_amount: number;
  affiliate_id?: string;
  affiliate_commission?: number;
  cinetpay_transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  download_links: DownloadLink[];
  created_at: string;
  updated_at: string;
  buyer?: User;
  seller?: User;
  product?: Product;
  affiliate?: User;
}

export interface DownloadLink {
  id: string;
  transaction_id: string;
  product_id: string;
  user_id: string;
  encrypted_url: string;
  downloads_count: number;
  max_downloads: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  total_earnings: number;
  total_withdrawals: number;
  pending_balance: number;
  last_withdrawal_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  method: 'bank_transfer' | 'mobile_money' | 'paypal';
  account_details: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  admin_notes?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  product_id?: string;
  user_id?: string;
  type: 'product' | 'user' | 'other';
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  admin_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AffiliateLink {
  id: string;
  user_id: string;
  product_id: string;
  code: string;
  clicks_count: number;
  conversions_count: number;
  total_earnings: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface ProductFormData {
  title: string;
  description: string;
  short_description?: string;
  price: number;
  is_free: boolean;
  category_id: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
}

export interface UserFormData {
  full_name: string;
  email: string;
  password?: string;
}

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isFree?: boolean;
  sortBy?: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'popular';
  search?: string;
}

// CinetPay Types
export interface CinetPayPayment {
  amount: number;
  currency: string;
  transaction_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  description: string;
  return_url: string;
  notify_url: string;
  metadata?: Record<string, any>;
}

export interface CinetPayResponse {
  code: string;
  message: string;
  data?: {
    payment_url: string;
    payment_token: string;
  };
}

export interface CinetPayWebhook {
  cpm_trans_id: string;
  cpm_site_id: string;
  cpm_amount: string;
  cpm_currency: string;
  cpm_trans_status: string;
  cpm_trans_date: string;
  cpm_payid: string;
  signature: string;
  cpm_custom?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalRevenue: number;
  totalProducts: number;
  totalSales: number;
  totalUsers: number;
  recentTransactions: Transaction[];
  topProducts: Product[];
  monthlyRevenue: Array<{ month: string; revenue: number }>;
}