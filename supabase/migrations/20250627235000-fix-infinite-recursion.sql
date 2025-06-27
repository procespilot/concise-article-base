
-- Drop all existing problematic policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles read access" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile access for articles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "Enable read access for own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow public read access to profiles (needed for article author info)
-- This is safe because we're not querying profiles from within profiles
CREATE POLICY "Enable read access for all profiles" ON public.profiles
  FOR SELECT USING (true);

-- Fix user_roles policies to ensure they work correctly
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Managers can view all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all roles" ON public.user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('manager', 'admin')
    )
  );

-- Ensure RLS is enabled on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
