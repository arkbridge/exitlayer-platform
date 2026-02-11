import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

export default async function HistoryPage() {
  const supabase = await createClient();

  // Get user's organization
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user!.id)
    .single();

  const organizationId = userOrg?.organization_id;

  // Get executions
  const { data: executions } = await supabase
    .from('executions')
    .select(`
      *,
      skills (name, slug),
      trigger_rules (name)
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(100);

  const statusConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { icon: Clock, variant: 'secondary' },
    running: { icon: Loader2, variant: 'outline' },
    completed: { icon: CheckCircle, variant: 'default' },
    failed: { icon: XCircle, variant: 'destructive' },
    awaiting_approval: { icon: Clock, variant: 'secondary' },
    approved: { icon: CheckCircle, variant: 'default' },
    rejected: { icon: XCircle, variant: 'destructive' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Execution History</h1>
        <p className="text-gray-500">Complete log of all skill executions</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executions && executions.length > 0 ? (
                executions.map((execution) => {
                  const config = statusConfig[execution.status] || statusConfig.pending;
                  const StatusIcon = config.icon;

                  return (
                    <TableRow key={execution.id}>
                      <TableCell className="font-medium">
                        {execution.skills?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {execution.trigger_rules?.name || 'Manual'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className="gap-1">
                          <StatusIcon className={`h-3 w-3 ${execution.status === 'running' ? 'animate-spin' : ''}`} />
                          {execution.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {execution.tokens_used?.toLocaleString() || '-'}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {formatDistanceToNow(new Date(execution.created_at), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No executions yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
