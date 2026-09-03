const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testContractInsert() {
  const contractCols = [
    'id', 'created_at', 'client_name', 'client_id', 'contact_id', 'vehicle_name', 'title',
    'contract_type', 'type', 'total_amount', 'total_value_cop', 'price', 'value',
    'commission_rate', 'commission_amount', 'status', 'signed_at', 'signature_hash', 'hash',
    'content', 'pdf_url', 'notes', 'tenant_id'
  ];

  for (const c of contractCols) {
    const obj = { client_name: 'Test Client' };
    obj[c] = null;
    const { error } = await supabase.from('contracts').insert(obj);
    if (!error || !error.message.includes('in the schema cache')) {
      console.log(`  ✓ Contract Column: ${c} (Error: ${error?.message})`);
    }
  }
}

testContractInsert();
