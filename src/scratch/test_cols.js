const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testCols() {
  const candidateCols = [
    'id', 'tenant_id', 'created_at', 'updated_at', 
    'title', 'name', 'brand', 'model', 'year', 'price', 'price_cop', 'status', 
    'description', 'images', 'image_url', 'category', 'category_type', 'type',
    'location', 'city', 'mileage', 'km', 'license_plate', 'plate', 'vin', 
    'metadata', 'details', 'specs', 'owner_id', 'contact_id', 'owner_contact_id'
  ];

  console.log('Testing columns on inventory_items...');
  for (const col of candidateCols) {
    const obj = {};
    obj[col] = null;
    const { error } = await supabase.from('inventory_items').insert(obj);
    if (!error || !error.message.includes('in the schema cache')) {
      console.log(`  ✓ Column EXISTS: ${col} (Error: ${error?.message})`);
    }
  }

  console.log('Testing columns on contacts...');
  const contactCandidateCols = [
    'id', 'tenant_id', 'created_at', 'updated_at',
    'name', 'full_name', 'first_name', 'last_name',
    'phone', 'telephone', 'mobile', 'email', 'doc_number', 'identification', 'id_number', 'document',
    'type', 'person_type', 'role', 'role_type', 'status', 'city', 'address', 'company'
  ];
  for (const col of contactCandidateCols) {
    const obj = {};
    obj[col] = null;
    const { error } = await supabase.from('contacts').insert(obj);
    if (!error || !error.message.includes('in the schema cache')) {
      console.log(`  ✓ Contact Column EXISTS: ${col} (Error: ${error?.message})`);
    }
  }
}

testCols();
