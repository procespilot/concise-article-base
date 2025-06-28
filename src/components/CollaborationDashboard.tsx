
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Bell, 
  GitBranch, 
  History, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import CommentSystem from './CommentSystem';
import NotificationSystem from './NotificationSystem';
import WorkflowManagement from './WorkflowManagement';
import ArticleVersioning from './ArticleVersioning';
import { useAuth } from '@/hooks/useAuth';

interface CollaborationDashboardProps {
  articleId?: string;
  currentVersion?: any;
}

const CollaborationDashboard = ({ articleId, currentVersion }: CollaborationDashboardProps) => {
  const { user, isManager } = useAuth();

  // Mock statistics
  const stats = {
    pendingReviews: 3,
    unreadNotifications: 5,
    activeComments: 12,
    articlesInWorkflow: 8
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">Log in om collaboration features te gebruiken</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingReviews}</p>
                <p className="text-sm text-gray-600">Pending Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.unreadNotifications}</p>
                <p className="text-sm text-gray-600">Unread Notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeComments}</p>
                <p className="text-sm text-gray-600">Active Comments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded">
                <GitBranch className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.articlesInWorkflow}</p>
                <p className="text-sm text-gray-600">In Workflow</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Collaboration Interface */}
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications" className="relative">
            <Bell className="h-4 w-4 mr-2" />
            Notificaties
            {stats.unreadNotifications > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {stats.unreadNotifications}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="workflow">
            <GitBranch className="h-4 w-4 mr-2" />
            Workflow
          </TabsTrigger>
          
          <TabsTrigger value="comments">
            <MessageCircle className="h-4 w-4 mr-2" />
            Reacties
          </TabsTrigger>
          
          <TabsTrigger value="versions">
            <History className="h-4 w-4 mr-2" />
            Versies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSystem maxItems={20} />
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <WorkflowManagement 
            articleId={articleId} 
            showAllWorkflows={!articleId || isManager} 
          />
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          {articleId ? (
            <CommentSystem articleId={articleId} />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MessageCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">
                  Selecteer een artikel om reacties te bekijken
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          {articleId && currentVersion ? (
            <ArticleVersioning 
              articleId={articleId} 
              currentVersion={currentVersion}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <History className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">
                  Selecteer een artikel om versiegeschiedenis te bekijken
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaborationDashboard;
