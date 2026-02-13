-- ExitLayer SaaS Platform - Supabase Schema
-- Run this in the Supabase SQL Editor

-- ============================================
-- TABLES
-- ============================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  -- Whop payment fields
  whop_user_id TEXT UNIQUE,
  whop_membership_id TEXT,
  access_tier TEXT DEFAULT 'free',  -- 'free' = quiz only, 'paid' = full platform
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions (questionnaire responses and analysis)
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  questionnaire_data JSONB NOT NULL,
  overall_score INTEGER,
  dimension_scores JSONB,
  analysis JSONB,
  recommendations JSONB,
  financial_metrics JSONB,
  call_prep JSONB,
  diagnostic_report TEXT,
  build_plan TEXT,
  system_spec JSONB,
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline stages (track client journey)
CREATE TABLE public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client assets (uploaded files)
CREATE TABLE public.client_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  category TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin notes (internal notes on clients)
CREATE TABLE public.admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  note_type TEXT,
  content TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit sessions (anonymous quiz progress + generated content)
CREATE TABLE public.audit_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE,
  full_name TEXT,
  company_name TEXT,
  email TEXT,
  score_data JSONB,
  form_data JSONB,
  overall_score INTEGER,
  client_folder TEXT,
  status TEXT DEFAULT 'in_progress',
  full_audit_status TEXT DEFAULT 'not_started',
  full_audit_data JSONB,
  full_audit_current_question INTEGER DEFAULT 0,
  full_audit_started_at TIMESTAMPTZ,
  full_audit_completed_at TIMESTAMPTZ,
  client_stage TEXT DEFAULT 'new',
  sprint_data JSONB,
  documents_uploaded TEXT[],
  -- Generated content (replaces filesystem writes)
  generated_content JSONB,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys (for Skills Platform integrations)
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_preview TEXT NOT NULL,
  scopes TEXT[] DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile on signup (admin for michael@exitlayer.io)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (
    new.id,
    new.email,
    new.email = 'michael@exitlayer.io'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users see own, admins see all
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_admin = (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid())
    AND access_tier = (SELECT p.access_tier FROM public.profiles p WHERE p.id = auth.uid())
    AND whop_membership_id IS NOT DISTINCT FROM (SELECT p.whop_membership_id FROM public.profiles p WHERE p.id = auth.uid())
    AND paid_at IS NOT DISTINCT FROM (SELECT p.paid_at FROM public.profiles p WHERE p.id = auth.uid())
    AND (
      (SELECT p.whop_user_id FROM public.profiles p WHERE p.id = auth.uid()) IS NULL
      OR whop_user_id = (SELECT p.whop_user_id FROM public.profiles p WHERE p.id = auth.uid())
    )
  );

-- Submissions: Users see own, admins see all
CREATE POLICY "submissions_select" ON public.submissions FOR SELECT
  USING (user_id = auth.uid() OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "submissions_insert" ON public.submissions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "submissions_update" ON public.submissions FOR UPDATE
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Pipeline stages: Users see own submissions, admins see all and can manage
CREATE POLICY "pipeline_select" ON public.pipeline_stages FOR SELECT
  USING (
    submission_id IN (SELECT id FROM public.submissions WHERE user_id = auth.uid())
    OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "pipeline_insert" ON public.pipeline_stages FOR INSERT
  WITH CHECK ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "pipeline_update" ON public.pipeline_stages FOR UPDATE
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Client assets: Users manage own, admins see all
CREATE POLICY "assets_select" ON public.client_assets FOR SELECT
  USING (user_id = auth.uid() OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "assets_insert" ON public.client_assets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "assets_delete" ON public.client_assets FOR DELETE
  USING (user_id = auth.uid());

-- Admin notes: Admin only
CREATE POLICY "notes_select" ON public.admin_notes FOR SELECT
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "notes_insert" ON public.admin_notes FOR INSERT
  WITH CHECK ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "notes_update" ON public.admin_notes FOR UPDATE
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "notes_delete" ON public.admin_notes FOR DELETE
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Audit sessions: Users see own, anonymous sessions visible, admins see all
CREATE POLICY "audit_sessions_select" ON public.audit_sessions FOR SELECT
  USING (user_id = auth.uid() OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "audit_sessions_insert" ON public.audit_sessions FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "audit_sessions_update" ON public.audit_sessions FOR UPDATE
  USING (user_id = auth.uid() OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (user_id = auth.uid() OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- ============================================
-- STORAGE
-- ============================================

-- Create storage bucket for client assets
INSERT INTO storage.buckets (id, name, public) VALUES ('client-assets', 'client-assets', false);

-- Storage policies
CREATE POLICY "storage_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'client-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "storage_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'client-assets' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  ));

CREATE POLICY "storage_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'client-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

-- API Keys: Org members see own org, admins see all
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_keys_select" ON public.api_keys FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid())
    OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "api_keys_insert" ON public.api_keys FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid())
  );

CREATE POLICY "api_keys_delete" ON public.api_keys FOR DELETE
  USING (
    organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid() AND role = 'owner')
  );

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submissions_created_at ON public.submissions(created_at DESC);
CREATE INDEX idx_pipeline_submission_id ON public.pipeline_stages(submission_id);
CREATE INDEX idx_assets_submission_id ON public.client_assets(submission_id);
CREATE INDEX idx_assets_user_id ON public.client_assets(user_id);
CREATE INDEX idx_notes_submission_id ON public.admin_notes(submission_id);
CREATE INDEX idx_audit_sessions_user_id ON public.audit_sessions(user_id);
CREATE INDEX idx_audit_sessions_token ON public.audit_sessions(session_token);
CREATE INDEX idx_audit_sessions_email ON public.audit_sessions(email);
CREATE INDEX idx_profiles_whop_user_id ON public.profiles(whop_user_id);
CREATE INDEX idx_api_keys_org_id ON public.api_keys(organization_id);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
