
import React from 'react';
import ArticleListEnhancedAI from './ArticleListEnhancedAI';
import { Article } from '@/types/article';
import { Category } from '@/types/user';

interface ArticleListEnhancedProps {
  articles: Article[];
  categories: Category[];
  onArticleClick: (id: string) => void;
  onCreateArticle?: () => void;
  isManager?: boolean;
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

const ArticleListEnhanced = (props: ArticleListEnhancedProps) => {
  return <ArticleListEnhancedAI {...props} />;
};

export default ArticleListEnhanced;
