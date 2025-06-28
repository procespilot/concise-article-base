
import React, { useState, useEffect } from 'react';
import { Bookmark, Clock, Eye, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Article } from '@/types/article';

interface BookmarkedArticlesProps {
  articles: Article[];
  onArticleClick: (id: string) => void;
}

const BookmarkedArticles = ({ articles, onArticleClick }: BookmarkedArticlesProps) => {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('articleBookmarks') || '[]');
    setBookmarkedIds(bookmarks);
  }, []);

  const removeBookmark = (articleId: string) => {
    const newBookmarks = bookmarkedIds.filter(id => id !== articleId);
    localStorage.setItem('articleBookmarks', JSON.stringify(newBookmarks));
    setBookmarkedIds(newBookmarks);
  };

  const bookmarkedArticles = articles.filter(article => 
    bookmarkedIds.includes(article.id)
  );

  if (bookmarkedArticles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Opgeslagen Artikelen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Je hebt nog geen artikelen opgeslagen. Klik op het bladwijzer-icoon bij artikelen om ze hier te zien.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          Opgeslagen Artikelen ({bookmarkedArticles.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookmarkedArticles.map(article => (
          <div
            key={article.id}
            className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
          >
            <div 
              className="flex-1 cursor-pointer"
              onClick={() => onArticleClick(article.id)}
            >
              <h4 className="font-medium text-gray-900 mb-2">
                {article.title}
              </h4>
              
              {article.excerpt && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {article.excerpt}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(article.created_at).toLocaleDateString('nl-NL')}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {article.views}
                </div>
                {article.categories && (
                  <Badge variant="outline" className="text-xs">
                    {article.categories.name}
                  </Badge>
                )}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeBookmark(article.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default BookmarkedArticles;
