'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Zap, Clock, Users, MessageSquare, Mail, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const mockTriggers = [
  {
    id: '1',
    name: 'New HubSpot Lead',
    description: 'When a new contact is added to HubSpot',
    skill: 'Personalized Outreach',
    enabled: true,
    executions: 47,
    lastRun: '2 hours ago',
    icon: Users,
    iconColor: 'text-[#FF7A59]',
    iconBg: 'bg-[#FF7A59]/10',
  },
  {
    id: '2',
    name: 'After Zoom Call',
    description: 'When a Zoom meeting ends',
    skill: 'Meeting Summary',
    enabled: true,
    executions: 23,
    lastRun: '5 hours ago',
    icon: Calendar,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  {
    id: '3',
    name: 'Long Slack Thread',
    description: 'When a thread exceeds 20 messages',
    skill: 'Slack Thread Summary',
    enabled: true,
    executions: 156,
    lastRun: '45 min ago',
    icon: MessageSquare,
    iconColor: 'text-[#4A154B]',
    iconBg: 'bg-[#4A154B]/10',
  },
  {
    id: '4',
    name: 'Weekly Client Report',
    description: 'Every Monday at 9:00 AM',
    skill: 'Weekly Client Report',
    enabled: true,
    executions: 12,
    lastRun: '2 days ago',
    icon: Clock,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
  },
  {
    id: '5',
    name: 'No Contact in 14 Days',
    description: 'When a lead has no activity for 14 days',
    skill: 'Follow-up Reminder',
    enabled: true,
    executions: 31,
    lastRun: '3 hours ago',
    icon: Mail,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
  },
  {
    id: '6',
    name: 'New Support Ticket',
    description: 'When a new ticket is created in Zendesk',
    skill: 'Ticket Categorizer',
    enabled: false,
    executions: 0,
    lastRun: 'Never',
    icon: MessageSquare,
    iconColor: 'text-gray-400',
    iconBg: 'bg-gray-100',
  },
  {
    id: '7',
    name: 'Daily Standup Reminder',
    description: 'Every weekday at 9:30 AM',
    skill: 'Standup Prompt',
    enabled: true,
    executions: 45,
    lastRun: 'Yesterday',
    icon: Clock,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
  },
];

export default function DemoTriggersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-medium text-[#1a1a1a]">Triggers</h1>
          <p className="text-[#666]">Automate actions based on events and schedules</p>
        </div>
        <Link href="/platform-demo/triggers/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Trigger
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <Zap className="h-3 w-3 mr-1" />
          {mockTriggers.filter(t => t.enabled).length} active
        </Badge>
        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
          {mockTriggers.filter(t => !t.enabled).length} paused
        </Badge>
      </div>

      <div className="grid gap-4">
        {mockTriggers.map((trigger) => {
          const IconComponent = trigger.icon;

          return (
            <Card key={trigger.id} className={`border-[#e5e5e5] ${!trigger.enabled ? 'opacity-60' : ''}`}>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${trigger.iconBg}`}>
                    <IconComponent className={`h-5 w-5 ${trigger.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-[#1a1a1a]">{trigger.name}</h3>
                      <ArrowRight className="h-4 w-4 text-[#ccc]" />
                      <span className="text-sm text-emerald-600">{trigger.skill}</span>
                    </div>
                    <p className="text-sm text-[#666] mt-0.5">{trigger.description}</p>
                  </div>

                  <div className="text-right mr-4">
                    <p className="text-sm font-medium text-[#1a1a1a]">{trigger.executions} runs</p>
                    <p className="text-xs text-[#999]">Last: {trigger.lastRun}</p>
                  </div>

                  <Switch checked={trigger.enabled} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
