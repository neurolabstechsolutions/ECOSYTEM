-- Inserción del Tenant NeuroLabs (Admin) y el Tenant Piloto Automotriz
INSERT INTO public.tenants (id, name, domain)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'NeuroLabs', 'neurolabs.ai'),
  ('22222222-2222-2222-2222-222222222222', 'Piloto Automotriz', 'automotriz.com');

-- Inserción de usuarios en auth.users (la contraseña de todos es 'password123')
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES 
  (
    '00000000-0000-0000-0000-000000000000', 
    '10000000-0000-0000-0000-000000000001', 
    'authenticated', 
    'authenticated', 
    'superadmin@neurolabs.ai', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"display_name":"NeuroLabs Super Admin","role":"SUPER_ADMIN","tenant_id":"11111111-1111-1111-1111-111111111111"}', 
    now(), 
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000', 
    '20000000-0000-0000-0000-000000000001', 
    'authenticated', 
    'authenticated', 
    'admin@automotriz.com', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"display_name":"Automotriz Admin","role":"TENANT_ADMIN","tenant_id":"22222222-2222-2222-2222-222222222222"}', 
    now(), 
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000', 
    '20000000-0000-0000-0000-000000000002', 
    'authenticated', 
    'authenticated', 
    'agente@automotriz.com', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"display_name":"Automotriz Agente 1","role":"AGENT","tenant_id":"22222222-2222-2222-2222-222222222222"}', 
    now(), 
    now()
  );

-- NOTA: El trigger on_auth_user_created insertará automáticamente los registros en public.users
