
-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_users_with_roles();

-- Add activation status to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS activation_token TEXT;

-- Update the secure user creation function to include activation workflow
CREATE OR REPLACE FUNCTION public.create_user_with_role(
  p_email TEXT,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_role app_role DEFAULT 'user',
  p_auto_activate BOOLEAN DEFAULT false
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  activation_token_val TEXT;
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
  
  -- Only admins can create managers
  IF p_role = 'manager' AND NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('error', 'Insufficient permissions to create manager users');
  END IF;
  
  -- Generate new UUID and activation token
  new_user_id := gen_random_uuid();
  activation_token_val := gen_random_uuid()::text;
  
  -- Insert into profiles with activation data
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    phone, 
    is_active,
    activated_at,
    activation_token
  )
  VALUES (
    new_user_id, 
    p_email, 
    p_first_name, 
    p_last_name, 
    p_phone,
    p_auto_activate,
    CASE WHEN p_auto_activate THEN NOW() ELSE NULL END,
    CASE WHEN p_auto_activate THEN NULL ELSE activation_token_val END
  );
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, p_role);
  
  -- Log the action in audit table
  INSERT INTO public.user_audit_log (
    action,
    target_user_id,
    performed_by,
    details
  )
  VALUES (
    'user_created',
    new_user_id,
    auth.uid(),
    json_build_object(
      'email', p_email,
      'role', p_role,
      'auto_activated', p_auto_activate
    )
  );
  
  -- Return success with user ID and activation token (if needed)
  RETURN json_build_object(
    'success', true, 
    'user_id', new_user_id,
    'activation_token', CASE WHEN p_auto_activate THEN NULL ELSE activation_token_val END,
    'requires_activation', NOT p_auto_activate
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Function to activate a user
CREATE OR REPLACE FUNCTION public.activate_user(
  p_user_id UUID,
  p_activation_token TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Get user record
  SELECT * INTO user_record 
  FROM public.profiles 
  WHERE id = p_user_id;
  
  -- Check if user exists
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'User not found');
  END IF;
  
  -- Check if user is already active
  IF user_record.is_active THEN
    RETURN json_build_object('error', 'User is already active');
  END IF;
  
  -- Verify activation token if provided
  IF p_activation_token IS NOT NULL AND user_record.activation_token != p_activation_token THEN
    RETURN json_build_object('error', 'Invalid activation token');
  END IF;
  
  -- Only admins can activate users without token
  IF p_activation_token IS NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('error', 'Insufficient permissions to activate user');
  END IF;
  
  -- Activate the user
  UPDATE public.profiles 
  SET 
    is_active = true,
    activated_at = NOW(),
    activation_token = NULL
  WHERE id = p_user_id;
  
  -- Log the action
  INSERT INTO public.user_audit_log (
    action,
    target_user_id,
    performed_by,
    details
  )
  VALUES (
    'user_activated',
    p_user_id,
    auth.uid(),
    json_build_object('activation_method', CASE WHEN p_activation_token IS NOT NULL THEN 'token' ELSE 'admin' END)
  );
  
  RETURN json_build_object('success', true, 'message', 'User activated successfully');
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Function to deactivate a user (admin only)
CREATE OR REPLACE FUNCTION public.deactivate_user(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only admins can deactivate users
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('error', 'Insufficient permissions');
  END IF;
  
  -- Don't allow deactivating yourself
  IF p_user_id = auth.uid() THEN
    RETURN json_build_object('error', 'Cannot deactivate your own account');
  END IF;
  
  -- Deactivate the user
  UPDATE public.profiles 
  SET is_active = false
  WHERE id = p_user_id;
  
  -- Log the action
  INSERT INTO public.user_audit_log (
    action,
    target_user_id,
    performed_by,
    details
  )
  VALUES (
    'user_deactivated',
    p_user_id,
    auth.uid(),
    json_build_object('reason', 'admin_action')
  );
  
  RETURN json_build_object('success', true, 'message', 'User deactivated successfully');
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Update RLS policies to consider activation status
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Managers and admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id AND is_active = true);

CREATE POLICY "Managers and admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    (public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'))
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_active = true)
  );

-- Recreate the get_users_with_roles function with new columns
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN,
  activated_at TIMESTAMPTZ,
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
    p.is_active,
    p.activated_at,
    p.created_at,
    COALESCE(
      json_agg(
        json_build_object('role', ur.role)
      ) FILTER (WHERE ur.role IS NOT NULL),
      '[]'::json
    ) as roles
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  GROUP BY p.id, p.first_name, p.last_name, p.email, p.phone, p.is_active, p.activated_at, p.created_at
  ORDER BY p.created_at DESC;
$$;
