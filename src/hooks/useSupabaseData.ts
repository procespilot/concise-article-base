
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseData = () => {
  const { toast } = useToast();

  const {
    data: articles = [],
    isLoading: articlesLoading,
    error: articlesError,
    refetch: refetchArticles
  } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      console.log('Fetching articles with optimized query...');
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories(name),
          profiles!articles_author_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching articles:', error);
        throw error;
      }
      
      console.log('Articles fetched successfully:', data?.length || 0);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
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
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });

  // Show error toasts
  if (articlesError) {
    toast({
      title: "Fout bij laden artikelen",
      description: articlesError.message,
      variant: "destructive"
    });
  }

  if (categoriesError) {
    toast({
      title: "Fout bij laden categorieën",
      description: categoriesError.message,
      variant: "destructive"
    });
  }

  if (usersError) {
    toast({
      title: "Fout bij laden gebruikers",
      description: usersError.message,
      variant: "destructive"
    });
  }

  return {
    articles,
    categories,
    users,
    loading: articlesLoading || categoriesLoading || usersLoading,
    refetchArticles,
    refetchCategories,
    refetchUsers,
    refreshAllData: () => {
      refetchArticles();
      refetchCategories();
      refetchUsers();
    }
  };
};
