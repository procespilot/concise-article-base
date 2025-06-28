
import { supabaseAdmin, supabasePublic, Article } from '@/config/supabase';
import { CreateArticleInput, UpdateArticleInput, ArticleQuery } from '@/schemas/article.schema';
import { AuthenticatedUser } from '@/plugins/auth';
import { escapeForSearch, sanitizeString, validateUUID } from '@/utils/inputSanitization';

export class ArticleServiceSecure {
  async searchArticles(query: ArticleQuery, user?: AuthenticatedUser) {
    const { page = 1, pageSize = 20, q, category_id, author_id, status, featured } = query;
    
    // Validate and sanitize inputs
    const sanitizedQuery = q ? escapeForSearch(q) : '';
    const validatedCategoryId = category_id && validateUUID(category_id) ? category_id : null;
    const validatedAuthorId = author_id && validateUUID(author_id) ? author_id : null;
    
    // Limit page size to prevent resource exhaustion
    const safePage = Math.max(1, Math.min(page, 1000));
    const safePageSize = Math.max(1, Math.min(pageSize, 100));
    
    // Use admin client for broader access, but respect RLS through user context
    const client = user?.isApiKey ? supabaseAdmin : supabasePublic;
    
    let dbQuery = client
      .from('articles')
      .select(`
        *,
        categories(name),
        profiles!articles_author_id_fkey(first_name, last_name)
      `, { count: 'exact' });

    // Apply filters with proper validation
    if (status && ['Concept', 'Gepubliceerd'].includes(status)) {
      dbQuery = dbQuery.eq('status', status);
    } else if (!user?.role || user.role === 'user') {
      // Non-authenticated or regular users only see published articles
      dbQuery = dbQuery.eq('status', 'Gepubliceerd');
    }

    if (featured !== undefined && typeof featured === 'boolean') {
      dbQuery = dbQuery.eq('featured', featured);
    }

    if (validatedCategoryId) {
      dbQuery = dbQuery.eq('category_id', validatedCategoryId);
    }

    if (validatedAuthorId) {
      dbQuery = dbQuery.eq('author_id', validatedAuthorId);
    }

    // Safe text search using textSearch instead of ILIKE
    if (sanitizedQuery) {
      dbQuery = dbQuery.textSearch('search_doc', sanitizedQuery, {
        type: 'websearch',
        config: 'dutch'
      });
    }

    // Pagination with bounds checking
    const offset = (safePage - 1) * safePageSize;
    dbQuery = dbQuery
      .range(offset, offset + safePageSize - 1)
      .order('created_at', { ascending: false });

    const { data, error, count } = await dbQuery;

    if (error) {
      console.error('Search articles error:', error);
      throw new Error(`Failed to fetch articles: ${error.message}`);
    }

    return {
      data: data || [],
      pagination: {
        page: safePage,
        pageSize: safePageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / safePageSize)
      }
    };
  }

  async getArticleById(id: string, user?: AuthenticatedUser): Promise<Article | null> {
    if (!validateUUID(id)) {
      throw new Error('Invalid article ID format');
    }

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
      console.error('Get article error:', error);
      throw new Error(`Failed to fetch article: ${error.message}`);
    }

    return data;
  }

  async createArticle(input: CreateArticleInput, authorId: string): Promise<Article> {
    if (!validateUUID(authorId)) {
      throw new Error('Invalid author ID format');
    }

    // Sanitize inputs
    const sanitizedInput = {
      ...input,
      title: sanitizeString(input.title, 200),
      content: sanitizeString(input.content, 50000),
      excerpt: input.excerpt ? sanitizeString(input.excerpt, 500) : null,
      category_id: input.category_id && validateUUID(input.category_id) ? input.category_id : null
    };

    const { data, error } = await supabaseAdmin
      .from('articles')
      .insert({
        ...sanitizedInput,
        author_id: authorId,
        category_id: sanitizedInput.category_id
      })
      .select(`
        *,
        categories(name),
        profiles!articles_author_id_fkey(first_name, last_name)
      `)
      .single();

    if (error) {
      console.error('Create article error:', error);
      throw new Error(`Failed to create article: ${error.message}`);
    }

    return data;
  }

  async updateArticle(id: string, input: UpdateArticleInput, user: AuthenticatedUser): Promise<Article> {
    if (!validateUUID(id)) {
      throw new Error('Invalid article ID format');
    }

    // Check if user owns the article or is manager/admin
    if (!user.isApiKey && user.role === 'user') {
      const existing = await this.getArticleById(id, user);
      if (!existing || existing.author_id !== user.id) {
        throw new Error('Insufficient permissions to update this article');
      }
    }

    // Sanitize inputs
    const sanitizedInput: any = {};
    if (input.title) sanitizedInput.title = sanitizeString(input.title, 200);
    if (input.content) sanitizedInput.content = sanitizeString(input.content, 50000);
    if (input.excerpt !== undefined) {
      sanitizedInput.excerpt = input.excerpt ? sanitizeString(input.excerpt, 500) : null;
    }
    if (input.category_id && validateUUID(input.category_id)) {
      sanitizedInput.category_id = input.category_id;
    }

    const { data, error } = await supabaseAdmin
      .from('articles')
      .update({
        ...sanitizedInput,
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
      console.error('Update article error:', error);
      throw new Error(`Failed to update article: ${error.message}`);
    }

    return data;
  }

  async deleteArticle(id: string, user: AuthenticatedUser): Promise<void> {
    if (!validateUUID(id)) {
      throw new Error('Invalid article ID format');
    }

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
      console.error('Delete article error:', error);
      throw new Error(`Failed to delete article: ${error.message}`);
    }
  }

  async publishArticle(id: string): Promise<Article> {
    if (!validateUUID(id)) {
      throw new Error('Invalid article ID format');
    }

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
      console.error('Publish article error:', error);
      throw new Error(`Failed to publish article: ${error.message}`);
    }

    return data;
  }

  async incrementViews(id: string): Promise<void> {
    if (!validateUUID(id)) {
      throw new Error('Invalid article ID format');
    }

    // Use atomic increment via RPC to prevent race conditions
    const { error } = await supabaseAdmin.rpc('increment_article_views', { 
      article_id: id 
    });
    
    if (error) {
      console.error('Increment views error:', error);
      // Don't throw error for view increment failures as it's non-critical
    }
  }
}

export const articleServiceSecure = new ArticleServiceSecure();
