
-- Fix the RLS policies for the profiles table to prevent infinite recursion
-- First, drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;

-- Create proper RLS policies for profiles
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile  
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow public read access to profiles for article authors (needed for article queries)
CREATE POLICY "Public profiles read access" ON public.profiles
  FOR SELECT USING (true);

-- Drop existing RLS policies for articles if they exist
DROP POLICY IF EXISTS "Published articles are publicly readable" ON public.articles;
DROP POLICY IF EXISTS "Managers can read all articles" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users can create articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can update own articles" ON public.articles;
DROP POLICY IF EXISTS "Managers can update all articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can delete own articles" ON public.articles;
DROP POLICY IF EXISTS "Managers can delete all articles" ON public.articles;
DROP POLICY IF EXISTS "Anyone can view published articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can create articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can update their own articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can delete their own articles" ON public.articles;

-- Enable RLS on articles table
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read published articles
CREATE POLICY "Published articles are publicly readable" ON public.articles
  FOR SELECT USING (status = 'Gepubliceerd');

-- Allow managers and admins to read all articles
CREATE POLICY "Managers can read all articles" ON public.articles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('manager', 'admin')
    )
  );

-- Allow authenticated users to create articles
CREATE POLICY "Authenticated users can create articles" ON public.articles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authors to update their own articles
CREATE POLICY "Authors can update own articles" ON public.articles
  FOR UPDATE USING (author_id = auth.uid());

-- Allow managers and admins to update all articles
CREATE POLICY "Managers can update all articles" ON public.articles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('manager', 'admin')
    )
  );

-- Allow authors to delete their own articles
CREATE POLICY "Authors can delete own articles" ON public.articles
  FOR DELETE USING (author_id = auth.uid());

-- Allow managers and admins to delete all articles
CREATE POLICY "Managers can delete all articles" ON public.articles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('manager', 'admin')
    )
  );
