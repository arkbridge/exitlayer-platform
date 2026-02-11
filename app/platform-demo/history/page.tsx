'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle, Activity, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

const mockHistory = [
  { id: '1', skill: 'Meeting Summary', trigger: 'After Zoom call ends', status: 'completed', created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), output: 'Generated summary for "Q1 Planning Call"' },
  { id: '2', skill: 'Personalized Outreach', trigger: 'New HubSpot lead', status: 'awaiting_approval', created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), output: 'Draft email for John Smith' },
  { id: '3', skill: 'Slack Thread Summary', trigger: 'Long thread detected', status: 'completed', created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), output: 'Summarized 47 messages in #engineering' },
  { id: '4', skill: 'Weekly Client Report', trigger: 'Monday 9am', status: 'completed', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), output: 'Generated 5 weekly reports' },
  { id: '5', skill: 'Follow-up Reminder', trigger: 'No contact in 14 days', status: 'awaiting_approval', created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), output: 'Draft follow-up for Sarah Chen' },
  { id: '6', skill: 'Personalized Outreach', trigger: 'New HubSpot lead', status: 'failed', created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), error: 'HubSpot API rate limit exceeded' },
  { id: '7', skill: 'Meeting Summary', trigger: 'After Zoom call ends', status: 'completed', created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), output: 'Generated summary for "Client Kickoff"' },
  { id: '8', skill: 'Slack Thread Summary', trigger: 'Long thread detected', status: 'completed', created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), output: 'Summarized 32 messages in #sales' },
  { id: '9', skill: 'Proposal Generator', trigger: 'Manual', status: 'completed', created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), output: 'Generated proposal for TechCorp' },
  { id: '10', skill: 'Follow-up Reminder', trigger: 'No contact in 14 days', status: 'completed', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), output: 'Sent follow-up to Mike at StartupXYZ' },
];

const statusConfig = {
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  awaiting_approval: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  running: { label: 'Running', color: 'bg-blue-100 text-blue-700', icon: Activity },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

export default function DemoHistoryPage() {
  const completed = mockHistory.filter(h => h.status === 'completed').length;
  const failed = mockHistory.filter(h => h.status === 'failed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-medium text-[#1a1a1a]">History</h1>
          <p className="text-[#666]">View all past executions and their results</p>
        </div>
        <Button variant="outline" className="border-[#e5e5e5] text-[#666]">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          {completed} completed
        </Badge>
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          {failed} failed
        </Badge>
      </div>

      <Card className="border-[#e5e5e5]">
        <CardContent className="p-0">
          <div className="divide-y divide-[#e5e5e5]">
            {mockHistory.map((item) => {
              const status = statusConfig[item.status as keyof typeof statusConfig];
              const StatusIcon = status?.icon || Clock;

              return (
                <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-[#f8f8f6] transition-colors">
                  <div className={`p-2 rounded-lg ${status?.color || 'bg-gray-100 text-gray-700'}`}>
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#1a1a1a]">{item.skill}</span>
                      <Badge variant="outline" className="text-xs border-[#e5e5e5] text-[#666]">
                        {item.trigger}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#666] truncate mt-0.5">
                      {item.output || item.error}
                    </p>
                  </div>
                  <span className="text-xs text-[#999] whitespace-nowrap">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
