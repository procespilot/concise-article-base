
-- Add phone column to profiles table
ALTER TABLE public.profiles ADD COLUMN phone TEXT;

-- Add unique constraint on email to prevent duplicates
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Create secure user creation function
CREATE OR REPLACE FUNCTION public.create_user_with_role(
  p_email TEXT,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_role app_role DEFAULT 'user'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Validate email format
  IF p_email !~ '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$' THEN
    RETURN json_build_object('error', 'Invalid email format');
  END IF;
  
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = p_email) THEN
    RETURN json_build_object('error', 'Email already exists');
  END IF;
  
  -- Check role hierarchy (only admins can create admins)
  IF p_role = 'admin' AND NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('error', 'Insufficient permissions to create admin users');
  END IF;
  
  -- Generate new UUID
  new_user_id := gen_random_uuid();
  
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, first_name, last_name, phone)
  VALUES (new_user_id, p_email, p_first_name, p_last_name, p_phone);
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, p_role);
  
  -- Return success with user ID
  RETURN json_build_object('success', true, 'user_id', new_user_id);
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Improve RLS policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;

-- New comprehensive RLS policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Managers and admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'manager') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Only admins can create user profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete user profiles" ON public.profiles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Improve user_roles RLS policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can view user roles" ON public.user_roles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'manager') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Only admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create optimized function to get users with roles (eliminates N+1 problem)
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ,
  roles JSON
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.phone,
    p.created_at,
    COALESCE(
      json_agg(
        json_build_object('role', ur.role)
      ) FILTER (WHERE ur.role IS NOT NULL),
      '[]'::json
    ) as roles
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  GROUP BY p.id, p.first_name, p.last_name, p.email, p.phone, p.created_at
  ORDER BY p.created_at DESC;
$$;

-- Create audit log table for user management actions
CREATE TABLE IF NOT EXISTS public.user_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  target_user_id UUID,
  performed_by UUID REFERENCES auth.users(id),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.user_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON public.user_audit_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
