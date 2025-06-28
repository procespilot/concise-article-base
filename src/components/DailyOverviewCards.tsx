
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  TrendingUp, 
  Bell, 
  Clock, 
  Eye, 
  Star,
  Calendar,
  Activity
} from 'lucide-react';

interface DailyOverviewCardsProps {
  articles: any[];
  onCreateArticle?: () => void;
  onArticleClick?: (id: string) => void;
  isManager?: boolean;
}

const DailyOverviewCards = ({ 
  articles, 
  onCreateArticle, 
  onArticleClick,
  isManager 
}: DailyOverviewCardsProps) => {
  // Calculate today's stats
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  const todayArticles = articles.filter(article => 
    article.created_at?.startsWith(todayString)
  );
  
  const recentArticles = articles
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
    .slice(0, 3);
    
  const trendingArticles = articles
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 3);

  const totalViewsToday = todayArticles.reduce((sum, article) => sum + (article.views || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Today's Activity */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-green-800 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Vandaag
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Nieuwe artikelen</span>
              <Badge variant="secondary">{todayArticles.length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Totale views</span>
              <Badge variant="secondary">{totalViewsToday}</Badge>
            </div>
            {isManager && (
              <Button 
                size="sm" 
                className="w-full mt-3"
                onClick={onCreateArticle}
              >
                <FileText className="w-4 h-4 mr-2" />
                Nieuw artikel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Recent bijgewerkt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentArticles.length > 0 ? (
              recentArticles.map(article => (
                <div 
                  key={article.id}
                  className="p-2 bg-white rounded border cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onArticleClick?.(article.id)}
                >
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {article.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(article.updated_at || article.created_at).toLocaleDateString('nl-NL')}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Geen recente activiteit</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trending */}
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-orange-800 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending deze week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {trendingArticles.length > 0 ? (
              trendingArticles.map((article, index) => (
                <div 
                  key={article.id}
                  className="p-2 bg-white rounded border cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onArticleClick?.(article.id)}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-900 truncate flex-1">
                      {article.title}
                    </p>
                    <div className="flex items-center space-x-1 ml-2">
                      <Eye className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{article.views || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Geen trending artikelen</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-purple-800 flex items-center">
            <Star className="w-4 h-4 mr-2" />
            Overzicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {articles.length}
              </div>
              <div className="text-xs text-gray-600">Totaal artikelen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {articles.reduce((sum, article) => sum + (article.views || 0), 0)}
              </div>
              <div className="text-xs text-gray-600">Totale views</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyOverviewCards;
