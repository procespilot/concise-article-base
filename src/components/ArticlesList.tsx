
import { useState, useRef } from "react";
import { Search, Plus, Filter, BookOpen, Clock, Eye, Star, Calendar, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SearchHighlight from "./SearchHighlight";
import { LoadingSpinner } from "./LoadingSpinner";
import { PaginationControls } from "./PaginationControls";
import { usePagination } from "@/hooks/usePagination";

interface ArticlesListProps {
  articles: any[];
  categories: any[];
  onArticleClick?: (articleId: string) => void;
  onCreateArticle?: () => void;
  isManager: boolean;
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

const ArticlesList = ({ 
  articles, 
  categories, 
  onArticleClick, 
  onCreateArticle, 
  isManager,
  searchInputRef 
}: ArticlesListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alle categorieën");
  const [authorFilter, setAuthorFilter] = useState("Alle auteurs");
  const [sortBy, setSortBy] = useState("updated");
  const [isLoading, setIsLoading] = useState(false);

  // Get unique authors from articles
  const authors = ["Alle auteurs", ...Array.from(new Set(
    articles
      .filter(a => a.profiles)
      .map(a => `${a.profiles.first_name || ''} ${a.profiles.last_name || ''}`.trim())
      .filter(name => name.length > 0)
  ))];

  // Enhanced search function
  const searchArticles = (articleList: any[], term: string) => {
    if (!term) return articleList;
    
    const searchLower = term.toLowerCase();
    return articleList.filter(article => 
      article.title.toLowerCase().includes(searchLower) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(searchLower)) ||
      article.content.toLowerCase().includes(searchLower) ||
      article.keywords.some((keyword: string) => keyword.toLowerCase().includes(searchLower)) ||
      (article.categories && article.categories.name.toLowerCase().includes(searchLower))
    );
  };

  // Filter functions
  const filterByCategory = (articleList: any[], category: string) => {
    if (category === "Alle categorieën") return articleList;
    return articleList.filter(article => article.categories && article.categories.name === category);
  };

  const filterByAuthor = (articleList: any[], author: string) => {
    if (author === "Alle auteurs") return articleList;
    return articleList.filter(article => {
      if (!article.profiles) return false;
      const fullName = `${article.profiles.first_name || ''} ${article.profiles.last_name || ''}`.trim();
      return fullName === author;
    });
  };

  // Sort function
  const sortArticles = (articleList: any[], sortBy: string) => {
    const sorted = [...articleList];
    switch (sortBy) {
      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "views":
        return sorted.sort((a, b) => b.views - a.views);
      case "updated":
        return sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      default:
        return sorted;
    }
  };

  // Apply all filters and sorting
  const filteredArticles = sortArticles(
    filterByAuthor(
      filterByCategory(
        searchArticles(articles, searchTerm),
        selectedCategory
      ),
      authorFilter
    ),
    sortBy
  );

  // Pagination
  const { 
    paginatedData,
    currentPage,
    totalPages,
    goToPage,
    hasNextPage,
    hasPrevPage,
    totalItems
  } = usePagination({
    data: filteredArticles,
    itemsPerPage: 6
  });

  const allCategories = ["Alle categorieën", ...categories.map(c => c.name)];

  const handleArticleClick = (articleId: string) => {
    if (onArticleClick) {
      setIsLoading(true);
      setTimeout(() => {
        onArticleClick(articleId);
        setIsLoading(false);
      }, 300);
    }
  };

  const handleCreateClick = () => {
    if (onCreateArticle) {
      onCreateArticle();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Artikel laden..." />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">
            {isManager ? "Artikel beheer" : "Knowledge Base"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isManager 
              ? "Beheer en organiseer je knowledge base artikelen" 
              : "Vind antwoorden op je vragen in onze knowledge base"
            }
          </p>
        </div>
        {isManager && (
          <Button 
            onClick={handleCreateClick}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nieuw artikel
          </Button>
        )}
      </div>

      {/* Enhanced Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                ref={searchInputRef}
                placeholder="Zoek artikelen op titel, inhoud, keywords of auteur... (Ctrl+K)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 text-black"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48 bg-white border-gray-200 text-black">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200">
              {allCategories.map((category) => (
                <SelectItem key={category} value={category} className="hover:bg-gray-100 text-black">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={authorFilter} onValueChange={setAuthorFilter}>
            <SelectTrigger className="w-48 bg-white border-gray-200 text-black">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200">
              {authors.map((author) => (
                <SelectItem key={author} value={author} className="hover:bg-gray-100 text-black">
                  {author}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 bg-white border-gray-200 text-black">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200">
              <SelectItem value="updated" className="hover:bg-gray-100 text-black">Laatst bijgewerkt</SelectItem>
              <SelectItem value="title" className="hover:bg-gray-100 text-black">Alfabetisch</SelectItem>
              <SelectItem value="views" className="hover:bg-gray-100 text-black">Meest bekeken</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search Results Info */}
      {(searchTerm || selectedCategory !== "Alle categorieën" || authorFilter !== "Alle auteurs") && (
        <div className="text-sm text-gray-600">
          {filteredArticles.length} artikel{filteredArticles.length !== 1 ? 'en' : ''} gevonden
          {searchTerm && ` voor "${searchTerm}"`}
          {selectedCategory !== "Alle categorieën" && ` in categorie "${selectedCategory}"`}
          {authorFilter !== "Alle auteurs" && ` van "${authorFilter}"`}
        </div>
      )}

      {/* Articles Grid with Search Highlighting */}
      <div className="grid gap-6">
        {paginatedData.map((article) => (
          <Card 
            key={article.id} 
            className="hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.01] bg-white border-gray-200"
            onClick={() => handleArticleClick(article.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {article.featured && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-black border-gray-200">
                      {article.categories ? article.categories.name : 'Geen categorie'}
                    </Badge>
                    {isManager && (
                      <Badge 
                        variant={article.status === "Gepubliceerd" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {article.status}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-black hover:text-blue-500 transition-colors">
                    <SearchHighlight text={article.title} searchTerm={searchTerm} />
                  </h3>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {article.keywords.slice(0, 3).map((keyword: string) => (
                      <Badge key={keyword} variant="outline" className="text-xs bg-gray-50 text-black border-gray-200">
                        <SearchHighlight text={keyword} searchTerm={searchTerm} />
                      </Badge>
                    ))}
                    {article.keywords.length > 3 && (
                      <Badge variant="outline" className="text-xs bg-gray-50 text-black border-gray-200">
                        +{article.keywords.length - 3} meer
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                <SearchHighlight text={article.excerpt || ''} searchTerm={searchTerm} />
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <UserIcon className="w-3 h-3" />
                    <span>
                      {article.profiles 
                        ? `${article.profiles.first_name || ''} ${article.profiles.last_name || ''}`.trim() || 'Onbekend'
                        : 'Onbekend'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(article.updated_at).toLocaleDateString('nl-NL')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{article.views} views</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          totalItems={totalItems}
          itemsPerPage={6}
        />
      )}

      {filteredArticles.length === 0 && (
        <div className="text-center py-12 bg-white">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-black mb-2">Geen artikelen gevonden</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== "Alle categorieën" || authorFilter !== "Alle auteurs"
              ? "Probeer een andere zoekterm of pas je filters aan."
              : "Er zijn nog geen artikelen beschikbaar."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ArticlesList;
