
import { supabaseAdmin, Category } from '@/config/supabase';
import { CreateCategoryInput, UpdateCategoryInput, CategoryQuery } from '@/schemas/category.schema';

export class CategoryService {
  async getCategories(query: CategoryQuery) {
    const { page = 1, pageSize = 20, search } = query;
    
    let dbQuery = supabaseAdmin
      .from('categories')
      .select('*', { count: 'exact' });

    if (search) {
      dbQuery = dbQuery.ilike('name', `%${search}%`);
    }

    const offset = (page - 1) * pageSize;
    dbQuery = dbQuery
      .range(offset, offset + pageSize - 1)
      .order('name', { ascending: true });

    const { data, error, count } = await dbQuery;

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
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

  async getCategoryById(id: string): Promise<Category | null> {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch category: ${error.message}`);
    }

    return data;
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert(input)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }

    return data;
  }

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }

    return data;
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  }
}

export const categoryService = new CategoryService();
