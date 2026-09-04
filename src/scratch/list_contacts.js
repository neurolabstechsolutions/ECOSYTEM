const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
const supabase = createClient(supabaseUrl, supabaseKey);

async function listCurrentContacts() {
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('id, name, phone, email, doc_number, role_type, status, created_at')
    .order('created_at', { ascending: false });

  console.log('Current Contacts count:', contacts?.length);
  console.log(contacts);
}

listCurrentContacts();
