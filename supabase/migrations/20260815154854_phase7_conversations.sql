-- FASE 7: Conversations & Messages
CREATE TABLE conversations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  handling_status text NOT NULL DEFAULT 'AI_HANDLING',
  channel text NOT NULL DEFAULT 'whatsapp',
  sentiment text,
  unread_count integer DEFAULT 0,
  tags text[],
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender text NOT NULL, -- 'user', 'ai', 'agent'
  sender_name text,
  content text NOT NULL,
  status text DEFAULT 'delivered',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations" ON conversations FOR SELECT USING (get_user_tenant_id() = tenant_id);
CREATE POLICY "Users can insert their own conversations" ON conversations FOR INSERT WITH CHECK (get_user_tenant_id() = tenant_id);
CREATE POLICY "Users can update their own conversations" ON conversations FOR UPDATE USING (get_user_tenant_id() = tenant_id);

CREATE POLICY "Users can view their own messages" ON messages FOR SELECT USING (get_user_tenant_id() = tenant_id);
CREATE POLICY "Users can insert their own messages" ON messages FOR INSERT WITH CHECK (get_user_tenant_id() = tenant_id);
