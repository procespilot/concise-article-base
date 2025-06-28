
export interface Article {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  status: 'Concept' | 'Gepubliceerd';
  featured: boolean;
  views: number;
  keywords: string[];
  created_at: string;
  updated_at: string;
  category_id: string | null;
  author_id: string | null;
  categories?: { name: string } | null;
  profiles?: { first_name: string | null; last_name: string | null } | null;
}

export interface ArticleFormData {
  title: string;
  excerpt?: string;
  content: string;
  category_id: string;
  keywords: string[];
  featured: boolean;
  status: 'Concept' | 'Gepubliceerd';
}

export interface ArticleQuery {
  page?: number;
  pageSize?: number;
  q?: string;
  category_id?: string;
  author_id?: string;
  status?: 'Concept' | 'Gepubliceerd';
  featured?: boolean;
}

export interface ArticleResponse {
  data: Article[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
