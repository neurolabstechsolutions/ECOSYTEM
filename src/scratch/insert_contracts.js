const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertContracts() {
  const contracts = [
    {
      id: 'e0000000-0000-4000-a000-000000000001',
      client_name: 'Carlos Mario Restrepo',
      contact_id: 'c0000000-0000-4000-a000-000000000001',
      service_type: 'CORRETAJE_MERCANTIL',
      contract_type: 'MANDATO_CORRETAJE',
      amount_cop: 310000000,
      commission_rate: 3.5,
      status: 'SIGNED'
    },
    {
      id: 'e0000000-0000-4000-a000-000000000002',
      client_name: 'Constructora & Inversiones del Caribe S.A.S.',
      contact_id: 'c0000000-0000-4000-a000-000000000002',
      service_type: 'CORRETAJE_MERCANTIL',
      contract_type: 'MANDATO_CORRETAJE',
      amount_cop: 850000000,
      commission_rate: 3.0,
      status: 'SIGNED'
    },
    {
      id: 'e0000000-0000-4000-a000-000000000003',
      client_name: 'David Silva Mendoza',
      contact_id: 'c0000000-0000-4000-a000-000000000003',
      service_type: 'CORRETAJE_MERCANTIL',
      contract_type: 'MANDATO_CORRETAJE',
      amount_cop: 68500000,
      commission_rate: 3.5,
      status: 'SIGNED'
    }
  ];

  const { data, error } = await supabase.from('contracts').upsert(contracts).select();
  console.log('Contracts inserted:', data?.length, error);

  const { data: allContracts } = await supabase.from('contracts').select('*');
  console.log('All Contracts in Supabase:', allContracts?.length, allContracts);
}

insertContracts();
