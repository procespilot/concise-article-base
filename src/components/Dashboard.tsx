
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Eye, 
  FileText, 
  Users, 
  ThumbsUp, 
  Download,
  Clock,
  ArrowUpRight
} from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Totaal Views",
      value: "12,847",
      change: "+12.5%",
      changeType: "positive",
      icon: Eye
    },
    {
      title: "Artikelen",
      value: "127",
      change: "+3 deze week",
      changeType: "neutral", 
      icon: FileText
    },
    {
      title: "Actieve Users",
      value: "2,341",
      change: "+8.2%",
      changeType: "positive",
      icon: Users
    },
    {
      title: "Positieve Feedback",
      value: "94.2%",
      change: "+2.1%",
      changeType: "positive",
      icon: ThumbsUp
    }
  ];

  const topArticles = [
    {
      title: "Hoe log je in op het systeem",
      views: 1247,
      category: "Gebruikershandleiding",
      lastUpdated: "2 dagen geleden",
      status: "published"
    },
    {
      title: "Wachtwoord resetten stap voor stap",
      views: 892,
      category: "Troubleshooting", 
      lastUpdated: "5 dagen geleden",
      status: "published"
    },
    {
      title: "Nieuwe functies in versie 2.0",
      views: 673,
      category: "Updates",
      lastUpdated: "1 week geleden", 
      status: "published"
    },
    {
      title: "API documentatie voor developers",
      views: 534,
      category: "Technisch",
      lastUpdated: "3 dagen geleden",
      status: "published"
    }
  ];

  const recentActivity = [
    {
      action: "Artikel gepubliceerd",
      title: "Nieuwe privacy instellingen",
      user: "Sarah de Vries",
      time: "2 uur geleden"
    },
    {
      action: "Artikel bewerkt", 
      title: "Installatie handleiding",
      user: "Mike van der Berg",
      time: "4 uur geleden" 
    },
    {
      action: "Categorie toegevoegd",
      title: "Mobile App Support",
      user: "Lisa Janssen", 
      time: "6 uur geleden"
    },
    {
      action: "Feedback ontvangen",
      title: "Login problemen oplossen",
      user: "Anonieme gebruiker",
      time: "8 uur geleden"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overzicht van je knowledge base prestaties</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className={`text-xs flex items-center mt-1 ${
                stat.changeType === 'positive' ? 'text-green-600' : 
                stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {stat.changeType === 'positive' && <TrendingUp className="w-3 h-3 mr-1" />}
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Populairste Artikelen
              <Button variant="ghost" size="sm">
                Alles bekijken <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </CardTitle>
            <CardDescription>
              Meest bekeken artikelen deze maand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topArticles.map((article, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{article.title}</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Badge variant="outline" className="text-xs">
                      {article.category}
                    </Badge>
                    <span>•</span>
                    <span>{article.lastUpdated}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span>{article.views}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recente Activiteit</CardTitle>
            <CardDescription>
              Laatste wijzigingen in je knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-2 h-2 bg-clearbase-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.action}</span>: {activity.title}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                    <span>door {activity.user}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Snelle acties</CardTitle>
          <CardDescription>
            Meest gebruikte functies voor knowledge base beheer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto p-4 bg-clearbase-600 hover:bg-clearbase-700">
              <div className="text-center">
                <FileText className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Nieuw artikel</div>
                <div className="text-xs opacity-90">Maak een nieuw artikel aan</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <Download className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Export data</div>
                <div className="text-xs text-muted-foreground">Download je content</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <Users className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Gebruikers beheren</div>
                <div className="text-xs text-muted-foreground">Toegang en rollen</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
