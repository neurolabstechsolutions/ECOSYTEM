-- Fase 13: WhatsApp Multi-Tenant & Marketplace Inventory

-- 1. Añadir credenciales de Meta API a la tabla de Clientes (Tenants)
ALTER TABLE public.tenants 
ADD COLUMN whatsapp_phone_id TEXT UNIQUE,
ADD COLUMN whatsapp_access_token TEXT,
ADD COLUMN system_prompt TEXT DEFAULT 'Eres un asistente experto en ventas de vehículos.';

-- 2. Crear tabla específica para el Marketplace de Autos
CREATE TABLE public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,
    trim TEXT,
    body_type TEXT,
    mileage INTEGER,
    transmission TEXT,
    fuel_type TEXT,
    exterior_color TEXT,
    interior_color TEXT,
    vin TEXT,
    license_plate TEXT,
    condition TEXT,
    engine TEXT,
    price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    brokerage_fee_type TEXT,
    brokerage_fee_value NUMERIC(15, 2),
    availability TEXT,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'DISPONIBLE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad
-- Públicamente visibles si están DISPONIBLES (Para el Marketplace B2C)
CREATE POLICY "Inventory is publicly viewable" ON public.inventory_items
    FOR SELECT USING (status = 'DISPONIBLE');

-- Inserciones desde el backend (Service Role) o por Tenant Admins
CREATE POLICY "Tenants can insert inventory" ON public.inventory_items
    FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id() OR public.is_super_admin());

CREATE POLICY "Tenants can update inventory" ON public.inventory_items
    FOR UPDATE USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin());

CREATE POLICY "Tenants can delete inventory" ON public.inventory_items
    FOR DELETE USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin());
