
import React, { createContext, useContext } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface UserContextType {
  articles: any[];
  categories: any[];
  users: any[];
  loading: boolean;
  createArticle: (data: any) => Promise<boolean>;
  updateArticle: (id: string, data: any) => Promise<boolean>;
  deleteArticle: (id: string) => Promise<boolean>;
  refetchArticles: () => Promise<void>;
  refetchCategories: () => Promise<void>;
  refetchUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabaseData = useSupabaseData();

  return (
    <UserContext.Provider value={supabaseData}>
      {children}
    </UserContext.Provider>
  );
};
