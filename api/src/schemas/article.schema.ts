
import { z } from 'zod';
import { paginationSchema, searchQuerySchema } from './common.schema';

// Article schemas
export const articleSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  excerpt: z.string().nullable(),
  content: z.string(),
  status: z.enum(['Concept', 'Gepubliceerd']),
  featured: z.boolean(),
  views: z.number(),
  keywords: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
  category_id: z.string().uuid().nullable(),
  author_id: z.string().uuid().nullable(),
  categories: z.object({
    name: z.string()
  }).nullable().optional(),
  profiles: z.object({
    first_name: z.string().nullable(),
    last_name: z.string().nullable()
  }).nullable().optional()
});

export const createArticleSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1),
  category_id: z.string().uuid().optional(),
  status: z.enum(['Concept', 'Gepubliceerd']).default('Concept'),
  featured: z.boolean().default(false),
  keywords: z.array(z.string()).default([])
});

export const updateArticleSchema = createArticleSchema.partial();

export const articleQuerySchema = paginationSchema.extend({
  ...searchQuerySchema.shape,
  category_id: z.string().uuid().optional(),
  author_id: z.string().uuid().optional(),
  status: z.enum(['Concept', 'Gepubliceerd']).optional(),
  featured: z.boolean().optional()
});

export const publishArticleSchema = z.object({
  status: z.literal('Gepubliceerd')
});

export type Article = z.infer<typeof articleSchema>;
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type ArticleQuery = z.infer<typeof articleQuerySchema>;
