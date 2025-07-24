import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Clock, 
  Eye, 
  User, 
  Tag,
  MoreHorizontal,
  Edit,
  Star,
  Copy,
  Archive,
  GitBranch,
  Sparkles,
  CheckSquare,
  AlertCircle,
  TrendingUp,
  Users,
  Target,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Article } from '@/types/article';
import { Category } from '@/types/user';
import SearchSystem from './SearchSystem';
import ArticleBookmarks from './ArticleBookmarks';
import { PaginationControls } from './PaginationControls';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/use-toast';

interface ArticleListEnhancedAIProps {
  articles: Article[];
  categories: Category[];
  onArticleClick: (id: string) => void;
  onCreateArticle?: () => void;
  isManager?: boolean;
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

type ViewMode = 'grid' | 'list' | 'compact';
type SortBy = 'created_at' | 'title' | 'views' | 'updated_at' | 'status';
type SortOrder = 'asc' | 'desc';

interface AIInsight {
  type: 'improve_title' | 'duplicate_content' | 'related_articles' | 'optimize_keywords' | 'update_content';
  severity: 'low' | 'medium' | 'high';
  message: string;
  action?: string;
}

const ArticleListEnhancedAI = ({ 
  articles, 
  categories, 
  onArticleClick, 
  onCreateArticle,
  isManager = false,
  searchInputRef
}: ArticleListEnhancedAIProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFeatured, setShowFeatured] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const { toast } = useToast();

  // Mock AI insights for articles
  const getAIInsights = (article: Article): AIInsight[] => {
    const insights: AIInsight[] = [];
    
    // Title optimization
    if (article.title.length < 30) {
      insights.push({
        type: 'improve_title',
        severity: 'medium',
        message: 'Titel kan specifieker en SEO-vriendelijker',
        action: 'Verbeter titel'
      });
    }
    
    // Content freshness
    const monthsOld = (Date.now() - new Date(article.updated_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsOld > 6) {
      insights.push({
        type: 'update_content',
        severity: 'high',
        message: 'Artikel is 6+ maanden oud, mogelijk verouderd',
        action: 'Update inhoud'
      });
    }
    
    // Keyword optimization
    if (!article.keywords || article.keywords.length < 3) {
      insights.push({
        type: 'optimize_keywords',
        severity: 'low',
        message: 'Voeg meer relevante keywords toe',
        action: 'Voeg keywords toe'
      });
    }
    
    return insights;
  };

  // Filter and sort articles
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
  } = usePagination({ data: filteredAndSortedArticles, itemsPerPage: viewMode === 'compact' ? 20 : 12 });

  const handleSelectArticle = (articleId: string, checked: boolean) => {
    const newSelected = new Set(selectedArticles);
    if (checked) {
      newSelected.add(articleId);
    } else {
      newSelected.delete(articleId);
    }
    setSelectedArticles(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedArticles(new Set(paginatedArticles.map(a => a.id)));
    } else {
      setSelectedArticles(new Set());
    }
  };

  const handleBulkAction = async (action: string) => {
    const count = selectedArticles.size;
    
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
    }
    
    setSelectedArticles(new Set());
    setBulkActionOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Gepubliceerd':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Gepubliceerd</Badge>;
      case 'Concept':
        return <Badge variant="secondary">Concept</Badge>;
      case 'Archief':
        return <Badge variant="outline" className="border-gray-400 text-gray-600">Archief</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'improve_title':
        return <Target className="h-3 w-3" />;
      case 'duplicate_content':
        return <Copy className="h-3 w-3" />;
      case 'related_articles':
        return <Users className="h-3 w-3" />;
      case 'optimize_keywords':
        return <Tag className="h-3 w-3" />;
      case 'update_content':
        return <TrendingUp className="h-3 w-3" />;
      default:
        return <Lightbulb className="h-3 w-3" />;
    }
  };

  const CompactListItem = ({ article }: { article: Article }) => {
    const insights = getAIInsights(article);
    const highPriorityInsights = insights.filter(i => i.severity === 'high');
    
    return (
      <div className="flex items-center gap-3 p-3 border-b border-border hover:bg-muted/50 transition-colors">
        {isManager && (
          <Checkbox
            checked={selectedArticles.has(article.id)}
            onCheckedChange={(checked) => handleSelectArticle(article.id, !!checked)}
          />
        )}
        
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onArticleClick(article.id)}>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm truncate">{article.title}</h3>
            {article.featured && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
            {getStatusBadge(article.status)}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{new Date(article.created_at).toLocaleDateString('nl-NL')}</span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.views || 0}
            </span>
            {article.categories && (
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {article.categories.name}
              </span>
            )}
          </div>
        </div>
        
        {highPriorityInsights.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <AlertCircle className="h-3 w-3 text-orange-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  {highPriorityInsights[0].message}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <div className="flex items-center gap-1">
          <ArticleBookmarks articleId={article.id} size="sm" />
          
          {isManager && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onArticleClick(article.id)}>
                  <Edit className="h-3 w-3 mr-2" />
                  Snel bewerken
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="h-3 w-3 mr-2" />
                  {article.featured ? 'Featured verwijderen' : 'Markeer als featured'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <GitBranch className="h-3 w-3 mr-2" />
                  Toon revisies
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {insights.map((insight, idx) => (
                  <DropdownMenuItem key={idx} className="text-xs">
                    <Sparkles className="h-3 w-3 mr-2 text-blue-500" />
                    {insight.action}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  };

  const ArticleCard = ({ article }: { article: Article }) => {
    const insights = getAIInsights(article);
    
    return (
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full group relative">
        {isManager && (
          <div className="absolute top-3 left-3 z-10">
            <Checkbox
              checked={selectedArticles.has(article.id)}
              onCheckedChange={(checked) => handleSelectArticle(article.id, !!checked)}
              className="bg-white shadow-sm"
            />
          </div>
        )}
        
        <CardHeader className="pb-3" onClick={() => onArticleClick(article.id)}>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2 flex-1 pr-8">
              {article.title}
            </CardTitle>
            <div className="flex items-center gap-1">
              {article.featured && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
              {getStatusBadge(article.status)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 cursor-pointer" onClick={() => onArticleClick(article.id)}>
          {article.excerpt && (
            <p className="text-muted-foreground text-sm line-clamp-3">
              {article.excerpt}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
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
            <div className="pt-2 border-t border-border">
              <Badge variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {article.categories.name}
              </Badge>
            </div>
          )}
          
          {/* AI Insights */}
          {insights.length > 0 && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3 w-3 text-blue-500" />
                <span className="text-xs font-medium text-blue-700">AI Suggesties</span>
              </div>
              <div className="space-y-1">
                {insights.slice(0, 2).map((insight, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div className={`p-1 rounded ${
                      insight.severity === 'high' ? 'bg-red-100 text-red-600' :
                      insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <span className="text-muted-foreground truncate">{insight.message}</span>
                  </div>
                ))}
                {insights.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{insights.length - 2} meer
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
        
        {/* Quick Actions */}
        {isManager && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onArticleClick(article.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Snel bewerken
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="h-4 w-4 mr-2" />
                  {article.featured ? 'Featured verwijderen' : 'Markeer als featured'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <GitBranch className="h-4 w-4 mr-2" />
                  Toon revisies
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {insights.map((insight, idx) => (
                  <DropdownMenuItem key={idx}>
                    <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                    {insight.action}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Artikelen ({filteredAndSortedArticles.length})
          </h1>
          <p className="text-muted-foreground mt-1">
            Doorzoek en beheer je kennisbank met AI-ondersteuning
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedArticles.size > 0 && isManager && (
            <Popover open={bulkActionOpen} onOpenChange={setBulkActionOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  {selectedArticles.size} geselecteerd
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="end">
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
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          {isManager && onCreateArticle && (
            <Button onClick={onCreateArticle}>
              Nieuw Artikel
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
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
        
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger>
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
            <SelectItem value="status-asc">Status</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex gap-2">
          <Button
            variant={showFeatured ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFeatured(!showFeatured)}
          >
            <Star className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isManager && (
            <Checkbox
              checked={selectedArticles.size === paginatedArticles.length && paginatedArticles.length > 0}
              onCheckedChange={handleSelectAll}
              className="mr-2"
            />
          )}
          
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
            variant={viewMode === 'compact' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('compact')}
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {filteredAndSortedArticles.length} artikel{filteredAndSortedArticles.length !== 1 ? 'en' : ''}
        </p>
      </div>

      {/* Articles Display */}
      {paginatedArticles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Geen artikelen gevonden</p>
          </CardContent>
        </Card>
      ) : viewMode === 'compact' ? (
        <Card>
          <CardContent className="p-0">
            {paginatedArticles.map(article => (
              <CompactListItem key={article.id} article={article} />
            ))}
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
            <ArticleCard key={article.id} article={article} />
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
          itemsPerPage={viewMode === 'compact' ? 20 : 12}
        />
      )}
    </div>
  );
};

export default ArticleListEnhancedAI;