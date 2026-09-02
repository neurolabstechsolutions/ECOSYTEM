const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDB() {
  console.log("=== VERIFICANDO CONEXIÓN A SUPABASE CLOUD ===");
  console.log("URL:", supabaseUrl);
  
  // 1. Check tenants
  const { data: tenants, error: errTenants } = await supabase.from('tenants').select('*');
  console.log("\n[1] TENANTS:", errTenants ? `Error: ${errTenants.message}` : JSON.stringify(tenants, null, 2));

  // 2. Check inventory_items
  const { data: items, error: errItems } = await supabase.from('inventory_items').select('*').limit(5);
  console.log("\n[2] INVENTORY_ITEMS:", errItems ? `Error: ${errItems.message}` : `Total encontrados: ${items?.length || 0}`);
  if (items && items.length > 0) {
    console.log("Muestra:", items);
  }

  // 3. Check contacts
  const { data: contacts, error: errContacts } = await supabase.from('contacts').select('*').limit(5);
  console.log("\n[3] CONTACTS:", errContacts ? `Error: ${errContacts.message}` : `Total encontrados: ${contacts?.length || 0}`);

  // 4. Check contracts
  const { data: contracts, error: errContracts } = await supabase.from('contracts').select('*').limit(5);
  console.log("\n[4] CONTRACTS:", errContracts ? `Error: ${errContracts.message}` : `Total encontrados: ${contracts?.length || 0}`);

  // 5. Check leads
  const { data: leads, error: errLeads } = await supabase.from('leads').select('*').limit(5);
  console.log("\n[5] LEADS:", errLeads ? `Error: ${errLeads.message}` : `Total encontrados: ${leads?.length || 0}`);
}

verifyDB();
