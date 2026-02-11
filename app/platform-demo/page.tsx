'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle, Clock, AlertCircle, Activity, Sparkles, MessageSquare, Mail, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Mock data for the demo
const mockStats = {
  executionsToday: 24,
  pendingApprovals: 3,
  activeTriggers: 7,
};

const mockExecutions = [
  {
    id: '1',
    status: 'completed',
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    skills: { name: 'Meeting Summary', slug: 'meeting-summary' },
    trigger_rules: { name: 'After Zoom call ends' },
    skill_output: 'Generated summary for "Q1 Planning Call" with 5 action items',
    action_taken: 'Posted to #client-updates',
  },
  {
    id: '2',
    status: 'awaiting_approval',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    skills: { name: 'Personalized Outreach', slug: 'personalized-outreach' },
    trigger_rules: { name: 'New HubSpot lead' },
    skill_output: 'Draft email for John Smith at TechCorp',
    action_taken: null,
  },
  {
    id: '3',
    status: 'completed',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    skills: { name: 'Slack Thread Summary', slug: 'slack-thread-summary' },
    trigger_rules: { name: 'Long thread detected' },
    skill_output: 'Summarized 47 messages in #engineering',
    action_taken: 'Posted summary to thread',
  },
  {
    id: '4',
    status: 'completed',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    skills: { name: 'Weekly Client Report', slug: 'weekly-client-report' },
    trigger_rules: { name: 'Monday 9am' },
    skill_output: 'Generated 5 weekly reports',
    action_taken: 'Posted to respective Slack channels',
  },
  {
    id: '5',
    status: 'awaiting_approval',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    skills: { name: 'Follow-up Reminder', slug: 'follow-up-reminder' },
    trigger_rules: { name: 'No contact in 14 days' },
    skill_output: 'Draft follow-up for Sarah at Innovate Inc',
    action_taken: null,
  },
  {
    id: '6',
    status: 'failed',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    skills: { name: 'Personalized Outreach', slug: 'personalized-outreach' },
    trigger_rules: { name: 'New HubSpot lead' },
    skill_output: null,
    action_taken: null,
    error: 'HubSpot API rate limit exceeded',
  },
];

const statusConfig = {
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  awaiting_approval: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-700', icon: Clock },
  running: { label: 'Running', color: 'bg-blue-100 text-blue-700', icon: Activity },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: Clock },
};

function StatsCards({ stats }: { stats: typeof mockStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-[#e5e5e5]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#666]">Executions Today</p>
              <p className="text-3xl font-bold text-[#1a1a1a]">{stats.executionsToday}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Activity className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#e5e5e5]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#666]">Pending Approvals</p>
              <p className="text-3xl font-bold text-amber-600">{stats.pendingApprovals}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#e5e5e5]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#666]">Active Triggers</p>
              <p className="text-3xl font-bold text-[#1a1a1a]">{stats.activeTriggers}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Zap className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityFeed({ executions }: { executions: typeof mockExecutions }) {
  if (executions.length === 0) {
    return (
      <div className="text-center py-8">
        <Sparkles className="h-12 w-12 text-[#ccc] mx-auto mb-3" />
        <p className="text-[#666]">No activity yet</p>
        <p className="text-sm text-[#999]">
          Set up triggers to start automating
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {executions.map((execution) => {
        const status = statusConfig[execution.status as keyof typeof statusConfig] || statusConfig.pending;
        const StatusIcon = status.icon;

        return (
          <div
            key={execution.id}
            className="flex items-start gap-4 p-4 rounded-xl bg-[#f8f8f6] hover:bg-[#f0f0ee] transition-colors"
          >
            <div className={`p-2 rounded-lg ${status.color}`}>
              <StatusIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-[#1a1a1a]">
                  {execution.skills?.name || 'Unknown Skill'}
                </span>
                <Badge variant="outline" className="text-xs border-[#e5e5e5] text-[#666]">
                  {execution.trigger_rules?.name || 'Manual'}
                </Badge>
              </div>
              <p className="text-sm text-[#666] truncate">
                {execution.skill_output || execution.error || 'Processing...'}
              </p>
              {execution.action_taken && (
                <p className="text-xs text-emerald-600 mt-1">
                  {execution.action_taken}
                </p>
              )}
            </div>
            <span className="text-xs text-[#999] whitespace-nowrap">
              {formatDistanceToNow(new Date(execution.created_at), { addSuffix: true })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function DemoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-medium text-[#1a1a1a]">Activity</h1>
        <p className="text-[#666]">What&apos;s happening in your automation</p>
      </div>

      <StatsCards stats={mockStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-[#e5e5e5]">
            <CardHeader>
              <CardTitle className="text-[#1a1a1a]">Recent Activity</CardTitle>
              <CardDescription className="text-[#666]">
                Real-time log of automated actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed executions={mockExecutions} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-[#e5e5e5]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1a1a1a]">
                <Clock className="h-5 w-5 text-amber-500" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-amber-600">{mockStats.pendingApprovals}</p>
                <p className="text-sm text-[#666] mt-1">items waiting for review</p>
                <a
                  href="/platform-demo/approvals"
                  className="inline-block mt-3 text-sm text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Review now &rarr;
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#e5e5e5]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1a1a1a]">
                <Zap className="h-5 w-5 text-emerald-500" />
                Active Triggers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-emerald-600">{mockStats.activeTriggers}</p>
                <p className="text-sm text-[#666] mt-1">triggers running</p>
                <a
                  href="/platform-demo/triggers"
                  className="inline-block mt-3 text-sm text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Manage triggers &rarr;
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#e5e5e5]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1a1a1a]">
                <Users className="h-5 w-5 text-blue-500" />
                Connected Platforms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#4A154B]/10 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-[#4A154B]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1a1a1a]">Slack</p>
                    <p className="text-xs text-[#999]">Connected</p>
                  </div>
                  <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#FF7A59]/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-[#FF7A59]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1a1a1a]">HubSpot</p>
                    <p className="text-xs text-[#999]">Connected</p>
                  </div>
                  <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#EA4335]/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-[#EA4335]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1a1a1a]">Gmail</p>
                    <p className="text-xs text-[#999]">Connected</p>
                  </div>
                  <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
