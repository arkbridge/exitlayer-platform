import { Platform, Connection } from '@/types';
import { BaseConnector, OAuthTokens, ConnectorCapabilities, registerConnector } from './base';

interface HubSpotContact {
  id: string;
  properties: {
    email?: string;
    firstname?: string;
    lastname?: string;
    company?: string;
    phone?: string;
    [key: string]: string | undefined;
  };
  createdAt: string;
  updatedAt: string;
}

interface HubSpotDeal {
  id: string;
  properties: {
    dealname?: string;
    amount?: string;
    dealstage?: string;
    closedate?: string;
    [key: string]: string | undefined;
  };
  createdAt: string;
  updatedAt: string;
}

interface HubSpotEngagement {
  id: string;
  type: 'NOTE' | 'EMAIL' | 'TASK' | 'MEETING' | 'CALL';
  properties: Record<string, string>;
  createdAt: string;
}

export class HubSpotConnector extends BaseConnector {
  readonly platform: Platform = 'hubspot';
  readonly name = 'HubSpot';
  readonly description = 'Connect to HubSpot CRM for contacts, deals, and activities';
  readonly icon = 'hubspot';
  readonly capabilities: ConnectorCapabilities = {
    read: ['contacts', 'deals', 'activities', 'companies'],
    write: ['notes', 'tasks', 'emails'],
  };

  private baseUrl = 'https://api.hubapi.com';

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: process.env.HUBSPOT_CLIENT_ID!,
      scope: 'crm.objects.contacts.read crm.objects.contacts.write crm.objects.deals.read crm.objects.deals.write',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/hubspot/callback`,
      state,
    });
    return `https://app.hubspot.com/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
    const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.HUBSPOT_CLIENT_ID!,
        client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/hubspot/callback`,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`HubSpot OAuth error: ${data.error_description || data.error}`);
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
    };
  }

  async refreshAccessToken(): Promise<OAuthTokens> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.HUBSPOT_CLIENT_ID!,
        client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
        refresh_token: this.refreshToken,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`HubSpot token refresh error: ${data.error_description || data.error}`);
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
    };
  }

  // API Methods
  private async apiCall<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT' = 'GET',
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

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
      throw new Error(`HubSpot API error: ${data.message || response.statusText}`);
    }

    return data;
  }

  // Read Operations
  async getContacts(limit = 100): Promise<HubSpotContact[]> {
    const data = await this.apiCall<{ results: HubSpotContact[] }>(
      `/crm/v3/objects/contacts?limit=${limit}&properties=email,firstname,lastname,company,phone`
    );
    return data.results;
  }

  async getContact(contactId: string): Promise<HubSpotContact> {
    return this.apiCall<HubSpotContact>(
      `/crm/v3/objects/contacts/${contactId}?properties=email,firstname,lastname,company,phone`
    );
  }

  async searchContacts(query: string): Promise<HubSpotContact[]> {
    const data = await this.apiCall<{ results: HubSpotContact[] }>(
      '/crm/v3/objects/contacts/search',
      'POST',
      {
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'CONTAINS_TOKEN',
                value: query,
              },
            ],
          },
        ],
        properties: ['email', 'firstname', 'lastname', 'company', 'phone'],
      }
    );
    return data.results;
  }

  async getDeals(limit = 100): Promise<HubSpotDeal[]> {
    const data = await this.apiCall<{ results: HubSpotDeal[] }>(
      `/crm/v3/objects/deals?limit=${limit}&properties=dealname,amount,dealstage,closedate`
    );
    return data.results;
  }

  async getDeal(dealId: string): Promise<HubSpotDeal> {
    return this.apiCall<HubSpotDeal>(
      `/crm/v3/objects/deals/${dealId}?properties=dealname,amount,dealstage,closedate`
    );
  }

  async getContactDeals(contactId: string): Promise<HubSpotDeal[]> {
    const data = await this.apiCall<{ results: { id: string }[] }>(
      `/crm/v3/objects/contacts/${contactId}/associations/deals`
    );

    const deals: HubSpotDeal[] = [];
    for (const { id } of data.results) {
      const deal = await this.getDeal(id);
      deals.push(deal);
    }
    return deals;
  }

  // Write Operations
  async createNote(contactId: string, body: string): Promise<HubSpotEngagement> {
    const noteData = await this.apiCall<{ id: string }>(
      '/crm/v3/objects/notes',
      'POST',
      {
        properties: {
          hs_note_body: body,
          hs_timestamp: new Date().toISOString(),
        },
      }
    );

    // Associate with contact
    await this.apiCall(
      `/crm/v3/objects/notes/${noteData.id}/associations/contacts/${contactId}/note_to_contact`,
      'PUT'
    );

    return {
      id: noteData.id,
      type: 'NOTE',
      properties: { hs_note_body: body },
      createdAt: new Date().toISOString(),
    };
  }

  async createTask(contactId: string, subject: string, dueDate?: Date): Promise<HubSpotEngagement> {
    const taskData = await this.apiCall<{ id: string }>(
      '/crm/v3/objects/tasks',
      'POST',
      {
        properties: {
          hs_task_subject: subject,
          hs_task_status: 'NOT_STARTED',
          hs_timestamp: new Date().toISOString(),
          ...(dueDate && { hs_task_due_date: dueDate.toISOString() }),
        },
      }
    );

    // Associate with contact
    await this.apiCall(
      `/crm/v3/objects/tasks/${taskData.id}/associations/contacts/${contactId}/task_to_contact`,
      'PUT'
    );

    return {
      id: taskData.id,
      type: 'TASK',
      properties: { hs_task_subject: subject },
      createdAt: new Date().toISOString(),
    };
  }

  // Context gathering for skills
  async gatherContext(options: {
    contactId?: string;
    dealId?: string;
    includeActivities?: boolean;
  }): Promise<Record<string, unknown>> {
    const context: Record<string, unknown> = {};

    if (options.contactId) {
      const contact = await this.getContact(options.contactId);
      context.contact = contact;

      const deals = await this.getContactDeals(options.contactId);
      context.deals = deals;
    }

    if (options.dealId) {
      const deal = await this.getDeal(options.dealId);
      context.deal = deal;
    }

    return context;
  }
}

// Register the connector
registerConnector('hubspot', HubSpotConnector);

// Factory functions for OAuth flow
export function createHubSpotAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.HUBSPOT_CLIENT_ID!,
    scope: 'crm.objects.contacts.read crm.objects.contacts.write crm.objects.deals.read crm.objects.deals.write',
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/hubspot/callback`,
    state,
  });
  return `https://app.hubspot.com/oauth/authorize?${params.toString()}`;
}

export async function exchangeHubSpotCode(code: string): Promise<OAuthTokens> {
  const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.HUBSPOT_CLIENT_ID!,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/hubspot/callback`,
      code,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(`HubSpot OAuth error: ${data.error_description || data.error}`);
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    token_type: data.token_type,
  };
}
