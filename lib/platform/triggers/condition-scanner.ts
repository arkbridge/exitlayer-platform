import { createClient } from '@supabase/supabase-js';
import { TriggerRule, TriggerCondition } from '@/types';
import { getConnector } from '@/lib/platform/connectors';

// Service client for backend operations
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface ConditionMatch {
  triggerRule: TriggerRule;
  organizationId: string;
  matchedData: Record<string, unknown>;
}

export async function scanConditions(): Promise<ConditionMatch[]> {
  const supabase = getServiceClient();
  const matches: ConditionMatch[] = [];

  // Get all active condition-based trigger rules
  const { data: rules, error } = await supabase
    .from('trigger_rules')
    .select('*, skills(*)')
    .eq('trigger_type', 'condition')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching condition rules:', error);
    return [];
  }

  for (const rule of rules || []) {
    try {
      const match = await evaluateConditionRule(rule);
      if (match) {
        matches.push(match);
      }
    } catch (err) {
      console.error(`Error evaluating rule ${rule.id}:`, err);
    }
  }

  return matches;
}

async function evaluateConditionRule(rule: TriggerRule): Promise<ConditionMatch | null> {
  const supabase = getServiceClient();
  const triggerConfig = rule.trigger_config;

  if (!triggerConfig?.conditions || triggerConfig.conditions.length === 0) {
    return null;
  }

  // Parse the trigger source to determine what to check
  // Format: platform.check_type (e.g., "crm.inactive_contacts")
  const [platform, checkType] = rule.trigger_source.split('.');

  // Get the connection for this platform
  const { data: connection } = await supabase
    .from('connections')
    .select('*')
    .eq('organization_id', rule.organization_id)
    .eq('platform', platform)
    .eq('is_active', true)
    .single();

  if (!connection) {
    return null;
  }

  // Evaluate based on check type
  let matchedData: Record<string, unknown> | null = null;

  switch (checkType) {
    case 'inactive_contacts':
      matchedData = await checkInactiveContacts(connection, triggerConfig.conditions);
      break;
    case 'deals_stuck':
      matchedData = await checkStuckDeals(connection, triggerConfig.conditions);
      break;
    case 'pending_tasks':
      matchedData = await checkPendingTasks(connection, triggerConfig.conditions);
      break;
    default:
      console.warn(`Unknown check type: ${checkType}`);
      return null;
  }

  if (matchedData) {
    return {
      triggerRule: rule,
      organizationId: rule.organization_id,
      matchedData,
    };
  }

  return null;
}

async function checkInactiveContacts(
  connection: { id: string; organization_id: string; platform: string; access_token_encrypted: string; refresh_token_encrypted?: string; token_expires_at?: string; scopes?: string[]; metadata?: Record<string, unknown>; is_active: boolean; created_at: string },
  conditions: TriggerCondition[]
): Promise<Record<string, unknown> | null> {
  // This would use the HubSpot connector to check for contacts with no activity
  // For now, return null - implementation depends on specific platform
  const inactiveDaysCondition = conditions.find(c => c.field === 'days_inactive');
  const inactiveDays = inactiveDaysCondition?.value as number || 30;

  // Would call HubSpot API to find contacts with last activity > inactiveDays
  // Placeholder for actual implementation
  console.log(`Checking for contacts inactive for ${inactiveDays} days`);

  return null;
}

async function checkStuckDeals(
  connection: { id: string; organization_id: string; platform: string; access_token_encrypted: string; refresh_token_encrypted?: string; token_expires_at?: string; scopes?: string[]; metadata?: Record<string, unknown>; is_active: boolean; created_at: string },
  conditions: TriggerCondition[]
): Promise<Record<string, unknown> | null> {
  // Check for deals stuck in a stage for too long
  const stuckDaysCondition = conditions.find(c => c.field === 'days_in_stage');
  const stuckDays = stuckDaysCondition?.value as number || 14;

  console.log(`Checking for deals stuck for ${stuckDays} days`);

  return null;
}

async function checkPendingTasks(
  connection: { id: string; organization_id: string; platform: string; access_token_encrypted: string; refresh_token_encrypted?: string; token_expires_at?: string; scopes?: string[]; metadata?: Record<string, unknown>; is_active: boolean; created_at: string },
  conditions: TriggerCondition[]
): Promise<Record<string, unknown> | null> {
  // Check for overdue tasks
  console.log('Checking for pending/overdue tasks');

  return null;
}

// Cron expression parser for scheduling
export function parseCronExpression(expression: string): { isMatch: boolean; nextRun: Date } {
  // Simple cron parser for common patterns
  // Format: minute hour day-of-month month day-of-week

  const now = new Date();
  const [minute, hour, dayOfMonth, month, dayOfWeek] = expression.split(' ');

  // Check if current time matches
  const isMatch =
    matchesCronField(minute, now.getMinutes()) &&
    matchesCronField(hour, now.getHours()) &&
    matchesCronField(dayOfMonth, now.getDate()) &&
    matchesCronField(month, now.getMonth() + 1) &&
    matchesCronField(dayOfWeek, now.getDay());

  // Calculate next run (simplified)
  const nextRun = new Date(now);
  if (!isMatch) {
    // Advance to next match (simplified - just add 1 hour for now)
    nextRun.setHours(nextRun.getHours() + 1);
    nextRun.setMinutes(0);
  }

  return { isMatch, nextRun };
}

function matchesCronField(field: string, value: number): boolean {
  if (field === '*') return true;

  // Handle ranges (e.g., "1-5")
  if (field.includes('-')) {
    const [start, end] = field.split('-').map(Number);
    return value >= start && value <= end;
  }

  // Handle lists (e.g., "1,3,5")
  if (field.includes(',')) {
    return field.split(',').map(Number).includes(value);
  }

  // Handle step values (e.g., "*/5")
  if (field.includes('/')) {
    const [, step] = field.split('/');
    return value % Number(step) === 0;
  }

  // Direct match
  return Number(field) === value;
}

// Predefined condition templates for UI
export const conditionTemplates = [
  {
    id: 'inactive_contacts',
    name: 'Inactive Contacts',
    description: 'Contacts with no activity for X days',
    platform: 'hubspot',
    source: 'crm.inactive_contacts',
    defaultConditions: [
      { field: 'days_inactive', operator: 'greater_than', value: 30 },
    ],
  },
  {
    id: 'deals_stuck',
    name: 'Stuck Deals',
    description: 'Deals in same stage for X days',
    platform: 'hubspot',
    source: 'crm.deals_stuck',
    defaultConditions: [
      { field: 'days_in_stage', operator: 'greater_than', value: 14 },
    ],
  },
  {
    id: 'weekly_report',
    name: 'Weekly Report',
    description: 'Runs every Monday at 9am',
    platform: 'system',
    source: 'cron.weekly',
    cron: '0 9 * * 1',
  },
  {
    id: 'daily_digest',
    name: 'Daily Digest',
    description: 'Runs every day at 9am',
    platform: 'system',
    source: 'cron.daily',
    cron: '0 9 * * *',
  },
] as const;
