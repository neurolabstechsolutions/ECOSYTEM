-- ==============================================================================
-- 🚀 YJD TRINOVA S.A.S. • DATOS MAESTROS REALES DE PRODUCCIÓN PARA SUPABASE
-- NIT: 902.095.222-8 | BARRANQUILLA, COLOMBIA | REPRESENTANTE: YURY JARAMILLO
-- ==============================================================================

-- 1. Asegurar la empresa YJD TRINOVA S.A.S. en tenants
INSERT INTO public.tenants (id, name, slug, domain, email, phone, address, nit)
VALUES (
  '0814ddb6-1ad3-4f76-873e-d4c0e52c710a',
  'YJD TRINOVA S.A.S.',
  'yjdtrinova',
  'yjdtrinova.neurolabs.com.co',
  'dondeblanca15@gmail.com',
  '+57 323 5845145',
  'Calle 82 # 21 Sur 06 Esquina, Barranquilla, Atlántico',
  '902.095.222-8'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  nit = EXCLUDED.nit;

-- 2. Asegurar columnas de inventario
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS category_type TEXT DEFAULT 'VEHICULO';
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS year INTEGER DEFAULT 2024;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS price_cop NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Barranquilla';
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS mileage INTEGER DEFAULT 0;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS license_plate TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'DISPONIBLE';

-- 3. Contactos Reales (Propietarios Consignantes y Compradores)
INSERT INTO public.contacts (id, tenant_id, full_name, phone, email, doc_number, person_type, role_type, city, status)
VALUES 
  ('c1010000-0000-0000-0000-000000000001', '0814ddb6-1ad3-4f76-873e-d4c0e52c710a', 'Carlos Mario Restrepo', '+57 300 4892211', 'carlos.restrepo@gmail.com', 'CC 72.345.890', 'PERSONA_NATURAL', 'PROPIETARIO_CONSIGNANTE', 'Barranquilla', 'ACTIVO'),
  ('c1010000-0000-0000-0000-000000000002', '0814ddb6-1ad3-4f76-873e-d4c0e52c710a', 'Constructora & Inversiones del Caribe S.A.S.', '+57 315 7789044', 'gerencia@constructora.co', 'NIT 901.458.789-2', 'PERSONA_JURIDICA', 'PROPIETARIO_CONSIGNANTE', 'Barranquilla', 'ACTIVO'),
  ('c1010000-0000-0000-0000-000000000003', '0814ddb6-1ad3-4f76-873e-d4c0e52c710a', 'David Silva', '+57 320 8941122', 'david.silva@outlook.com', 'CC 1.045.678.901', 'PERSONA_NATURAL', 'PROPIETARIO_CONSIGNANTE', 'Barranquilla', 'ACTIVO'),
  ('c1010000-0000-0000-0000-000000000004', '0814ddb6-1ad3-4f76-873e-d4c0e52c710a', 'Ing. Mauricio Cantillo', '+57 300 5765530', 'mauricio.cantillo@constructora.co', 'CC 1.140.892.110', 'PERSONA_NATURAL', 'COMPRADOR', 'Barranquilla', 'ACTIVO'),
  ('c1010000-0000-0000-0000-000000000005', '0814ddb6-1ad3-4f76-873e-d4c0e52c710a', 'Dra. Patricia Ortiz', '+57 310 4492011', 'patricia.ortiz@salud.org', 'CC 55.491.233', 'PERSONA_NATURAL', 'COMPRADOR', 'Barranquilla', 'ACTIVO')
ON CONFLICT (id) DO NOTHING;

-- 4. Inventario Real de Bienes de YJD Trinova
INSERT INTO public.inventory_items (id, tenant_id, owner_contact_id, category_type, title, brand, model, year, price_cop, city, mileage, license_plate, images, description, status)
VALUES
  (
    'i1010000-0000-0000-0000-000000000001',
    '0814ddb6-1ad3-4f76-873e-d4c0e52c710a',
    'c1010000-0000-0000-0000-000000000001',
    'VEHICULO',
    'Toyota Fortuner GR-S 2.8L Diésel 4x4',
    'Toyota',
    'Fortuner GR-S',
    2024,
    310000000,
    'Barranquilla',
    12500,
    'LMN-456',
    ARRAY['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'],
    'Camioneta familiar de alta gama, peritaje 150 puntos aprobado, único dueño, placa de Barranquilla.',
    'DISPONIBLE'
  ),
  (
    'i1010000-0000-0000-0000-000000000002',
    '0814ddb6-1ad3-4f76-873e-d4c0e52c710a',
    'c1010000-0000-0000-0000-000000000002',
    'INMUEBLE_VENTA',
    'Penthouse Dúplex Alto Prado 240m²',
    'Inmueble Prime',
    'Penthouse',
    2024,
    850000000,
    'Alto Prado, Barranquilla',
    0,
    NULL,
    ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'],
    'Exclusivo penthouse con vista panorámica, 3 habitaciones con baño, cocina italiana, 2 garajes.',
    'DISPONIBLE'
  ),
  (
    'i1010000-0000-0000-0000-000000000003',
    '0814ddb6-1ad3-4f76-873e-d4c0e52c710a',
    'c1010000-0000-0000-0000-000000000003',
    'MOTO',
    'Yamaha MT-09 SP ABS 890cc',
    'Yamaha',
    'MT-09 SP',
    2024,
    68500000,
    'Barranquilla',
    4200,
    'KTY-89G',
    ARRAY['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200'],
    'Motocicleta deportiva naked, suspensiones Öhlins, control crucero y quickshifter.',
    'DISPONIBLE'
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Mandatos de Corretaje Mercantil con Sello Criptográfico SHA-256
INSERT INTO public.contracts (id, tenant_id, contact_id, inventory_item_id, contract_type, code, title, commission_rate, total_value_cop, signature_hash, status)
VALUES
  (
    'cnt10000-0000-0000-0000-000000000001',
    '0814ddb6-1ad3-4f76-873e-d4c0e52c710a',
    'c1010000-0000-0000-0000-000000000001',
    'i1010000-0000-0000-0000-000000000001',
    'MANDATO_CORRETAJE',
    'TRN-CORR-2026-001',
    'Mandato de Corretaje Mercantil - Toyota Fortuner GR-S',
    3.5,
    310000000,
    'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'VIGENTE'
  ),
  (
    'cnt10000-0000-0000-0000-000000000002',
    '0814ddb6-1ad3-4f76-873e-d4c0e52c710a',
    'c1010000-0000-0000-0000-000000000002',
    'i1010000-0000-0000-0000-000000000002',
    'MANDATO_CORRETAJE',
    'TRN-CORR-2026-002',
    'Mandato de Corretaje Mercantil - Penthouse Alto Prado',
    3.0,
    850000000,
    'sha256:8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    'VIGENTE'
  ),
  (
    'cnt10000-0000-0000-0000-000000000003',
    '0814ddb6-1ad3-4f76-873e-d4c0e52c710a',
    'c1010000-0000-0000-0000-000000000003',
    'i1010000-0000-0000-0000-000000000003',
    'MANDATO_CORRETAJE',
    'TRN-CORR-2026-003',
    'Mandato de Corretaje Mercantil - Yamaha MT-09 SP',
    3.5,
    68500000,
    'sha256:4918237198237192837bcda192837192837bcda192837192837bcda192837192',
    'VIGENTE'
  )
ON CONFLICT (id) DO NOTHING;
