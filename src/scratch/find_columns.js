const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";
const supabase = createClient(supabaseUrl, supabaseKey);

async function findColumns() {
  const tables = ['inventory_items', 'contacts', 'contracts', 'tenants', 'leads'];
  for (const t of tables) {
    // Try inserting an empty object or invalid column to get Supabase error message listing columns or rejecting
    const { data, error } = await supabase.from(t).insert({ invalid_test_col_xyz: 123 });
    console.log(`Table ${t} error:`, error?.message);
  }
}

findColumns();
