const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertAllContracts() {
  const contracts = [
    {
      id: 'e0000000-0000-4000-a000-000000000001',
      client_name: 'Carlos Mario Restrepo',
      contact_id: 'c0000000-0000-4000-a000-000000000001',
      service_type: 'CORRETAJE_MERCANTIL',
      contract_type: 'MANDATO_CORRETAJE',
      amount_cop: 310000000,
      commission_type: 'PERCENTAGE',
      commission_value: 3.5,
      status: 'FIRMADO'
    },
    {
      id: 'e0000000-0000-4000-a000-000000000002',
      client_name: 'Constructora & Inversiones del Caribe S.A.S.',
      contact_id: 'c0000000-0000-4000-a000-000000000002',
      service_type: 'CORRETAJE_MERCANTIL',
      contract_type: 'MANDATO_CORRETAJE',
      amount_cop: 850000000,
      commission_type: 'PERCENTAGE',
      commission_value: 3.0,
      status: 'FIRMADO'
    },
    {
      id: 'e0000000-0000-4000-a000-000000000003',
      client_name: 'David Silva Mendoza',
      contact_id: 'c0000000-0000-4000-a000-000000000003',
      service_type: 'CORRETAJE_MERCANTIL',
      contract_type: 'MANDATO_CORRETAJE',
      amount_cop: 68500000,
      commission_type: 'PERCENTAGE',
      commission_value: 3.5,
      status: 'FIRMADO'
    }
  ];

  const { data, error } = await supabase.from('contracts').upsert(contracts).select();
  console.log('✅ Contracts inserted successfully:', data?.length, error);

  console.log('--- Checking Full Real Supabase Database Status ---');
  const { data: allItems } = await supabase.from('inventory_items').select('id, name, price_cop, status');
  const { data: allContacts } = await supabase.from('contacts').select('id, name, phone, role_type');
  const { data: allContracts } = await supabase.from('contracts').select('id, client_name, amount_cop, status');

  console.log(`🎉 INVENTORY ITEMS (${allItems?.length}):`, allItems);
  console.log(`🎉 CONTACTS (${allContacts?.length}):`, allContacts);
  console.log(`🎉 CONTRACTS (${allContracts?.length}):`, allContracts);
}

insertAllContracts();
