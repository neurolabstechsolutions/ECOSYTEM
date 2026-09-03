const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithSku() {
  const tenantId = '0814ddb6-1ad3-4f76-873e-d4c0e52c710a';
  const contactId = 'c0000000-0000-4000-a000-000000000003';
  const itemId = 'a0000000-0000-4000-a000-000000000003';

  console.log('--- Inserting Yamaha MT-09 SP with sku and AVAILABLE ---');
  const { data, error } = await supabase.from('inventory_items').upsert({
    id: itemId,
    tenant_id: tenantId,
    sku: 'TRN-YAM-001',
    name: 'Yamaha MT-09 SP ABS 890cc',
    brand: 'Yamaha',
    model: 'MT-09 SP',
    year: 2024,
    price: 68500000,
    price_cop: 68500000,
    mileage: 4200,
    license_plate: 'KTY-89G',
    images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200'],
    description: 'Motocicleta deportiva naked, suspensiones Öhlins, control crucero y quickshifter.',
    status: 'AVAILABLE'
  }).select();

  console.log('Result:', data, error);
}

testWithSku();
