const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealInsert() {
  const tenantId = '0814ddb6-1ad3-4f76-873e-d4c0e52c710a';

  console.log('--- 1. Insert Contact (David Silva) ---');
  const contactId = 'c1010000-0000-0000-0000-000000000003';
  const { data: contact, error: errContact } = await supabase.from('contacts').upsert({
    id: contactId,
    tenant_id: tenantId,
    name: 'David Silva Mendoza',
    phone: '+57 320 8941122',
    email: 'david.silva@outlook.com',
    doc_number: 'CC 1.045.678.901',
    person_type: 'PERSONA_NATURAL',
    role_type: 'PROPIETARIO_CONSIGNANTE',
    city: 'Barranquilla',
    status: 'ACTIVO'
  }).select();
  console.log('Contact Inserted:', contact, errContact);

  console.log('--- 2. Insert Motorcycle (Yamaha MT-09 SP) ---');
  const itemId = 'i1010000-0000-0000-0000-000000000003';
  const { data: item, error: errItem } = await supabase.from('inventory_items').upsert({
    id: itemId,
    tenant_id: tenantId,
    owner_contact_id: contactId,
    name: 'Yamaha MT-09 SP ABS 890cc',
    category: 'MOTO',
    category_type: 'MOTO',
    brand: 'Yamaha',
    model: 'MT-09 SP',
    year: 2024,
    price: 68500000,
    price_cop: 68500000,
    mileage: 4200,
    license_plate: 'KTY-89G',
    images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200'],
    description: 'Motocicleta deportiva naked, suspensiones Öhlins, control crucero y quickshifter.',
    status: 'DISPONIBLE'
  }).select();
  console.log('Item Inserted:', item, errItem);

  console.log('--- 3. Insert Toyota Fortuner GR-S ---');
  const toyotaId = 'i1010000-0000-0000-0000-000000000001';
  const { data: toyota, error: errToyota } = await supabase.from('inventory_items').upsert({
    id: toyotaId,
    tenant_id: tenantId,
    owner_contact_id: contactId,
    name: 'Toyota Fortuner GR-S 2.8L Diésel 4x4',
    category: 'VEHICULO',
    category_type: 'VEHICULO',
    brand: 'Toyota',
    model: 'Fortuner GR-S',
    year: 2024,
    price: 310000000,
    price_cop: 310000000,
    mileage: 12500,
    license_plate: 'LMN-456',
    images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'],
    description: 'Camioneta familiar de alta gama, peritaje 150 puntos aprobado, único dueño, placa de Barranquilla.',
    status: 'DISPONIBLE'
  }).select();
  console.log('Toyota Inserted:', toyota, errToyota);
}

testRealInsert();
