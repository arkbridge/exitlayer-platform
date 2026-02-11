import { createClient } from '@supabase/supabase-js';
import { TriggerRule, WebhookEvent, Platform } from '@/types';

// Service client for backend operations
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface EventMatch {
  triggerRule: TriggerRule;
  organizationId: string;
}

export async function handleWebhookEvent(event: WebhookEvent): Promise<EventMatch[]> {
  const supabase = getServiceClient();

  // Find all trigger rules that match this event
  const { data: rules, error } = await supabase
    .from('trigger_rules')
    .select('*, skills(*)')
    .eq('trigger_type', 'event')
    .eq('trigger_source', `${event.platform}.${event.event_type}`)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching trigger rules:', error);
    return [];
  }

  // Filter rules by organization (if we know the org from the webhook)
  const matches: EventMatch[] = [];

  for (const rule of rules || []) {
    // Check if the organization has an active connection for this platform
    const { data: connection } = await supabase
      .from('connections')
      .select('id')
      .eq('organization_id', rule.organization_id)
      .eq('platform', event.platform)
      .eq('is_active', true)
      .single();

    if (connection) {
      // Apply any event filters from trigger_config
      if (matchesEventFilters(event, rule.trigger_config?.event_filters)) {
        matches.push({
          triggerRule: rule,
          organizationId: rule.organization_id,
        });
      }
    }
  }

  return matches;
}

function matchesEventFilters(
  event: WebhookEvent,
  filters?: Record<string, unknown>
): boolean {
  if (!filters || Object.keys(filters).length === 0) {
    return true;
  }

  // Simple filter matching - check if payload contains filter values
  for (const [key, value] of Object.entries(filters)) {
    const payloadValue = getNestedValue(event.payload, key);
    if (payloadValue !== value) {
      return false;
    }
  }

  return true;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

// Platform-specific event parsers
export function parseSlackEvent(body: unknown): WebhookEvent | null {
  const payload = body as Record<string, unknown>;

  // Handle Slack URL verification
  if (payload.type === 'url_verification') {
    return null;
  }

  // Handle event callbacks
  if (payload.type === 'event_callback') {
    const event = payload.event as Record<string, unknown>;
    const eventType = event.type as string;

    return {
      platform: 'slack',
      event_type: eventType,
      payload: event,
      organization_id: '', // Will be matched by team_id
      received_at: new Date().toISOString(),
    };
  }

  return null;
}

export function parseHubSpotEvent(body: unknown): WebhookEvent | null {
  const payloads = body as Array<Record<string, unknown>>;

  if (!Array.isArray(payloads) || payloads.length === 0) {
    return null;
  }

  // HubSpot sends an array of events, we'll process the first one
  const payload = payloads[0];
  const subscriptionType = payload.subscriptionType as string;

  // Map subscription types to event types
  const eventTypeMap: Record<string, string> = {
    'contact.creation': 'new_contact',
    'contact.propertyChange': 'contact_updated',
    'deal.creation': 'new_deal',
    'deal.propertyChange': 'deal_updated',
  };

  const eventType = eventTypeMap[subscriptionType] || subscriptionType;

  return {
    platform: 'hubspot',
    event_type: eventType,
    payload: payload,
    organization_id: '', // Will be matched by portal ID
    received_at: new Date().toISOString(),
  };
}

// Event type registry for UI
export const eventTypes: Record<Platform, { type: string; label: string; description: string }[]> = {
  slack: [
    { type: 'message', label: 'New Message', description: 'Triggered when a message is posted' },
    { type: 'reaction_added', label: 'Reaction Added', description: 'Triggered when a reaction is added' },
    { type: 'app_mention', label: 'App Mentioned', description: 'Triggered when your app is mentioned' },
  ],
  hubspot: [
    { type: 'new_contact', label: 'New Contact', description: 'Triggered when a contact is created' },
    { type: 'contact_updated', label: 'Contact Updated', description: 'Triggered when a contact is updated' },
    { type: 'new_deal', label: 'New Deal', description: 'Triggered when a deal is created' },
    { type: 'deal_updated', label: 'Deal Updated', description: 'Triggered when a deal stage changes' },
  ],
  gmail: [
    { type: 'email_received', label: 'Email Received', description: 'Triggered when an email is received' },
  ],
  pipedrive: [],
  outlook: [],
  asana: [
    { type: 'task_completed', label: 'Task Completed', description: 'Triggered when a task is completed' },
    { type: 'task_created', label: 'Task Created', description: 'Triggered when a task is created' },
  ],
  monday: [],
  notion: [],
  google_calendar: [
    { type: 'meeting_ended', label: 'Meeting Ended', description: 'Triggered when a calendar event ends' },
    { type: 'meeting_created', label: 'Meeting Created', description: 'Triggered when an event is created' },
  ],
};
