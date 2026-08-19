-- FASE 6: Knowledge Base
CREATE TABLE knowledge_documents (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  size_bytes bigint NOT NULL,
  status text NOT NULL DEFAULT 'PROCESSING',
  category text,
  author text,
  summary text,
  embedding_model text,
  tags text[],
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own knowledge_documents" ON knowledge_documents
  FOR SELECT USING (get_user_tenant_id() = tenant_id);

CREATE POLICY "Users can insert their own knowledge_documents" ON knowledge_documents
  FOR INSERT WITH CHECK (get_user_tenant_id() = tenant_id);

CREATE POLICY "Users can update their own knowledge_documents" ON knowledge_documents
  FOR UPDATE USING (get_user_tenant_id() = tenant_id);

CREATE POLICY "Users can delete their own knowledge_documents" ON knowledge_documents
  FOR DELETE USING (get_user_tenant_id() = tenant_id);
