
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Plus,
  FileText,
  Calendar,
  User
} from "lucide-react";

const ArticlesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const articles = [
    {
      id: 1,
      title: "Hoe log je in op het systeem",
      category: "Gebruikershandleiding",
      author: "Sarah de Vries",
      status: "published",
      views: 1247,
      lastModified: "2024-06-25",
      description: "Een stap-voor-stap handleiding voor het inloggen op ClearBase"
    },
    {
      id: 2,
      title: "Wachtwoord resetten stap voor stap",
      category: "Troubleshooting",
      author: "Mike van der Berg",
      status: "published", 
      views: 892,
      lastModified: "2024-06-22",
      description: "Uitgebreide instructies voor het resetten van je wachtwoord"
    },
    {
      id: 3,
      title: "Nieuwe functies in versie 2.0",
      category: "Updates",
      author: "Lisa Janssen",
      status: "draft",
      views: 0,
      lastModified: "2024-06-27",
      description: "Overzicht van alle nieuwe functies en verbeteringen"
    },
    {
      id: 4,
      title: "API documentatie voor developers",
      category: "Technisch",
      author: "Tom Hendriksen",
      status: "published",
      views: 534,
      lastModified: "2024-06-24",
      description: "Complete API referentie en voorbeelden voor ontwikkelaars"
    },
    {
      id: 5,
      title: "Mobile app installatie handleiding",
      category: "Gebruikershandleiding", 
      author: "Sarah de Vries",
      status: "archived",
      views: 213,
      lastModified: "2024-06-15",
      description: "Instructies voor het installeren van de mobiele applicatie"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Gepubliceerd</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Concept</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Gearchiveerd</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Artikelen</h1>
          <p className="text-gray-600">Beheer je knowledge base content</p>
        </div>
        <Button className="bg-clearbase-600 hover:bg-clearbase-700">
          <Plus className="w-4 h-4 mr-2" />
          Nieuw artikel
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Zoek artikelen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <div className="grid gap-4">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-clearbase-600 cursor-pointer">
                      {article.title}
                    </h3>
                    {getStatusBadge(article.status)}
                  </div>
                  
                  <p className="text-gray-600 mb-3 text-sm">
                    {article.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      <span>{article.category}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{new Date(article.lastModified).toLocaleDateString('nl-NL')}</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{article.views} views</span>
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acties</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      Bekijken
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Bewerken
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Verwijderen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Geen artikelen gevonden</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Probeer een andere zoekterm' : 'Begin met het maken van je eerste artikel'}
            </p>
            <Button className="bg-clearbase-600 hover:bg-clearbase-700">
              <Plus className="w-4 h-4 mr-2" />
              Nieuw artikel maken
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ArticlesList;
