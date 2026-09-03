import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient();

    // 1. Fetch Real Inventory
    const { data: inventory, error: errInventory } = await supabase
      .from('inventory_items')
      .select('*')
      .order('created_at', { ascending: false });

    // 2. Fetch Real Contracts
    const { data: contracts, error: errContracts } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });

    // 3. Fetch Real Contacts
    const { data: contacts, error: errContacts } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    // 4. Fetch Real Leads
    const { data: leads, error: errLeads } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      inventory: inventory || [],
      contracts: contracts || [],
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
