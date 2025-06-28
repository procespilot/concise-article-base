
import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  action_url?: string;
  action_label?: string;
  related_article_id?: string;
  related_user_id?: string;
}

interface NotificationSystemProps {
  showUnreadOnly?: boolean;
  maxItems?: number;
}

const NotificationSystem = ({ showUnreadOnly = false, maxItems = 10 }: NotificationSystemProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    // Mock data - in real implementation this would fetch from Supabase
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'info',
        title: 'Nieuw artikel gepubliceerd',
        message: 'Het artikel "Best Practices voor React Development" is zojuist gepubliceerd.',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        action_url: '/articles/123',
        action_label: 'Bekijk artikel',
        related_article_id: '123'
      },
      {
        id: '2',
        type: 'success',
        title: 'Artikel goedgekeurd',
        message: 'Je artikel "TypeScript Tips" is goedgekeurd en gepubliceerd.',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        read: false,
        action_url: '/articles/124',
        action_label: 'Bekijk artikel',
        related_article_id: '124'
      },
      {
        id: '3',
        type: 'warning',
        title: 'Artikel moet worden herzien',
        message: 'Je artikel "Database Optimalisatie" heeft feedback ontvangen en moet worden herzien.',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        read: true,
        action_url: '/articles/125/edit',
        action_label: 'Bewerk artikel',
        related_article_id: '125'
      },
      {
        id: '4',
        type: 'info',
        title: 'Nieuwe reactie',
        message: 'Jan de Vries heeft gereageerd op je artikel "API Design Patterns".',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        read: true,
        action_url: '/articles/126#comments',
        action_label: 'Bekijk reactie',
        related_article_id: '126'
      }
    ];

    const filteredNotifications = showUnreadOnly 
      ? mockNotifications.filter(n => !n.read)
      : mockNotifications;

    setNotifications(filteredNotifications.slice(0, maxItems));
  };

  const markAsRead = async (notificationId: string) => {
    setLoading(true);
    try {
      // In real implementation, this would update the notification in Supabase
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het markeren van de notificatie",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      // In real implementation, this would update all notifications in Supabase
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      toast({
        title: "Notificaties gemarkeerd",
        description: "Alle notificaties zijn gemarkeerd als gelezen"
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het markeren van de notificaties",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    setLoading(true);
    try {
      // In real implementation, this would delete the notification from Supabase
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het verwijderen van de notificatie",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Notificaties</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
        
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={loading}
          >
            <Check className="h-4 w-4 mr-1" />
            Alles gelezen
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Bell className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">
              {showUnreadOnly ? 'Geen ongelezen notificaties' : 'Geen notificaties'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <Card 
              key={notification.id} 
              className={`${!notification.read ? 'border-blue-200 bg-blue-50/30' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleString('nl-NL')}
                      </p>
                      
                      <div className="flex gap-2">
                        {notification.action_url && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                          >
                            {notification.action_label || 'Bekijken'}
                          </Button>
                        )}
                        
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            disabled={loading}
                            className="text-xs"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          disabled={loading}
                          className="text-xs"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;
