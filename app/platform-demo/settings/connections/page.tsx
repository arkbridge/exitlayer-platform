'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mail, Users, Calendar, CheckCircle, Plus } from 'lucide-react';

const connections = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Post messages, summarize threads, manage channels',
    icon: MessageSquare,
    iconColor: 'text-[#4A154B]',
    iconBg: 'bg-[#4A154B]/10',
    connected: true,
    account: 'acme-agency.slack.com',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Access contacts, deals, and company data',
    icon: Users,
    iconColor: 'text-[#FF7A59]',
    iconBg: 'bg-[#FF7A59]/10',
    connected: true,
    account: 'Acme Agency',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Send emails on your behalf',
    icon: Mail,
    iconColor: 'text-[#EA4335]',
    iconBg: 'bg-[#EA4335]/10',
    connected: true,
    account: 'team@acmeagency.com',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Access meeting recordings and transcripts',
    icon: Calendar,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    connected: false,
    account: null,
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Create and update pages, access databases',
    icon: MessageSquare,
    iconColor: 'text-gray-800',
    iconBg: 'bg-gray-100',
    connected: false,
    account: null,
  },
];

export default function DemoConnectionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-medium text-[#1a1a1a]">Connections</h1>
        <p className="text-[#666]">Connect your tools to enable automations</p>
      </div>

      <div className="grid gap-4">
        {connections.map((conn) => {
          const IconComponent = conn.icon;

          return (
            <Card key={conn.id} className="border-[#e5e5e5]">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${conn.iconBg}`}>
                    <IconComponent className={`h-6 w-6 ${conn.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-[#1a1a1a]">{conn.name}</h3>
                      {conn.connected && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#666]">{conn.description}</p>
                    {conn.account && (
                      <p className="text-xs text-[#999] mt-1">{conn.account}</p>
                    )}
                  </div>
                  {conn.connected ? (
                    <Button variant="outline" className="border-[#e5e5e5] text-[#666]">
                      Manage
                    </Button>
                  ) : (
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
