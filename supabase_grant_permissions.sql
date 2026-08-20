-- ==============================================================================
-- 🚀 NEUROLABS - PERMISOS MAESTROS DE SUPABASE (GRANT ANON & SERVICE_ROLE)
-- Ejecuta esto en el SQL Editor de Supabase para desbloquear lecturas y escrituras
-- ==============================================================================

-- 1. Otorgar permisos directos a los roles anon y authenticated de Supabase
GRANT ALL ON TABLE public.team_members TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.team_goals TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.team_tasks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.campaigns TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.contracts TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.knowledge_base TO anon, authenticated, service_role;

-- 2. Deshabilitar RLS temporalmente o configurarlo para permitir ALL sin bloqueos
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base DISABLE ROW LEVEL SECURITY;

-- 3. Limpiar e insertar los registros iniciales con IDs predecibles
TRUNCATE TABLE public.team_members CASCADE;
TRUNCATE TABLE public.team_goals CASCADE;

INSERT INTO public.team_members (id, name, role, email, phone, avatar_url)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Jafet Cantillo', 'CEO & FUNDADOR', 'neurolabstechsolutions@gmail.com', '+57 323 5845145', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jafet'),
('22222222-2222-2222-2222-222222222222', 'Director Comercial', 'DIRECTOR COMERCIAL', 'ventas@neurolabs.io', '+57 300 5765530', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Comercial'),
('33333333-3333-3333-3333-333333333333', 'Director de Marketing', 'DIRECTOR DE MARKETING', 'marketing@neurolabs.io', '+57 310 9876543', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marketing');

INSERT INTO public.team_goals (id, title, target_metric, current_progress, assigned_role, deadline)
VALUES 
('44444444-4444-4444-4444-444444444444', 'Cierre de Nuevos Contratos B2B de Software e IA', '$50,000,000 COP / Mes', 68, 'DIRECTOR COMERCIAL', '31 Ago 2026'),
('55555555-5555-5555-5555-555555555555', 'Leads Calificados Captados por Redes y Outbound', '200 Empresas Prospectadas', 82, 'DIRECTOR DE MARKETING', '28 Ago 2026'),
('66666666-6666-6666-6666-666666666666', 'Alianzas Estratégicas y Expansión SaaS', '5 Grandes Cuentas Cerradas', 40, 'CEO & FUNDADOR', '15 Sep 2026');
