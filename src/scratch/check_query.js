const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInventoryQuery() {
  console.log('Querying with status AVAILABLE or DISPONIBLE...');
  const { data: dbItems, error: dbErr } = await supabase
    .from('inventory_items')
    .select('*')
    .in('status', ['AVAILABLE', 'DISPONIBLE'])
    .order('created_at', { ascending: false });

  console.log('Found items count:', dbItems?.length, dbErr);
  if (dbItems) {
    const formatted = dbItems.map((item) => {
      const title = item.name || item.title || `${item.brand} ${item.model}`;
      const price = Number(item.price_cop || item.price || 0);
      return `• [${item.category_type || item.category || 'VEHICULO'}] ${title} (${item.year || 2024}) - Valor: $${price.toLocaleString('es-CO')} COP - Ubicación: ${item.city || 'Barranquilla'}${item.license_plate ? ` - Placa: ${item.license_plate}` : ''}${item.mileage ? ` - ${item.mileage} km` : ''}`;
    }).join('\n');
    console.log('\n--- Formatted Inventory for AI ---');
    console.log(formatted);
  }
}

testInventoryQuery();
