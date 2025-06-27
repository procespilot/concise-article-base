
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsProps {
  articles: any[];
  categories: any[];
}

const Analytics = ({ articles, categories }: AnalyticsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Inzichten in je kennisbank</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Artikel Statistieken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Totaal artikelen:</span>
                <span className="font-semibold">{articles.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Gepubliceerd:</span>
                <span className="font-semibold">
                  {articles.filter(a => a.status === 'Gepubliceerd').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Concepten:</span>
                <span className="font-semibold">
                  {articles.filter(a => a.status === 'Concept').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorieën</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex justify-between">
                  <span>{category.name}:</span>
                  <span className="font-semibold">
                    {articles.filter(a => a.category_id === category.id).length}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
