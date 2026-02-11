// Connector registry and exports
export { BaseConnector, getConnector, registerConnector, getRegisteredPlatforms } from './base';
export type { OAuthTokens, ConnectorCapabilities } from './base';

// Import all connectors to register them
import './slack';
import './hubspot';
import './gmail';

// Re-export individual connectors
export { SlackConnector, createSlackAuthUrl, exchangeSlackCode } from './slack';
export { HubSpotConnector, createHubSpotAuthUrl, exchangeHubSpotCode } from './hubspot';
export { GmailConnector, createGmailAuthUrl, exchangeGmailCode } from './gmail';

// Platform metadata for UI
export const platformMeta = {
  slack: {
    name: 'Slack',
    description: 'Connect to Slack workspaces for messaging',
    icon: 'MessageSquare',
    color: '#4A154B',
  },
  hubspot: {
    name: 'HubSpot',
    description: 'Connect to HubSpot CRM for contacts and deals',
    icon: 'Users',
    color: '#FF7A59',
  },
  gmail: {
    name: 'Gmail',
    description: 'Connect to Gmail for email reading and sending',
    icon: 'Mail',
    color: '#EA4335',
  },
  pipedrive: {
    name: 'Pipedrive',
    description: 'Connect to Pipedrive CRM',
    icon: 'Users',
    color: '#017737',
  },
  outlook: {
    name: 'Outlook',
    description: 'Connect to Microsoft Outlook',
    icon: 'Mail',
    color: '#0078D4',
  },
  asana: {
    name: 'Asana',
    description: 'Connect to Asana for task management',
    icon: 'CheckSquare',
    color: '#F06A6A',
  },
  monday: {
    name: 'Monday',
    description: 'Connect to Monday.com boards',
    icon: 'Layout',
    color: '#6161FF',
  },
  notion: {
    name: 'Notion',
    description: 'Connect to Notion workspaces',
    icon: 'FileText',
    color: '#000000',
  },
  google_calendar: {
    name: 'Google Calendar',
    description: 'Connect to Google Calendar',
    icon: 'Calendar',
    color: '#4285F4',
  },
} as const;

export type PlatformKey = keyof typeof platformMeta;
