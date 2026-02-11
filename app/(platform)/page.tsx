import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActivityFeed } from '@/components/platform/activity-feed';
import { StatsCards } from '@/components/platform/stats-cards';
import { Zap, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get user's organization
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user!.id)
    .single();

  const organizationId = userOrg?.organization_id;

  // Get stats
  const [executionsResult, approvalsResult, triggersResult] = await Promise.all([
    supabase
      .from('executions')
      .select('id, status', { count: 'exact' })
      .eq('organization_id', organizationId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('approval_queue')
      .select('id', { count: 'exact' })
      .eq('organization_id', organizationId)
      .eq('status', 'pending'),
    supabase
      .from('trigger_rules')
      .select('id', { count: 'exact' })
      .eq('organization_id', organizationId)
      .eq('is_active', true),
  ]);

  const stats = {
    executionsToday: executionsResult.count || 0,
    pendingApprovals: approvalsResult.count || 0,
    activeTriggers: triggersResult.count || 0,
  };

  // Get recent executions
  const { data: recentExecutions } = await supabase
    .from('executions')
    .select(`
      *,
      skills (name, slug),
      trigger_rules (name)
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
        <p className="text-gray-500">What&apos;s happening in your automation</p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Real-time log of automated actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed executions={recentExecutions || []} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.pendingApprovals > 0 ? (
                <div className="text-center py-4">
                  <p className="text-3xl font-bold text-amber-600">{stats.pendingApprovals}</p>
                  <p className="text-sm text-gray-500 mt-1">items waiting for review</p>
                  <a
                    href="/approvals"
                    className="inline-block mt-3 text-sm text-indigo-600 hover:underline"
                  >
                    Review now →
                  </a>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  All caught up! No pending approvals.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-500" />
                Active Triggers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-indigo-600">{stats.activeTriggers}</p>
                <p className="text-sm text-gray-500 mt-1">triggers running</p>
                <a
                  href="/triggers"
                  className="inline-block mt-3 text-sm text-indigo-600 hover:underline"
                >
                  Manage triggers →
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
