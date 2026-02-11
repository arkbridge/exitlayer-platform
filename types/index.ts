// Core types for Exit Layer platform

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Connection {
  id: string;
  organization_id: string;
  platform: Platform;
  access_token_encrypted: string;
  refresh_token_encrypted?: string;
  token_expires_at?: string;
  scopes?: string[];
  metadata?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export interface ApiKey {
  id: string;
  organization_id: string;
  encrypted_key: string;
  key_preview?: string;
  created_at: string;
}

export interface Skill {
  id: string;
  organization_id: string;
  slug: string;
  name: string;
  description?: string;
  system_prompt: string;
  config: SkillConfig;
  is_active: boolean;
  created_at: string;
}

export interface SkillConfig {
  model?: string;
  max_tokens?: number;
  temperature?: number;
  required_context?: ContextSource[];
}

export interface TriggerRule {
  id: string;
  organization_id: string;
  name: string;
  trigger_type: 'event' | 'condition';
  trigger_source: string;
  trigger_config?: TriggerConfig;
  skill_id: string;
  action_type: 'auto' | 'approval';
  destination?: string;
  destination_config?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export interface TriggerConfig {
  cron_expression?: string;
  conditions?: TriggerCondition[];
  event_filters?: Record<string, unknown>;
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value?: string | number | boolean;
}

export interface Execution {
  id: string;
  organization_id: string;
  trigger_rule_id?: string;
  skill_id: string;
  trigger_event?: Record<string, unknown>;
  context_gathered?: Record<string, unknown>;
  skill_input?: Record<string, unknown>;
  skill_output?: string;
  status: ExecutionStatus;
  action_taken?: string;
  error?: string;
  tokens_used?: number;
  created_at: string;
  completed_at?: string;
}

export type ExecutionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'awaiting_approval'
  | 'approved'
  | 'rejected';

export interface ApprovalQueueItem {
  id: string;
  organization_id: string;
  execution_id: string;
  draft_content: string;
  destination: string;
  destination_config?: Record<string, unknown>;
  status: ApprovalStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  final_content?: string;
  created_at: string;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'edited';

// Platform types
export type Platform =
  | 'slack'
  | 'hubspot'
  | 'pipedrive'
  | 'gmail'
  | 'outlook'
  | 'asana'
  | 'monday'
  | 'notion'
  | 'google_calendar';

export type ContextSource =
  | 'crm_contact'
  | 'crm_deal'
  | 'crm_activities'
  | 'email_thread'
  | 'slack_thread'
  | 'calendar_event'
  | 'pm_tasks';

// Event types for webhooks
export interface WebhookEvent {
  platform: Platform;
  event_type: string;
  payload: Record<string, unknown>;
  organization_id: string;
  received_at: string;
}

// Connector interface
export interface ConnectorConfig {
  platform: Platform;
  name: string;
  description: string;
  icon: string;
  oauth_config: {
    authorization_url: string;
    token_url: string;
    scopes: string[];
  };
  capabilities: {
    read: string[];
    write: string[];
  };
}

// Action routing
export interface ActionRoute {
  destination: string;
  action_type: 'auto' | 'approval';
  payload: Record<string, unknown>;
}

// User session type
export interface UserSession {
  user: {
    id: string;
    email: string;
  };
  organization: Organization;
}
