-- FASE 11: Usage (Tokens)
CREATE TABLE public.token_usage_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model text NOT NULL,
  tokens_used integer NOT NULL,
  cost_usd numeric(15, 6) NOT NULL DEFAULT 0,
  context jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.token_usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own usage logs" ON public.token_usage_logs FOR SELECT USING (public.get_user_tenant_id() = tenant_id);
