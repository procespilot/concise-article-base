
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Search, 
  ThumbsUp, 
  Download,
  Calendar,
  Users
} from "lucide-react";

const Analytics = () => {
  const searchTerms = [
    { term: "wachtwoord reset", count: 234, trend: "up" },
    { term: "inloggen", count: 189, trend: "up" },
    { term: "api documentatie", count: 156, trend: "down" },
    { term: "mobile app", count: 143, trend: "up" },
    { term: "troubleshooting", count: 98, trend: "down" },
    { term: "nieuwe functies", count: 87, trend: "up" },
    { term: "installatie", count: 76, trend: "neutral" },
    { term: "gebruikershandleiding", count: 65, trend: "up" }
  ];

  const monthlyStats = [
    { month: "Jan", views: 8234, articles: 45 },
    { month: "Feb", views: 9123, articles: 52 },
    { month: "Mar", views: 10567, articles: 61 },
    { month: "Apr", views: 11234, articles: 68 },
    { month: "Mei", views: 12456, articles: 73 },
    { month: "Jun", views: 12847, articles: 78 }
  ];

  const feedbackData = [
    { article: "Hoe log je in op het systeem", positive: 94, negative: 6, total: 127 },
    { article: "Wachtwoord resetten stap voor stap", positive: 89, negative: 11, total: 98 },
    { article: "API documentatie voor developers", positive: 96, negative: 4, total: 76 },
    { article: "Mobile app installatie handleiding", positive: 87, negative: 13, total: 54 },
    { article: "Nieuwe functies in versie 2.0", positive: 92, negative: 8, total: 43 }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Inzicht in je knowledge base prestaties</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Views deze maand
            </CardTitle>
            <Eye className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,847</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5% vs vorige maand
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Zoekacties
            </CardTitle>
            <Search className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,421</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8.2% vs vorige maand
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Downloads
            </CardTitle>
            <Download className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-red-600 flex items-center mt-1">
              <TrendingDown className="w-3 h-3 mr-1" />
              -2.1% vs vorige maand
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Actieve gebruikers
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,341</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +15.3% vs vorige maand
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Search Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Populaire zoektermen</CardTitle>
            <CardDescription>
              Meest gezochte termen in je knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {searchTerms.map((search, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded text-xs font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{search.term}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">{search.count}</span>
                  {search.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                  {search.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Article Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Artikel feedback</CardTitle>
            <CardDescription>
              Positieve vs negatieve feedback per artikel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedbackData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 text-sm truncate">
                    {item.article}
                  </h4>
                  <span className="text-xs text-gray-500">{item.total} votes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${item.positive}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-green-600">
                    {item.positive}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Maandelijkse trends</CardTitle>
          <CardDescription>
            Views en artikel groei over de laatste 6 maanden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {monthlyStats.map((month, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">{month.month}</div>
                <div className="text-sm text-gray-600 mt-1">
                  <div className="flex items-center justify-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {month.views.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-center mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {month.articles}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
