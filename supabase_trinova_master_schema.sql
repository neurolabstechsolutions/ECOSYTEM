-- ==============================================================================
-- 🚀 YJD TRINOVA S.A.S. • ESQUEMA MAESTRO DE BASE DE DATOS SUPABASE (PRODUCCIÓN)
-- PROYECTO: neurolabstechTrinova (fqxqcqdsqdampuzciomx)
-- COMPATIBILIDAD: Persona Natural (Mayoría) + Persona Jurídica
-- MÓDULOS: Vehículos, Motos, Bienes Raíces (Venta & Renta), Contratos, CRM & Leads
-- ==============================================================================

-- 1. EXTENSIONES CRIPTOGRÁFICAS Y DE IDENTIFICADORES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLA: TENANTS (ORGANIZACIONES / EMPRESA TRINOVA)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'YJD TRINOVA S.A.S.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Asegurar columnas si la tabla ya existía previamente
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS legal_name TEXT DEFAULT 'YJD TRINOVA S.A.S.';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS nit TEXT DEFAULT '902.095.222-8';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS slug TEXT DEFAULT 'yjdtrinova';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '+57 (605) 322-5918';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS whatsapp TEXT DEFAULT '573005765530';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS email TEXT DEFAULT 'dondeblanca15@gmail.com';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS address TEXT DEFAULT 'Calle 82 # 21 Sur 06 Esquina';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Barranquilla, Atlántico';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '/logo.png';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'ENTERPRISE';

-- Crear índice único en slug si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tenants_slug_key') THEN
        ALTER TABLE public.tenants ADD CONSTRAINT tenants_slug_key UNIQUE (slug);
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- 3. TABLA: CONTACTS (PROPIETARIOS PARTICULARES PERSONA NATURAL & EMPRESAS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Asegurar columnas para Persona Natural y Jurídica
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS person_type TEXT DEFAULT 'PERSONA_NATURAL';
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS trade_name TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS doc_type TEXT DEFAULT 'CC';
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS doc_number TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Barranquilla';
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS bank_account_type TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS role_type TEXT DEFAULT 'PROPIETARIO_CONSIGNANTE';
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY['PERSONA_NATURAL'];
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVO';

-- ==============================================================================
-- 4. TABLA: INVENTORY_ITEMS (CARROS, MOTOS, INMUEBLES EN VENTA & RENTA)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Asegurar todas las columnas técnicas y comerciales
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS owner_contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS category_type TEXT DEFAULT 'VEHICULO';
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS sub_category TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS price_cop NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS monthly_rent_cop NUMERIC(15, 2);

-- Especificaciones Carros / Motos
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS mileage INTEGER DEFAULT 0;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS fuel_type TEXT DEFAULT 'Gasolina';
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS transmission TEXT DEFAULT 'Automática';
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS engine_displacement TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS license_plate TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS vin TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS exterior_color TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS interior_color TEXT;

-- Especificaciones Inmuebles
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS area_m2 NUMERIC(10, 2);
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS bedrooms INTEGER;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS bathrooms INTEGER;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS parking_spots INTEGER;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS stratum INTEGER;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS neighborhood TEXT;

-- Galería & Estado
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'Seminuevo Certificado';
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'DISPONIBLE';
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT true;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS inspection_score INTEGER DEFAULT 98;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- ==============================================================================
-- 5. TABLA: PRODUCTS (COMPATIBILIDAD CON TIENDA Y PASARELAS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT,
    category TEXT DEFAULT 'GENERAL',
    price NUMERIC(15, 2) DEFAULT 0,
    stock INTEGER DEFAULT 1,
    status TEXT DEFAULT 'AVAILABLE',
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 6. TABLA: CONTRACTS (CONTRATOS DE CORRETAJE & MANDATOS NOTARIALES DIGITALES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    contract_code TEXT NOT NULL,
    client_name TEXT NOT NULL,
    verification_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Asegurar columnas de contrato digital
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'CORRETAJE_VEHICULO';
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS person_type TEXT DEFAULT 'PERSONA_NATURAL';
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS client_doc_type TEXT DEFAULT 'CC';
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS client_doc_number TEXT;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS client_phone TEXT;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS client_city TEXT DEFAULT 'Barranquilla';
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS items_assigned JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS total_valuation_cop NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS commission_type TEXT DEFAULT 'PERCENTAGE';
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS commission_value NUMERIC(10, 2) DEFAULT 3.5;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS signed_timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS signer_ip TEXT;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS signature_type TEXT DEFAULT 'DRAW';
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS signature_data_url TEXT;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'FIRMADO';

-- ==============================================================================
-- 7. TABLA: LEADS (PIPELINE DE VENTAS Y PROSPECTOS INTERESADOS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS interest_category TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS interest_item_title TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS budget_cop NUMERIC(15, 2);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 85;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS intent_level TEXT DEFAULT 'ALTA';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'NUEVO';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes TEXT;

-- ==============================================================================
-- 8. TABLA: APPOINTMENTS (CITAS, VISITAS Y TEST DRIVES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS appointment_type TEXT DEFAULT 'TEST_DRIVE';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Vitrina Principal YJD TRINOVA - Barranquilla';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PROGRAMADA';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS notes TEXT;

-- ==============================================================================
-- 9. TABLA: KNOWLEDGE_BASE (BASE DE CONOCIMIENTO PARA EL AGENTE DE IA)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'POLITICAS_CORRETAJE_YJD_TRINOVA';
ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ==============================================================================
-- ⚡ ROW LEVEL SECURITY (RLS) & POLÍTICAS DE ACCESO PÚBLICO
-- ==============================================================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on tenants" ON public.tenants;
DROP POLICY IF EXISTS "Allow all on contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow all on inventory_items" ON public.inventory_items;
DROP POLICY IF EXISTS "Allow all on products" ON public.products;
DROP POLICY IF EXISTS "Allow all on contracts" ON public.contracts;
DROP POLICY IF EXISTS "Allow all on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow all on appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow all on knowledge_base" ON public.knowledge_base;

CREATE POLICY "Allow all on tenants" ON public.tenants FOR ALL USING (true);
CREATE POLICY "Allow all on contacts" ON public.contacts FOR ALL USING (true);
CREATE POLICY "Allow all on inventory_items" ON public.inventory_items FOR ALL USING (true);
CREATE POLICY "Allow all on products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow all on contracts" ON public.contracts FOR ALL USING (true);
CREATE POLICY "Allow all on leads" ON public.leads FOR ALL USING (true);
CREATE POLICY "Allow all on appointments" ON public.appointments FOR ALL USING (true);
CREATE POLICY "Allow all on knowledge_base" ON public.knowledge_base FOR ALL USING (true);

-- ==============================================================================
-- 📋 REGISTRO OFICIAL DE LA EMPRESA YJD TRINOVA S.A.S.
-- ==============================================================================
DELETE FROM public.tenants WHERE slug = 'yjdtrinova' OR name ILIKE '%Trinova%';

INSERT INTO public.tenants (name, legal_name, nit, slug, phone, whatsapp, email, address, city, plan)
VALUES (
    'YJD Trinova S.A.S.',
    'YJD TRINOVA S.A.S.',
    '902.095.222-8',
    'yjdtrinova',
    '+57 (605) 322-5918',
    '573005765530',
    'dondeblanca15@gmail.com',
    'Calle 82 # 21 Sur 06 Esquina',
    'Barranquilla, Atlántico',
    'ENTERPRISE'
);

-- Conocimiento base para el Agente IA de YJD Trinova
DELETE FROM public.knowledge_base WHERE category = 'POLITICAS_CORRETAJE_YJD_TRINOVA';

INSERT INTO public.knowledge_base (title, content, category)
VALUES (
    'Políticas Oficiales de Corretaje y Consignación YJD TRINOVA S.A.S.',
    'YJD TRINOVA S.A.S. (NIT 902.095.222-8, Barranquilla) ofrece intermediación mercantil para personas naturales y jurídicas en vehículos (carros y camionetas), motos de alto cilindraje y urbanas, e inmuebles tanto en venta como en arriendo/renta. Los contratos se firman digitalmente con validez notarial y sellado de tiempo criptográfico.',
    'POLITICAS_CORRETAJE_YJD_TRINOVA'
);

