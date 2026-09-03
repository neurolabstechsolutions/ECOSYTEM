import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient();

    // 1. Get Trinova Tenant ID
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', 'yjdtrinova')
      .limit(1)
      .single();

    const tenantId = tenant?.id;

    // 2. Fetch Real Contracts (Mandatos de Corretaje & Promesas de Compraventa)
    let contractsQuery = supabase
      .from('contracts')
      .select('*, contacts(full_name, phone, email, doc_number, person_type), inventory_items(title, price_cop, category_type, license_plate)')
      .order('created_at', { ascending: false });

    if (tenantId) {
      contractsQuery = contractsQuery.eq('tenant_id', tenantId);
    }

    const { data: contracts, error: errContracts } = await contractsQuery;

    // 3. Fetch Real Inventory (Vehicles, Motos, Properties)
    let inventoryQuery = supabase
      .from('inventory_items')
      .select('*, contacts(full_name, phone, email)')
      .order('created_at', { ascending: false });

    if (tenantId) {
      inventoryQuery = inventoryQuery.eq('tenant_id', tenantId);
    }

    const { data: inventory, error: errInventory } = await inventoryQuery;

    // 4. Fetch Real Contacts (Propietarios Consignantes & Compradores)
    let contactsQuery = supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (tenantId) {
      contactsQuery = contactsQuery.eq('tenant_id', tenantId);
    }

    const { data: contacts, error: errContacts } = await contactsQuery;

    // 5. Fetch Real Leads
    let leadsQuery = supabase
      .from('leads')
      .select('*, contacts(full_name, phone, email)')
      .order('created_at', { ascending: false });

    if (tenantId) {
      leadsQuery = leadsQuery.eq('tenant_id', tenantId);
    }

    const { data: leads, error: errLeads } = await leadsQuery;

    return NextResponse.json({
      success: true,
      contracts: contracts || [],
      inventory: inventory || [],
      contacts: contacts || [],
      leads: leads || []
    });
  } catch (error: any) {
    console.error('[Trinova Dashboard API Exception]:', error);
    return NextResponse.json({
      success: false,
      contracts: [],
      inventory: [],
      contacts: [],
      leads: []
    });
  }
}
