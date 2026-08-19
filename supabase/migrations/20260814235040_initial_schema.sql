-- Create roles ENUM
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'AGENT', 'VIEWER');

-- Create tenants table
CREATE TABLE public.tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Create users table (Profiles)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    role user_role DEFAULT 'VIEWER'::user_role NOT NULL,
    display_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID AS $$
    SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
    SELECT role = 'SUPER_ADMIN'::user_role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Tenants policies
CREATE POLICY "Tenants are viewable by their own users or super admins"
ON public.tenants FOR SELECT
USING (id = public.get_user_tenant_id() OR public.is_super_admin());

CREATE POLICY "Tenants are insertable by super admins"
ON public.tenants FOR INSERT
WITH CHECK (public.is_super_admin());

CREATE POLICY "Tenants are updatable by tenant admins or super admins"
ON public.tenants FOR UPDATE
USING (id = public.get_user_tenant_id() AND public.get_user_role() IN ('TENANT_ADMIN'::user_role, 'SUPER_ADMIN'::user_role));

-- Users policies
CREATE POLICY "Users can view users in their own tenant or if super admin"
ON public.users FOR SELECT
USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin());

CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Tenant admins can insert users in their tenant"
ON public.users FOR INSERT
WITH CHECK ((tenant_id = public.get_user_tenant_id() AND public.get_user_role() = 'TENANT_ADMIN'::user_role) OR public.is_super_admin());

-- Create a trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, display_name, tenant_id, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'display_name',
    (new.raw_user_meta_data->>'tenant_id')::UUID,
    COALESCE((new.raw_user_meta_data->>'role')::text::user_role, 'VIEWER'::user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
