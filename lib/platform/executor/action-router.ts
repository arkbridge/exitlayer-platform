import { createClient } from '@supabase/supabase-js';
import { TriggerRule, Connection } from '@/types';
import { SlackConnector } from '@/lib/platform/connectors/slack';
import { GmailConnector } from '@/lib/platform/connectors/gmail';
import { HubSpotConnector } from '@/lib/platform/connectors/hubspot';

// Service client for backend operations
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface RouteResult {
  queued: boolean;
  action: string;
  destination?: string;
  error?: string;
}

export async function routeAction(
  organizationId: string,
  executionId: string,
  triggerRule: TriggerRule,
  output: string
): Promise<RouteResult> {
  const supabase = getServiceClient();

  // Check if this action requires approval
  if (triggerRule.action_type === 'approval') {
    // Queue for approval
    const { error } = await supabase.from('approval_queue').insert({
      organization_id: organizationId,
      execution_id: executionId,
      draft_content: output,
      destination: triggerRule.destination || 'display',
      destination_config: triggerRule.destination_config,
      status: 'pending',
    });

    if (error) {
      console.error('Failed to queue for approval:', error);
      return {
        queued: false,
        action: 'failed',
        error: 'Failed to queue for approval',
      };
    }

    return {
      queued: true,
      action: 'queued_for_approval',
      destination: triggerRule.destination,
    };
  }

  // Auto-execute
  if (triggerRule.destination) {
    try {
      await postToDestination(
        organizationId,
        triggerRule.destination,
        triggerRule.destination_config || {},
        output
      );

      return {
        queued: false,
        action: `posted_to_${triggerRule.destination}`,
        destination: triggerRule.destination,
      };
    } catch (error) {
      console.error('Failed to post to destination:', error);
      return {
        queued: false,
        action: 'post_failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  return {
    queued: false,
    action: 'completed',
  };
}

export async function postToDestination(
  organizationId: string,
  destination: string,
  config: Record<string, unknown>,
  content: string
): Promise<void> {
  const supabase = getServiceClient();

  // Parse destination (format: platform.action)
  const [platform, action] = destination.split('.');

  // Get the connection
  const { data: connection, error } = await supabase
    .from('connections')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('platform', platform)
    .eq('is_active', true)
    .single();

  if (error || !connection) {
    throw new Error(`No active ${platform} connection found`);
  }

  switch (platform) {
    case 'slack':
      await postToSlack(connection as Connection, action, config, content);
      break;

    case 'gmail':
      await postToGmail(connection as Connection, action, config, content);
      break;

    case 'hubspot':
      await postToHubSpot(connection as Connection, action, config, content);
      break;

    default:
      throw new Error(`Unsupported destination platform: ${platform}`);
  }
}

async function postToSlack(
  connection: Connection,
  action: string,
  config: Record<string, unknown>,
  content: string
): Promise<void> {
  const connector = new SlackConnector(connection);

  switch (action) {
    case 'post':
    case 'post_message':
      const channelId = config.channel_id as string;
      if (!channelId) {
        throw new Error('Slack channel_id not configured');
      }
      await connector.postMessage(channelId, content, config.thread_ts as string | undefined);
      break;

    default:
      throw new Error(`Unsupported Slack action: ${action}`);
  }
}

async function postToGmail(
  connection: Connection,
  action: string,
  config: Record<string, unknown>,
  content: string
): Promise<void> {
  const connector = new GmailConnector(connection);

  switch (action) {
    case 'send':
    case 'send_email':
      const to = config.to as string;
      const subject = config.subject as string || 'Message from Exit Layer';
      if (!to) {
        throw new Error('Email recipient (to) not configured');
      }
      await connector.sendEmail(to, subject, content);
      break;

    case 'draft':
    case 'create_draft':
      const draftTo = config.to as string;
      const draftSubject = config.subject as string || 'Draft from Exit Layer';
      if (!draftTo) {
        throw new Error('Email recipient (to) not configured');
      }
      await connector.createDraft(draftTo, draftSubject, content);
      break;

    default:
      throw new Error(`Unsupported Gmail action: ${action}`);
  }
}

async function postToHubSpot(
  connection: Connection,
  action: string,
  config: Record<string, unknown>,
  content: string
): Promise<void> {
  const connector = new HubSpotConnector(connection);

  switch (action) {
    case 'note':
    case 'create_note':
      const contactId = config.contact_id as string;
      if (!contactId) {
        throw new Error('HubSpot contact_id not configured');
      }
      await connector.createNote(contactId, content);
      break;

    case 'task':
    case 'create_task':
      const taskContactId = config.contact_id as string;
      if (!taskContactId) {
        throw new Error('HubSpot contact_id not configured');
      }
      await connector.createTask(taskContactId, content);
      break;

    default:
      throw new Error(`Unsupported HubSpot action: ${action}`);
  }
}

// Process approval (when user approves from queue)
export async function processApproval(
  approvalId: string,
  userId: string,
  action: 'approve' | 'reject' | 'edit',
  editedContent?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getServiceClient();

  // Get the approval item
  const { data: approval, error: fetchError } = await supabase
    .from('approval_queue')
    .select('*, executions(*)')
    .eq('id', approvalId)
    .single();

  if (fetchError || !approval) {
    return { success: false, error: 'Approval item not found' };
  }

  if (approval.status !== 'pending') {
    return { success: false, error: 'This item has already been processed' };
  }

  if (action === 'reject') {
    // Update approval status
    await supabase
      .from('approval_queue')
      .update({
        status: 'rejected',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', approvalId);

    // Update execution status
    await supabase
      .from('executions')
      .update({
        status: 'rejected',
        completed_at: new Date().toISOString(),
      })
      .eq('id', approval.execution_id);

    return { success: true };
  }

  // Approve or Edit (then approve)
  const finalContent = action === 'edit' && editedContent ? editedContent : approval.draft_content;

  try {
    // Post to destination
    if (approval.destination && approval.destination !== 'display') {
      await postToDestination(
        approval.organization_id,
        approval.destination,
        approval.destination_config || {},
        finalContent
      );
    }

    // Update approval status
    await supabase
      .from('approval_queue')
      .update({
        status: action === 'edit' ? 'edited' : 'approved',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        final_content: action === 'edit' ? editedContent : null,
      })
      .eq('id', approvalId);

    // Update execution status
    await supabase
      .from('executions')
      .update({
        status: 'approved',
        action_taken: `posted_to_${approval.destination}`,
        completed_at: new Date().toISOString(),
      })
      .eq('id', approval.execution_id);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to post to destination',
    };
  }
}

// Destination options for UI
export const destinationOptions = [
  {
    platform: 'slack',
    actions: [
      { value: 'slack.post', label: 'Post to Slack channel' },
    ],
    configFields: [
      { key: 'channel_id', label: 'Channel', type: 'select' },
    ],
  },
  {
    platform: 'gmail',
    actions: [
      { value: 'gmail.send', label: 'Send email' },
      { value: 'gmail.draft', label: 'Create draft' },
    ],
    configFields: [
      { key: 'to', label: 'Recipient', type: 'text' },
      { key: 'subject', label: 'Subject', type: 'text' },
    ],
  },
  {
    platform: 'hubspot',
    actions: [
      { value: 'hubspot.note', label: 'Add CRM note' },
      { value: 'hubspot.task', label: 'Create CRM task' },
    ],
    configFields: [
      { key: 'contact_id', label: 'Contact', type: 'select' },
    ],
  },
] as const;
