
import { useState } from "react";
import { Search, Plus, Filter, BookOpen, Clock, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";

const ArticlesList = () => {
  const { isManager } = useUser();
  const [searchTerm, setSearchTerm] = useState("");

  const articles = [
    {
      id: 1,
      title: "Hoe maak ik een account aan?",
      excerpt: "Stap-voor-stap uitleg over het aanmaken van een nieuw account in ClearBase...",
      category: "Aan de slag",
      author: "Sarah van Dam",
      updatedAt: "2024-01-15",
      views: 245,
      status: "Gepubliceerd",
      featured: true
    },
    {
      id: 2,
      title: "Wachtwoord vergeten - wat nu?",
      excerpt: "Instructies voor het resetten van je wachtwoord wanneer je deze bent vergeten...",
      category: "Account beheer",
      author: "Mike de Jong",
      updatedAt: "2024-01-14",
      views: 189,
      status: "Gepubliceerd",
      featured: false
    },
    {
      id: 3,
      title: "Factuurgegevens wijzigen",
      excerpt: "Leer hoe je je factuurgegevens kunt aanpassen in je accountinstellingen...",
      category: "Facturering",
      author: "Lisa Bakker",
      updatedAt: "2024-01-12",
      views: 92,
      status: "Concept",
      featured: false
    },
  ];

  const categories = ["Alle categorieën", "Aan de slag", "Account beheer", "Facturering", "Technische ondersteuning"];

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              placeholder="Zoek artikelen..."
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

      {/* Categories (for users) */}
      {!isManager && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              size="sm"
              className="text-sm"
            >
              {category}
            </Button>
          ))}
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
            Probeer een andere zoekterm of pas je filters aan.
          </p>
        </div>
      )}
    </div>
  );
};

export default ArticlesList;
