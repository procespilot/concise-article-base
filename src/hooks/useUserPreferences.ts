
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface UserPreferences {
  id?: string;
  display_name: string | null;
  notifications: boolean;
  email_updates: boolean;
  two_factor_auth: boolean;
  session_timeout: number;
  email_notifications: boolean;
  push_notifications: boolean;
  security_alerts: boolean;
  article_updates: boolean;
  weekly_digest: boolean;
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    display_name: '',
    notifications: true,
    email_updates: false,
    two_factor_auth: false,
    session_timeout: 60,
    email_notifications: true,
    push_notifications: false,
    security_alerts: true,
    article_updates: false,
    weekly_digest: false
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPreferences = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Fetching user preferences for:', user.id);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        throw error;
      }

      if (data) {
        console.log('User preferences loaded:', data);
        setPreferences({
          id: data.id,
          display_name: data.display_name,
          notifications: data.notifications,
          email_updates: data.email_updates,
          two_factor_auth: data.two_factor_auth,
          session_timeout: data.session_timeout,
          email_notifications: data.email_notifications,
          push_notifications: data.push_notifications,
          security_alerts: data.security_alerts,
          article_updates: data.article_updates,
          weekly_digest: data.weekly_digest
        });
      } else {
        // Set default values from user profile if no preferences exist
        console.log('No preferences found, using defaults');
        setPreferences(prev => ({
          ...prev,
          display_name: user.email?.split('@')[0] || ''
        }));
      }
    } catch (error: any) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Fout bij laden voorkeuren",
        description: error.message || "Probeer het opnieuw",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const savePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return false;
    
    setSaving(true);
    try {
      console.log('Saving user preferences:', newPreferences);
      
      const dataToSave = {
        user_id: user.id,
        display_name: newPreferences.display_name,
        notifications: newPreferences.notifications,
        email_updates: newPreferences.email_updates,
        two_factor_auth: newPreferences.two_factor_auth,
        session_timeout: newPreferences.session_timeout,
        email_notifications: newPreferences.email_notifications,
        push_notifications: newPreferences.push_notifications,
        security_alerts: newPreferences.security_alerts,
        article_updates: newPreferences.article_updates,
        weekly_digest: newPreferences.weekly_digest
      };

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(dataToSave, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('Error saving preferences:', error);
        throw error;
      }

      console.log('Preferences saved successfully:', data);
      setPreferences({
        id: data.id,
        display_name: data.display_name,
        notifications: data.notifications,
        email_updates: data.email_updates,
        two_factor_auth: data.two_factor_auth,
        session_timeout: data.session_timeout,
        email_notifications: data.email_notifications,
        push_notifications: data.push_notifications,
        security_alerts: data.security_alerts,
        article_updates: data.article_updates,
        weekly_digest: data.weekly_digest
      });

      toast({
        title: "Voorkeuren opgeslagen",
        description: "Je persoonlijke instellingen zijn bijgewerkt"
      });

      return true;
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Fout bij opslaan",
        description: error.message || "Probeer het opnieuw",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    saving,
    savePreferences,
    refetchPreferences: fetchPreferences
  };
};
