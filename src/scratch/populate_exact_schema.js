const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFullPopulate() {
  const tenantId = '0814ddb6-1ad3-4f76-873e-d4c0e52c710a';
  const contactId = 'c0000000-0000-4000-a000-000000000003';
  const motoId = 'a0000000-0000-4000-a000-000000000003';
  const fortunerId = 'a0000000-0000-4000-a000-000000000001';
  const penthouseId = 'a0000000-0000-4000-a000-000000000002';

  console.log('--- 1. Insert 3 Real Contacts ---');
  await supabase.from('contacts').upsert([
    {
      id: 'c0000000-0000-4000-a000-000000000001',
      tenant_id: tenantId,
      name: 'Carlos Mario Restrepo',
      phone: '+57 300 4892211',
      email: 'carlos.restrepo@gmail.com',
      doc_number: 'CC 72.345.890',
      person_type: 'PERSONA_NATURAL',
      role_type: 'PROPIETARIO_CONSIGNANTE',
      city: 'Barranquilla',
      status: 'ACTIVO'
    },
    {
      id: 'c0000000-0000-4000-a000-000000000002',
      tenant_id: tenantId,
      name: 'Constructora & Inversiones del Caribe S.A.S.',
      phone: '+57 315 7789044',
      email: 'gerencia@constructora.co',
      doc_number: 'NIT 901.458.789-2',
      person_type: 'PERSONA_JURIDICA',
      role_type: 'PROPIETARIO_CONSIGNANTE',
      city: 'Barranquilla',
      status: 'ACTIVO'
    },
    {
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
    },
    {
      id: 'c0000000-0000-4000-a000-000000000004',
      tenant_id: tenantId,
      name: 'Ing. Mauricio Cantillo',
      phone: '+57 300 5765530',
      email: 'mauricio.cantillo@constructora.co',
      doc_number: 'CC 1.140.892.110',
      person_type: 'PERSONA_NATURAL',
      role_type: 'COMPRADOR',
      city: 'Barranquilla',
      status: 'ACTIVO'
    },
    {
      id: 'c0000000-0000-4000-a000-000000000005',
      tenant_id: tenantId,
      name: 'Dra. Patricia Ortiz',
      phone: '+57 310 4492011',
      email: 'patricia.ortiz@salud.org',
      doc_number: 'CC 55.491.233',
      person_type: 'PERSONA_NATURAL',
      role_type: 'COMPRADOR',
      city: 'Barranquilla',
      status: 'ACTIVO'
    }
  ]);

  console.log('--- 2. Insert 3 Real Inventory Items ---');
  await supabase.from('inventory_items').upsert([
    {
      id: fortunerId,
      tenant_id: tenantId,
      sku: 'TRN-TOY-001',
      name: 'Toyota Fortuner GR-S 2.8L Diésel 4x4',
      brand: 'Toyota',
      model: 'Fortuner GR-S',
      year: 2024,
      price: 310000000,
      price_cop: 310000000,
      category_type: 'VEHICULO',
      mileage: 12500,
      license_plate: 'LMN-456',
      images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'],
      description: 'Camioneta familiar de alta gama, peritaje 150 puntos aprobado, único dueño, placa de Barranquilla.',
      status: 'AVAILABLE'
    },
    {
      id: penthouseId,
      tenant_id: tenantId,
      sku: 'TRN-INM-002',
      name: 'Penthouse Dúplex Alto Prado 240m²',
      brand: 'Inmueble Prime',
      model: 'Penthouse',
      year: 2024,
      price: 850000000,
      price_cop: 850000000,
      category_type: 'INMUEBLE_VENTA',
      mileage: 0,
      license_plate: null,
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'],
      description: 'Exclusivo penthouse con vista panorámica, 3 habitaciones con baño, cocina italiana, 2 garajes.',
      status: 'AVAILABLE'
    },
    {
      id: motoId,
      tenant_id: tenantId,
      sku: 'TRN-YAM-003',
      name: 'Yamaha MT-09 SP ABS 890cc',
      brand: 'Yamaha',
      model: 'MT-09 SP',
      year: 2024,
      price: 68500000,
      price_cop: 68500000,
      category_type: 'MOTO',
      mileage: 4200,
      license_plate: 'KTY-89G',
      images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200'],
      description: 'Motocicleta deportiva naked, suspensiones Öhlins, control crucero y quickshifter. Peritaje 150 puntos aprobado.',
      status: 'AVAILABLE'
    }
  ]);

  console.log('--- 3. Testing Contracts Insert ---');
  const contractId = 'e0000000-0000-4000-a000-000000000003';
  const { data: contractData, error: errContract } = await supabase.from('contracts').upsert({
    id: contractId,
    client_name: 'David Silva Mendoza',
    contact_id: contactId,
    service_type: 'CORRETAJE_MERCANTIL',
    contract_type: 'MANDATO_CORRETAJE',
    status: 'SIGNED'
  }).select();
  console.log('Contract inserted:', contractData, errContract);

  console.log('--- 4. Final DB Counts ---');
  const { data: finalItems } = await supabase.from('inventory_items').select('id, name, price_cop, status');
  const { data: finalContacts } = await supabase.from('contacts').select('id, name, phone, role_type');
  const { data: finalContracts } = await supabase.from('contracts').select('id, client_name, service_type');

  console.log('✅ Inventory Items in Supabase:', finalItems?.length, finalItems);
  console.log('✅ Contacts in Supabase:', finalContacts?.length, finalContacts);
  console.log('✅ Contracts in Supabase:', finalContracts?.length, finalContracts);
}

testFullPopulate();
