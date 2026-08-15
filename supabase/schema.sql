-- ====================================================================
-- STUDENT PROJECT MANAGEMENT PLATFORM (TEAM ROXX) - COMPLETE SQL SCHEMA
-- Run this complete SQL script in your Supabase SQL Editor from start to end.
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Extends auth.users with Captain, Vice Captain, Member & Trainee roles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('captain', 'vice_captain', 'member', 'trainee')),
  department TEXT NOT NULL DEFAULT 'General',
  project_id UUID,
  phone_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure columns & constraints exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('captain', 'vice_captain', 'member', 'trainee'));

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage profiles" ON public.profiles;
CREATE POLICY "Authenticated users can manage profiles"
  ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ongoing' CHECK (status IN ('planned', 'ongoing', 'on_hold', 'completed')),
  department TEXT NOT NULL DEFAULT 'General',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Projects are viewable by authenticated users" ON public.projects;
CREATE POLICY "Projects are viewable by authenticated users"
  ON public.projects FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Captains and vice captains can manage projects" ON public.projects;
CREATE POLICY "Captains and vice captains can manage projects"
  ON public.projects FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('captain', 'vice_captain')));

-- 4. Tasks Table
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

DROP POLICY IF EXISTS "Tasks are viewable by authenticated users" ON public.tasks;
CREATE POLICY "Tasks are viewable by authenticated users"
  ON public.tasks FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Captains and vice captains can manage tasks" ON public.tasks;
CREATE POLICY "Captains and vice captains can manage tasks"
  ON public.tasks FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('captain', 'vice_captain')));

DROP POLICY IF EXISTS "Members can update own task status" ON public.tasks;
CREATE POLICY "Members can update own task status"
  ON public.tasks FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid() AND status IN ('todo', 'in_progress', 'review', 'done'));

-- 5. Events Table (Viewable by Trainees; Creation by Captain)
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

DROP POLICY IF EXISTS "Events are viewable by authenticated users" ON public.events;
CREATE POLICY "Events are viewable by authenticated users"
  ON public.events FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Captains can manage events" ON public.events;
CREATE POLICY "Captains can manage events"
  ON public.events FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'captain'));

-- 6. Event Participants Table
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, profile_id)
);

ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Event participants are viewable by authenticated users" ON public.event_participants;
CREATE POLICY "Event participants are viewable by authenticated users"
  ON public.event_participants FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated non-trainee users can manage event registration" ON public.event_participants;
CREATE POLICY "Authenticated non-trainee users can manage event registration"
  ON public.event_participants FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role != 'trainee'));

-- 7. Research Docs Table (Viewable by Trainees; Created/edited by non-trainees)
CREATE TABLE IF NOT EXISTS public.research_docs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.research_docs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Research docs are viewable by authenticated users" ON public.research_docs;
CREATE POLICY "Research docs are viewable by authenticated users"
  ON public.research_docs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated non-trainees can create and manage research docs" ON public.research_docs;
CREATE POLICY "Authenticated non-trainees can create and manage research docs"
  ON public.research_docs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role != 'trainee'));

-- 8. Weekly Reports Table (Viewable by Trainees for Leaderboard rankings; Submitted by non-trainees; Rated by Captain)
CREATE TABLE IF NOT EXISTS public.weekly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_ending DATE NOT NULL,
  summary TEXT NOT NULL,
  accomplishments TEXT,
  blockers TEXT,
  next_steps TEXT,
  rating_stars INTEGER CHECK (rating_stars BETWEEN 1 AND 5),
  points INTEGER CHECK (points BETWEEN 2 AND 10),
  rated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rating_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, week_ending)
);

ALTER TABLE public.weekly_reports ADD COLUMN IF NOT EXISTS rating_stars INTEGER CHECK (rating_stars BETWEEN 1 AND 5);
ALTER TABLE public.weekly_reports ADD COLUMN IF NOT EXISTS points INTEGER CHECK (points BETWEEN 2 AND 10);
ALTER TABLE public.weekly_reports ADD COLUMN IF NOT EXISTS rated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.weekly_reports ADD COLUMN IF NOT EXISTS rating_feedback TEXT;
ALTER TABLE public.weekly_reports DROP CONSTRAINT IF EXISTS unique_weekly_report_per_user_week;
ALTER TABLE public.weekly_reports ADD CONSTRAINT unique_weekly_report_per_user_week UNIQUE (profile_id, week_ending);

ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Weekly reports are viewable by authenticated users" ON public.weekly_reports;
CREATE POLICY "Weekly reports are viewable by authenticated users"
  ON public.weekly_reports FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Non-trainee members can create own reports" ON public.weekly_reports;
CREATE POLICY "Non-trainee members can create own reports"
  ON public.weekly_reports FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = profile_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role != 'trainee')
  );

DROP POLICY IF EXISTS "Captains can rate weekly reports" ON public.weekly_reports;
CREATE POLICY "Captains can rate weekly reports"
  ON public.weekly_reports FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'captain'));

-- 9. Inventory Logs Table (Restricted for Trainees)
CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  returned_at TIMESTAMPTZ,
  notes TEXT,
  purpose TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.inventory_logs ADD COLUMN IF NOT EXISTS purpose TEXT;

ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Non-trainees can view inventory" ON public.inventory_logs;
CREATE POLICY "Non-trainees can view inventory"
  ON public.inventory_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role != 'trainee'));

DROP POLICY IF EXISTS "Non-trainees can manage inventory" ON public.inventory_logs;
CREATE POLICY "Non-trainees can manage inventory"
  ON public.inventory_logs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role != 'trainee'));

-- 10. Budget Items Table (Recorded Expenses; Edit/Delete strictly Captain-only)
CREATE TABLE IF NOT EXISTS public.budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  category TEXT NOT NULL DEFAULT 'Components',
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  purchased_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Non-trainees can view budget items" ON public.budget_items;
CREATE POLICY "Non-trainees can view budget items"
  ON public.budget_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role != 'trainee'));

DROP POLICY IF EXISTS "Team leads can insert budget items" ON public.budget_items;
CREATE POLICY "Team leads can insert budget items"
  ON public.budget_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('captain', 'vice_captain')));

DROP POLICY IF EXISTS "Captains exclusively can update or delete budget items" ON public.budget_items;
CREATE POLICY "Captains exclusively can update or delete budget items"
  ON public.budget_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'captain'));

-- 11. Budget Requests Table (Item Requests Queue)
CREATE TABLE IF NOT EXISTS public.budget_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requested_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  category TEXT NOT NULL DEFAULT 'Components',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  justification TEXT,
  link TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'ordered', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.budget_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Non-trainees can view budget requests" ON public.budget_requests;
CREATE POLICY "Non-trainees can view budget requests"
  ON public.budget_requests FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role != 'trainee'));

DROP POLICY IF EXISTS "Non-trainees can create budget requests" ON public.budget_requests;
CREATE POLICY "Non-trainees can create budget requests"
  ON public.budget_requests FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = requested_by AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role != 'trainee')
  );

DROP POLICY IF EXISTS "Captains and vice captains can manage budget requests" ON public.budget_requests;
CREATE POLICY "Captains and vice captains can manage budget requests"
  ON public.budget_requests FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('captain', 'vice_captain')));

-- 12. Learning Resources Table (Google Drive links, YouTube videos & docs)
CREATE TABLE IF NOT EXISTS public.learning_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('youtube', 'drive', 'link')),
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Trainee',
  added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Learning resources are viewable by authenticated users" ON public.learning_resources;
CREATE POLICY "Learning resources are viewable by authenticated users"
  ON public.learning_resources FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Captains and vice captains can manage learning resources" ON public.learning_resources;
CREATE POLICY "Captains and vice captains can manage learning resources"
  ON public.learning_resources FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('captain', 'vice_captain')));

-- 13. Auto Profile Signup Trigger
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
