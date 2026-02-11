import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { Skill } from '@/types';
import { decrypt } from '@/lib/platform/encryption';

// Service client for backend operations
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface SkillExecutionResult {
  output: string;
  tokensUsed: number;
}

export async function executeSkill(
  organizationId: string,
  skill: Skill,
  input: Record<string, unknown>
): Promise<SkillExecutionResult> {
  const supabase = getServiceClient();

  // Get the organization's API key
  const { data: apiKeyRecord, error } = await supabase
    .from('api_keys')
    .select('encrypted_key')
    .eq('organization_id', organizationId)
    .single();

  if (error || !apiKeyRecord) {
    throw new Error('Anthropic API key not configured. Please add your API key in settings.');
  }

  // Decrypt the API key
  const apiKey = decrypt(apiKeyRecord.encrypted_key);

  // Initialize Anthropic client with customer's key
  const anthropic = new Anthropic({ apiKey });

  // Build the user message with context
  const userMessage = buildUserMessage(input);

  // Get model from skill config or default
  const model = skill.config?.model || 'claude-sonnet-4-20250514';
  const maxTokens = skill.config?.max_tokens || 1024;
  const temperature = skill.config?.temperature || 0.7;

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: skill.system_prompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    // Extract text from response
    const output = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    // Calculate tokens used
    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    return { output, tokensUsed };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Claude API error: ${error.message}`);
    }
    throw error;
  }
}

function buildUserMessage(input: Record<string, unknown>): string {
  const parts: string[] = [];

  // Add trigger event info
  if (input.trigger_event) {
    parts.push('## Trigger Event');
    parts.push(formatObject(input.trigger_event as Record<string, unknown>));
  }

  // Add manual input
  if (input.manual_input) {
    parts.push('## Input');
    parts.push(formatObject(input.manual_input as Record<string, unknown>));
  }

  // Add gathered context
  if (input.context && Object.keys(input.context as object).length > 0) {
    parts.push('## Context');

    const context = input.context as Record<string, unknown>;

    for (const [key, value] of Object.entries(context)) {
      if (key.endsWith('_error')) continue; // Skip error entries

      parts.push(`### ${formatContextKey(key)}`);
      parts.push(formatContextValue(value));
    }
  }

  return parts.join('\n\n');
}

function formatObject(obj: Record<string, unknown>, indent = 0): string {
  const prefix = '  '.repeat(indent);
  const lines: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'object' && !Array.isArray(value)) {
      lines.push(`${prefix}**${formatKey(key)}:**`);
      lines.push(formatObject(value as Record<string, unknown>, indent + 1));
    } else if (Array.isArray(value)) {
      lines.push(`${prefix}**${formatKey(key)}:** ${value.length} items`);
      if (value.length <= 5) {
        value.forEach((item, i) => {
          if (typeof item === 'object') {
            lines.push(`${prefix}  ${i + 1}.`);
            lines.push(formatObject(item as Record<string, unknown>, indent + 2));
          } else {
            lines.push(`${prefix}  - ${item}`);
          }
        });
      }
    } else {
      lines.push(`${prefix}**${formatKey(key)}:** ${value}`);
    }
  }

  return lines.join('\n');
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function formatContextKey(key: string): string {
  const keyMap: Record<string, string> = {
    crm_contact: 'CRM Contact',
    crm_deal: 'CRM Deal',
    crm_activities: 'CRM Activities',
    email_thread: 'Email Thread',
    slack_thread: 'Slack Conversation',
    calendar_event: 'Calendar Event',
    pm_tasks: 'Project Tasks',
  };

  return keyMap[key] || formatKey(key);
}

function formatContextValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item, i) => {
        if (typeof item === 'object') {
          return `${i + 1}. ${formatObject(item as Record<string, unknown>, 1)}`;
        }
        return `- ${item}`;
      })
      .join('\n');
  }

  if (typeof value === 'object' && value !== null) {
    return formatObject(value as Record<string, unknown>);
  }

  return String(value);
}

// Validate API key format
export function validateAnthropicKey(key: string): boolean {
  // Anthropic keys start with "sk-ant-"
  return key.startsWith('sk-ant-') && key.length > 20;
}

// Test API key by making a simple request
export async function testAnthropicKey(key: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const anthropic = new Anthropic({ apiKey: key });

    await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }],
    });

    return { valid: true };
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return { valid: false, error: 'Invalid API key' };
    }
    if (error instanceof Anthropic.APIError) {
      return { valid: false, error: error.message };
    }
    return { valid: false, error: 'Failed to validate API key' };
  }
}
