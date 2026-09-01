-- ==============================================================================
-- 🚀 YJD TRINOVA S.A.S. • ESQUEMA MAESTRO DE BASE DE DATOS SUPABASE (PRODUCCIÓN)
-- PROYECTO: neurolabstechTrinova (fqxqcqdsqdampuzciomx)
-- COMPATIBILIDAD: Persona Natural (Mayoría) + Persona Jurídica
-- MÓDULOS: Vehículos, Motos, Bienes Raíces (Venta & Renta), Contratos, CRM & Leads
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA: TENANTS (ORGANIZACIONES / EMPRESAS MATRICULADAS)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'YJD TRINOVA S.A.S.',
    legal_name TEXT DEFAULT 'YJD TRINOVA S.A.S.',
    nit TEXT DEFAULT '902.095.222-8',
    slug TEXT UNIQUE NOT NULL DEFAULT 'yjdtrinova',
    phone TEXT DEFAULT '+57 (605) 322-5918',
    whatsapp TEXT DEFAULT '573005765530',
    email TEXT DEFAULT 'dondeblanca15@gmail.com',
    address TEXT DEFAULT 'Calle 82 # 21 Sur 06 Esquina',
    city TEXT DEFAULT 'Barranquilla, Atlántico',
    logo_url TEXT DEFAULT '/logo.png',
    plan TEXT DEFAULT 'ENTERPRISE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: CONTACTS / PROVEEDORES & CLIENTES (PERSONAS NATURALES Y JURÍDICAS)
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    person_type TEXT CHECK (person_type IN ('PERSONA_NATURAL', 'PERSONA_JURIDICA')) DEFAULT 'PERSONA_NATURAL',
    full_name TEXT NOT NULL,
    trade_name TEXT,
    doc_type TEXT DEFAULT 'CC', -- CC, CE, PASAPORTE, NIT, PEP
    doc_number TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT DEFAULT 'Barranquilla',
    address TEXT,
    bank_name TEXT,
    bank_account_type TEXT,
    bank_account_number TEXT,
    role_type TEXT CHECK (role_type IN ('PROPIETARIO_CONSIGNANTE', 'COMPRADOR', 'ARRENDADOR', 'ARRENDATARIO', 'ALIADO')) DEFAULT 'PROPIETARIO_CONSIGNANTE',
    tags TEXT[] DEFAULT ARRAY['PERSONA_NATURAL'],
    status TEXT DEFAULT 'ACTIVO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA: INVENTORY ITEMS / CATÁLOGO CENTRAL (VEHÍCULOS, MOTOS, CASAS, RENTAS)
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    owner_contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    
    -- Clasificación del bien
    category_type TEXT CHECK (category_type IN ('VEHICULO', 'MOTO', 'INMUEBLE_VENTA', 'INMUEBLE_RENTA')) NOT NULL DEFAULT 'VEHICULO',
    sub_category TEXT, -- SUV, Sedán, Moto Deportiva, Apartamento, Casa Campestre, Penthouse, Local
    
    -- Datos del Ítem
    title TEXT NOT NULL,
    brand TEXT, -- Toyota, Yamaha, Mazda, Honda
    model TEXT, -- MT-09, Fortuner, CX-30, Casa Campestre
    year INTEGER,
    price_cop NUMERIC(15, 2) NOT NULL,
    monthly_rent_cop NUMERIC(15, 2), -- Si es renta
    
    -- Especificaciones de Vehículos / Motos
    mileage INTEGER DEFAULT 0,
    fuel_type TEXT DEFAULT 'Gasolina', -- Gasolina, Diésel, Híbrido, Eléctrico
    transmission TEXT DEFAULT 'Automática', -- Automática, Manual, Secuencial
    engine_displacement TEXT, -- 2.0L Turbo, 890cc, etc.
    license_plate TEXT,
    vin TEXT,
    exterior_color TEXT,
    interior_color TEXT,
    
    -- Especificaciones de Inmuebles
    area_m2 NUMERIC(10, 2),
    bedrooms INTEGER,
    bathrooms INTEGER,
    parking_spots INTEGER,
    stratum INTEGER,
    neighborhood TEXT,
    
    -- Multimedia & Detalles
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    description TEXT,
    
    -- Estado de Comercialización
    condition TEXT DEFAULT 'Seminuevo Certificado',
    status TEXT CHECK (status IN ('DISPONIBLE', 'RESERVADO', 'CONSIGNADO', 'VENDIDO', 'ARRENDADO')) DEFAULT 'DISPONIBLE',
    is_featured BOOLEAN DEFAULT true,
    inspection_score INTEGER DEFAULT 98,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA: PRODUCTS (COMPATIBILIDAD CON TIENDA Y PASARELAS)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    category TEXT NOT NULL,
    price NUMERIC(15, 2) NOT NULL,
    stock INTEGER DEFAULT 1,
    status TEXT DEFAULT 'AVAILABLE',
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLA: CONTRACTS (CONTRATOS DE CORRETAJE & MANDATOS NOTARIALES DIGITALES)
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    
    contract_code TEXT NOT NULL,
    contract_type TEXT CHECK (contract_type IN ('CORRETAJE_VEHICULO', 'CORRETAJE_MOTO', 'CORRETAJE_INMOBILIARIO_VENTA', 'CORRETAJE_INMOBILIARIO_RENTA')) DEFAULT 'CORRETAJE_VEHICULO',
    person_type TEXT CHECK (person_type IN ('PERSONA_NATURAL', 'PERSONA_JURIDICA')) DEFAULT 'PERSONA_NATURAL',
    
    -- Datos del Otorgante / Propietario
    client_name TEXT NOT NULL,
    client_doc_type TEXT NOT NULL,
    client_doc_number TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_city TEXT DEFAULT 'Barranquilla',
    
    -- Datos del Mandato y Bienes
    items_assigned JSONB NOT NULL DEFAULT '[]'::JSONB,
    total_valuation_cop NUMERIC(15, 2) NOT NULL,
    commission_type TEXT DEFAULT 'PERCENTAGE', -- PERCENTAGE o FIXED
    commission_value NUMERIC(10, 2) DEFAULT 3.5,
    
    -- Validez y Firma Digital
    verification_hash TEXT NOT NULL,
    signed_timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    signer_ip TEXT,
    signature_type TEXT DEFAULT 'DRAW',
    signature_data_url TEXT,
    pdf_url TEXT,
    
    status TEXT CHECK (status IN ('BORRADOR', 'FIRMADO', 'RADICADO', 'LIQUIDADO')) DEFAULT 'FIRMADO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABLA: LEADS / PIPELINE DE VENTAS (PROSPECTOS INTERESADOS)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
    
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    interest_category TEXT, -- VEHICULO, MOTO, INMUEBLE_VENTA, INMUEBLE_RENTA
    interest_item_title TEXT,
    budget_cop NUMERIC(15, 2),
    lead_score INTEGER DEFAULT 85,
    intent_level TEXT DEFAULT 'ALTA',
    status TEXT CHECK (status IN ('NUEVO', 'CONTACTADO', 'CALIFICADO', 'VISITA_PROGRAMADA', 'NEGOCIACION', 'CERRADO_GANADO', 'PERDIDO')) DEFAULT 'NUEVO',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABLA: APPOINTMENTS / CITAS Y TEST DRIVES
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
    
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    appointment_type TEXT CHECK (appointment_type IN ('TEST_DRIVE', 'VISITA_INMUEBLE', 'INSPECCION_PERICIAL', 'FIRMA_NOTARIAL')) DEFAULT 'TEST_DRIVE',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT DEFAULT 'Vitrina Principal YJD TRINOVA - Barranquilla',
    status TEXT CHECK (status IN ('PROGRAMADA', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA')) DEFAULT 'PROGRAMADA',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABLA: KNOWLEDGE BASE (BASE DE CONOCIMIENTO PARA EL AGENTE DE IA)
CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'POLITICAS_CORRETAJE_YJD_TRINOVA',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ⚡ POLÍTICAS DE ACCESO PÚBLICO & RLS (ROW LEVEL SECURITY)
-- ==============================================================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on tenants" ON public.tenants FOR ALL USING (true);
CREATE POLICY "Allow all on contacts" ON public.contacts FOR ALL USING (true);
CREATE POLICY "Allow all on inventory_items" ON public.inventory_items FOR ALL USING (true);
CREATE POLICY "Allow all on products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow all on contracts" ON public.contracts FOR ALL USING (true);
CREATE POLICY "Allow all on leads" ON public.leads FOR ALL USING (true);
CREATE POLICY "Allow all on appointments" ON public.appointments FOR ALL USING (true);
CREATE POLICY "Allow all on knowledge_base" ON public.knowledge_base FOR ALL USING (true);

-- ==============================================================================
-- 📋 INSERTAR REGISTRO BASE DE YJD TRINOVA S.A.S.
-- ==============================================================================

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
)
ON CONFLICT (slug) DO UPDATE SET
    legal_name = EXCLUDED.legal_name,
    nit = EXCLUDED.nit,
    phone = EXCLUDED.phone,
    whatsapp = EXCLUDED.whatsapp,
    email = EXCLUDED.email,
    address = EXCLUDED.address,
    city = EXCLUDED.city;

-- Conocimiento base para el Agente IA de YJD Trinova
INSERT INTO public.knowledge_base (title, content, category)
VALUES (
    'Políticas Oficiales de Corretaje y Consignación YJD TRINOVA S.A.S.',
    'YJD TRINOVA S.A.S. (NIT 902.095.222-8, Barranquilla) ofrece intermediación mercantil para personas naturales y jurídicas en vehículos (carros y camionetas), motos de alto cilindraje y urbanas, e inmuebles tanto en venta como en arriendo/renta. Los contratos se firman digitalmente con validez notarial y sellado de tiempo criptográfico.',
    'POLITICAS_CORRETAJE_YJD_TRINOVA'
)
ON CONFLICT DO NOTHING;
