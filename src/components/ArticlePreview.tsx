
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ArticleFormData } from '@/schemas/articleSchema';
import DOMPurify from 'dompurify';

interface ArticlePreviewProps {
  data: ArticleFormData;
}

export const ArticlePreview: React.FC<ArticlePreviewProps> = ({ data }) => {
  const sanitizedContent = DOMPurify.sanitize(data.content || '');
  
  return (
    <div className="prose max-w-none">
      <div className="not-prose mb-6">
        <h1 className="text-3xl font-bold mb-4">
          {data.title || "Artikel titel"}
        </h1>
        
        {data.excerpt && (
          <p className="text-lg text-gray-600 mb-6 italic">
            {data.excerpt}
          </p>
        )}
        
        {data.featured && (
          <Badge className="mb-4 bg-yellow-100 text-yellow-800">
            Uitgelicht
          </Badge>
        )}
      </div>
      
      <div 
        className="whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
      
      {data.keywords && data.keywords.length > 0 && (
        <div className="not-prose mt-8 pt-6 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Trefwoorden:</h3>
          <div className="flex flex-wrap gap-2">
            {data.keywords.map((keyword, index) => (
              <Badge key={index} variant="outline">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
