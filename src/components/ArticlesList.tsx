
import { useState } from "react";
import { Search, Plus, Filter, BookOpen, Clock, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";

const ArticlesList = () => {
  const { isManager, articles, categories } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alle categorieën");

  // Enhanced search function that includes keywords
  const searchArticles = (articleList: any[], term: string) => {
    if (!term) return articleList;
    
    const searchLower = term.toLowerCase();
    return articleList.filter(article => 
      article.title.toLowerCase().includes(searchLower) ||
      article.excerpt.toLowerCase().includes(searchLower) ||
      article.content.toLowerCase().includes(searchLower) ||
      article.keywords.some((keyword: string) => keyword.toLowerCase().includes(searchLower)) ||
      article.category.toLowerCase().includes(searchLower) ||
      article.author.toLowerCase().includes(searchLower)
    );
  };

  // Filter by category
  const filterByCategory = (articleList: any[], category: string) => {
    if (category === "Alle categorieën") return articleList;
    return articleList.filter(article => article.category === category);
  };

  // Apply both search and category filters
  const filteredArticles = filterByCategory(
    searchArticles(articles, searchTerm),
    selectedCategory
  );

  const allCategories = ["Alle categorieën", ...categories];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
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
          <Button className="bg-clearbase-600 hover:bg-clearbase-700">
            <Plus className="w-4 h-4 mr-2" />
            Nieuw artikel
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Zoek artikelen op titel, inhoud, keywords of auteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          {isManager && (
            <Button variant="outline" size="sm">
              Status
            </Button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {allCategories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            className="text-sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Search Results Info */}
      {(searchTerm || selectedCategory !== "Alle categorieën") && (
        <div className="text-sm text-gray-600">
          {filteredArticles.length} artikel{filteredArticles.length !== 1 ? 'en' : ''} gevonden
          {searchTerm && ` voor "${searchTerm}"`}
          {selectedCategory !== "Alle categorieën" && ` in categorie "${selectedCategory}"`}
        </div>
      )}

      {/* Articles Grid */}
      <div className="grid gap-6">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {article.featured && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {article.category}
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
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-clearbase-600 transition-colors">
                    {article.title}
                  </h3>
                  {/* Keywords display */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {article.keywords.slice(0, 3).map((keyword: string) => (
                      <Badge key={keyword} variant="outline" className="text-xs bg-gray-50">
                        {keyword}
                      </Badge>
                    ))}
                    {article.keywords.length > 3 && (
                      <Badge variant="outline" className="text-xs bg-gray-50">
                        +{article.keywords.length - 3} meer
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(article.updatedAt).toLocaleDateString('nl-NL')}</span>
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

      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Geen artikelen gevonden</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== "Alle categorieën" 
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
