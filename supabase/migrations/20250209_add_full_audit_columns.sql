-- Migration: Add full audit columns to audit_sessions table
-- Run this in Supabase SQL Editor

-- Add columns for full audit functionality
ALTER TABLE audit_sessions
ADD COLUMN IF NOT EXISTS full_audit_data jsonb,
ADD COLUMN IF NOT EXISTS full_audit_status text DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS full_audit_current_question int DEFAULT 0,
ADD COLUMN IF NOT EXISTS full_audit_started_at timestamptz,
ADD COLUMN IF NOT EXISTS full_audit_completed_at timestamptz;

-- Add check constraint for full_audit_status
ALTER TABLE audit_sessions
ADD CONSTRAINT full_audit_status_check
CHECK (full_audit_status IN ('not_started', 'in_progress', 'completed'));

-- Add index for querying by full audit status
CREATE INDEX IF NOT EXISTS idx_audit_sessions_full_audit_status
ON audit_sessions(full_audit_status);

-- Add index for user_id lookups (for dashboard queries)
CREATE INDEX IF NOT EXISTS idx_audit_sessions_user_id
ON audit_sessions(user_id);

-- Comment on new columns
COMMENT ON COLUMN audit_sessions.full_audit_data IS 'JSONB storage for 74-question full audit responses';
COMMENT ON COLUMN audit_sessions.full_audit_status IS 'Status: not_started, in_progress, completed';
COMMENT ON COLUMN audit_sessions.full_audit_current_question IS 'Current question index for resume functionality';
COMMENT ON COLUMN audit_sessions.full_audit_started_at IS 'Timestamp when full audit was started';
COMMENT ON COLUMN audit_sessions.full_audit_completed_at IS 'Timestamp when full audit was completed';
