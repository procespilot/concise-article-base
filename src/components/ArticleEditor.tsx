import React from 'react';
import { ArticleEditorNew } from './ArticleEditorNew';

interface ArticleEditorProps {
  articleId?: string;
  onBack: () => void;
  onSave: (articleData: any) => Promise<void>;
  articles: any[];
  categories: any[];
}

const ArticleEditor = ({ articleId, onBack, onSave, articles, categories }: ArticleEditorProps) => {
  // Legacy wrapper - redirect to new improved editor
  return (
    <ArticleEditorNew
      articleId={articleId}
      onBack={onBack}
      articles={articles}
      categories={categories}
    />
  );
};

export default ArticleEditor;
