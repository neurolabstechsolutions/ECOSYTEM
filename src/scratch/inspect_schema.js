const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const { data, error } = await supabase.from('inventory_items').select('*').limit(1);
  console.log("inventory_items select result:", { data, error });

  const { data: prodData, error: prodErr } = await supabase.from('products').select('*').limit(1);
  console.log("products select result:", { prodData, prodErr });
}

inspect();
