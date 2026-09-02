import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantSlug = url.searchParams.get('tenant') || 'yjdtrinova';
    const category = url.searchParams.get('category');

    const supabase = createAdminClient();

    let query = supabase
      .from('inventory_items')
      .select('*, tenants(name, slug), contacts(full_name, phone)')
      .order('created_at', { ascending: false });

    if (category && category !== 'TODOS' && category !== 'ALL') {
      query = query.eq('category_type', category);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('[Inventory API Supabase Error]:', error.message);
      return NextResponse.json({ success: true, items: [] });
    }

    return NextResponse.json({ success: true, items: data || [] });
  } catch (err: any) {
    console.error('[Inventory API Exception]:', err);
    return NextResponse.json({ success: true, items: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    // Get tenant ID
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', body.tenant_slug || 'yjdtrinova')
      .single();

    const tenantId = tenant?.id || null;

    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        tenant_id: tenantId,
        category_type: body.category_type || 'VEHICULO',
        title: body.title,
        brand: body.brand,
        model: body.model,
        year: Number(body.year) || new Date().getFullYear(),
        price_cop: Number(body.price_cop) || 0,
        city: body.city || 'Barranquilla',
        mileage: Number(body.mileage) || 0,
        license_plate: body.license_plate || null,
        images: Array.isArray(body.images) ? body.images : [body.images || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'],
        video_url: body.video_url || null,
        description: body.description || '',
        status: 'DISPONIBLE'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, item: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
