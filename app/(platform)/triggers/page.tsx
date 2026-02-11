import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Zap, Clock, ArrowRight } from 'lucide-react';

export default async function TriggersPage() {
  const supabase = await createClient();

  // Get user's organization
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user!.id)
    .single();

  const organizationId = userOrg?.organization_id;

  // Get trigger rules
  const { data: triggers } = await supabase
    .from('trigger_rules')
    .select(`
      *,
      skills (name, slug)
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Triggers</h1>
          <p className="text-gray-500">Automate skill execution based on events or conditions</p>
        </div>
        <Button asChild>
          <Link href="/triggers/new">
            <Plus className="h-4 w-4 mr-2" />
            New Trigger
          </Link>
        </Button>
      </div>

      {triggers && triggers.length > 0 ? (
        <div className="grid gap-4">
          {triggers.map((trigger) => (
            <Card key={trigger.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      trigger.trigger_type === 'event'
                        ? 'bg-indigo-50'
                        : 'bg-amber-50'
                    }`}>
                      {trigger.trigger_type === 'event' ? (
                        <Zap className="h-5 w-5 text-indigo-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{trigger.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span>{formatTriggerSource(trigger.trigger_source)}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span>{trigger.skills?.name}</span>
                        {trigger.destination && (
                          <>
                            <ArrowRight className="h-3 w-3" />
                            <span>{formatDestination(trigger.destination)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge variant={trigger.action_type === 'auto' ? 'default' : 'secondary'}>
                      {trigger.action_type === 'auto' ? 'Auto-execute' : 'Approval required'}
                    </Badge>
                    <Switch checked={trigger.is_active} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No triggers yet</h3>
              <p className="text-gray-500 mt-1 mb-4">
                Create your first trigger to automate skill execution.
              </p>
              <Button asChild>
                <Link href="/triggers/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Trigger
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function formatTriggerSource(source: string): string {
  const [platform, event] = source.split('.');
  const platformNames: Record<string, string> = {
    slack: 'Slack',
    hubspot: 'HubSpot',
    gmail: 'Gmail',
    cron: 'Schedule',
    crm: 'CRM',
  };
  const eventNames: Record<string, string> = {
    message: 'new message',
    new_contact: 'new contact',
    new_deal: 'new deal',
    deal_updated: 'deal updated',
    email_received: 'email received',
    weekly: 'weekly',
    daily: 'daily',
    inactive_contacts: 'inactive contacts',
  };
  return `${platformNames[platform] || platform} ${eventNames[event] || event}`;
}

function formatDestination(destination: string): string {
  const [platform, action] = destination.split('.');
  const labels: Record<string, string> = {
    'slack.post': 'Slack',
    'gmail.send': 'Email',
    'gmail.draft': 'Draft',
    'hubspot.note': 'CRM Note',
    'hubspot.task': 'CRM Task',
  };
  return labels[destination] || destination;
}
