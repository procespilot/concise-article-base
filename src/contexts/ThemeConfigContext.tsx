import React, { createContext, useContext, useEffect, useState } from 'react';
import { hexToHsl, applyPrimaryColor, isValidHexColor } from '@/utils/colorUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  card: string;
  border: string;
  success: string;
  warning: string;
  destructive: string;
  info: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description?: string;
  colors: ThemeColors;
  isDefault?: boolean;
}

interface ThemeConfigContextType {
  currentTheme: ThemeColors;
  presets: ThemePreset[];
  isLoading: boolean;
  updateColor: (key: keyof ThemeColors, value: string) => void;
  applyTheme: (theme: ThemeColors) => void;
  savePreset: (name: string, description?: string) => Promise<void>;
  loadPreset: (preset: ThemePreset) => void;
  resetToDefault: () => void;
  deletePreset: (id: string) => Promise<void>;
  validateContrast: (foreground: string, background: string) => boolean;
}

const defaultTheme: ThemeColors = {
  primary: '#3B82F6',
  secondary: '#F3F4F6',
  accent: '#10B981',
  background: '#FFFFFF',
  foreground: '#000000',
  muted: '#6B7280',
  card: '#FFFFFF',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  destructive: '#EF4444',
  info: '#3B82F6'
};

const ThemeConfigContext = createContext<ThemeConfigContextType | undefined>(undefined);

export const useThemeConfig = () => {
  const context = useContext(ThemeConfigContext);
  if (!context) {
    throw new Error('useThemeConfig must be used within a ThemeConfigProvider');
  }
  return context;
};

export const ThemeConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentTheme, setCurrentTheme] = useState<ThemeColors>(defaultTheme);
  const [presets, setPresets] = useState<ThemePreset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load user's theme preferences on mount
  useEffect(() => {
    if (user) {
      loadUserThemes();
    }
  }, [user]);

  const loadUserThemes = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load user preferences with theme data
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (preferences?.theme_colors) {
        const savedTheme = JSON.parse(preferences.theme_colors);
        setCurrentTheme({ ...defaultTheme, ...savedTheme });
        applyThemeToCSS({ ...defaultTheme, ...savedTheme });
      }

      // Load saved presets (we'll create a table for this)
      // For now, include some default presets
      setPresets([
        {
          id: 'default',
          name: 'ClearBase Default',
          description: 'The original ClearBase theme',
          colors: defaultTheme,
          isDefault: true
        },
        {
          id: 'ocean',
          name: 'Ocean Blue',
          description: 'Professional blue theme',
          colors: {
            ...defaultTheme,
            primary: '#1E40AF',
            secondary: '#EFF6FF',
            accent: '#0EA5E9'
          }
        },
        {
          id: 'forest',
          name: 'Forest Green',
          description: 'Natural green theme',
          colors: {
            ...defaultTheme,
            primary: '#059669',
            secondary: '#ECFDF5',
            accent: '#10B981'
          }
        },
        {
          id: 'sunset',
          name: 'Sunset Orange',
          description: 'Warm orange theme',
          colors: {
            ...defaultTheme,
            primary: '#EA580C',
            secondary: '#FFF7ED',
            accent: '#F97316'
          }
        }
      ]);
    } catch (error) {
      console.error('Error loading user themes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyThemeToCSS = (theme: ThemeColors) => {
    const root = document.documentElement;
    
    // Convert hex colors to HSL and apply to CSS variables
    Object.entries(theme).forEach(([key, value]) => {
      if (isValidHexColor(value)) {
        const hsl = hexToHsl(value);
        root.style.setProperty(`--${key}`, hsl);
        
        // Also update specific mappings
        if (key === 'primary') {
          root.style.setProperty('--sidebar-primary', hsl);
          root.style.setProperty('--ring', hsl);
        }
        if (key === 'background') {
          root.style.setProperty('--sidebar-background', hsl);
        }
        if (key === 'foreground') {
          root.style.setProperty('--sidebar-foreground', hsl);
        }
        if (key === 'border') {
          root.style.setProperty('--sidebar-border', hsl);
          root.style.setProperty('--input', hsl);
        }
      }
    });
  };

  const updateColor = (key: keyof ThemeColors, value: string) => {
    if (!isValidHexColor(value)) return;
    
    const newTheme = { ...currentTheme, [key]: value };
    setCurrentTheme(newTheme);
    applyThemeToCSS(newTheme);
  };

  const applyTheme = (theme: ThemeColors) => {
    setCurrentTheme(theme);
    applyThemeToCSS(theme);
  };

  const savePreset = async (name: string, description?: string) => {
    if (!user) return;

    try {
      // Save current theme as user preference
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          theme_colors: JSON.stringify(currentTheme)
        });

      if (error) throw error;

      toast({
        title: 'Theme saved',
        description: `Your theme "${name}" has been saved successfully.`
      });
    } catch (error) {
      console.error('Error saving theme:', error);
      toast({
        title: 'Error',
        description: 'Failed to save theme. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const loadPreset = (preset: ThemePreset) => {
    applyTheme(preset.colors);
    toast({
      title: 'Theme applied',
      description: `"${preset.name}" theme has been applied.`
    });
  };

  const resetToDefault = () => {
    applyTheme(defaultTheme);
    toast({
      title: 'Theme reset',
      description: 'Theme has been reset to default.'
    });
  };

  const deletePreset = async (id: string) => {
    // For now, just remove from local state
    // In a full implementation, this would delete from database
    setPresets(prev => prev.filter(p => p.id !== id));
    toast({
      title: 'Preset deleted',
      description: 'Theme preset has been deleted.'
    });
  };

  const validateContrast = (foreground: string, background: string): boolean => {
    // Basic contrast validation
    // In a full implementation, this would calculate WCAG contrast ratios
    if (!isValidHexColor(foreground) || !isValidHexColor(background)) return false;
    
    // Simple luminance check
    const getLuminance = (hex: string) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      return 0.299 * r + 0.587 * g + 0.114 * b;
    };
    
    const fgLum = getLuminance(foreground);
    const bgLum = getLuminance(background);
    const ratio = Math.abs(fgLum - bgLum);
    
    return ratio > 125; // Basic threshold
  };

  return (
    <ThemeConfigContext.Provider
      value={{
        currentTheme,
        presets,
        isLoading,
        updateColor,
        applyTheme,
        savePreset,
        loadPreset,
        resetToDefault,
        deletePreset,
        validateContrast
      }}
    >
      {children}
    </ThemeConfigContext.Provider>
  );
};