
-- Verwijder alle bestaande rollen
DELETE FROM public.user_roles;

-- Update het bestaande profiel naar manager gegevens
UPDATE public.profiles 
SET 
  first_name = 'Manager',
  last_name = 'User',
  email = 'manager@example.com',
  is_active = true,
  activated_at = NOW()
WHERE id = 'c6a6b990-5474-4c81-8907-15590fac9708';

-- Geef de huidige gebruiker manager rechten
INSERT INTO public.user_roles (user_id, role)
VALUES ('c6a6b990-5474-4c81-8907-15590fac9708', 'manager');
