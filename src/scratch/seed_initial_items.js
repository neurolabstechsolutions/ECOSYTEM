const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fqxqeqdsqdampuzeiomx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHFlcWRzcWRhbXB1emVpb214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODIyODEsImV4cCI6MjEwMjM1ODI4MX0.6sDR-bNOmYXsW9BfuG1NUY0SMUmEC4TIys4RwucRm6U";

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedItems() {
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', 'yjdtrinova')
    .limit(1)
    .single();

  const tenantId = tenant?.id;

  const items = [
    {
      tenant_id: tenantId,
      category_type: 'VEHICULO',
      title: 'Toyota Fortuner GR-S 2.8L Diésel 4x4',
      brand: 'Toyota',
      model: 'Fortuner GR-S',
      year: 2024,
      price_cop: 310000000,
      neighborhood: 'Barranquilla',
      mileage: 12500,
      license_plate: 'LMN-456',
      images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'],
      description: 'Camioneta familiar de alta gama, peritaje 150 puntos aprobado, único dueño, placa de Barranquilla.',
      status: 'DISPONIBLE'
    },
    {
      tenant_id: tenantId,
      category_type: 'MOTO',
      title: 'Yamaha MT-09 SP ABS 890cc',
      brand: 'Yamaha',
      model: 'MT-09 SP',
      year: 2024,
      price_cop: 68500000,
      neighborhood: 'Barranquilla',
      mileage: 4200,
      license_plate: 'KTY-89G',
      images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200'],
      description: 'Motocicleta deportiva naked, suspensiones Öhlins, control crucero y quickshifter.',
      status: 'DISPONIBLE'
    },
    {
      tenant_id: tenantId,
      category_type: 'INMUEBLE_VENTA',
      title: 'Penthouse Dúplex Alto Prado 240m²',
      brand: 'Inmueble Prime',
      model: 'Penthouse',
      year: 2024,
      price_cop: 850000000,
      neighborhood: 'Alto Prado, Barranquilla',
      mileage: 0,
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'],
      description: 'Exclusivo penthouse con vista panorámica, 3 habitaciones con baño, cocina italiana, 2 garajes.',
      status: 'DISPONIBLE'
    }
  ];

  const { data, error } = await supabase.from('inventory_items').insert(items).select();
  if (error) {
    console.error("Error insertando inventario inicial:", error.message);
  } else {
    console.log(`✅ ¡${data.length} bienes iniciales guardados con éxito en Supabase para Trinova!`);
    console.log(JSON.stringify(data, null, 2));
  }
}

seedItems();
