
-- Maak test gebruikers aan in de auth.users tabel
-- Let op: Dit is een speciale manier om gebruikers aan te maken via SQL
-- Normaal gesproken gebeurt dit via de Supabase Auth API

-- Eerst maken we een manager account aan
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'manager@example.com',
  crypt('password', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Manager","last_name":"User"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Dan maken we een gewone gebruiker account aan
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'user@example.com',
  crypt('password', gen_salt('bf')),  
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Test","last_name":"User"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Geef de manager account manager rechten
-- Eerst halen we de user_id op en maken we een manager rol aan
WITH manager_user AS (
  SELECT id FROM auth.users WHERE email = 'manager@example.com'
)
UPDATE user_roles 
SET role = 'manager'
WHERE user_id IN (SELECT id FROM manager_user);

-- Als de user_role nog niet bestaat, voeg deze toe
INSERT INTO user_roles (user_id, role)
SELECT id, 'manager'::app_role
FROM auth.users 
WHERE email = 'manager@example.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.users.id
);
