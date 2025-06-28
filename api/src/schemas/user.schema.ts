
import { z } from 'zod';
import { paginationSchema, roleSchema } from './common.schema';

export const userSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  is_active: z.boolean(),
  activated_at: z.string().nullable(),
  created_at: z.string(),
  user_roles: z.array(z.object({
    role: roleSchema
  }))
});

export const createUserSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1).max(50).optional(),
  last_name: z.string().min(1).max(50).optional(),
  phone: z.string().optional(),
  role: roleSchema.default('user'),
  auto_activate: z.boolean().default(false)
});

export const updateUserSchema = z.object({
  first_name: z.string().max(50).optional(),
  last_name: z.string().max(50).optional(),
  phone: z.string().optional(),
  is_active: z.boolean().optional()
});

export const userQuerySchema = paginationSchema.extend({
  role: roleSchema.optional(),
  is_active: z.boolean().optional(),
  search: z.string().min(1).optional()
});

export const activateUserSchema = z.object({
  is_active: z.boolean()
});

export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQuery = z.infer<typeof userQuerySchema>;
