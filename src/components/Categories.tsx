
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface CategoriesProps {
  categories: any[];
  articles: any[];
  onRefresh: () => Promise<void>;
}

const Categories = ({ categories, articles, onRefresh }: CategoriesProps) => {
  return (
    <div className="space-y-6 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Categorieën</h1>
          <p className="text-gray-600">Beheer je artikel categorieën</p>
        </div>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Vernieuwen
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const articleCount = articles.filter(a => a.category_id === category.id).length;
          
          return (
            <Card key={category.id} className="border border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-black">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{articleCount} artikel{articleCount !== 1 ? 'en' : ''}</span>
                  <span>{new Date(category.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Categories;
