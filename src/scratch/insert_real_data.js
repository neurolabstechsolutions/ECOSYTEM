const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
const supabase = createClient(supabaseUrl, supabaseKey);

async function populateRealData() {
  console.log('--- 1. Testing Contact Insert ---');
  const contactId = 'c1010000-0000-0000-0000-000000000003';
  const { data: contact, error: errContact } = await supabase.from('contacts').upsert({
    id: contactId,
    tenant_id: '0814ddb6-1ad3-4f76-873e-d4c0e52c710a',
    full_name: 'David Silva Mendoza',
    phone: '+57 320 8941122',
    email: 'david.silva@outlook.com',
    doc_number: 'CC 1.045.678.901',
    person_type: 'PERSONA_NATURAL',
    role_type: 'PROPIETARIO_CONSIGNANTE',
    city: 'Barranquilla',
    status: 'ACTIVO'
  }).select();
  console.log('Contact result:', contact, errContact);

  console.log('--- 2. Testing Inventory Item Insert ---');
  const itemId = 'i1010000-0000-0000-0000-000000000003';
  const { data: item, error: errItem } = await supabase.from('inventory_items').upsert({
    id: itemId,
    tenant_id: '0814ddb6-1ad3-4f76-873e-d4c0e52c710a',
    owner_contact_id: contactId,
    category_type: 'MOTO',
    title: 'Yamaha MT-09 SP ABS 890cc',
    brand: 'Yamaha',
    model: 'MT-09 SP',
    year: 2024,
    price_cop: 68500000,
    city: 'Barranquilla',
    mileage: 4200,
    license_plate: 'KTY-89G',
    images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200'],
    description: 'Motocicleta deportiva naked, suspensiones Öhlins, control crucero y quickshifter. Peritaje 150 puntos aprobado.',
    status: 'DISPONIBLE'
  }).select();
  console.log('Inventory Item result:', item, errItem);

  console.log('--- 3. Testing Toyota Fortuner Insert ---');
  const toyotaId = 'i1010000-0000-0000-0000-000000000001';
  const { data: toyota, error: errToyota } = await supabase.from('inventory_items').upsert({
    id: toyotaId,
    tenant_id: '0814ddb6-1ad3-4f76-873e-d4c0e52c710a',
    owner_contact_id: contactId,
    category_type: 'VEHICULO',
    title: 'Toyota Fortuner GR-S 2.8L Diésel 4x4',
    brand: 'Toyota',
    model: 'Fortuner GR-S',
    year: 2024,
    price_cop: 310000000,
    city: 'Barranquilla',
    mileage: 12500,
    license_plate: 'LMN-456',
    images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'],
    description: 'Camioneta familiar de alta gama, peritaje 150 puntos aprobado, único dueño, placa de Barranquilla.',
    status: 'DISPONIBLE'
  }).select();
  console.log('Toyota result:', toyota, errToyota);

  console.log('--- 4. Testing Contract Insert ---');
  const contractId = 'cnt10000-0000-0000-0000-000000000003';
  const { data: contract, error: errContract } = await supabase.from('contracts').upsert({
    id: contractId,
    tenant_id: '0814ddb6-1ad3-4f76-873e-d4c0e52c710a',
    contact_id: contactId,
    inventory_item_id: itemId,
    contract_type: 'MANDATO_CORRETAJE',
    code: 'TRN-CORR-2026-003',
    title: 'Mandato de Corretaje Mercantil - Yamaha MT-09 SP',
    commission_rate: 3.5,
    total_value_cop: 68500000,
    signature_hash: 'sha256:4918237198237192837bcda192837192837bcda192837192837bcda192837192',
    status: 'VIGENTE'
  }).select();
  console.log('Contract result:', contract, errContract);
}

populateRealData();
