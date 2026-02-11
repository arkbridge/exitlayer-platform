import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectionsList } from '@/components/settings/connections-list';

export default async function ConnectionsPage() {
  const supabase = await createClient();

  // Get user's organization
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user!.id)
    .single();

  const organizationId = userOrg?.organization_id;

  // Get connections
  const { data: connections } = await supabase
    .from('connections')
    .select('id, platform, is_active, created_at, metadata')
    .eq('organization_id', organizationId);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
        <p className="text-gray-500">Manage your connected platforms</p>
      </div>

      <ConnectionsList connections={connections || []} />
    </div>
  );
}
