-- ExitLayer Platform - Migration Script
-- Run this on existing databases to add new columns/tables
-- Safe to run multiple times (uses IF NOT EXISTS / IF NOT EXISTS patterns)

-- ============================================
-- 1. Add audit_sessions table (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_sessions (
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
  generated_content JSONB,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add generated_content column if audit_sessions already exists
ALTER TABLE public.audit_sessions ADD COLUMN IF NOT EXISTS generated_content JSONB;

-- ============================================
-- 2. Add Whop payment fields to profiles
-- ============================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whop_user_id TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whop_membership_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS access_tier TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- ============================================
-- 3. Add extra submission columns
-- ============================================
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS skills_catalog JSONB;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS analytics_data JSONB;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS call_prep_markdown TEXT;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS diagnostic_report_markdown TEXT;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS build_plan_markdown TEXT;

-- ============================================
-- 4. RLS for audit_sessions
-- ============================================
ALTER TABLE public.audit_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
DO $$ BEGIN
  DROP POLICY IF EXISTS "audit_sessions_select" ON public.audit_sessions;
  DROP POLICY IF EXISTS "audit_sessions_insert" ON public.audit_sessions;
  DROP POLICY IF EXISTS "audit_sessions_update" ON public.audit_sessions;
END $$;

CREATE POLICY "audit_sessions_select" ON public.audit_sessions FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "audit_sessions_insert" ON public.audit_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "audit_sessions_update" ON public.audit_sessions FOR UPDATE
  USING (user_id = auth.uid() OR user_id IS NULL);

-- ============================================
-- 5. Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_audit_sessions_user_id ON public.audit_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_sessions_token ON public.audit_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_audit_sessions_email ON public.audit_sessions(email);
CREATE INDEX IF NOT EXISTS idx_profiles_whop_user_id ON public.profiles(whop_user_id);

-- ============================================
-- 6. API Keys table for Skills Platform
-- ============================================
CREATE TABLE IF NOT EXISTS public.api_keys (
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

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "api_keys_select" ON public.api_keys;
  DROP POLICY IF EXISTS "api_keys_insert" ON public.api_keys;
  DROP POLICY IF EXISTS "api_keys_delete" ON public.api_keys;
END $$;

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

CREATE INDEX IF NOT EXISTS idx_api_keys_org_id ON public.api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);

-- ============================================
-- 7. Backfill: Create submissions for users who already signed up
-- (audit_sessions with status 'account_created' but no matching submission)
-- ============================================
INSERT INTO public.submissions (
  user_id, questionnaire_data, overall_score, dimension_scores,
  financial_metrics, call_prep, diagnostic_report, build_plan,
  system_spec, status
)
SELECT
  a.user_id,
  COALESCE(a.form_data, '{}'::jsonb),
  a.overall_score,
  a.score_data->'dimensions',
  a.score_data->'financialMetrics',
  a.generated_content->'callPrep',
  a.generated_content->>'diagnosticReport',
  a.generated_content->>'buildPlan',
  a.generated_content->'systemSpec',
  'submitted'
FROM public.audit_sessions a
WHERE a.user_id IS NOT NULL
  AND a.status = 'account_created'
  AND NOT EXISTS (
    SELECT 1 FROM public.submissions s WHERE s.user_id = a.user_id
  );
