import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

describe('Aislamiento Multi-Tenant (RLS)', () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  it('AGENT de Automotriz solo puede ver usuarios de Automotriz', async () => {
    // Login como agente del tenant automotriz
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'agente@automotriz.com',
      password: 'password123',
    });
    
    expect(authError).toBeNull();
    expect(authData.user).toBeDefined();

    // Intentar leer todos los usuarios
    const { data: users, error: selectError } = await supabase
      .from('users')
      .select('*, tenants!inner(name, domain)');

    expect(selectError).toBeNull();
    
    // Validar que todos los usuarios devueltos pertenecen a automotriz.com
    users?.forEach(u => {
      expect(u.tenants.domain).toBe('automotriz.com');
    });

    // Validar que no hay fuga del tenant de NeuroLabs
    const neuroLabsUsers = users?.filter(u => u.tenants.domain === 'neurolabs.ai');
    expect(neuroLabsUsers?.length).toBe(0);

    await supabase.auth.signOut();
  });

  it('SUPER_ADMIN de NeuroLabs puede ver todos los usuarios de todos los tenants', async () => {
    // Login como Super Admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'superadmin@neurolabs.ai',
      password: 'password123',
    });
    
    expect(authError).toBeNull();
    expect(authData.user).toBeDefined();

    // Intentar leer todos los usuarios
    const { data: users, error: selectError } = await supabase
      .from('users')
      .select('*, tenants!inner(name, domain)');

    expect(selectError).toBeNull();
    
    // Validar que vemos tanto usuarios de automotriz como de neurolabs
    const neuroLabsUsers = users?.filter(u => u.tenants.domain === 'neurolabs.ai');
    const automotrizUsers = users?.filter(u => u.tenants.domain === 'automotriz.com');

    expect(neuroLabsUsers?.length).toBeGreaterThan(0);
    expect(automotrizUsers?.length).toBeGreaterThan(0);

    await supabase.auth.signOut();
  });
});
