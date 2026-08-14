-- Run this SQL in the Supabase SQL Editor to create tables and RLS policies.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('captain', 'vice_captain', 'member')),
  department TEXT NOT NULL DEFAULT 'General',
  project_id UUID,
  phone_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage profiles"
  ON public.profiles FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('planned', 'ongoing', 'on_hold', 'completed')),
  department TEXT NOT NULL DEFAULT 'General',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projects are viewable by authenticated users"
  ON public.projects FOR SELECT TO authenticated USING (true);

CREATE POLICY "Captains and vice captains can manage projects"
  ON public.projects FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('captain', 'vice_captain')));

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks are viewable by authenticated users"
  ON public.tasks FOR SELECT TO authenticated USING (true);

CREATE POLICY "Captains and vice captains can manage tasks"
  ON public.tasks FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('captain', 'vice_captain')));

CREATE POLICY "Members can update own task status"
  ON public.tasks FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (
    assigned_to = auth.uid() AND
    status IN ('todo', 'in_progress', 'review', 'done')
  );

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 4 CHECK (max_participants > 0),
  location TEXT,
  registered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by authenticated users"
  ON public.events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Captains can manage events"
  ON public.events FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'captain'));

-- Event participants
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, profile_id)
);

ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event participants are viewable by authenticated users"
  ON public.event_participants FOR SELECT TO authenticated USING (true);

CREATE POLICY "Captains can manage event participants"
  ON public.event_participants FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'captain'));

-- Research docs
CREATE TABLE IF NOT EXISTS public.research_docs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.research_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Research docs are viewable by authenticated users"
  ON public.research_docs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create research docs"
  ON public.research_docs FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update/delete own docs"
  ON public.research_docs FOR ALL TO authenticated
  USING (auth.uid() = author_id);

-- Weekly reports
CREATE TABLE IF NOT EXISTS public.weekly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_ending DATE NOT NULL,
  summary TEXT NOT NULL,
  accomplishments TEXT,
  blockers TEXT,
  next_steps TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Weekly reports are viewable by authenticated users"
  ON public.weekly_reports FOR SELECT TO authenticated USING (true);

CREATE POLICY "Members can create own reports"
  ON public.weekly_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);

-- Inventory logs
CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name TEXT NOT NULL,
  taken_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  returned_at TIMESTAMPTZ,
  condition_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inventory logs are viewable by authenticated users"
  ON public.inventory_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create inventory logs"
  ON public.inventory_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = taken_by);

CREATE POLICY "Takers can update own logs"
  ON public.inventory_logs FOR UPDATE TO authenticated
  USING (auth.uid() = taken_by);

-- Budget items
CREATE TABLE IF NOT EXISTS public.budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  item TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  category TEXT NOT NULL DEFAULT 'Components',
  purchased_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Budget items are viewable by authenticated users"
  ON public.budget_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Captains and vice captains can manage budget items"
  ON public.budget_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('captain', 'vice_captain')));

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, department)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'member'),
    COALESCE(NEW.raw_user_meta_data ->> 'department', 'General')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    department = EXCLUDED.department;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
