import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApprovalQueue } from '@/components/platform/approval-queue';
import { CheckSquare } from 'lucide-react';

export default async function ApprovalsPage() {
  const supabase = await createClient();

  // Get user's organization
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user!.id)
    .single();

  const organizationId = userOrg?.organization_id;

  // Get pending approvals
  const { data: approvals } = await supabase
    .from('approval_queue')
    .select(`
      *,
      executions (
        *,
        skills (name, slug),
        trigger_rules (name)
      )
    `)
    .eq('organization_id', organizationId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approval Queue</h1>
        <p className="text-gray-500">Review and approve automated actions</p>
      </div>

      {approvals && approvals.length > 0 ? (
        <ApprovalQueue approvals={approvals} />
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CheckSquare className="h-12 w-12 text-green-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
              <p className="text-gray-500 mt-1">
                No items pending approval. Check back later.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
