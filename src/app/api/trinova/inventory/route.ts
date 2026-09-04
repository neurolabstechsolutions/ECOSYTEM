import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();

    const {
      name,
      brand,
      model,
      year,
      priceCop,
      categoryType = 'VEHICULO',
      subCategory,
      licensePlate,
      mileage,
      city = 'Barranquilla',
      neighborhood,
      areaM2,
      bedrooms,
      bathrooms,
      parkingSpots,
      stratum,
      fuelType,
      transmission,
      engineDisplacement,
      exteriorColor,
      interiorColor,
      features = [],
      description,
      images = []
    } = body;

    if (!name || !priceCop) {
      return NextResponse.json({ success: false, error: 'Nombre y Precio COP son obligatorios' }, { status: 400 });
    }

    // Get Tenant
    const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', 'yjdtrinova').limit(1).single();
    const tenantId = tenant?.id || null;

    // Generate SKU
    const prefix = categoryType === 'MOTO' ? 'MOT' : (categoryType.startsWith('INMUEBLE') ? 'INM' : 'AUT');
    const sku = `TRN-${prefix}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const priceNum = Number(priceCop);

    const insertPayload: Record<string, any> = {
      tenant_id: tenantId,
      sku,
      name: name.trim(),
      brand: brand ? brand.trim() : (categoryType.startsWith('INMUEBLE') ? 'Inmobiliaria Trinova' : 'Trinova'),
      model: model ? model.trim() : 'Oficial',
      year: year ? parseInt(year) : 2024,
      price: priceNum,
      price_cop: priceNum,
      category: categoryType,
      category_type: categoryType,
      city: city.trim(),
      description: description ? description.trim() : `Bien oficial garantizado por YJD TRINOVA S.A.S. con peritaje de 150 puntos.`,
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200'],
      status: 'AVAILABLE'
    };

    if (subCategory) insertPayload.sub_category = subCategory;
    if (licensePlate) insertPayload.license_plate = licensePlate.trim().toUpperCase();
    if (mileage !== undefined && mileage !== null && mileage !== '') insertPayload.mileage = parseInt(mileage);
    if (neighborhood) insertPayload.neighborhood = neighborhood.trim();
    if (areaM2) insertPayload.area_m2 = parseFloat(areaM2);
    if (bedrooms) insertPayload.bedrooms = parseInt(bedrooms);
    if (bathrooms) insertPayload.bathrooms = parseInt(bathrooms);
    if (parkingSpots) insertPayload.parking_spots = parseInt(parkingSpots);
    if (stratum) insertPayload.stratum = parseInt(stratum);
    if (fuelType) insertPayload.fuel_type = fuelType;
    if (transmission) insertPayload.transmission = transmission;
    if (engineDisplacement) insertPayload.engine_displacement = engineDisplacement;
    if (exteriorColor) insertPayload.exterior_color = exteriorColor;
    if (interiorColor) insertPayload.interior_color = interiorColor;
    if (Array.isArray(features) && features.length > 0) insertPayload.features = features;

    const { data: newItem, error: insertError } = await supabase
      .from('inventory_items')
      .insert(insertPayload)
      .select()
      .single();

    if (insertError) {
      console.error('[Supabase Inventory Insert Error]:', insertError);
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Ítem publicado exitosamente en el Marketplace y conectado a WhatsApp',
      item: newItem
    });
  } catch (error: any) {
    console.error('[Inventory API Exception]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID es requerido' }, { status: 400 });
    }

    const { error } = await supabase.from('inventory_items').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Ítem eliminado correctamente' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
