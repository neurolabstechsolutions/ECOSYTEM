const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
const supabase = createClient(supabaseUrl, supabaseKey);

async function wipeAllContacts() {
  console.log('🗑️ Vaciando tabla contacts para inicio en blanco 100%...');
  
  // Set owner_contact_id to null in inventory_items and contracts before deleting contacts if any FK exists
  await supabase.from('inventory_items').update({ owner_contact_id: null }).neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('contracts').update({ contact_id: null }).neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { data, error } = await supabase.from('contacts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Wipe result:', data, error);

  const { count } = await supabase.from('contacts').select('*', { count: 'exact', head: true });
  console.log('Total contacts remaining in Supabase:', count);
}

wipeAllContacts();
