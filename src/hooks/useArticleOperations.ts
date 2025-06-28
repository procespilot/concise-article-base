
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArticleFormData } from '@/schemas/articleSchema';

interface CreateArticleResponse {
  success: boolean;
  article_id?: string;
  error?: string;
  message?: string;
}

interface PublishArticleResponse {
  success: boolean;
  error?: string;
  message?: string;
}

// Type guard functions
const isCreateArticleResponse = (data: any): data is CreateArticleResponse => {
  return data && typeof data === 'object' && typeof data.success === 'boolean';
};

const isPublishArticleResponse = (data: any): data is PublishArticleResponse => {
  return data && typeof data === 'object' && typeof data.success === 'boolean';
};

export const useArticleOperations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createArticleMutation = useMutation({
    mutationFn: async (articleData: ArticleFormData): Promise<CreateArticleResponse> => {
      console.log('Creating article with secure RPC:', articleData);
      
      const { data, error } = await supabase.rpc('create_article_secure', {
        input: articleData
      });

      if (error) {
        console.error('RPC Error:', error);
        throw new Error(error.message);
      }

      // Safe type conversion with validation
      if (!data) {
        throw new Error('No response data received');
      }

      // Convert to unknown first, then validate
      const response = data as unknown;
      
      if (!isCreateArticleResponse(response)) {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format from server');
      }

      return response;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Artikel opgeslagen",
          description: data.message || "Je artikel is succesvol opgeslagen als concept"
        });
        
        // Invalidate and refetch articles
        queryClient.invalidateQueries({ queryKey: ['articles'] });
      } else {
        toast({
          title: "Fout bij opslaan",
          description: data.error || "Er is een fout opgetreden",
          variant: "destructive"
        });
      }
    },
    onError: (error: Error) => {
      console.error('Create article error:', error);
      toast({
        title: "Fout bij opslaan",
        description: error.message || "Er is een onverwachte fout opgetreden",
        variant: "destructive"
      });
    }
  });

  const publishArticleMutation = useMutation({
    mutationFn: async (articleId: string): Promise<PublishArticleResponse> => {
      console.log('Publishing article:', articleId);
      
      const { data, error } = await supabase.rpc('publish_article_secure', {
        article_id: articleId
      });

      if (error) {
        console.error('Publish RPC Error:', error);
        throw new Error(error.message);
      }

      // Safe type conversion with validation
      if (!data) {
        throw new Error('No response data received');
      }

      // Convert to unknown first, then validate
      const response = data as unknown;
      
      if (!isPublishArticleResponse(response)) {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format from server');
      }

      return response;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Artikel gepubliceerd",
          description: data.message || "Je artikel is succesvol gepubliceerd"
        });
        
        // Invalidate and refetch articles
        queryClient.invalidateQueries({ queryKey: ['articles'] });
      } else {
        toast({
          title: "Fout bij publiceren",
          description: data.error || "Er is een fout opgetreden",
          variant: "destructive"
        });
      }
    },
    onError: (error: Error) => {
      console.error('Publish article error:', error);
      toast({
        title: "Fout bij publiceren",
        description: error.message || "Er is een onverwachte fout opgetreden",
        variant: "destructive"
      });
    }
  });

  const incrementViewsMutation = useMutation({
    mutationFn: async (articleId: string) => {
      const { data, error } = await supabase.rpc('increment_article_views', {
        article_id: articleId
      });

      if (error) {
        console.error('Increment views error:', error);
        throw new Error(error.message);
      }

      return data;
    },
    onError: (error: Error) => {
      console.error('Failed to increment views:', error);
      // Don't show error toast for view increments as it's not critical
    }
  });

  return {
    createArticle: createArticleMutation.mutate,
    publishArticle: publishArticleMutation.mutate,
    incrementViews: incrementViewsMutation.mutate,
    isCreating: createArticleMutation.isPending,
    isPublishing: publishArticleMutation.isPending,
    createError: createArticleMutation.error,
    publishError: publishArticleMutation.error
  };
};
