
import React, { createContext, useContext } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { useArticleOperations } from '@/hooks/useArticleOperations';

interface UserContextType {
  articles: any[];
  categories: any[];
  users: any[];
  loading: boolean;
  isManager: boolean;
  createArticle: (data: any) => Promise<boolean>;
  updateArticle: (id: string, data: any) => Promise<boolean>;
  deleteArticle: (id: string) => Promise<boolean>;
  incrementViews: (id: string) => void;
  refetchArticles: () => Promise<any[]>;
  refetchCategories: () => Promise<any[]>;
  refetchUsers: () => Promise<any[]>;
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
  const { isManager } = useAuth();
  const articleOps = useArticleOperations();

  // Wrapper functions to maintain compatibility
  const createArticle = async (data: any): Promise<boolean> => {
    return new Promise((resolve) => {
      articleOps.createArticle(data);
      // Since mutation is async, we'll resolve optimistically
      // The actual success/failure is handled by the mutation's onSuccess/onError
      resolve(true);
    });
  };

  const updateArticle = async (id: string, data: any): Promise<boolean> => {
    // For now, redirect to create since we don't have update RPC yet
    return createArticle(data);
  };

  const deleteArticle = async (id: string): Promise<boolean> => {
    // Placeholder - not implemented yet
    console.warn('deleteArticle not implemented yet');
    return false;
  };

  const incrementViews = (id: string): void => {
    articleOps.incrementViews(id);
  };

  // Wrapper functions to handle Query return types
  const refetchArticles = async (): Promise<any[]> => {
    const result = await supabaseData.refetchArticles();
    return result.data || [];
  };

  const refetchCategories = async (): Promise<any[]> => {
    const result = await supabaseData.refetchCategories();
    return result.data || [];
  };

  const refetchUsers = async (): Promise<any[]> => {
    const result = await supabaseData.refetchUsers();
    return result.data || [];
  };

  const contextValue = {
    ...supabaseData,
    isManager,
    createArticle,
    updateArticle,
    deleteArticle,
    incrementViews,
    refetchArticles,
    refetchCategories,
    refetchUsers
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
