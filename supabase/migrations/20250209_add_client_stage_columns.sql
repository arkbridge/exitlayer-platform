-- Migration: Add client stage and sprint data columns to audit_sessions table
-- Run this in Supabase SQL Editor

-- Add client_stage column for tracking journey stage
ALTER TABLE audit_sessions
ADD COLUMN IF NOT EXISTS client_stage text DEFAULT 'new';

-- Add sprint_data column for build tracking
ALTER TABLE audit_sessions
ADD COLUMN IF NOT EXISTS sprint_data jsonb;

-- Add check constraint for client_stage
ALTER TABLE audit_sessions
ADD CONSTRAINT client_stage_check
CHECK (client_stage IN ('new', 'in_audit', 'docs_needed', 'ready', 'building', 'complete'));

-- Add index for querying by client stage
CREATE INDEX IF NOT EXISTS idx_audit_sessions_client_stage
ON audit_sessions(client_stage);

-- Comment on new columns
COMMENT ON COLUMN audit_sessions.client_stage IS 'Client journey stage: new, in_audit, docs_needed, ready, building, complete';
COMMENT ON COLUMN audit_sessions.sprint_data IS 'JSONB storage for sprint tracking: { week: number, systems: string[], hoursReclaimed: number, milestones: object[], status: string }';
