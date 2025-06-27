
-- Remove the problematic public access policy that causes recursion
DROP POLICY IF EXISTS "Public profiles read access" ON public.profiles;

-- Create a more specific policy for profiles that avoids recursion
-- This allows reading profile data when it's needed for article queries
CREATE POLICY "Allow profile access for articles" ON public.profiles
  FOR SELECT USING (
    -- Allow users to read their own profile
    auth.uid() = id 
    OR
    -- Allow reading profiles of article authors (but avoid recursion by not querying profiles again)
    EXISTS (
      SELECT 1 FROM public.articles 
      WHERE author_id = profiles.id
    )
  );

-- Also ensure we have the basic user policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
