import { createClient } from '@supabase/supabase-js';
import { ContextSource, Connection } from '@/types';
import { getConnector } from '@/lib/platform/connectors';
import { SlackConnector } from '@/lib/platform/connectors/slack';
import { HubSpotConnector } from '@/lib/platform/connectors/hubspot';
import { GmailConnector } from '@/lib/platform/connectors/gmail';

// Service client for backend operations
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function gatherContext(
  organizationId: string,
  requiredContext: ContextSource[],
  triggerEvent: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const supabase = getServiceClient();
  const context: Record<string, unknown> = {};

  // Get all active connections for the organization
  const { data: connections } = await supabase
    .from('connections')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true);

  if (!connections || connections.length === 0) {
    return context;
  }

  // Create a map of platform to connection
  const connectionMap = new Map<string, Connection>();
  for (const conn of connections) {
    connectionMap.set(conn.platform, conn as Connection);
  }

  // Gather each required context type
  for (const contextType of requiredContext) {
    try {
      const gathered = await gatherContextByType(
        contextType,
        connectionMap,
        triggerEvent
      );
      if (gathered) {
        context[contextType] = gathered;
      }
    } catch (error) {
      console.error(`Failed to gather context ${contextType}:`, error);
      context[`${contextType}_error`] = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  return context;
}

async function gatherContextByType(
  contextType: ContextSource,
  connections: Map<string, Connection>,
  triggerEvent: Record<string, unknown>
): Promise<Record<string, unknown> | null> {
  switch (contextType) {
    case 'crm_contact':
      return gatherCRMContact(connections, triggerEvent);

    case 'crm_deal':
      return gatherCRMDeal(connections, triggerEvent);

    case 'crm_activities':
      return gatherCRMActivities(connections, triggerEvent);

    case 'email_thread':
      return gatherEmailThread(connections, triggerEvent);

    case 'slack_thread':
      return gatherSlackThread(connections, triggerEvent);

    case 'calendar_event':
      return gatherCalendarEvent(connections, triggerEvent);

    case 'pm_tasks':
      return gatherPMTasks(connections, triggerEvent);

    default:
      console.warn(`Unknown context type: ${contextType}`);
      return null;
  }
}

async function gatherCRMContact(
  connections: Map<string, Connection>,
  triggerEvent: Record<string, unknown>
): Promise<Record<string, unknown> | null> {
  // Try HubSpot first, then Pipedrive
  const hubspotConn = connections.get('hubspot');

  if (hubspotConn) {
    const connector = new HubSpotConnector(hubspotConn);

    // Extract contact ID from trigger event
    const contactId = extractId(triggerEvent, ['contactId', 'contact_id', 'objectId', 'vid']);

    if (contactId) {
      const contact = await connector.getContact(contactId);
      return { contact, source: 'hubspot' };
    }

    // If no specific contact, get recent contacts
    const contacts = await connector.getContacts(10);
    return { contacts, source: 'hubspot' };
  }

  return null;
}

async function gatherCRMDeal(
  connections: Map<string, Connection>,
  triggerEvent: Record<string, unknown>
): Promise<Record<string, unknown> | null> {
  const hubspotConn = connections.get('hubspot');

  if (hubspotConn) {
    const connector = new HubSpotConnector(hubspotConn);

    const dealId = extractId(triggerEvent, ['dealId', 'deal_id', 'objectId']);

    if (dealId) {
      const deal = await connector.getDeal(dealId);
      return { deal, source: 'hubspot' };
    }

    const deals = await connector.getDeals(10);
    return { deals, source: 'hubspot' };
  }

  return null;
}

async function gatherCRMActivities(
  connections: Map<string, Connection>,
  triggerEvent: Record<string, unknown>
): Promise<Record<string, unknown> | null> {
  const hubspotConn = connections.get('hubspot');

  if (hubspotConn) {
    const connector = new HubSpotConnector(hubspotConn);

    const contactId = extractId(triggerEvent, ['contactId', 'contact_id', 'objectId', 'vid']);

    if (contactId) {
      // Get contact with deals (as proxy for activities)
      const contact = await connector.getContact(contactId);
      const deals = await connector.getContactDeals(contactId);
      return { contact, deals, source: 'hubspot' };
    }
  }

  return null;
}

async function gatherEmailThread(
  connections: Map<string, Connection>,
  triggerEvent: Record<string, unknown>
): Promise<Record<string, unknown> | null> {
  const gmailConn = connections.get('gmail');

  if (gmailConn) {
    const connector = new GmailConnector(gmailConn);

    const threadId = extractId(triggerEvent, ['threadId', 'thread_id']);

    if (threadId) {
      return connector.gatherContext({ threadId });
    }

    // Get recent emails
    const emails = await connector.getRecentEmails(5);
    return {
      recent_emails: emails.map(e => connector.extractEmailContent(e)),
      source: 'gmail',
    };
  }

  return null;
}

async function gatherSlackThread(
  connections: Map<string, Connection>,
  triggerEvent: Record<string, unknown>
): Promise<Record<string, unknown> | null> {
  const slackConn = connections.get('slack');

  if (slackConn) {
    const connector = new SlackConnector(slackConn);

    const channelId = extractId(triggerEvent, ['channel', 'channel_id']);
    const threadTs = extractId(triggerEvent, ['thread_ts', 'ts']);

    if (channelId) {
      return connector.gatherContext({
        channelId,
        threadTs: threadTs || undefined,
        messageCount: 20,
      });
    }
  }

  return null;
}

async function gatherCalendarEvent(
  connections: Map<string, Connection>,
  triggerEvent: Record<string, unknown>
): Promise<Record<string, unknown> | null> {
  // Calendar integration would go here
  // For now, return event details from trigger
  const eventDetails = {
    title: triggerEvent.summary || triggerEvent.title,
    start: triggerEvent.start,
    end: triggerEvent.end,
    attendees: triggerEvent.attendees,
    description: triggerEvent.description,
  };

  return { event: eventDetails, source: 'trigger_event' };
}

async function gatherPMTasks(
  connections: Map<string, Connection>,
  triggerEvent: Record<string, unknown>
): Promise<Record<string, unknown> | null> {
  // Asana/Monday integration would go here
  // Placeholder for now
  return null;
}

// Helper to extract IDs from nested trigger events
function extractId(
  obj: Record<string, unknown>,
  possibleKeys: string[]
): string | null {
  for (const key of possibleKeys) {
    // Check top level
    if (obj[key] && typeof obj[key] === 'string') {
      return obj[key] as string;
    }

    // Check nested in common structures
    const nested = obj.payload || obj.event || obj.data || obj.properties;
    if (nested && typeof nested === 'object' && (nested as Record<string, unknown>)[key]) {
      return (nested as Record<string, unknown>)[key] as string;
    }
  }

  return null;
}

// Context summary for display
export function summarizeContext(context: Record<string, unknown>): string {
  const parts: string[] = [];

  if (context.crm_contact) {
    parts.push('CRM Contact data');
  }
  if (context.crm_deal) {
    parts.push('CRM Deal data');
  }
  if (context.email_thread) {
    parts.push('Email thread');
  }
  if (context.slack_thread) {
    parts.push('Slack conversation');
  }
  if (context.calendar_event) {
    parts.push('Calendar event');
  }
  if (context.pm_tasks) {
    parts.push('Project tasks');
  }

  return parts.length > 0 ? parts.join(', ') : 'No additional context';
}
