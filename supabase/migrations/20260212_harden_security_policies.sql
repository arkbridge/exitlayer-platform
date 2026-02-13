-- Migration: Harden profile and audit session policies
-- Date: 2026-02-12

-- ============================================
-- Profiles: prevent privilege escalation
-- ============================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
END $$;

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

-- ============================================
-- Audit sessions: remove anonymous broad read/write
-- ============================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "audit_sessions_select" ON public.audit_sessions;
  DROP POLICY IF EXISTS "audit_sessions_insert" ON public.audit_sessions;
  DROP POLICY IF EXISTS "audit_sessions_update" ON public.audit_sessions;
END $$;

CREATE POLICY "audit_sessions_select" ON public.audit_sessions FOR SELECT
  USING (
    user_id = auth.uid()
    OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "audit_sessions_insert" ON public.audit_sessions FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "audit_sessions_update" ON public.audit_sessions FOR UPDATE
  USING (
    user_id = auth.uid()
    OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid()
    OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );
