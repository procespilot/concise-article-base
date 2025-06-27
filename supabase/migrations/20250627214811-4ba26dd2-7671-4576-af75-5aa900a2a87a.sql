
-- Fix the infinite recursion in RLS policies by simplifying them
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;

-- Create simpler, non-recursive policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Managers can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('manager', 'admin')
    )
  );

-- Also fix articles policies to ensure they work correctly
DROP POLICY IF EXISTS "Anyone can view published articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can create articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can update their own articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can delete their own articles" ON public.articles;

-- Create proper articles policies
CREATE POLICY "Anyone can view published articles" ON public.articles
  FOR SELECT USING (
    status = 'Gepubliceerd' 
    OR author_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Authors can create articles" ON public.articles
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own articles" ON public.articles
  FOR UPDATE USING (
    author_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Authors can delete their own articles" ON public.articles
  FOR DELETE USING (
    author_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('manager', 'admin')
    )
  );
