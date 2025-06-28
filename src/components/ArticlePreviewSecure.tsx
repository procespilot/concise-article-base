
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { sanitizeHtml } from '@/utils/inputSanitization';
import { ArticleFormData } from '@/types/article';

interface ArticlePreviewSecureProps {
  data: ArticleFormData;
}

export const ArticlePreviewSecure: React.FC<ArticlePreviewSecureProps> = ({ data }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Sanitize content before rendering
  const sanitizedContent = sanitizeHtml(data.content || '');
  const sanitizedTitle = data.title || 'Geen titel';
  const sanitizedExcerpt = data.excerpt ? sanitizeHtml(data.excerpt) : null;

  return (
    <div className="prose prose-gray max-w-none">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {sanitizedTitle}
        </h1>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span>Gepubliceerd op {formatDate(new Date())}</span>
          <Badge variant={data.status === 'Gepubliceerd' ? 'default' : 'secondary'}>
            {data.status}
          </Badge>
          {data.featured && (
            <Badge variant="outline">Uitgelicht</Badge>
          )}
        </div>

        {sanitizedExcerpt && (
          <div className="text-lg text-gray-600 mb-6 p-4 bg-gray-50 rounded-lg">
            <div dangerouslySetInnerHTML={{ __html: sanitizedExcerpt }} />
          </div>
        )}

        {data.keywords && data.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {data.keywords.map((keyword, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="article-content">
        {sanitizedContent ? (
          <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        ) : (
          <p className="text-gray-500 italic">Nog geen inhoud toegevoegd...</p>
        )}
      </div>
    </div>
  );
};

export default ArticlePreviewSecure;
