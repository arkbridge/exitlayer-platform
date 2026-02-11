'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Mail, MessageSquare, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const mockApprovals = [
  {
    id: '1',
    skill: 'Personalized Outreach',
    trigger: 'New HubSpot lead',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    output: {
      recipient: 'John Smith',
      company: 'TechCorp',
      subject: 'Quick question about your automation needs',
      preview: 'Hi John, I noticed TechCorp recently expanded into the enterprise space. We help companies like yours automate their sales processes...',
    },
    type: 'email',
  },
  {
    id: '2',
    skill: 'Follow-up Reminder',
    trigger: 'No contact in 14 days',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    output: {
      recipient: 'Sarah Chen',
      company: 'Innovate Inc',
      subject: 'Following up on our conversation',
      preview: 'Hi Sarah, I wanted to check in on the proposal I sent over two weeks ago. I know Q1 planning can be hectic...',
    },
    type: 'email',
  },
  {
    id: '3',
    skill: 'Slack Summary',
    trigger: 'End of day',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    output: {
      channel: '#client-acme',
      summary: 'Today\'s highlights: 3 new feature requests logged, deployment scheduled for Friday, client approved Phase 2 scope.',
    },
    type: 'slack',
  },
];

const typeIcons = {
  email: Mail,
  slack: MessageSquare,
  document: FileText,
};

export default function DemoApprovalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-medium text-[#1a1a1a]">Approvals</h1>
        <p className="text-[#666]">Review and approve pending automated actions</p>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="h-3 w-3 mr-1" />
          {mockApprovals.length} pending
        </Badge>
      </div>

      <div className="space-y-4">
        {mockApprovals.map((approval) => {
          const TypeIcon = typeIcons[approval.type as keyof typeof typeIcons] || FileText;

          return (
            <Card key={approval.id} className="border-[#e5e5e5]">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100">
                      <TypeIcon className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-[#1a1a1a]">{approval.skill}</CardTitle>
                      <CardDescription className="text-[#666]">
                        Triggered by: {approval.trigger}
                      </CardDescription>
                    </div>
                  </div>
                  <span className="text-xs text-[#999]">
                    {formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-[#f8f8f6] rounded-lg p-4 mb-4">
                  {approval.type === 'email' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[#999]">To:</span>
                        <span className="text-[#1a1a1a]">{approval.output.recipient} at {approval.output.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[#999]">Subject:</span>
                        <span className="text-[#1a1a1a]">{approval.output.subject}</span>
                      </div>
                      <div className="pt-2 border-t border-[#e5e5e5] mt-2">
                        <p className="text-sm text-[#666]">{approval.output.preview}</p>
                      </div>
                    </div>
                  )}
                  {approval.type === 'slack' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[#999]">Channel:</span>
                        <span className="text-[#1a1a1a]">{approval.output.channel}</span>
                      </div>
                      <div className="pt-2 border-t border-[#e5e5e5] mt-2">
                        <p className="text-sm text-[#666]">{approval.output.summary}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve & Send
                  </Button>
                  <Button variant="outline" className="border-[#e5e5e5] text-[#666]">
                    Edit
                  </Button>
                  <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
