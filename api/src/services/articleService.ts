
import { supabaseAdmin, supabasePublic, Article } from '@/config/supabase';
import { CreateArticleInput, UpdateArticleInput, ArticleQuery } from '@/schemas/article.schema';
import { AuthenticatedUser } from '@/plugins/auth';

export class ArticleService {
  async searchArticles(query: ArticleQuery, user?: AuthenticatedUser) {
    const { page = 1, pageSize = 20, q, category_id, author_id, status, featured } = query;
    
    // Use admin client for broader access, but respect RLS through user context
    const client = user?.isApiKey ? supabaseAdmin : supabasePublic;
    
    let dbQuery = client
      .from('articles')
      .select(`
        *,
        categories(name),
        profiles!articles_author_id_fkey(first_name, last_name)
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      dbQuery = dbQuery.eq('status', status);
    } else if (!user?.role || user.role === 'user') {
      // Non-authenticated or regular users only see published articles
      dbQuery = dbQuery.eq('status', 'Gepubliceerd');
    }

    if (featured !== undefined) {
      dbQuery = dbQuery.eq('featured', featured);
    }

    if (category_id) {
      dbQuery = dbQuery.eq('category_id', category_id);
    }

    if (author_id) {
      dbQuery = dbQuery.eq('author_id', author_id);
    }

    // Full-text search on title and content
    if (q) {
      dbQuery = dbQuery.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
    }

    // Pagination
    const offset = (page - 1) * pageSize;
    dbQuery = dbQuery
      .range(offset, offset + pageSize - 1)
      .order('created_at', { ascending: false });

    const { data, error, count } = await dbQuery;

    if (error) {
      throw new Error(`Failed to fetch articles: ${error.message}`);
    }

    return {
      data: data || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    };
  }

  async getArticleById(id: string, user?: AuthenticatedUser): Promise<Article | null> {
    const client = user?.isApiKey ? supabaseAdmin : supabasePublic;
    
    const { data, error } = await client
      .from('articles')
      .select(`
        *,
        categories(name),
        profiles!articles_author_id_fkey(first_name, last_name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch article: ${error.message}`);
    }

    return data;
  }

  async createArticle(input: CreateArticleInput, authorId: string): Promise<Article> {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .insert({
        ...input,
        author_id: authorId,
        category_id: input.category_id || null
      })
      .select(`
        *,
        categories(name),
        profiles!articles_author_id_fkey(first_name, last_name)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create article: ${error.message}`);
    }

    return data;
  }

  async updateArticle(id: string, input: UpdateArticleInput, user: AuthenticatedUser): Promise<Article> {
    // Check if user owns the article or is manager/admin
    if (!user.isApiKey && user.role === 'user') {
      const existing = await this.getArticleById(id, user);
      if (!existing || existing.author_id !== user.id) {
        throw new Error('Insufficient permissions to update this article');
      }
    }

    const { data, error } = await supabaseAdmin
      .from('articles')
      .update({
        ...input,
        category_id: input.category_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        categories(name),
        profiles!articles_author_id_fkey(first_name, last_name)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update article: ${error.message}`);
    }

    return data;
  }

  async deleteArticle(id: string, user: AuthenticatedUser): Promise<void> {
    // Check permissions
    if (!user.isApiKey && user.role === 'user') {
      const existing = await this.getArticleById(id, user);
      if (!existing || existing.author_id !== user.id) {
        throw new Error('Insufficient permissions to delete this article');
      }
    }

    const { error } = await supabaseAdmin
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete article: ${error.message}`);
    }
  }

  async publishArticle(id: string): Promise<Article> {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .update({ 
        status: 'Gepubliceerd',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        categories(name),
        profiles!articles_author_id_fkey(first_name, last_name)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to publish article: ${error.message}`);
    }

    return data;
  }

  async incrementViews(id: string): Promise<void> {
    // Use RPC for atomic increment
    const { error } = await supabaseAdmin.rpc('increment_views', { article_id: id });
    
    if (error) {
      // Fallback to manual increment if RPC doesn't exist
      const { data: article } = await supabaseAdmin
        .from('articles')
        .select('views')
        .eq('id', id)
        .single();
      
      if (article) {
        await supabaseAdmin
          .from('articles')
          .update({ views: (article.views || 0) + 1 })
          .eq('id', id);
      }
    }
  }
}

export const articleService = new ArticleService();
