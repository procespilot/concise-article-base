
import React from 'react';
import { Clock, Eye, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Article } from '@/types/article';

interface RelatedArticlesProps {
  currentArticle: Article;
  allArticles: Article[];
  onArticleClick: (id: string) => void;
  maxResults?: number;
}

const RelatedArticles = ({ 
  currentArticle, 
  allArticles, 
  onArticleClick, 
  maxResults = 5 
}: RelatedArticlesProps) => {
  
  const calculateRelatedness = (article: Article): number => {
    let score = 0;
    
    // Same category gets high score
    if (article.category_id === currentArticle.category_id && currentArticle.category_id) {
      score += 50;
    }
    
    // Shared keywords
    const sharedKeywords = article.keywords?.filter(keyword => 
      currentArticle.keywords?.includes(keyword)
    ) || [];
    score += sharedKeywords.length * 10;
    
    // Title similarity (basic word matching)
    const currentWords = currentArticle.title.toLowerCase().split(' ');
    const articleWords = article.title.toLowerCase().split(' ');
    const sharedWords = currentWords.filter(word => 
      word.length > 3 && articleWords.includes(word)
    );
    score += sharedWords.length * 5;
    
    // Content similarity (very basic - checking for common significant words)
    const currentContent = currentArticle.content.toLowerCase();
    const articleContent = article.content.toLowerCase();
    let contentMatches = 0;
    currentWords.forEach(word => {
      if (word.length > 4 && articleContent.includes(word)) {
        contentMatches++;
      }
    });
    score += Math.min(contentMatches, 10) * 2;
    
    return score;
  };

  const relatedArticles = allArticles
    .filter(article => 
      article.id !== currentArticle.id && 
      article.status === 'Gepubliceerd'
    )
    .map(article => ({
      ...article,
      relatedness: calculateRelatedness(article)
    }))
    .filter(article => article.relatedness > 0)
    .sort((a, b) => b.relatedness - a.relatedness)
    .slice(0, maxResults);

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Gerelateerde Artikelen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {relatedArticles.map(article => (
          <div
            key={article.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
            onClick={() => onArticleClick(article.id)}
          >
            <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
              {article.title}
            </h4>
            
            {article.excerpt && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {article.excerpt}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(article.created_at).toLocaleDateString('nl-NL')}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {article.views}
                </div>
              </div>
              
              {article.categories && (
                <Badge variant="outline" className="text-xs">
                  {article.categories.name}
                </Badge>
              )}
            </div>
            
            {article.keywords && article.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {article.keywords.slice(0, 3).map(keyword => (
                  <Badge key={keyword} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
                {article.keywords.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{article.keywords.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RelatedArticles;
