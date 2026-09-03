const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
  console.log('--- Checking Tenants ---');
  const { data: tenants, error: errTenants } = await supabase.from('tenants').select('*');
  console.log('Tenants:', tenants, errTenants);

  console.log('--- Checking Inventory Items ---');
  const { data: items, error: errItems } = await supabase.from('inventory_items').select('*');
  console.log('Inventory Items Count:', items ? items.length : 0, errItems);
  if (items) console.log('Items:', items);

  console.log('--- Checking Contracts ---');
  const { data: contracts, error: errContracts } = await supabase.from('contracts').select('*');
  console.log('Contracts Count:', contracts ? contracts.length : 0, errContracts);
  if (contracts) console.log('Contracts:', contracts);

  console.log('--- Checking Contacts ---');
  const { data: contacts, error: errContacts } = await supabase.from('contacts').select('*');
  console.log('Contacts Count:', contacts ? contacts.length : 0, errContacts);
  if (contacts) console.log('Contacts:', contacts);
}

checkDb();
