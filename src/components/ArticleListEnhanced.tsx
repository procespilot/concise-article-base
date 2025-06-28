
import React, { useState, useMemo } from 'react';
import { Search, Filter, Grid, List, Clock, Eye, User, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Article } from '@/types/article';
import { Category } from '@/types/user';
import SearchSystem from './SearchSystem';
import ArticleBookmarks from './ArticleBookmarks';
import { PaginationControls } from './PaginationControls';
import { usePagination } from '@/hooks/usePagination';

interface ArticleListEnhancedProps {
  articles: Article[];
  categories: Category[];
  onArticleClick: (id: string) => void;
  onCreateArticle?: () => void;
  isManager?: boolean;
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'created_at' | 'title' | 'views' | 'updated_at';
type SortOrder = 'asc' | 'desc';

const ArticleListEnhanced = ({ 
  articles, 
  categories, 
  onArticleClick, 
  onCreateArticle,
  isManager = false,
  searchInputRef
}: ArticleListEnhancedProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFeatured, setShowFeatured] = useState(false);

  // Filter and sort articles
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = articles.filter(article => {
      // Category filter
      if (selectedCategory !== 'all' && article.category_id !== selectedCategory) {
        return false;
      }
      
      // Featured filter
      if (showFeatured && !article.featured) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          article.title.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query) ||
          article.keywords?.some(keyword => keyword.toLowerCase().includes(query))
        );
      }
      
      return true;
    });

    // Sort articles
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'views':
          comparison = (a.views || 0) - (b.views || 0);
          break;
        case 'updated_at':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case 'created_at':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [articles, selectedCategory, showFeatured, searchQuery, sortBy, sortOrder]);

  const {
    paginatedData: paginatedArticles,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    totalItems
  } = usePagination({ data: filteredAndSortedArticles, itemsPerPage: 12 });

  const ArticleCard = ({ article }: { article: Article }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
      <CardHeader 
        className="pb-3"
        onClick={() => onArticleClick(article.id)}
      >
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2 flex-1">
            {article.title}
          </CardTitle>
          {article.featured && (
            <Badge variant="secondary" className="shrink-0">
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent 
        className="space-y-4 cursor-pointer"
        onClick={() => onArticleClick(article.id)}
      >
        {article.excerpt && (
          <p className="text-gray-600 text-sm line-clamp-3">
            {article.excerpt}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(article.created_at).toLocaleDateString('nl-NL')}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.views || 0}
            </div>
          </div>
          
          <ArticleBookmarks articleId={article.id} size="sm" />
        </div>
        
        {article.keywords && article.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.keywords.slice(0, 3).map(keyword => (
              <Badge key={keyword} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
            {article.keywords.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{article.keywords.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        {article.categories && (
          <div className="pt-2 border-t border-gray-100">
            <Badge variant="secondary" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {article.categories.name}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const ArticleListItem = ({ article }: { article: Article }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div 
            className="flex-1 cursor-pointer"
            onClick={() => onArticleClick(article.id)}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg line-clamp-1 flex-1">
                {article.title}
              </h3>
              {article.featured && (
                <Badge variant="secondary">Featured</Badge>
              )}
            </div>
            
            {article.excerpt && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {article.excerpt}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(article.created_at).toLocaleDateString('nl-NL')}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {article.views || 0}
                </div>
                {article.categories && (
                  <Badge variant="outline" className="text-xs">
                    {article.categories.name}
                  </Badge>
                )}
              </div>
              
              <ArticleBookmarks articleId={article.id} size="sm" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Artikelen ({filteredAndSortedArticles.length})
          </h1>
          <p className="text-gray-600 mt-1">
            Doorzoek en beheer je kennisbank
          </p>
        </div>
        
        {isManager && onCreateArticle && (
          <Button onClick={onCreateArticle}>
            Nieuw Artikel
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <SearchSystem
            articles={articles}
            categories={categories}
            onArticleClick={onArticleClick}
            searchInputRef={searchInputRef}
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Alle categorieën" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle categorieën</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex gap-2">
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
            const [sort, order] = value.split('-');
            setSortBy(sort as SortBy);
            setSortOrder(order as SortOrder);
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at-desc">Nieuwste eerst</SelectItem>
              <SelectItem value="created_at-asc">Oudste eerst</SelectItem>
              <SelectItem value="title-asc">Titel A-Z</SelectItem>
              <SelectItem value="title-desc">Titel Z-A</SelectItem>
              <SelectItem value="views-desc">Meest bekeken</SelectItem>
              <SelectItem value="views-asc">Minst bekeken</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button
            variant={showFeatured ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFeatured(!showFeatured)}
          >
            Featured
          </Button>
        </div>
        
        <p className="text-sm text-gray-500">
          {filteredAndSortedArticles.length} artikel{filteredAndSortedArticles.length !== 1 ? 'en' : ''}
        </p>
      </div>

      {/* Articles Grid/List */}
      {paginatedArticles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Geen artikelen gevonden</p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedArticles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedArticles.map(article => (
            <ArticleListItem key={article.id} article={article} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          totalItems={totalItems}
          itemsPerPage={12}
        />
      )}
    </div>
  );
};

export default ArticleListEnhanced;
