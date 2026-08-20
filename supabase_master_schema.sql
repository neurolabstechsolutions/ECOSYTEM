-- ==============================================================================
-- 🚀 NEUROLABS TECH SOLUTIONS S.A.S. • ESQUEMA MAESTRO COMPLETO DE BASE DE DATOS
-- PROYECTO: neurolabstech (Supabase)
-- ==============================================================================

-- 1. EXTENSIÓN PARA UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: TENANTS / ORGANIZACIÓN
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'NeuroLabs Tech Solutions S.A.S.',
    slug TEXT UNIQUE NOT NULL DEFAULT 'neurolabs',
    logo_url TEXT DEFAULT '/neurolabs-logo.jpg',
    plan TEXT DEFAULT 'ENTERPRISE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: USUARIOS Y ACCESOS DEL SISTEMA (USERS)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ADMIN',
    avatar_url TEXT DEFAULT 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jafet',
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA: EQUIPO DIRECTIVO Y SOCIOS (TEAM MEMBERS)
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    avatar_url TEXT DEFAULT 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jafet',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA: METAS Y OBJETIVOS ESTRATÉGICOS DEL MES (TEAM GOALS)
CREATE TABLE IF NOT EXISTS public.team_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_metric TEXT NOT NULL,
    current_progress INTEGER DEFAULT 0 CHECK (current_progress >= 0 AND current_progress <= 100),
    assigned_role TEXT NOT NULL,
    deadline TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLA: TAREAS EJECUTIVAS Y RESPUESTAS DE WHATSAPP (TEAM TASKS)
CREATE TABLE IF NOT EXISTS public.team_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    assigned_to TEXT NOT NULL,
    assigned_role TEXT NOT NULL,
    phone TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('ALTA', 'MEDIA', 'ESTRATÉGICA')) DEFAULT 'ALTA',
    status TEXT CHECK (status IN ('PENDIENTE', 'EN_PROCESO', 'COMPLETADA')) DEFAULT 'PENDIENTE',
    due_date TEXT NOT NULL,
    ai_assisted BOOLEAN DEFAULT true,
    ai_recommendation TEXT DEFAULT '',
    partner_response TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABLA: CAMPAÑAS DE OUTBOUND & MARKETING (CAMPAIGNS)
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    channel TEXT CHECK (channel IN ('WHATSAPP', 'VOICE_AI', 'EMAIL', 'OMNICHANNEL')) DEFAULT 'WHATSAPP',
    status TEXT CHECK (status IN ('BORRADOR', 'ACTIVA', 'PAUSADA', 'COMPLETADA')) DEFAULT 'ACTIVA',
    target_audience TEXT NOT NULL,
    total_leads INTEGER DEFAULT 0,
    contacted_count INTEGER DEFAULT 0,
    replied_count INTEGER DEFAULT 0,
    converted_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABLA: CONTRATOS Y PROPUESTAS TÉCNICAS B2B (CONTRACTS)
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    service_type TEXT NOT NULL, -- 'Desarrollo de Software a Medida', 'Agentes IA 24/7'
    amount_cop NUMERIC(15, 2) NOT NULL,
    status TEXT CHECK (status IN ('BORRADOR', 'ENVIADO', 'FIRMADO', 'PAGADO')) DEFAULT 'ENVIADO',
    pdf_url TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABLA: BASE DE CONOCIMIENTO DE LA IA (KNOWLEDGE BASE)
CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'SERVICIOS_NEUROLABS',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ⚡ POLÍTICAS DE ACCESO (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all tenants" ON public.tenants FOR ALL USING (true);
CREATE POLICY "Allow public all users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow public all team_members" ON public.team_members FOR ALL USING (true);
CREATE POLICY "Allow public all team_goals" ON public.team_goals FOR ALL USING (true);
CREATE POLICY "Allow public all team_tasks" ON public.team_tasks FOR ALL USING (true);
CREATE POLICY "Allow public all campaigns" ON public.campaigns FOR ALL USING (true);
CREATE POLICY "Allow public all contracts" ON public.contracts FOR ALL USING (true);
CREATE POLICY "Allow public all knowledge_base" ON public.knowledge_base FOR ALL USING (true);

-- ==============================================================================
-- 📋 INSERTAR DATOS INICIALES REALES DE NEUROLABS
-- ==============================================================================

-- 1. Tenant
INSERT INTO public.tenants (name, slug, logo_url, plan)
VALUES ('NeuroLabs Tech Solutions S.A.S.', 'neurolabs', '/neurolabs-logo.jpg', 'ENTERPRISE')
ON CONFLICT (slug) DO NOTHING;

-- 2. Team Members
INSERT INTO public.team_members (name, role, email, phone, avatar_url)
VALUES 
('Jafet Cantillo', 'CEO & FUNDADOR', 'neurolabstechsolutions@gmail.com', '+57 323 5845145', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jafet'),
('Director Comercial', 'DIRECTOR COMERCIAL', 'ventas@neurolabs.io', '+57 300 5765530', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Comercial'),
('Director de Marketing', 'DIRECTOR DE MARKETING', 'marketing@neurolabs.io', '+57 310 9876543', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marketing')
ON CONFLICT DO NOTHING;

-- 3. Team Goals
INSERT INTO public.team_goals (title, target_metric, current_progress, assigned_role, deadline)
VALUES 
('Cierre de Nuevos Contratos B2B de Software e IA', '$50,000,000 COP / Mes', 68, 'DIRECTOR COMERCIAL', '31 Ago 2026'),
('Leads Calificados Captados por Redes y Outbound', '200 Empresas Prospectadas', 82, 'DIRECTOR DE MARKETING', '28 Ago 2026'),
('Alianzas Estratégicas y Expansión SaaS', '5 Grandes Cuentas Cerradas', 40, 'CEO & FUNDADOR', '15 Sep 2026')
ON CONFLICT DO NOTHING;
