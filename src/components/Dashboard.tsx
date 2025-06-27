
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, FolderOpen, Eye, TrendingUp } from "lucide-react";

interface DashboardProps {
  articles: any[];
  categories: any[];
  users: any[];
}

const Dashboard = ({ articles, categories, users }: DashboardProps) => {
  const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
  const publishedArticles = articles.filter(article => article.status === 'Gepubliceerd');
  
  const stats = [
    {
      title: "Totaal Artikelen",
      value: articles.length,
      subtitle: `${publishedArticles.length} gepubliceerd`,
      icon: FileText,
      bgColor: "bg-white"
    },
    {
      title: "Categorieën",
      value: categories.length,
      subtitle: "Actieve categorieën",
      icon: FolderOpen,
      bgColor: "bg-white"
    },
    {
      title: "Gebruikers",
      value: users.length,
      subtitle: "Geregistreerde gebruikers",
      icon: Users,
      bgColor: "bg-white"
    },
    {
      title: "Totaal Weergaven",
      value: totalViews.toLocaleString(),
      subtitle: "Artikel weergaven",
      icon: Eye,
      bgColor: "bg-white"
    }
  ];
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="centered-container">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-black">
            Dashboard
          </h1>
          <p className="text-lg text-spacegray-600 text-balance">
            Overzicht van je kennisbank en belangrijkste statistieken
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {stats.map((stat, index) => (
            <Card key={stat.title} className={`card-hover animate-scale-in ${stat.bgColor} shadow-lg border-gray-200`} style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-spacegray-600">
                  {stat.title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-gray-100">
                  <stat.icon className="h-5 w-5 text-spacegray-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-bold text-black">
                  {stat.value}
                </div>
                <p className="text-xs text-spacegray-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.subtitle}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-6 text-black">Snelle Acties</h2>
          <div className="button-group max-w-2xl">
            <Card className="card-hover p-6 text-center cursor-pointer group bg-white border-gray-200">
              <FileText className="h-8 w-8 mx-auto mb-3 text-spacegray-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1 text-black">Nieuw Artikel</h3>
              <p className="text-sm text-spacegray-500">Voeg een artikel toe</p>
            </Card>
            <Card className="card-hover p-6 text-center cursor-pointer group bg-white border-gray-200">
              <FolderOpen className="h-8 w-8 mx-auto mb-3 text-spacegray-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1 text-black">Nieuwe Categorie</h3>
              <p className="text-sm text-spacegray-500">Organiseer je content</p>
            </Card>
            <Card className="card-hover p-6 text-center cursor-pointer group bg-white border-gray-200">
              <Users className="h-8 w-8 mx-auto mb-3 text-spacegray-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1 text-black">Gebruiker Toevoegen</h3>
              <p className="text-sm text-spacegray-500">Beheer toegang</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
