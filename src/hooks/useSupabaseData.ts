
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useMemo, useRef } from 'react';

export const useSupabaseData = () => {
  const { toast } = useToast();
  const hasShownErrorRef = useRef({ articles: false, categories: false, users: false });

  const {
    data: articles = [],
    isLoading: articlesLoading,
    error: articlesError,
    refetch: refetchArticles
  } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      console.log('Fetching articles with optimized query...');
      
      // Simplified query to avoid the profiles recursion issue
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching articles:', error);
        throw error;
      }
      
      console.log('Articles fetched successfully:', data?.length || 0);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    retryOnMount: false
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('Fetching categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      console.log('Categories fetched successfully:', data?.length || 0);
      return data || [];
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    retryOnMount: false
  });

  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      console.log('Fetching users...');
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_users_with_roles');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      const transformedUsers = (usersData || []).map((user: any) => ({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        is_active: user.is_active,
        activated_at: user.activated_at,
        created_at: user.created_at,
        user_roles: user.roles || []
      }));

      console.log('Users fetched successfully:', transformedUsers?.length || 0);
      return transformedUsers;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 1,
    retryOnMount: false
  });

  // Stable refresh function
  const refreshAllData = useCallback(() => {
    refetchArticles();
    refetchCategories();
    refetchUsers();
  }, [refetchArticles, refetchCategories, refetchUsers]);

  // Show error toasts only once per session
  if (articlesError && !hasShownErrorRef.current.articles) {
    hasShownErrorRef.current.articles = true;
    toast({
      title: "Fout bij laden artikelen",
      description: "Er is een probleem met het laden van artikelen",
      variant: "destructive"
    });
  }

  if (categoriesError && !hasShownErrorRef.current.categories) {
    hasShownErrorRef.current.categories = true;
    toast({
      title: "Fout bij laden categorieën",
      description: "Er is een probleem met het laden van categorieën",
      variant: "destructive"
    });
  }

  if (usersError && !hasShownErrorRef.current.users) {
    hasShownErrorRef.current.users = true;
    toast({
      title: "Fout bij laden gebruikers",
      description: "Er is een probleem met het laden van gebruikers",
      variant: "destructive"
    });
  }

  return useMemo(() => ({
    articles,
    categories,
    users,
    loading: articlesLoading || categoriesLoading || usersLoading,
    refetchArticles,
    refetchCategories,
    refetchUsers,
    refreshAllData
  }), [
    articles,
    categories,
    users,
    articlesLoading,
    categoriesLoading,
    usersLoading,
    refetchArticles,
    refetchCategories,
    refetchUsers,
    refreshAllData
  ]);
};
