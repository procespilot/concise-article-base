import React, { useState, useEffect } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  FileText, 
  Tag, 
  Calendar, 
  User, 
  Filter,
  Plus,
  Settings,
  BarChart,
  Archive,
  Star,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Article } from '@/types/article';
import { Category } from '@/types/user';

interface ArticleCommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  categories: Category[];
  onArticleSelect: (articleId: string) => void;
  onCreateArticle?: () => void;
  onCategoryFilter?: (categoryId: string) => void;
  onStatusFilter?: (status: string) => void;
  onQuickAction?: (action: string, articleId?: string) => void;
  isManager?: boolean;
}

const ArticleCommandMenu = ({
  isOpen,
  onClose,
  articles,
  categories,
  onArticleSelect,
  onCreateArticle,
  onCategoryFilter,
  onStatusFilter,
  onQuickAction,
  isManager = false
}: ArticleCommandMenuProps) => {
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!isOpen) {
          // Open handled by parent component
        }
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen]);

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchValue.toLowerCase()) ||
    article.content.toLowerCase().includes(searchValue.toLowerCase()) ||
    article.keywords?.some(keyword => 
      keyword.toLowerCase().includes(searchValue.toLowerCase())
    )
  ).slice(0, 8); // Limit results for performance

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Gepubliceerd':
        return <Eye className="h-4 w-4" />;
      case 'Concept':
        return <Edit className="h-4 w-4" />;
      case 'Archief':
        return <Archive className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleSelect = (callback: () => void) => {
    callback();
    onClose();
  };

  return (
    <CommandDialog 
      open={isOpen} 
      onOpenChange={onClose}
      aria-label="Artikel zoeken en acties uitvoeren"
    >
      <CommandInput 
        placeholder="Zoek artikelen, categorieën of acties..." 
        value={searchValue}
        onValueChange={setSearchValue}
      />
      <CommandList className="max-h-96">
        <CommandEmpty>
          <div className="py-6 text-center text-sm text-muted-foreground">
            <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
            Geen resultaten gevonden
          </div>
        </CommandEmpty>

        {/* Quick Actions */}
        {isManager && (
          <CommandGroup heading="Acties">
            <CommandItem
              onSelect={() => handleSelect(() => onCreateArticle?.())}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nieuw artikel maken</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                Ctrl+N
              </Badge>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => onQuickAction?.('analytics'))}
              className="flex items-center gap-2"
            >
              <BarChart className="h-4 w-4" />
              <span>Analytics bekijken</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect(() => onQuickAction?.('settings'))}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span>Instellingen</span>
            </CommandItem>
          </CommandGroup>
        )}

        {/* Articles */}
        {filteredArticles.length > 0 && (
          <CommandGroup heading="Artikelen">
            {filteredArticles.map((article) => (
              <CommandItem
                key={article.id}
                onSelect={() => handleSelect(() => onArticleSelect(article.id))}
                className="flex items-center gap-3 py-3"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getStatusIcon(article.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{article.title}</span>
                      {article.featured && (
                        <Star className="h-3 w-3 text-yellow-500 fill-current shrink-0" />
                      )}
                    </div>
                    {article.excerpt && (
                      <p className="text-xs text-muted-foreground truncate">
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {article.categories && (
                    <Badge variant="outline" className="text-xs">
                      {article.categories.name}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {article.views || 0} views
                  </Badge>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Filters */}
        <CommandSeparator />
        <CommandGroup heading="Filters">
          {/* Status filters */}
          <CommandItem
            onSelect={() => handleSelect(() => onStatusFilter?.('Gepubliceerd'))}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            <span>Alleen gepubliceerde artikelen</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => onStatusFilter?.('Concept'))}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            <span>Alleen concepten</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => onStatusFilter?.('featured'))}
            className="flex items-center gap-2"
          >
            <Star className="h-4 w-4" />
            <span>Alleen featured artikelen</span>
          </CommandItem>
        </CommandGroup>

        {/* Categories */}
        {categories.length > 0 && (
          <CommandGroup heading="Categorieën">
            {categories.slice(0, 5).map((category) => (
              <CommandItem
                key={category.id}
                onSelect={() => handleSelect(() => onCategoryFilter?.(category.id))}
                className="flex items-center gap-2"
              >
                <Tag className="h-4 w-4" />
                <span>{category.name}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {articles.filter(a => a.category_id === category.id).length}
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Recently viewed or popular articles */}
        {articles.length > 0 && (
          <CommandGroup heading="Populaire artikelen">
            {articles
              .sort((a, b) => (b.views || 0) - (a.views || 0))
              .slice(0, 3)
              .map((article) => (
                <CommandItem
                  key={`popular-${article.id}`}
                  onSelect={() => handleSelect(() => onArticleSelect(article.id))}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  <span className="truncate">{article.title}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {article.views} views
                  </Badge>
                </CommandItem>
              ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default ArticleCommandMenu;