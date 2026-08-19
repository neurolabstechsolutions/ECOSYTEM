-- Fase 3: CRM Schema
-- Tablas para Contactos, Leads, Notas, Tareas y Citas con Multi-tenant RLS

-- 1. ENUMERADORES
CREATE TYPE lead_status AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'APPOINTMENT', 'NEGOTIATION', 'WON', 'LOST');
CREATE TYPE contact_status AS ENUM ('ACTIVO', 'INACTIVO', 'BLOQUEADO');
CREATE TYPE task_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE appointment_status AS ENUM ('SCHEDULED', 'COMPLETED', 'NO_SHOW', 'CANCELLED');

-- 2. TABLA CONTACTOS
CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    source TEXT,
    tags TEXT[] DEFAULT '{}',
    status contact_status DEFAULT 'ACTIVO',
    last_interaction_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA LEADS (Oportunidades Comerciales asociadas a un Contacto)
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    status lead_status DEFAULT 'NEW',
    score INTEGER DEFAULT 0,
    source TEXT,
    product_interest TEXT,
    budget NUMERIC(15, 2),
    purchase_intent TEXT,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    follow_up_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA NOTAS (Para llevar historial manual y del agente IA)
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA TAREAS (Recordatorios)
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status task_status DEFAULT 'PENDING',
    due_date TIMESTAMPTZ,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    related_lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA CITAS (Agenda)
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status appointment_status DEFAULT 'SCHEDULED',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HABILITAR RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE SEGURIDAD (Aislamiento Total por Tenant_ID)

-- CONTACTS
CREATE POLICY "Tenants can view their own contacts" ON public.contacts
    FOR SELECT USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin());
CREATE POLICY "Tenants can insert their own contacts" ON public.contacts
    FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id() OR public.is_super_admin());
CREATE POLICY "Tenants can update their own contacts" ON public.contacts
    FOR UPDATE USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin());
CREATE POLICY "Tenants can delete their own contacts" ON public.contacts
    FOR DELETE USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin());

-- LEADS
CREATE POLICY "Tenants can view their own leads" ON public.leads
    FOR SELECT USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin());
CREATE POLICY "Tenants can insert their own leads" ON public.leads
    FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id() OR public.is_super_admin());
CREATE POLICY "Tenants can update their own leads" ON public.leads
    FOR UPDATE USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin());
CREATE POLICY "Tenants can delete their own leads" ON public.leads
    FOR DELETE USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin());

-- NOTES
CREATE POLICY "Tenants can view their own notes" ON public.notes
    FOR SELECT USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin());
CREATE POLICY "Tenants can manage their own notes" ON public.notes
    FOR ALL USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin());

-- TASKS & APPOINTMENTS
CREATE POLICY "Tenants can manage their own tasks" ON public.tasks
    FOR ALL USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin());
CREATE POLICY "Tenants can manage their own appointments" ON public.appointments
    FOR ALL USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin());
