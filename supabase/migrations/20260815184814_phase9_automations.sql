-- FASE 9: Automations (Workflows)
CREATE TABLE public.workflows (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.workflow_nodes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  workflow_id uuid NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  type text NOT NULL,
  config jsonb DEFAULT '{}'::jsonb,
  position_x numeric DEFAULT 0,
  position_y numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own workflows" ON public.workflows FOR SELECT USING (public.get_user_tenant_id() = tenant_id);
CREATE POLICY "Users can manage their own workflows" ON public.workflows FOR ALL USING (public.get_user_tenant_id() = tenant_id);
