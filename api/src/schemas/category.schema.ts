
import { z } from 'zod';
import { paginationSchema } from './common.schema';

export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional()
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryQuerySchema = paginationSchema.extend({
  search: z.string().min(1).optional()
});

export type Category = z.infer<typeof categorySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
