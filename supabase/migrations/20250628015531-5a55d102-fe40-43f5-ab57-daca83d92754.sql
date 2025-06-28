
-- Extend user_preferences table with email and notification settings
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS push_notifications boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS security_alerts boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS article_updates boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS weekly_digest boolean DEFAULT false;

-- Create notification_logs table for tracking sent notifications
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notification_type text NOT NULL,
  title text NOT NULL,
  message text,
  sent_at timestamp with time zone DEFAULT now(),
  delivery_status text DEFAULT 'sent',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on notification_logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notification_logs
CREATE POLICY "Users can view their own notification logs" 
  ON public.notification_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notification logs" 
  ON public.notification_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Create email_templates table for customizable email templates
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text UNIQUE NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL,
  text_content text,
  variables jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default email templates
INSERT INTO public.email_templates (template_name, subject, html_content, text_content, variables) VALUES
('welcome', 'Welkom bij ClearBase!', 
'<h1>Welkom {{user_name}}!</h1><p>Je account is succesvol aangemaakt. Begin met het ontdekken van onze knowledge base.</p>', 
'Welkom {{user_name}}! Je account is succesvol aangemaakt.', 
'["user_name", "login_url"]'::jsonb),
('password_reset', 'Wachtwoord reset aanvraag', 
'<h1>Wachtwoord Reset</h1><p>Klik op de link om je wachtwoord te resetten: <a href="{{reset_url}}">Reset Wachtwoord</a></p>', 
'Wachtwoord reset link: {{reset_url}}', 
'["user_name", "reset_url"]'::jsonb),
('email_change', 'Email adres wijziging', 
'<h1>Email Wijziging</h1><p>Je email adres wordt gewijzigd naar {{new_email}}. Klik hier om te bevestigen: <a href="{{confirm_url}}">Bevestigen</a></p>', 
'Email wijziging naar {{new_email}}. Bevestig via: {{confirm_url}}', 
'["user_name", "new_email", "confirm_url"]'::jsonb);

-- Create function to log notifications
CREATE OR REPLACE FUNCTION public.log_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notification_logs (user_id, notification_type, title, message, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_metadata)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Create updated_at trigger for email_templates
CREATE OR REPLACE FUNCTION public.update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_templates_updated_at();
