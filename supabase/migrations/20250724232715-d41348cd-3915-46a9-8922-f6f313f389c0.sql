-- Add theme_colors column to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN theme_colors jsonb DEFAULT '{}'::jsonb;