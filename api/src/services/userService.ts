
import { supabaseAdmin, UserProfile } from '@/config/supabase';
import { CreateUserInput, UpdateUserInput, UserQuery } from '@/schemas/user.schema';

export class UserService {
  async getUsers(query: UserQuery) {
    const { page = 1, pageSize = 20, role, is_active, search } = query;
    
    // Use the existing RPC function
    const { data, error } = await supabaseAdmin.rpc('get_users_with_roles');

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    let filteredData = data || [];

    // Apply filters
    if (role) {
      filteredData = filteredData.filter(user => 
        user.roles && user.roles.some((r: any) => r.role === role)
      );
    }

    if (is_active !== undefined) {
      filteredData = filteredData.filter(user => user.is_active === is_active);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(user =>
        user.first_name?.toLowerCase().includes(searchLower) ||
        user.last_name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }

    // Manual pagination
    const total = filteredData.length;
    const offset = (page - 1) * pageSize;
    const paginatedData = filteredData.slice(offset, offset + pageSize);

    // Transform to match our schema
    const transformedData = paginatedData.map(user => ({
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

    return {
      data: transformedData,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  async getUserById(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        user_roles(role)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  }

  async createUser(input: CreateUserInput): Promise<any> {
    // Use the existing RPC function
    const { data, error } = await supabaseAdmin.rpc('create_user_with_role', {
      p_email: input.email,
      p_first_name: input.first_name || null,
      p_last_name: input.last_name || null,
      p_phone: input.phone || null,
      p_role: input.role,
      p_auto_activate: input.auto_activate
    });

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<UserProfile> {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        user_roles(role)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  }

  async activateUser(id: string, isActive: boolean): Promise<any> {
    if (isActive) {
      // Use RPC to activate
      const { data, error } = await supabaseAdmin.rpc('activate_user', {
        p_user_id: id
      });

      if (error) {
        throw new Error(`Failed to activate user: ${error.message}`);
      }

      return data;
    } else {
      // Use RPC to deactivate
      const { data, error } = await supabaseAdmin.rpc('deactivate_user', {
        p_user_id: id
      });

      if (error) {
        throw new Error(`Failed to deactivate user: ${error.message}`);
      }

      return data;
    }
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}

export const userService = new UserService();
