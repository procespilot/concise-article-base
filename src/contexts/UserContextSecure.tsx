import React, { createContext, useContext, useMemo } from 'react';
import { useSupabaseDataSecure } from '@/hooks/useSupabaseDataSecure';
import { useAuth } from '@/hooks/useAuth';
import { useArticleOperationsSecure } from '@/hooks/useArticleOperationsSecure';
import { Article, ArticleFormData } from '@/types/article';
import { UserProfile, Category } from '@/types/user';

interface UserContextSecureType {
  articles: Article[];
  categories: Category[];
  users: UserProfile[];
  loading: boolean;
  isManager: boolean;
  createArticle: (data: ArticleFormData) => Promise<boolean>;
  updateArticle: (id: string, data: ArticleFormData) => Promise<boolean>;
  deleteArticle: (id: string) => Promise<boolean>;
  incrementViews: (id: string) => void;
  refetchArticles: () => Promise<Article[]>;
  refetchCategories: () => Promise<Category[]>;
  refetchUsers: () => Promise<UserProfile[]>;
}

const UserContextSecure = createContext<UserContextSecureType | undefined>(undefined);

export const useUserSecure = () => {
  const context = useContext(UserContextSecure);
  if (context === undefined) {
    throw new Error('useUserSecure must be used within a UserProviderSecure');
  }
  return context;
};

export const UserProviderSecure: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabaseData = useSupabaseDataSecure();
  const { isManager } = useAuth();
  const articleOps = useArticleOperationsSecure();

  // Stable context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    const createArticle = async (data: ArticleFormData): Promise<boolean> => {
      try {
        await articleOps.createArticle(data);
        return true;
      } catch (error) {
        console.error('Error creating article:', error);
        return false;
      }
    };

    const updateArticle = async (id: string, data: ArticleFormData): Promise<boolean> => {
      try {
        // For now, since we don't have an update mutation, we'll create a new article
        // This should be replaced with proper update logic when available
        console.warn('Update functionality not fully implemented, creating new article instead');
        await articleOps.createArticle(data);
        return true;
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

    const refetchArticles = async (): Promise<Article[]> => {
      try {
        const result = await supabaseData.refetchArticles();
        return result?.data || [];
      } catch (error) {
        console.error('Error refetching articles:', error);
        return [];
      }
    };

    const refetchCategories = async (): Promise<Category[]> => {
      try {
        const result = await supabaseData.refetchCategories();
        return result?.data || [];
      } catch (error) {
        console.error('Error refetching categories:', error);
        return [];
      }
    };

    const refetchUsers = async (): Promise<UserProfile[]> => {
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
    articleOps,
    supabaseData.refetchArticles,
    supabaseData.refetchCategories,
    supabaseData.refetchUsers
  ]);

  return (
    <UserContextSecure.Provider value={contextValue}>
      {children}
    </UserContextSecure.Provider>
  );
};
