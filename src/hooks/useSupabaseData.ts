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
  profiles: { first_name: string | null; last_name: string | null } | null;
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
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories(name),
          profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Fout bij laden van artikelen",
        description: "Probeer de pagina te verversen",
        variant: "destructive"
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Fout bij laden van categorieën",
        description: "Probeer de pagina te verversen",
        variant: "destructive"
      });
    }
  };

  const fetchUsers = async () => {
    try {
      // Get profiles with basic fields only (removing phone and other non-existent fields)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get user roles for each profile
      const usersWithRoles = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);

          return {
            ...profile,
            user_roles: rolesData || []
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Fout bij laden van gebruikers",
        description: "Probeer de pagina te verversen",
        variant: "destructive"
      });
    }
  };

  const createArticle = async (articleData: {
    title: string;
    excerpt: string;
    content: string;
    category_id: string;
    status: string;
    featured: boolean;
    keywords: string[];
  }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Niet ingelogd');

      const { error } = await supabase
        .from('articles')
        .insert([{
          ...articleData,
          author_id: userData.user.id
        }]);

      if (error) throw error;
      
      await fetchArticles();
      toast({
        title: "Artikel aangemaakt",
        description: "Je artikel is succesvol aangemaakt"
      });
      return true;
    } catch (error) {
      console.error('Error creating article:', error);
      toast({
        title: "Fout bij aanmaken artikel",
        description: "Probeer het opnieuw",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateArticle = async (id: string, articleData: {
    title: string;
    excerpt: string;
    content: string;
    category_id: string;
    status: string;
    featured: boolean;
    keywords: string[];
  }) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update(articleData)
        .eq('id', id);

      if (error) throw error;
      
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
        description: "Probeer het opnieuw",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
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
        description: "Probeer het opnieuw",
        variant: "destructive"
      });
      return false;
    }
  };

  const incrementViews = async (id: string) => {
    try {
      // Simple update for views
      const article = articles.find(a => a.id === id);
      if (article) {
        await supabase
          .from('articles')
          .update({ views: article.views + 1 })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchArticles(),
        fetchCategories(),
        fetchUsers()
      ]);
      setLoading(false);
    };

    loadData();
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
    refetchArticles: fetchArticles,
    refetchCategories: fetchCategories,
    refetchUsers: fetchUsers
  };
};
