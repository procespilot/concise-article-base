
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Public client for JWT passthrough
export const supabasePublic = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);

// Admin client for service operations
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Database types (simplified version matching your schema)
export interface Article {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  status: string;
  featured: boolean;
  views: number;
  keywords: string[];
  created_at: string;
  updated_at: string;
  category_id: string | null;
  author_id: string | null;
  categories?: { name: string } | null;
  profiles?: { first_name: string | null; last_name: string | null } | null;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  activated_at: string | null;
  created_at: string;
  user_roles: { role: string }[];
}
