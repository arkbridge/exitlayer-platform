import { Platform, Connection } from '@/types';
import { BaseConnector, OAuthTokens, ConnectorCapabilities, registerConnector } from './base';

interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_member: boolean;
}

interface SlackMessage {
  ts: string;
  text: string;
  user: string;
  channel: string;
  thread_ts?: string;
}

interface SlackUser {
  id: string;
  name: string;
  real_name: string;
  email?: string;
}

export class SlackConnector extends BaseConnector {
  readonly platform: Platform = 'slack';
  readonly name = 'Slack';
  readonly description = 'Connect to Slack workspaces for messaging';
  readonly icon = 'slack';
  readonly capabilities: ConnectorCapabilities = {
    read: ['messages', 'channels', 'users', 'reactions'],
    write: ['messages', 'reactions'],
  };

  private baseUrl = 'https://slack.com/api';

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      scope: 'channels:read,channels:history,chat:write,users:read,reactions:read,reactions:write',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/slack/callback`,
      state,
    });
    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/slack/callback`,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Slack OAuth error: ${data.error}`);
    }

    return {
      access_token: data.access_token,
      token_type: data.token_type,
      scope: data.scope,
    };
  }

  async refreshAccessToken(): Promise<OAuthTokens> {
    // Slack tokens don't expire by default, so this is a no-op
    // If using token rotation, implement refresh here
    return {
      access_token: this.accessToken,
    };
  }

  // API Methods
  private async apiCall<T>(method: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}/${method}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }

    return data;
  }

  private async apiPost<T>(method: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${method}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }

    return data;
  }

  // Read Operations
  async listChannels(): Promise<SlackChannel[]> {
    const data = await this.apiCall<{ channels: SlackChannel[] }>('conversations.list', {
      types: 'public_channel,private_channel',
      exclude_archived: 'true',
    });
    return data.channels;
  }

  async getChannelHistory(channelId: string, limit = 100): Promise<SlackMessage[]> {
    const data = await this.apiCall<{ messages: SlackMessage[] }>('conversations.history', {
      channel: channelId,
      limit: limit.toString(),
    });
    return data.messages;
  }

  async getThreadReplies(channelId: string, threadTs: string): Promise<SlackMessage[]> {
    const data = await this.apiCall<{ messages: SlackMessage[] }>('conversations.replies', {
      channel: channelId,
      ts: threadTs,
    });
    return data.messages;
  }

  async getUserInfo(userId: string): Promise<SlackUser> {
    const data = await this.apiCall<{ user: SlackUser }>('users.info', {
      user: userId,
    });
    return data.user;
  }

  // Write Operations
  async postMessage(channelId: string, text: string, threadTs?: string): Promise<SlackMessage> {
    const body: Record<string, unknown> = {
      channel: channelId,
      text,
    };

    if (threadTs) {
      body.thread_ts = threadTs;
    }

    const data = await this.apiPost<{ message: SlackMessage }>('chat.postMessage', body);
    return data.message;
  }

  async addReaction(channelId: string, timestamp: string, emoji: string): Promise<void> {
    await this.apiPost('reactions.add', {
      channel: channelId,
      timestamp,
      name: emoji,
    });
  }

  // Context gathering for skills
  async gatherContext(options: {
    channelId?: string;
    threadTs?: string;
    messageCount?: number;
  }): Promise<Record<string, unknown>> {
    const context: Record<string, unknown> = {};

    if (options.channelId) {
      const messages = await this.getChannelHistory(
        options.channelId,
        options.messageCount || 10
      );
      context.recent_messages = messages;

      if (options.threadTs) {
        const thread = await this.getThreadReplies(options.channelId, options.threadTs);
        context.thread = thread;
      }
    }

    return context;
  }
}

// Register the connector
registerConnector('slack', SlackConnector);

// Factory function for creating without a connection (for OAuth flow)
export function createSlackAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    scope: 'channels:read,channels:history,chat:write,users:read,reactions:read,reactions:write',
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/slack/callback`,
    state,
  });
  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

export async function exchangeSlackCode(code: string): Promise<OAuthTokens & { team?: { id: string; name: string } }> {
  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/slack/callback`,
    }),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack OAuth error: ${data.error}`);
  }

  return {
    access_token: data.access_token,
    token_type: data.token_type,
    scope: data.scope,
    team: data.team,
  };
}
