const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRampuzeiomx.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
const supabase = createClient(supabaseUrl, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U");

async function testContractsCols() {
  const candidateCols = [
    'id', 'tenant_id', 'created_at', 'updated_at',
    'contract_number', 'number', 'code', 'title', 'name',
    'type', 'contract_type', 'status', 'total_amount', 'amount', 'total_value_cop',
    'commission_rate', 'commission_amount', 'hash', 'signature_hash', 'signed_at',
    'contact_id', 'inventory_item_id', 'vehicle_id', 'provider_id', 'customer_id'
  ];

  for (const col of candidateCols) {
    const obj = {};
    obj[col] = null;
    const { error } = await supabase.from('contracts').insert(obj);
    if (!error || !error.message.includes('in the schema cache')) {
      console.log(`  ✓ Contract Column EXISTS: ${col} (Error: ${error?.message})`);
    }
  }
}

testContractsCols();
