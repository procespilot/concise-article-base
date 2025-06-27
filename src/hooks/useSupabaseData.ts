import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Article {
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
  categories: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
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

export const useSupabaseData = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchArticles = async () => {
    try {
      console.log('Fetching articles...');
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
      
      console.log('Articles fetched successfully:', data?.length || 0, 'articles');
      setArticles(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Fout bij laden van artikelen",
        description: "Probeer de pagina te verversen",
        variant: "destructive"
      });
      return [];
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      console.log('Categories fetched successfully:', data?.length || 0, 'categories');
      setCategories(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Fout bij laden van categorieën",
        description: "Probeer de pagina te verversen",
        variant: "destructive"
      });
      return [];
    }
  };

  const fetchUsers = async () => {
    try {
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

      console.log('Users fetched successfully:', transformedUsers?.length || 0, 'users');
      setUsers(transformedUsers);
      return transformedUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Fout bij laden van gebruikers",
        description: "Probeer de pagina te verversen",
        variant: "destructive"
      });
      return [];
    }
  };

  const createArticle = async (articleData: {
    title: string;
    excerpt: string;
    content: string;
    category_id: string | null;
    status: string;
    featured: boolean;
    keywords: string[];
  }) => {
    try {
      console.log('Creating article:', articleData);
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        console.error('Authentication error:', userError);
        throw new Error('Niet ingelogd');
      }

      console.log('Current user:', userData.user.id);

      const cleanedData = {
        ...articleData,
        category_id: articleData.category_id && articleData.category_id.trim() !== '' ? articleData.category_id : null
      };

      const { data, error } = await supabase
        .from('articles')
        .insert([{
          ...cleanedData,
          author_id: userData.user.id
        }])
        .select(`
          *,
          categories(name)
        `)
        .single();

      if (error) {
        console.error('Error creating article:', error);
        throw error;
      }
      
      console.log('Article created successfully:', data);
      
      // Refresh articles immediately
      const updatedArticles = await fetchArticles();
      
      toast({
        title: "Artikel aangemaakt",
        description: "Je artikel is succesvol aangemaakt"
      });
      return true;
    } catch (error) {
      console.error('Error creating article:', error);
      toast({
        title: "Fout bij aanmaken artikel",
        description: error instanceof Error ? error.message : "Probeer het opnieuw",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateArticle = async (id: string, articleData: {
    title: string;
    excerpt: string;
    content: string;
    category_id: string | null;
    status: string;
    featured: boolean;
    keywords: string[];
  }) => {
    try {
      console.log('Updating article:', id, articleData);
      
      const cleanedData = {
        ...articleData,
        category_id: articleData.category_id && articleData.category_id.trim() !== '' ? articleData.category_id : null
      };

      const { error } = await supabase
        .from('articles')
        .update(cleanedData)
        .eq('id', id);

      if (error) {
        console.error('Error updating article:', error);
        throw error;
      }
      
      console.log('Article updated successfully');
      
      // Refresh articles immediately
      await fetchArticles();
      
      toast({
        title: "Artikel bijgewerkt",
        description: "Je wijzigingen zijn opgeslagen"
      });
      return true;
    } catch (error) {
      console.error('Error updating article:', error);
      toast({
        title: "Fout bij bijwerken artikel",
        description: error instanceof Error ? error.message : "Probeer het opnieuw",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      console.log('Deleting article:', id);
      
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting article:', error);
        throw error;
      }
      
      console.log('Article deleted successfully');
      
      // Refresh articles immediately
      await fetchArticles();
      
      toast({
        title: "Artikel verwijderd",
        description: "Het artikel is succesvol verwijderd"
      });
      return true;
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: "Fout bij verwijderen artikel",
        description: error instanceof Error ? error.message : "Probeer het opnieuw",
        variant: "destructive"
      });
      return false;
    }
  };

  const incrementViews = async (id: string) => {
    try {
      console.log('Incrementing views for article:', id);
      
      const { data: currentArticle, error: fetchError } = await supabase
        .from('articles')
        .select('views')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching current views:', fetchError);
        return;
      }

      const currentViews = currentArticle?.views || 0;
      
      const { error } = await supabase
        .from('articles')
        .update({ views: currentViews + 1 })
        .eq('id', id);

      if (error) {
        console.error('Error incrementing views:', error);
      } else {
        console.log('Views incremented successfully');
        // Refresh articles to show updated view count
        await fetchArticles();
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const refreshAllData = async () => {
    console.log('Refreshing all data...');
    setLoading(true);
    await Promise.all([
      fetchArticles(),
      fetchCategories(),
      fetchUsers()
    ]);
    setLoading(false);
    console.log('All data refreshed');
  };

  const refetchArticles = async () => {
    const data = await fetchArticles();
    return data;
  };

  const refetchCategories = async () => {
    const data = await fetchCategories();
    return data;
  };

  const refetchUsers = async () => {
    const data = await fetchUsers();
    return data;
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  return {
    articles,
    categories,
    users,
    loading,
    createArticle,
    updateArticle,
    deleteArticle,
    incrementViews,
    refetchArticles,
    refetchCategories,
    refetchUsers,
    refreshAllData
  };
};
