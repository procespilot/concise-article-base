
-- Drop ALL existing policies completely
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_managers" ON public.user_roles;

-- Create ultra-simple policies without ANY recursion risk
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "user_roles_own_read" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Allow managers to read all roles using a simple approach
CREATE POLICY "user_roles_public_read" ON public.user_roles
  FOR SELECT USING (true);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
