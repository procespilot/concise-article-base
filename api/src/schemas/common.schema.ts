
import { z } from 'zod';

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20)
});

// Common response schemas
export const successResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional()
});

export const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional()
});

export const paginatedResponseSchema = <T>(dataSchema: z.ZodType<T>) => z.object({
  data: z.array(dataSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number()
  })
});

// Common query parameters
export const searchQuerySchema = z.object({
  q: z.string().min(2).optional().describe('Search query (minimum 2 characters)')
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid UUID format')
});

// Role enum
export const roleSchema = z.enum(['user', 'manager', 'admin']);

export type PaginationQuery = z.infer<typeof paginationSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type UserRole = z.infer<typeof roleSchema>;
