
import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ArticleBookmarksProps {
  articleId: string;
  size?: 'sm' | 'md' | 'lg';
}

const ArticleBookmarks = ({ articleId, size = 'md' }: ArticleBookmarksProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load bookmarks from localStorage
    const bookmarks = JSON.parse(localStorage.getItem('articleBookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(articleId));
  }, [articleId]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('articleBookmarks') || '[]');
    
    if (isBookmarked) {
      // Remove bookmark
      const newBookmarks = bookmarks.filter((id: string) => id !== articleId);
      localStorage.setItem('articleBookmarks', JSON.stringify(newBookmarks));
      setIsBookmarked(false);
      toast({
        title: "Bladwijzer verwijderd",
        description: "Artikel is verwijderd uit je bladwijzers"
      });
    } else {
      // Add bookmark
      const newBookmarks = [...bookmarks, articleId];
      localStorage.setItem('articleBookmarks', JSON.stringify(newBookmarks));
      setIsBookmarked(true);
      toast({
        title: "Bladwijzer toegevoegd",
        description: "Artikel is toegevoegd aan je bladwijzers"
      });
    }
  };

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }[size];

  const buttonSize = {
    sm: 'sm',
    md: 'default',
    lg: 'lg'
  }[size] as 'sm' | 'default' | 'lg';

  return (
    <Button
      variant={isBookmarked ? "default" : "outline"}
      size={buttonSize}
      onClick={toggleBookmark}
      className="flex items-center gap-2"
    >
      {isBookmarked ? (
        <BookmarkCheck className={iconSize} />
      ) : (
        <Bookmark className={iconSize} />
      )}
      {size !== 'sm' && (
        <span>
          {isBookmarked ? 'Opgeslagen' : 'Opslaan'}
        </span>
      )}
    </Button>
  );
};

export default ArticleBookmarks;
