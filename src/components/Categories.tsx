
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileText,
  Eye
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Categories = () => {
  const { isManager } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    {
      id: 1,
      name: "Aan de slag",
      description: "Handleidingen voor nieuwe gebruikers",
      articleCount: 8,
      color: "bg-blue-100 text-blue-800",
      lastUpdated: "2024-01-15"
    },
    {
      id: 2,
      name: "Account beheer",
      description: "Alles over gebruikersaccounts en instellingen",
      articleCount: 12,
      color: "bg-green-100 text-green-800",
      lastUpdated: "2024-01-14"
    },
    {
      id: 3,
      name: "Facturering",
      description: "Betalingen, facturen en abonnementen",
      articleCount: 6,
      color: "bg-purple-100 text-purple-800",
      lastUpdated: "2024-01-12"
    },
    {
      id: 4,
      name: "Technische ondersteuning",
      description: "Troubleshooting en technische problemen",
      articleCount: 15,
      color: "bg-red-100 text-red-800",
      lastUpdated: "2024-01-10"
    },
    {
      id: 5,
      name: "API Documentatie",
      description: "Ontwikkelaarshandleidingen en API referenties",
      articleCount: 9,
      color: "bg-yellow-100 text-yellow-800",
      lastUpdated: "2024-01-08"
    }
  ];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorieën</h1>
          <p className="text-gray-600 mt-1">
            {isManager 
              ? "Beheer je knowledge base categorieën en structuur" 
              : "Blader door artikelen per categorie"
            }
          </p>
        </div>
        {isManager && (
          <Button className="bg-clearbase-600 hover:bg-clearbase-700">
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe categorie
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Zoek categorieën..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Totaal categorieën
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Totaal artikelen
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((sum, cat) => sum + cat.articleCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Gemiddeld per categorie
            </CardTitle>
            <Eye className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(categories.reduce((sum, cat) => sum + cat.articleCount, 0) / categories.length)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${category.color.split(' ')[0]}`}></div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
                {isManager && (
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Artikelen</span>
                  <Badge variant="secondary">{category.articleCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Laatst bijgewerkt</span>
                  <span className="text-sm text-gray-500">
                    {new Date(category.lastUpdated).toLocaleDateString('nl-NL')}
                  </span>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  <FileText className="w-4 h-4 mr-2" />
                  Bekijk artikelen
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Geen categorieën gevonden</h3>
          <p className="text-gray-600">
            {searchTerm 
              ? "Probeer een andere zoekterm." 
              : "Er zijn nog geen categorieën beschikbaar."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Categories;
