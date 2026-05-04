-- ============================================================
-- Proyecto Catecismo — Classroom Expansion Migration 030
-- child_profiles, parent_child_links, parishes, parish_users,
-- parish_programs, class_announcements, messages, documents
-- ALTER class_assignments: add due_date, section_name
-- ============================================================

-- Enable gen_random_uuid if not already
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── child_profiles ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS child_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  avatar_url text,
  date_of_birth date,
  sacramental_status jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_child_profiles_parent ON child_profiles(parent_id);

-- ─── parent_child_links ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS parent_child_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  relationship text NOT NULL CHECK (relationship IN ('father','mother','guardian','godparent')),
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

CREATE INDEX idx_parent_child_links_parent ON parent_child_links(parent_id);
CREATE INDEX idx_parent_child_links_child ON parent_child_links(child_id);

-- ─── parishes ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  city text,
  phone text,
  pastor_name text,
  dre_name text,
  settings jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── parish_users ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parish_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('parish_admin','dre','catechist','volunteer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(parish_id, user_id)
);

CREATE INDEX idx_parish_users_parish ON parish_users(parish_id);
CREATE INDEX idx_parish_users_user ON parish_users(user_id);

-- ─── parish_programs ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parish_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  year text,
  start_date date,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_parish_programs_parish ON parish_programs(parish_id);

-- ─── class_announcements ───────────────────────────────────
CREATE TABLE IF NOT EXISTS class_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id integer NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_class_announcements_class ON class_announcements(class_id);
CREATE INDEX idx_class_announcements_author ON class_announcements(author_id);

-- ─── messages ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id integer NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES profiles(id),
  child_id uuid REFERENCES child_profiles(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_class ON messages(class_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_parent ON messages(parent_id) WHERE parent_id IS NOT NULL;

-- ─── documents ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  file_url text,
  signed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_child ON documents(child_id);

-- ─── ALTER class_assignments ───────────────────────────────
ALTER TABLE class_assignments
  ADD COLUMN IF NOT EXISTS due_date timestamptz,
  ADD COLUMN IF NOT EXISTS section_name text;

-- ─── RLS Policies ──────────────────────────────────────────
-- child_profiles: parents see their own children
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can see own children" ON child_profiles
  FOR SELECT USING (parent_id = auth.uid());
CREATE POLICY "Parents can insert own children" ON child_profiles
  FOR INSERT WITH CHECK (parent_id = auth.uid());
CREATE POLICY "Parents can update own children" ON child_profiles
  FOR UPDATE USING (parent_id = auth.uid());
CREATE POLICY "Parents can delete own children" ON child_profiles
  FOR DELETE USING (parent_id = auth.uid());

-- parent_child_links: parents manage their links
ALTER TABLE parent_child_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents see own links" ON parent_child_links
  FOR SELECT USING (parent_id = auth.uid());
CREATE POLICY "Parents insert own links" ON parent_child_links
  FOR INSERT WITH CHECK (parent_id = auth.uid());
CREATE POLICY "Parents delete own links" ON parent_child_links
  FOR DELETE USING (parent_id = auth.uid());

-- parishes: anyone can read, admins manage
ALTER TABLE parishes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read parishes" ON parishes
  FOR SELECT USING (true);
CREATE POLICY "Admins manage parishes" ON parishes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin'))
  );

-- parish_users: members see, admins manage
ALTER TABLE parish_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see parish memberships" ON parish_users
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin'))
  );
CREATE POLICY "Admins manage parish memberships" ON parish_users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin'))
  );

-- parish_programs: anyone can read, admins manage
ALTER TABLE parish_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read programs" ON parish_programs
  FOR SELECT USING (true);
CREATE POLICY "Admins manage programs" ON parish_programs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin'))
  );

-- class_announcements: class members can read, catechists can CRUD
ALTER TABLE class_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Class members read announcements" ON class_announcements
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM class_students WHERE class_id = class_announcements.class_id AND student_id = auth.uid())
    OR EXISTS (SELECT 1 FROM classes WHERE id = class_announcements.class_id AND catechist_id = auth.uid())
    OR EXISTS (SELECT 1 FROM class_catechists WHERE class_id = class_announcements.class_id AND catechist_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin'))
  );
CREATE POLICY "Catechists create announcements" ON class_announcements
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM classes WHERE id = class_announcements.class_id AND catechist_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin'))
  );
CREATE POLICY "Author delete own announcements" ON class_announcements
  FOR DELETE USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin'))
  );
CREATE POLICY "Author update own announcements" ON class_announcements
  FOR UPDATE USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin'))
  );

-- messages: class members can read, authenticated users can send
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Class members read messages" ON messages
  FOR SELECT USING (
    sender_id = auth.uid()
    OR EXISTS (SELECT 1 FROM class_students WHERE class_id = messages.class_id AND student_id = auth.uid())
    OR EXISTS (SELECT 1 FROM classes WHERE id = messages.class_id AND catechist_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','catechist'))
    OR parent_id = auth.uid()
  );
CREATE POLICY "Authenticated users send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- documents: parents see documents for their children
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents see child documents" ON documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM child_profiles WHERE id = documents.child_id AND parent_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','catechist'))
  );
CREATE POLICY "Parents insert child documents" ON documents
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM child_profiles WHERE id = documents.child_id AND parent_id = auth.uid())
  );
