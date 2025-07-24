import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Grid, 
  List, 
  LayoutGrid,
  Filter,
  SortAsc,
  CheckSquare,
  Star,
  Eye,
  Archive,
  Plus,
  Command
} from 'lucide-react';
import { Article } from '@/types/article';
import { Category } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';

// Import new modular components
import ArticleCard from '@/components/articles/ArticleCard';
import ArticleListSkeleton from '@/components/articles/ArticleListSkeleton';
import ArticleListEmptyState from '@/components/articles/ArticleListEmptyState';
import ArticleCommandMenu from '@/components/articles/ArticleCommandMenu';
import SearchSystem from '@/components/SearchSystem';
import { PaginationControls } from '@/components/PaginationControls';

interface ArticleListPageProps {
  articles: Article[];
  categories: Category[];
  onArticleClick: (id: string) => void;
  onCreateArticle?: () => void;
  isManager?: boolean;
  loading?: boolean;
  error?: string | null;
}

type ViewMode = 'grid' | 'list' | 'compact';
type SortBy = 'created_at' | 'title' | 'views' | 'updated_at' | 'status';
type SortOrder = 'asc' | 'desc';

const ArticleListPage = ({
  articles = [],
  categories = [],
  onArticleClick,
  onCreateArticle,
  isManager = false,
  loading = false,
  error = null
}: ArticleListPageProps) => {
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFeatured, setShowFeatured] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandMenuOpen(true);
      }
      if (e.key === 'n' && (e.metaKey || e.ctrlKey) && isManager) {
        e.preventDefault();
        onCreateArticle?.();
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSelectedArticles(new Set());
        setSearchQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isManager, onCreateArticle]);

  // Filter and sort logic
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = articles.filter(article => {
      // Category filter
      if (selectedCategory !== 'all' && article.category_id !== selectedCategory) {
        return false;
      }
      
      // Status filter
      if (selectedStatus !== 'all' && article.status !== selectedStatus) {
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
          article.keywords?.some(keyword => keyword.toLowerCase().includes(query)) ||
          article.excerpt?.toLowerCase().includes(query)
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
        case 'status':
          comparison = a.status.localeCompare(b.status);
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
  }, [articles, selectedCategory, selectedStatus, showFeatured, searchQuery, sortBy, sortOrder]);

  // Pagination
  const {
    paginatedData: paginatedArticles,
    currentPage,
    totalPages,
    goToPage,
    hasNextPage,
    hasPrevPage,
    totalItems
  } = usePagination({ 
    data: filteredAndSortedArticles, 
    itemsPerPage: viewMode === 'compact' ? 20 : viewMode === 'list' ? 10 : 12 
  });

  // Event handlers
  const handleSelectArticle = useCallback((articleId: string, checked: boolean) => {
    const newSelected = new Set(selectedArticles);
    if (checked) {
      newSelected.add(articleId);
    } else {
      newSelected.delete(articleId);
    }
    setSelectedArticles(newSelected);
  }, [selectedArticles]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedArticles(new Set(paginatedArticles.map(a => a.id)));
    } else {
      setSelectedArticles(new Set());
    }
  }, [paginatedArticles]);

  const handleBulkAction = useCallback(async (action: string) => {
    const count = selectedArticles.size;
    
    try {
      switch (action) {
        case 'feature':
          toast({
            title: "Artikelen gemarkeerd",
            description: `${count} artikel(en) als featured gemarkeerd`
          });
          break;
        case 'archive':
          toast({
            title: "Artikelen gearchiveerd", 
            description: `${count} artikel(en) gearchiveerd`
          });
          break;
        case 'publish':
          toast({
            title: "Artikelen gepubliceerd",
            description: `${count} artikel(en) gepubliceerd`
          });
          break;
        case 'delete':
          toast({
            title: "Artikelen verwijderd",
            description: `${count} artikel(en) verwijderd`,
            variant: "destructive"
          });
          break;
      }
    } catch (error) {
      toast({
        title: "Fout bij bulk actie",
        description: "Er is een fout opgetreden. Probeer het opnieuw.",
        variant: "destructive"
      });
    }
    
    setSelectedArticles(new Set());
    setBulkActionOpen(false);
  }, [selectedArticles, toast]);

  const handleClearFilters = useCallback(() => {
    setSelectedCategory('all');
    setSelectedStatus('all');
    setShowFeatured(false);
    setSearchQuery('');
  }, []);

  const handleAIAction = useCallback((action: string, articleId: string) => {
    toast({
      title: "AI Actie",
      description: `${action} voor artikel uitgevoerd`,
    });
  }, [toast]);

  const handleQuickAction = useCallback((action: string, articleId?: string) => {
    switch (action) {
      case 'analytics':
        // Navigate to analytics
        break;
      case 'settings':
        // Navigate to settings
        break;
      default:
        toast({
          title: "Actie uitgevoerd",
          description: `${action} ${articleId ? 'voor artikel' : ''} uitgevoerd`
        });
    }
  }, [toast]);

  // Determine empty state type
  const getEmptyStateType = () => {
    if (articles.length === 0) return 'no_articles';
    if (filteredAndSortedArticles.length === 0) return 'no_results';
    return 'no_articles';
  };

  const activeFilters = [
    selectedCategory !== 'all' ? categories.find(c => c.id === selectedCategory)?.name : null,
    selectedStatus !== 'all' ? selectedStatus : null,
    showFeatured ? 'Featured' : null
  ].filter(Boolean);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6" role="main" aria-label="Artikelen pagina">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <ArticleListSkeleton count={12} variant={viewMode} />
      </div>
    );
  }

  return (
    <div className="space-y-6" role="main" aria-label="Artikelen pagina">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Artikelen ({filteredAndSortedArticles.length})
          </h1>
          <p className="text-muted-foreground mt-1">
            Doorzoek en beheer je kennisbank met AI-ondersteuning
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Command Menu trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCommandMenuOpen(true)}
            className="hidden sm:flex items-center gap-2"
          >
            <Command className="h-4 w-4" />
            <span>Zoeken</span>
            <Badge variant="secondary" className="text-xs">⌘K</Badge>
          </Button>
          
          {/* Bulk actions */}
          {selectedArticles.size > 0 && isManager && (
            <Popover open={bulkActionOpen} onOpenChange={setBulkActionOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  {selectedArticles.size} geselecteerd
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleBulkAction('feature')}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Markeer als featured
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleBulkAction('publish')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Publiceer
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleBulkAction('archive')}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archiveer
                  </Button>
                  <Separator />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive"
                    onClick={() => handleBulkAction('delete')}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Verwijderen
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          {/* Create article */}
          {isManager && onCreateArticle && (
            <Button onClick={onCreateArticle} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nieuw Artikel
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Zoek artikelen... (druk / om te focussen)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Zoek in artikelen"
            />
          </div>
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger aria-label="Filter op categorie">
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
        
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger aria-label="Filter op status">
            <SelectValue placeholder="Alle statussen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle statussen</SelectItem>
            <SelectItem value="Gepubliceerd">Gepubliceerd</SelectItem>
            <SelectItem value="Concept">Concept</SelectItem>
            <SelectItem value="Archief">Archief</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
          const [sort, order] = value.split('-');
          setSortBy(sort as SortBy);
          setSortOrder(order as SortOrder);
        }}>
          <SelectTrigger aria-label="Sorteer artikelen">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at-desc">Nieuwste eerst</SelectItem>
            <SelectItem value="created_at-asc">Oudste eerst</SelectItem>
            <SelectItem value="title-asc">Titel A-Z</SelectItem>
            <SelectItem value="title-desc">Titel Z-A</SelectItem>
            <SelectItem value="views-desc">Meest bekeken</SelectItem>
            <SelectItem value="views-asc">Minst bekeken</SelectItem>
            <SelectItem value="status-asc">Status</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex gap-2">
          <Button
            variant={showFeatured ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFeatured(!showFeatured)}
            aria-label="Filter featured artikelen"
          >
            <Star className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Active filters pills */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap py-2 px-3 bg-muted/30 rounded-lg border border-border/50">
          <span className="text-sm font-medium text-muted-foreground">Actieve filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="text-xs px-2 py-1 bg-background border">
              {filter}
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs h-6 px-2 hover:bg-background"
          >
            Alles wissen
          </Button>
        </div>
      )}

      {/* View controls & List headers */}
      {viewMode === 'list' && paginatedArticles.length > 0 && (
        <div className="space-y-4">
          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isManager && (
                <Checkbox
                  checked={selectedArticles.size === paginatedArticles.length && paginatedArticles.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="mr-2 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  aria-label="Selecteer alle zichtbare artikelen"
                />
              )}
              
              <div className="flex items-center border rounded-lg bg-background">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none border-r h-9"
                  aria-label="Grid weergave"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-r h-9"
                  aria-label="Lijst weergave"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'compact' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('compact')}
                  className="rounded-l-none h-9"
                  aria-label="Compacte weergave"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground font-medium">
              {filteredAndSortedArticles.length} van {articles.length} artikel{filteredAndSortedArticles.length !== 1 ? 'en' : ''}
            </p>
          </div>
          
          {/* List Headers - sticky */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="flex items-center gap-4 p-4 text-sm font-semibold text-muted-foreground">
              {isManager && <div className="w-6"></div>}
              <div className="w-24">Status</div>
              <div className="flex-1">Titel & Inhoud</div>
              <div className="w-32">Categorie</div>
              <div className="w-24 text-right">Acties</div>
            </div>
          </div>
        </div>
      )}

      {/* Grid/Compact view controls */}
      {viewMode !== 'list' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isManager && (
              <Checkbox
                checked={selectedArticles.size === paginatedArticles.length && paginatedArticles.length > 0}
                onCheckedChange={handleSelectAll}
                className="mr-2 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                aria-label="Selecteer alle zichtbare artikelen"
              />
            )}
            
            <div className="flex items-center border rounded-lg bg-background">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none border-r h-9"
                aria-label="Grid weergave"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none border-r h-9"
                aria-label="Lijst weergave"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'compact' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('compact')}
                className="rounded-l-none h-9"
                aria-label="Compacte weergave"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground font-medium">
            {filteredAndSortedArticles.length} van {articles.length} artikel{filteredAndSortedArticles.length !== 1 ? 'en' : ''}
          </p>
        </div>
      )}

      {/* Articles display */}
      {error ? (
        <div className="text-center py-12 text-destructive">
          <p>Fout bij laden artikelen: {error}</p>
        </div>
      ) : paginatedArticles.length === 0 ? (
        <ArticleListEmptyState
          type={getEmptyStateType()}
          searchQuery={searchQuery}
          activeFilters={activeFilters}
          onCreateArticle={onCreateArticle}
          onClearFilters={handleClearFilters}
          onClearSearch={() => setSearchQuery('')}
          isManager={isManager}
        />
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {paginatedArticles.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              variant={viewMode === 'grid' ? 'default' : viewMode === 'list' ? 'list' : 'compact'}
              isSelectable={isManager}
              isSelected={selectedArticles.has(article.id)}
              onSelect={handleSelectArticle}
              onClick={onArticleClick}
              onEdit={(id) => toast({ title: "Bewerken", description: `Bewerk artikel ${id}` })}
              onToggleFeatured={(id) => toast({ title: "Featured", description: `Toggle featured voor ${id}` })}
              onAIAction={handleAIAction}
              isManager={isManager}
              showAIHints={false}
            />
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
          itemsPerPage={viewMode === 'compact' ? 20 : viewMode === 'list' ? 10 : 12}
        />
      )}

      {/* Command Menu */}
      <ArticleCommandMenu
        isOpen={commandMenuOpen}
        onClose={() => setCommandMenuOpen(false)}
        articles={articles}
        categories={categories}
        onArticleSelect={onArticleClick}
        onCreateArticle={onCreateArticle}
        onCategoryFilter={setSelectedCategory}
        onStatusFilter={setSelectedStatus}
        onQuickAction={handleQuickAction}
        isManager={isManager}
      />
    </div>
  );
};

export default ArticleListPage;