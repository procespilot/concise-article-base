
-- Create user_preferences table for personal settings
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  notifications BOOLEAN DEFAULT true,
  email_updates BOOLEAN DEFAULT false,
  two_factor_auth BOOLEAN DEFAULT false,
  session_timeout INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create system_settings table for manager/admin settings
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT DEFAULT 'ClearBase',
  site_description TEXT DEFAULT 'Knowledge Base Platform',
  allow_registration BOOLEAN DEFAULT true,
  require_approval BOOLEAN DEFAULT false,
  enable_comments BOOLEAN DEFAULT true,
  enable_ratings BOOLEAN DEFAULT true,
  primary_color TEXT DEFAULT '#3B82F6',
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default system settings
INSERT INTO public.system_settings (site_name, site_description) 
VALUES ('ClearBase', 'Knowledge Base Platform');

-- Enable RLS on both tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences" 
  ON public.user_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
  ON public.user_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
  ON public.user_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for system_settings
CREATE POLICY "Everyone can view system settings" 
  ON public.system_settings 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Only managers can update system settings" 
  ON public.system_settings 
  FOR UPDATE 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
