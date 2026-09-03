const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testContractStatuses() {
  const statuses = ['DRAFT', 'PENDING_SIGNATURE', 'PENDING', 'ACTIVE', 'VIGENTE', 'FIRMADO', 'SIGNED', 'EXECUTED', 'COMPLETED', 'draft', 'pending', 'active'];

  for (const st of statuses) {
    const { data, error } = await supabase.from('contracts').upsert({
      id: 'e0000000-0000-4000-a000-000000000001',
      client_name: 'Carlos Mario Restrepo',
      contact_id: 'c0000000-0000-4000-a000-000000000001',
      service_type: 'CORRETAJE_MERCANTIL',
      contract_type: 'MANDATO_CORRETAJE',
      amount_cop: 310000000,
      commission_type: 'PERCENTAGE',
      commission_value: 3.5,
      status: st
    }).select();

    if (!error) {
      console.log(`✅ SUCCESS with status: "${st}"!`);
      break;
    } else {
      console.log(`❌ Failed with status "${st}":`, error.message);
    }
  }
}

testContractStatuses();
