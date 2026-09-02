-- 1. Otorgar permisos completos a los roles de Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 2. Asegurar columnas necesarias en tenants
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS slug TEXT DEFAULT 'yjdtrinova';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS nit TEXT DEFAULT '902.095.222-8';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '+57 323 5845145';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS email TEXT DEFAULT 'dondeblanca15@gmail.com';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS address TEXT DEFAULT 'Barranquilla, Atlántico';

-- 3. Deshabilitar RLS temporalmente para acceso del agente
ALTER TABLE IF EXISTS public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.appointments DISABLE ROW LEVEL SECURITY;

-- 4. Registrar la empresa YJD TRINOVA S.A.S.
INSERT INTO public.tenants (name, slug, domain, email, phone, address, nit)
VALUES (
  'YJD TRINOVA S.A.S.',
  'yjdtrinova',
  'yjdtrinova.neurolabs.com.co',
  'dondeblanca15@gmail.com',
  '+57 323 5845145',
  'Barranquilla, Atlántico',
  '902.095.222-8'
)
ON CONFLICT DO NOTHING;
