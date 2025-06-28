
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

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'user' | 'manager' | 'admin';
