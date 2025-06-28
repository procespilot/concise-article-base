
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from './LoadingSpinner';
import { Bell, Mail, Shield, FileText, Calendar, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface NotificationLog {
  id: string;
  notification_type: string;
  title: string;
  message: string | null;
  sent_at: string;
  delivery_status: string;
  metadata: any;
}

const NotificationCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Fout bij laden notificaties",
        description: error.message || "Probeer het opnieuw",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id: string) => {
    setDeleting(id);
    try {
      const { error } = await supabase
        .from('notification_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== id));
      
      toast({
        title: "Notificatie verwijderd",
        description: "De notificatie is uit je overzicht verwijderd"
      });
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Fout bij verwijderen",
        description: error.message || "Probeer het opnieuw",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email_change_requested':
      case 'email_change_confirmed':
        return <Mail className="w-4 h-4" />;
      case 'security_alert':
      case 'password_reset':
        return <Shield className="w-4 h-4" />;
      case 'article_published':
      case 'article_updated':
        return <FileText className="w-4 h-4" />;
      case 'weekly_digest':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'security_alert':
      case 'password_reset':
        return 'destructive';
      case 'email_change_requested':
      case 'email_change_confirmed':
        return 'default';
      case 'article_published':
      case 'article_updated':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light">Notificaties</h1>
          <p className="text-gray-600">Overzicht van je ontvangen berichten</p>
        </div>
        <Badge variant="secondary">
          {notifications.length} {notifications.length === 1 ? 'bericht' : 'berichten'}
        </Badge>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Geen notificaties
            </h3>
            <p className="text-gray-500 text-center">
              Je hebt nog geen notificaties ontvangen. 
              <br />
              Berichten over account wijzigingen en nieuwe content verschijnen hier.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-2 rounded-full ${
                      notification.notification_type.includes('security') || notification.notification_type.includes('password')
                        ? 'bg-red-100 text-red-600'
                        : notification.notification_type.includes('email')
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <Badge variant={getNotificationColor(notification.notification_type)} className="text-xs">
                          {notification.notification_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      {notification.message && (
                        <p className="text-gray-600 text-sm mb-2">
                          {notification.message}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {formatDistanceToNow(new Date(notification.sent_at), { 
                            addSuffix: true, 
                            locale: nl 
                          })}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${
                          notification.delivery_status === 'sent' 
                            ? 'bg-green-100 text-green-700'
                            : notification.delivery_status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {notification.delivery_status === 'sent' ? 'Verzonden' :
                           notification.delivery_status === 'failed' ? 'Mislukt' : 
                           notification.delivery_status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                    disabled={deleting === notification.id}
                    className="text-gray-400 hover:text-red-600"
                  >
                    {deleting === notification.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
