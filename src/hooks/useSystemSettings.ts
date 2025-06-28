import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { applyPrimaryColor, resetToDefaultColor } from '@/utils/colorUtils';

interface SystemSettings {
  id?: string;
  site_name: string;
  site_description: string;
  allow_registration: boolean;
  require_approval: boolean;
  enable_comments: boolean;
  enable_ratings: boolean;
  primary_color: string;
}

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    site_name: 'ClearBase',
    site_description: 'Knowledge Base Platform',
    allow_registration: true,
    require_approval: false,
    enable_comments: true,
    enable_ratings: true,
    primary_color: '#3B82F6'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user, isManager } = useAuth();

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching system settings');
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching system settings:', error);
        throw error;
      }

      if (data) {
        console.log('System settings loaded:', data);
        const loadedSettings = {
          id: data.id,
          site_name: data.site_name || 'ClearBase',
          site_description: data.site_description || 'Knowledge Base Platform',
          allow_registration: data.allow_registration ?? true,
          require_approval: data.require_approval ?? false,
          enable_comments: data.enable_comments ?? true,
          enable_ratings: data.enable_ratings ?? true,
          primary_color: data.primary_color || '#3B82F6'
        };
        
        setSettings(loadedSettings);
        
        // Apply the primary color immediately when settings are loaded
        applyPrimaryColor(loadedSettings.primary_color);
      } else {
        // Apply default color if no settings found
        resetToDefaultColor();
      }
    } catch (error: any) {
      console.error('Error loading system settings:', error);
      resetToDefaultColor(); // Fallback to default on error
      toast({
        title: "Fout bij laden systeeminstellingen",
        description: error.message || "Probeer het opnieuw",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const saveSettings = useCallback(async (newSettings: Partial<SystemSettings>) => {
    if (!user || !isManager) {
      toast({
        title: "Geen toegang",
        description: "Je hebt geen rechten om systeeminstellingen te wijzigen",
        variant: "destructive"
      });
      return false;
    }
    
    setSaving(true);
    try {
      console.log('Saving system settings:', newSettings);
      
      const dataToSave = {
        site_name: newSettings.site_name,
        site_description: newSettings.site_description,
        allow_registration: newSettings.allow_registration,
        require_approval: newSettings.require_approval,
        enable_comments: newSettings.enable_comments,
        enable_ratings: newSettings.enable_ratings,
        primary_color: newSettings.primary_color,
        updated_by: user.id
      };

      let query = supabase.from('system_settings');
      
      if (settings.id) {
        const { data, error } = await query
          .update(dataToSave)
          .eq('id', settings.id)
          .select()
          .single();
          
        if (error) throw error;
        
        const updatedSettings = { ...settings, ...data };
        setSettings(updatedSettings);
        
        // Apply the new primary color immediately after saving
        if (newSettings.primary_color) {
          applyPrimaryColor(newSettings.primary_color);
        }
      } else {
        const { data, error } = await query
          .insert(dataToSave)
          .select()
          .single();
          
        if (error) throw error;
        
        const updatedSettings = { ...settings, ...data };
        setSettings(updatedSettings);
        
        // Apply the new primary color immediately after saving
        if (newSettings.primary_color) {
          applyPrimaryColor(newSettings.primary_color);
        }
      }

      console.log('System settings saved successfully');
      
      toast({
        title: "Systeeminstellingen opgeslagen",
        description: "De configuratie is succesvol bijgewerkt"
      });

      return true;
    } catch (error: any) {
      console.error('Error saving system settings:', error);
      toast({
        title: "Fout bij opslaan",
        description: error.message || "Probeer het opnieuw",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, isManager, settings.id, toast, settings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    saving,
    saveSettings,
    refetchSettings: fetchSettings,
    canEdit: isManager
  };
};
