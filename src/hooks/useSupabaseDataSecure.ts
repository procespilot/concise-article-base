import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useMemo, useRef } from 'react';
import { Article } from '@/types/article';
import { UserProfile, Category } from '@/types/user';

export const useSupabaseDataSecure = () => {
  const { toast } = useToast();
  const hasShownErrorRef = useRef({ articles: false, categories: false, users: false });

  const {
    data: articles = [],
    isLoading: articlesLoading,
    error: articlesError,
    refetch: refetchArticles
  } = useQuery({
    queryKey: ['articles'],
    queryFn: async (): Promise<Article[]> => {
      console.log('Fetching articles with optimized and secure query...');
      
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories(name)
        `)
        .order('created_at', { ascending: false })
        .limit(100); // Limit to prevent excessive data fetching

      if (error) {
        console.error('Error fetching articles:', error);
        throw new Error(`Failed to fetch articles: ${error.message}`);
      }
      
      console.log('Articles fetched successfully:', data?.length || 0);
      return (data || []) as Article[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    retryOnMount: false
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      console.log('Fetching categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
        .limit(50); // Reasonable limit for categories

      if (error) {
        console.error('Error fetching categories:', error);
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }
      
      console.log('Categories fetched successfully:', data?.length || 0);
      return (data || []) as Category[];
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    retryOnMount: false
  });

  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UserProfile[]> => {
      console.log('Fetching users...');
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_users_with_roles');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw new Error(`Failed to fetch users: ${usersError.message}`);
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
      })) as UserProfile[];

      console.log('Users fetched successfully:', transformedUsers?.length || 0);
      return transformedUsers;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    retryOnMount: false
  });

  // Stable refresh function
  const refreshAllData = useCallback(() => {
    Promise.all([
      refetchArticles(),
      refetchCategories(),
      refetchUsers()
    ]).catch(error => {
      console.error('Error refreshing data:', error);
    });
  }, [refetchArticles, refetchCategories, refetchUsers]);

  // Show error toasts only once per session with better error handling
  useMemo(() => {
    if (articlesError && !hasShownErrorRef.current.articles) {
      hasShownErrorRef.current.articles = true;
      toast({
        title: "Fout bij laden artikelen",
        description: "Er is een probleem met het laden van artikelen. Probeer de pagina te vernieuwen.",
        variant: "destructive"
      });
    }

    if (categoriesError && !hasShownErrorRef.current.categories) {
      hasShownErrorRef.current.categories = true;
      toast({
        title: "Fout bij laden categorieën",
        description: "Er is een probleem met het laden van categorieën. Probeer de pagina te vernieuwen.",
        variant: "destructive"
      });
    }

    if (usersError && !hasShownErrorRef.current.users) {
      hasShownErrorRef.current.users = true;
      toast({
        title: "Fout bij laden gebruikers",
        description: "Er is een probleem met het laden van gebruikers. Probeer de pagina te vernieuwen.",
        variant: "destructive"
      });
    }
  }, [articlesError, categoriesError, usersError, toast]);

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
