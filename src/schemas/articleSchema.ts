
import { z } from 'zod';

export const articleSchema = z.object({
  title: z.string()
    .min(3, "Titel moet minimaal 3 karakters lang zijn")
    .max(200, "Titel mag maximaal 200 karakters lang zijn")
    .trim(),
  
  excerpt: z.string()
    .max(500, "Uittreksel mag maximaal 500 karakters lang zijn")
    .trim()
    .optional(),
  
  content: z.string()
    .min(10, "Inhoud moet minimaal 10 karakters lang zijn")
    .max(50000, "Inhoud mag maximaal 50.000 karakters lang zijn")
    .trim(),
  
  category_id: z.string()
    .uuid("Selecteer een geldige categorie")
    .min(1, "Categorie is verplicht"),
  
  keywords: z.array(z.string().trim())
    .max(10, "Maximaal 10 trefwoorden toegestaan")
    .default([]),
  
  featured: z.boolean().default(false),
  
  status: z.enum(['Concept', 'Gepubliceerd']).default('Concept')
});

export type ArticleFormData = z.infer<typeof articleSchema>;

export const articleUpdateSchema = articleSchema.partial();
export type ArticleUpdateData = z.infer<typeof articleUpdateSchema>;
