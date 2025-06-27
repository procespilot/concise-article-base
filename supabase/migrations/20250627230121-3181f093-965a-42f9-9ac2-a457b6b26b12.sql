
-- First, clean up ALL existing problematic policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile access for articles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles read access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "Enable read access for own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update access for own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow public read access to profiles for article display (no recursion)
CREATE POLICY "Enable read access for article authors" ON public.profiles
  FOR SELECT USING (true);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clean up and recreate articles policies to ensure they work properly
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

-- Create simple, working articles policies
CREATE POLICY "Enable read access for published articles" ON public.articles
  FOR SELECT USING (
    status = 'Gepubliceerd' 
    OR author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Enable insert for authenticated users" ON public.articles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authors and managers" ON public.articles
  FOR UPDATE USING (
    author_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Enable delete for authors and managers" ON public.articles
  FOR DELETE USING (
    author_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('manager', 'admin')
    )
  );

-- Ensure RLS is enabled on articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Also ensure categories table has proper policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
CREATE POLICY "Enable read access for all users" ON public.categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write access for managers" ON public.categories;
CREATE POLICY "Enable write access for managers" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('manager', 'admin')
    )
  );
