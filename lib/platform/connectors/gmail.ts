import { Platform, Connection } from '@/types';
import { BaseConnector, OAuthTokens, ConnectorCapabilities, registerConnector } from './base';

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: { name: string; value: string }[];
    body?: { data?: string };
    parts?: { mimeType: string; body?: { data?: string } }[];
  };
  internalDate: string;
}

interface GmailThread {
  id: string;
  messages: GmailMessage[];
}

export class GmailConnector extends BaseConnector {
  readonly platform: Platform = 'gmail';
  readonly name = 'Gmail';
  readonly description = 'Connect to Gmail for email reading and sending';
  readonly icon = 'mail';
  readonly capabilities: ConnectorCapabilities = {
    read: ['emails', 'threads', 'labels'],
    write: ['emails', 'drafts'],
  };

  private baseUrl = 'https://gmail.googleapis.com/gmail/v1';

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/gmail/callback`,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.compose',
      access_type: 'offline',
      prompt: 'consent',
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/gmail/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`Gmail OAuth error: ${data.error_description || data.error}`);
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
      scope: data.scope,
    };
  }

  async refreshAccessToken(): Promise<OAuthTokens> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`Gmail token refresh error: ${data.error_description || data.error}`);
    }

    return {
      access_token: data.access_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
      scope: data.scope,
    };
  }

  // API Methods
  private async apiCall<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}/users/me${endpoint}`);

    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url.toString(), options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Gmail API error: ${data.error?.message || response.statusText}`);
    }

    return data;
  }

  // Read Operations
  async listMessages(query?: string, maxResults = 20): Promise<{ id: string; threadId: string }[]> {
    let endpoint = `/messages?maxResults=${maxResults}`;
    if (query) {
      endpoint += `&q=${encodeURIComponent(query)}`;
    }
    const data = await this.apiCall<{ messages: { id: string; threadId: string }[] }>(endpoint);
    return data.messages || [];
  }

  async getMessage(messageId: string): Promise<GmailMessage> {
    return this.apiCall<GmailMessage>(`/messages/${messageId}`);
  }

  async getThread(threadId: string): Promise<GmailThread> {
    return this.apiCall<GmailThread>(`/threads/${threadId}`);
  }

  async getRecentEmails(count = 10): Promise<GmailMessage[]> {
    const messageList = await this.listMessages(undefined, count);
    const messages: GmailMessage[] = [];

    for (const { id } of messageList) {
      const message = await this.getMessage(id);
      messages.push(message);
    }

    return messages;
  }

  // Helper to extract email content
  private decodeBase64(data: string): string {
    return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
  }

  extractEmailContent(message: GmailMessage): {
    from: string;
    to: string;
    subject: string;
    date: string;
    body: string;
  } {
    const getHeader = (name: string) =>
      message.payload.headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    let body = '';
    if (message.payload.body?.data) {
      body = this.decodeBase64(message.payload.body.data);
    } else if (message.payload.parts) {
      const textPart = message.payload.parts.find(p => p.mimeType === 'text/plain');
      if (textPart?.body?.data) {
        body = this.decodeBase64(textPart.body.data);
      }
    }

    return {
      from: getHeader('From'),
      to: getHeader('To'),
      subject: getHeader('Subject'),
      date: getHeader('Date'),
      body,
    };
  }

  // Write Operations
  async sendEmail(to: string, subject: string, body: string): Promise<{ id: string; threadId: string }> {
    const rawMessage = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      body,
    ].join('\r\n');

    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return this.apiCall<{ id: string; threadId: string }>('/messages/send', 'POST', {
      raw: encodedMessage,
    });
  }

  async createDraft(to: string, subject: string, body: string): Promise<{ id: string }> {
    const rawMessage = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      body,
    ].join('\r\n');

    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return this.apiCall<{ id: string }>('/drafts', 'POST', {
      message: {
        raw: encodedMessage,
      },
    });
  }

  async replyToThread(threadId: string, to: string, subject: string, body: string): Promise<{ id: string; threadId: string }> {
    const rawMessage = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      body,
    ].join('\r\n');

    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return this.apiCall<{ id: string; threadId: string }>('/messages/send', 'POST', {
      raw: encodedMessage,
      threadId,
    });
  }

  // Context gathering for skills
  async gatherContext(options: {
    threadId?: string;
    query?: string;
    messageCount?: number;
  }): Promise<Record<string, unknown>> {
    const context: Record<string, unknown> = {};

    if (options.threadId) {
      const thread = await this.getThread(options.threadId);
      context.thread = thread.messages.map(m => this.extractEmailContent(m));
    }

    if (options.query) {
      const messages = await this.listMessages(options.query, options.messageCount || 5);
      const fullMessages: GmailMessage[] = [];
      for (const { id } of messages) {
        fullMessages.push(await this.getMessage(id));
      }
      context.search_results = fullMessages.map(m => this.extractEmailContent(m));
    }

    return context;
  }
}

// Register the connector
registerConnector('gmail', GmailConnector);

// Factory functions for OAuth flow
export function createGmailAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/gmail/callback`,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.compose',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGmailCode(code: string): Promise<OAuthTokens> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/gmail/callback`,
      grant_type: 'authorization_code',
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(`Gmail OAuth error: ${data.error_description || data.error}`);
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    token_type: data.token_type,
    scope: data.scope,
  };
}
