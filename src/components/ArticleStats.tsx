
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar, User, Tag } from 'lucide-react';
import { ArticleFormData } from '@/schemas/articleSchema';

interface ArticleStatsProps {
  data: ArticleFormData;
  article?: any;
}

export const ArticleStats: React.FC<ArticleStatsProps> = ({ data, article }) => {
  const wordCount = data.content ? data.content.trim().split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Artikel statistieken</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Woorden</span>
            <span className="font-medium">{wordCount.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Leestijd</span>
            <span className="font-medium">{readingTime} min</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Karakters</span>
            <span className="font-medium">{(data.content?.length || 0).toLocaleString()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Trefwoorden</span>
            <span className="font-medium">{data.keywords?.length || 0}/10</span>
          </div>
        </CardContent>
      </Card>

      {article && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Artikel details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{article.views || 0} weergaven</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                {new Date(article.created_at).toLocaleDateString('nl-NL')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Jij</span>
            </div>
            
            <div>
              <Badge 
                variant={article.status === 'Gepubliceerd' ? 'default' : 'secondary'}
              >
                {article.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">SEO Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Titel lengte</span>
            <Badge variant={
              data.title && data.title.length >= 30 && data.title.length <= 70 
                ? 'default' 
                : 'secondary'
            }>
              {data.title ? (
                data.title.length >= 30 && data.title.length <= 70 ? 'Goed' : 'Te kort/lang'
              ) : 'Leeg'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Uittreksel</span>
            <Badge variant={
              data.excerpt && data.excerpt.length >= 120 && data.excerpt.length <= 160 
                ? 'default' 
                : 'secondary'
            }>
              {data.excerpt ? (
                data.excerpt.length >= 120 && data.excerpt.length <= 160 ? 'Goed' : 'Te kort/lang'
              ) : 'Ontbreekt'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Trefwoorden</span>
            <Badge variant={
              data.keywords && data.keywords.length >= 3 && data.keywords.length <= 8
                ? 'default' 
                : 'secondary'
            }>
              {data.keywords && data.keywords.length >= 3 && data.keywords.length <= 8 
                ? 'Goed' 
                : 'Te weinig/veel'
              }
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
