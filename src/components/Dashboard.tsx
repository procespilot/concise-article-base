
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, FolderOpen, Eye } from "lucide-react";

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
    },
    {
      title: "Categorieën",
      value: categories.length,
      subtitle: "Actieve categorieën",
      icon: FolderOpen,
    },
    {
      title: "Gebruikers",
      value: users.length,
      subtitle: "Geregistreerde gebruikers",
      icon: Users,
    },
    {
      title: "Totaal Weergaven",
      value: totalViews.toLocaleString(),
      subtitle: "Artikel weergaven",
      icon: Eye,
    }
  ];
  
  return (
    <div className="space-y-12">
      <div className="centered-container">
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-5xl font-light text-black">
            Dashboard
          </h1>
          <p className="text-lg text-spacegray-600 max-w-2xl mx-auto leading-relaxed">
            Overzicht van je kennisbank en belangrijkste statistieken
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full mb-16">
          {stats.map((stat) => (
            <Card key={stat.title} className="card-minimal p-8">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-normal text-spacegray-600 uppercase tracking-wide">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-spacegray-400" />
              </CardHeader>
              <CardContent className="space-y-3 p-0">
                <div className="text-4xl font-light text-black">
                  {stat.value}
                </div>
                <p className="text-xs text-spacegray-500">
                  {stat.subtitle}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <h2 className="text-3xl font-light mb-12 text-black">Snelle Acties</h2>
          <div className="button-group max-w-4xl">
            <Card className="card-minimal p-8 text-center cursor-pointer group min-w-64">
              <FileText className="h-8 w-8 mx-auto mb-4 text-spacegray-400 group-hover:text-spacegray-600 transition-colors" />
              <h3 className="font-medium mb-2 text-black text-lg">Nieuw Artikel</h3>
              <p className="text-sm text-spacegray-500">Voeg een artikel toe</p>
            </Card>
            <Card className="card-minimal p-8 text-center cursor-pointer group min-w-64">
              <FolderOpen className="h-8 w-8 mx-auto mb-4 text-spacegray-400 group-hover:text-spacegray-600 transition-colors" />
              <h3 className="font-medium mb-2 text-black text-lg">Nieuwe Categorie</h3>
              <p className="text-sm text-spacegray-500">Organiseer je content</p>
            </Card>
            <Card className="card-minimal p-8 text-center cursor-pointer group min-w-64">
              <Users className="h-8 w-8 mx-auto mb-4 text-spacegray-400 group-hover:text-spacegray-600 transition-colors" />
              <h3 className="font-medium mb-2 text-black text-lg">Gebruiker Toevoegen</h3>
              <p className="text-sm text-spacegray-500">Beheer toegang</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
