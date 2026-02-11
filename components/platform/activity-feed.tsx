'use client';

import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Sparkles,
  Zap,
  Loader2,
} from 'lucide-react';

interface Execution {
  id: string;
  status: string;
  action_taken?: string;
  error?: string;
  tokens_used?: number;
  created_at: string;
  completed_at?: string;
  skills?: {
    name: string;
    slug: string;
  };
  trigger_rules?: {
    name: string;
  };
}

interface ActivityFeedProps {
  executions: Execution[];
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    label: 'Pending',
  },
  running: {
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    label: 'Running',
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    label: 'Completed',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    label: 'Failed',
  },
  awaiting_approval: {
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100',
    label: 'Awaiting Approval',
  },
  approved: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    label: 'Approved',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    label: 'Rejected',
  },
};

export function ActivityFeed({ executions }: ActivityFeedProps) {
  if (executions.length === 0) {
    return (
      <div className="text-center py-12">
        <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No activity yet</h3>
        <p className="text-gray-500 mt-1">
          Activity will appear here when your triggers run.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {executions.map((execution) => {
        const config = statusConfig[execution.status as keyof typeof statusConfig] || statusConfig.pending;
        const StatusIcon = config.icon;

        return (
          <div
            key={execution.id}
            className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <StatusIcon
                className={`h-5 w-5 ${config.color} ${
                  execution.status === 'running' ? 'animate-spin' : ''
                }`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {execution.skills?.name || 'Unknown Skill'}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {config.label}
                </Badge>
              </div>

              {execution.trigger_rules?.name && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Triggered by: {execution.trigger_rules.name}
                </p>
              )}

              {execution.action_taken && (
                <p className="text-sm text-gray-600 mt-1">
                  {formatActionTaken(execution.action_taken)}
                </p>
              )}

              {execution.error && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {execution.error}
                </p>
              )}

              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span>
                  {formatDistanceToNow(new Date(execution.created_at), { addSuffix: true })}
                </span>
                {execution.tokens_used && (
                  <span>{execution.tokens_used.toLocaleString()} tokens</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatActionTaken(action: string): string {
  const actionMap: Record<string, string> = {
    displayed: 'Result displayed',
    queued_for_approval: 'Queued for approval',
    posted_to_slack: 'Posted to Slack',
    'posted_to_slack.post': 'Posted to Slack',
    posted_to_gmail: 'Email sent via Gmail',
    'posted_to_gmail.send': 'Email sent',
    'posted_to_gmail.draft': 'Draft created',
    posted_to_hubspot: 'Added to HubSpot',
    'posted_to_hubspot.note': 'Note added to HubSpot',
    'posted_to_hubspot.task': 'Task created in HubSpot',
  };

  return actionMap[action] || action.replace(/_/g, ' ').replace(/^posted_to_/, 'Posted to ');
}
