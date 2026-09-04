const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncAndresManjarrez() {
  const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', 'yjdtrinova').limit(1).single();
  const tenantId = tenant?.id || null;

  // Insert Andres Manjarrez with status 'ACTIVO' and role 'COMPRADOR'
  const { data, error } = await supabase.from('contacts').insert({
    tenant_id: tenantId,
    name: 'Andres Manjarrz',
    phone: '+57 300 576 5530',
    email: 'andres.manjarrez@trinova.co',
    doc_number: 'CC 12356982682',
    person_type: 'PERSONA_NATURAL',
    role_type: 'COMPRADOR',
    city: 'Barranquilla',
    status: 'ACTIVO'
  }).select();

  console.log('Inserted Andres Manjarrez result:', data, error);
}

syncAndresManjarrez();
