
import React, { createContext, useContext, useMemo } from 'react';
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

  // Stable context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    const createArticle = async (data: any): Promise<boolean> => {
      try {
        articleOps.createArticle(data);
        return true;
      } catch (error) {
        console.error('Error creating article:', error);
        return false;
      }
    };

    const updateArticle = async (id: string, data: any): Promise<boolean> => {
      try {
        return createArticle(data);
      } catch (error) {
        console.error('Error updating article:', error);
        return false;
      }
    };

    const deleteArticle = async (id: string): Promise<boolean> => {
      console.warn('deleteArticle not implemented yet');
      return false;
    };

    const incrementViews = (id: string): void => {
      try {
        articleOps.incrementViews(id);
      } catch (error) {
        console.error('Error incrementing views:', error);
      }
    };

    const refetchArticles = async (): Promise<any[]> => {
      try {
        const result = await supabaseData.refetchArticles();
        return result?.data || [];
      } catch (error) {
        console.error('Error refetching articles:', error);
        return [];
      }
    };

    const refetchCategories = async (): Promise<any[]> => {
      try {
        const result = await supabaseData.refetchCategories();
        return result?.data || [];
      } catch (error) {
        console.error('Error refetching categories:', error);
        return [];
      }
    };

    const refetchUsers = async (): Promise<any[]> => {
      try {
        const result = await supabaseData.refetchUsers();
        return result?.data || [];
      } catch (error) {
        console.error('Error refetching users:', error);
        return [];
      }
    };

    return {
      articles: supabaseData.articles || [],
      categories: supabaseData.categories || [],
      users: supabaseData.users || [],
      loading: supabaseData.loading || false,
      isManager: isManager || false,
      createArticle,
      updateArticle,
      deleteArticle,
      incrementViews,
      refetchArticles,
      refetchCategories,
      refetchUsers
    };
  }, [
    supabaseData.articles,
    supabaseData.categories, 
    supabaseData.users,
    supabaseData.loading,
    isManager,
    articleOps.createArticle,
    articleOps.incrementViews,
    supabaseData.refetchArticles,
    supabaseData.refetchCategories,
    supabaseData.refetchUsers
  ]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
