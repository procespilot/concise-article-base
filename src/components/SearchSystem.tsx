import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Tag, Clock, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';
import { Article } from '@/types/article';
import { Category } from '@/types/user';
import SearchHighlight from '@/components/SearchHighlight';

interface SearchSystemProps {
  articles: Article[];
  categories: Category[];
  onArticleClick: (id: string) => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

interface SearchSuggestion {
  type: 'article' | 'category' | 'tag';
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
}

const SearchSystem = ({ articles, categories, onArticleClick, searchInputRef }: SearchSystemProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      generateSuggestions(debouncedQuery);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [debouncedQuery, articles, categories]);

  const generateSuggestions = (searchQuery: string) => {
    const newSuggestions: SearchSuggestion[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    // Search articles
    articles.forEach(article => {
      const matchesTitle = article.title.toLowerCase().includes(lowerQuery);
      const matchesContent = article.content.toLowerCase().includes(lowerQuery);
      const matchesKeywords = article.keywords?.some(keyword => 
        keyword.toLowerCase().includes(lowerQuery)
      );

      if (matchesTitle || matchesContent || matchesKeywords) {
        newSuggestions.push({
          type: 'article',
          id: article.id,
          title: article.title,
          subtitle: article.excerpt || undefined,
          category: article.categories?.name
        });
      }
    });

    // Search categories
    categories.forEach(category => {
      if (category.name.toLowerCase().includes(lowerQuery)) {
        newSuggestions.push({
          type: 'category',
          id: category.id,
          title: category.name,
          subtitle: category.description || undefined
        });
      }
    });

    // Extract unique tags from articles
    const allTags = new Set<string>();
    articles.forEach(article => {
      article.keywords?.forEach(keyword => {
        if (keyword.toLowerCase().includes(lowerQuery)) {
          allTags.add(keyword);
        }
      });
    });

    allTags.forEach(tag => {
      newSuggestions.push({
        type: 'tag',
        id: tag,
        title: tag,
        subtitle: `${articles.filter(a => a.keywords?.includes(tag)).length} artikelen`
      });
    });

    setSuggestions(newSuggestions.slice(0, 10));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        handleSuggestionSelect(suggestions[selectedIndex]);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'article') {
      onArticleClick(suggestion.id);
    }
    setQuery('');
    setIsOpen(false);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'article': return <Search className="h-4 w-4" />;
      case 'category': return <Tag className="h-4 w-4" />;
      case 'tag': return <Tag className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Zoek artikelen, categorieën of tags..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.type}-${suggestion.id}`}
                className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                  index === selectedIndex ? 'bg-gray-50' : ''
                }`}
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-gray-400">
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <SearchHighlight 
                        text={suggestion.title} 
                        searchTerm={query}
                        className="font-medium text-gray-900"
                      />
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.type === 'article' ? 'Artikel' : 
                         suggestion.type === 'category' ? 'Categorie' : 'Tag'}
                      </Badge>
                    </div>
                    {suggestion.subtitle && (
                      <p className="text-sm text-gray-600 truncate">
                        {suggestion.subtitle}
                      </p>
                    )}
                    {suggestion.category && (
                      <p className="text-xs text-gray-500 mt-1">
                        in {suggestion.category}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchSystem;
