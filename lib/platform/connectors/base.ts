import { Platform, Connection } from '@/types';
import { decrypt, encrypt } from '@/lib/platform/encryption';

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
}

export interface ConnectorCapabilities {
  read: string[];
  write: string[];
}

export abstract class BaseConnector {
  abstract readonly platform: Platform;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly icon: string;
  abstract readonly capabilities: ConnectorCapabilities;

  protected accessToken: string;
  protected refreshToken?: string;
  protected tokenExpiresAt?: Date;
  protected organizationId: string;

  constructor(connection: Connection) {
    this.accessToken = decrypt(connection.access_token_encrypted);
    this.refreshToken = connection.refresh_token_encrypted
      ? decrypt(connection.refresh_token_encrypted)
      : undefined;
    this.tokenExpiresAt = connection.token_expires_at
      ? new Date(connection.token_expires_at)
      : undefined;
    this.organizationId = connection.organization_id;
  }

  // OAuth methods
  abstract getAuthorizationUrl(state: string): string;
  abstract exchangeCodeForTokens(code: string): Promise<OAuthTokens>;
  abstract refreshAccessToken(): Promise<OAuthTokens>;

  // Check if token needs refresh
  protected needsRefresh(): boolean {
    if (!this.tokenExpiresAt) return false;
    // Refresh if less than 5 minutes until expiration
    return this.tokenExpiresAt.getTime() - Date.now() < 5 * 60 * 1000;
  }

  // Prepare tokens for storage
  static encryptTokens(tokens: OAuthTokens): {
    access_token_encrypted: string;
    refresh_token_encrypted?: string;
    token_expires_at?: string;
  } {
    return {
      access_token_encrypted: encrypt(tokens.access_token),
      refresh_token_encrypted: tokens.refresh_token
        ? encrypt(tokens.refresh_token)
        : undefined,
      token_expires_at: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : undefined,
    };
  }
}

// Connector registry
const connectors: Map<Platform, new (connection: Connection) => BaseConnector> = new Map();

export function registerConnector(
  platform: Platform,
  connector: new (connection: Connection) => BaseConnector
) {
  connectors.set(platform, connector);
}

export function getConnector(
  platform: Platform,
  connection: Connection
): BaseConnector {
  const ConnectorClass = connectors.get(platform);
  if (!ConnectorClass) {
    throw new Error(`No connector registered for platform: ${platform}`);
  }
  return new ConnectorClass(connection);
}

export function getRegisteredPlatforms(): Platform[] {
  return Array.from(connectors.keys());
}
