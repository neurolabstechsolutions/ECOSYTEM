const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanTestContactsAndLeads() {
  console.log('🧹 Limpiando contactos de prueba y leads temporales...');

  // 1. Delete test leads
  const { error: errLeads } = await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Leads cleaned:', errLeads);

  // 2. Delete test contacts with LID or test names
  const testIds = [
    '85a224b1-6dff-42a0-a9d7-2ba0cfb1c309', // Víctor
    '02aa3a2a-e457-4b38-a21a-cbab51ace097', // Richard
    '4dc317c2-b6a5-4d61-b800-f1df7f07c909', // SOLO
    'af414b89-14a7-4467-b186-bb7622481f6b', // sandymariamangamanga
    '3059d321-1e66-4d90-8a71-c028023a7de7', // Karen
    'fb2785fa-534c-41f3-8875-0386565b0276', // gisel
    '3c326161-0aa7-4af7-976c-02285785d644', // Propietario +264
    '9e766a5c-0f32-4fbb-8f24-91ced62435e2', // Andres Manjarrz (test)
    'c1010000-0000-0000-0000-000000000003'  // Duplicado David Silva
  ];

  for (const id of testIds) {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) console.log(`Error deleting ${id}:`, error.message);
  }

  // Also delete any other contacts with phone containing long LID strings
  const { data: allContacts } = await supabase.from('contacts').select('id, phone, name');
  if (allContacts) {
    for (const c of allContacts) {
      if (c.phone && (c.phone.length > 18 || c.phone === '+' || c.name.startsWith('Propietario +'))) {
        await supabase.from('contacts').delete().eq('id', c.id);
        console.log(`Removed LID contact ${c.name} (${c.phone})`);
      }
    }
  }

  console.log('✅ Base de datos limpia y en orden.');

  const { data: finalContacts } = await supabase
    .from('contacts')
    .select('id, name, phone, email, doc_number, role_type, status');
  console.log('\n--- Contactos Finales Reales en Supabase ---');
  console.table(finalContacts);
}

cleanTestContactsAndLeads();
