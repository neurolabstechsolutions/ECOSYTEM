const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  console.log('--- Contacts single row select ---');
  const { data: contacts, error: e1 } = await supabase.from('contacts').select('*').limit(1);
  console.log('Contacts:', contacts, e1);

  console.log('--- Inventory single row select ---');
  const { data: items, error: e2 } = await supabase.from('inventory_items').select('*').limit(1);
  console.log('Items:', items, e2);

  console.log('--- Contracts single row select ---');
  const { data: contracts, error: e3 } = await supabase.from('contracts').select('*').limit(1);
  console.log('Contracts:', contracts, e3);
}

inspectSchema();
