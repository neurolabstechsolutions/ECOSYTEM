-- FASE 8: Integrations
CREATE TABLE tenant_integrations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL, -- 'meta_whatsapp', 'openai', 'stripe'
  status text NOT NULL DEFAULT 'DISCONNECTED',
  config jsonb DEFAULT '{}'::jsonb,
  last_sync timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(tenant_id, provider)
);

ALTER TABLE tenant_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own integrations" ON tenant_integrations FOR SELECT USING (get_user_tenant_id() = tenant_id);
CREATE POLICY "Users can insert their own integrations" ON tenant_integrations FOR INSERT WITH CHECK (get_user_tenant_id() = tenant_id);
CREATE POLICY "Users can update their own integrations" ON tenant_integrations FOR UPDATE USING (get_user_tenant_id() = tenant_id);
