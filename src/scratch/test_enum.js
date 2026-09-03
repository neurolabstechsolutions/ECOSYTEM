const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testStatusEnum() {
  const tenantId = '0814ddb6-1ad3-4f76-873e-d4c0e52c710a';
  const testStatuses = ['AVAILABLE', 'IN_STOCK', 'ACTIVE', 'DRAFT', 'PUBLISHED', 'DISPONIBLE', 'EN_VENTA'];

  for (const st of testStatuses) {
    const itemId = 'a0000000-0000-4000-a000-000000000003';
    const { data, error } = await supabase.from('inventory_items').upsert({
      id: itemId,
      tenant_id: tenantId,
      name: 'Yamaha MT-09 SP ABS 890cc',
      brand: 'Yamaha',
      model: 'MT-09 SP',
      year: 2024,
      price: 68500000,
      price_cop: 68500000,
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

testStatusEnum();
