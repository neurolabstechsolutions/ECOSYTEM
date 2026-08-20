-- ==============================================================================
-- 🚀 NEUROLABS TECH SOLUTIONS S.A.S. • ESQUEMA DE BASE DE DATOS SUPABASE
-- MÓDULO: EQUIPO DIRECTIVO, METAS MENSUALES Y TAREAS CON AGENTE IA
-- ==============================================================================

-- 1. TABLA: EQUIPO DIRECTIVO Y SOCIOS (TEAM MEMBERS)
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    avatar_url TEXT DEFAULT 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jafet',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA: METAS Y OBJETIVOS ESTRATÉGICOS DEL MES (TEAM GOALS)
CREATE TABLE IF NOT EXISTS public.team_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    target_metric TEXT NOT NULL,
    current_progress INTEGER DEFAULT 0 CHECK (current_progress >= 0 AND current_progress <= 100),
    assigned_role TEXT NOT NULL,
    deadline TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: TAREAS EJECUTIVAS Y RESPUESTAS DE WHATSAPP (TEAM TASKS)
CREATE TABLE IF NOT EXISTS public.team_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- ==============================================================================
-- ⚡ POLÍTICAS DE ACCESO (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_tasks ENABLE ROW LEVEL SECURITY;

-- Permitir lectura y escritura pública/anon para integración directa con Next.js y WhatsApp
CREATE POLICY "Allow public read team_members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update team_members" ON public.team_members FOR ALL USING (true);

CREATE POLICY "Allow public read team_goals" ON public.team_goals FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update team_goals" ON public.team_goals FOR ALL USING (true);

CREATE POLICY "Allow public read team_tasks" ON public.team_tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update team_tasks" ON public.team_tasks FOR ALL USING (true);

-- ==============================================================================
-- 📋 INSERTAR DATOS INICIALES REALES DE NEUROLABS
-- ==============================================================================

INSERT INTO public.team_members (name, role, email, phone, avatar_url)
VALUES 
('Jafet Cantillo', 'CEO & FUNDADOR', 'neurolabstechsolutions@gmail.com', '+57 323 5845145', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jafet'),
('Director Comercial', 'DIRECTOR COMERCIAL', 'ventas@neurolabs.io', '+57 300 5765530', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Comercial'),
('Director de Marketing', 'DIRECTOR DE MARKETING', 'marketing@neurolabs.io', '+57 310 9876543', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marketing')
ON CONFLICT DO NOTHING;

INSERT INTO public.team_goals (title, target_metric, current_progress, assigned_role, deadline)
VALUES 
('Cierre de Nuevos Contratos B2B de Software e IA', '$50,000,000 COP / Mes', 68, 'DIRECTOR COMERCIAL', '31 Ago 2026'),
('Leads Calificados Captados por Redes y Outbound', '200 Empresas Prospectadas', 82, 'DIRECTOR DE MARKETING', '28 Ago 2026'),
('Alianzas Estratégicas y Expansión SaaS', '5 Grandes Cuentas Cerradas', 40, 'CEO & FUNDADOR', '15 Sep 2026')
ON CONFLICT DO NOTHING;

INSERT INTO public.team_tasks (title, description, assigned_to, assigned_role, phone, priority, status, due_date, ai_assisted, ai_recommendation, partner_response)
VALUES 
('PROGRAMAR VIAJE CÁMARA DE COMERCIO', 'Inscripción nuevamente y validación de bases de datos B2B.', 'Jafet Cantillo', 'CEO & FUNDADOR', '+57 323 5845145', 'ALTA', 'EN_PROCESO', 'Hoy', true, 'El Agente IA espera la confirmación de fecha para agendar en calendario.', '¡Listo Jafet! Ya revisé la fecha del viaje, salimos el martes a primera hora.')
ON CONFLICT DO NOTHING;
