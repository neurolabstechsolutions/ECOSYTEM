-- Fase 4: Inventory Schema
-- CRUD de catálogo de productos (vehículos) con Multi-tenant RLS

CREATE TYPE product_status AS ENUM ('AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED');

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    category TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    status product_status DEFAULT 'AVAILABLE',
    metadata JSONB DEFAULT '{}'::jsonb,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, sku)
);

-- HABILITAR RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE SEGURIDAD (Aislamiento Total por Tenant_ID)

CREATE POLICY "Tenants can view their own products" ON public.products
    FOR SELECT USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin());

CREATE POLICY "Tenants can insert their own products" ON public.products
    FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id() OR public.is_super_admin());

CREATE POLICY "Tenants can update their own products" ON public.products
    FOR UPDATE USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin());

CREATE POLICY "Tenants can delete their own products" ON public.products
    FOR DELETE USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin());
