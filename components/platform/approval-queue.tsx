'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  CheckCircle,
  XCircle,
  Edit,
  Loader2,
  Mail,
  MessageSquare,
  FileText,
  Zap,
} from 'lucide-react';

interface ApprovalItem {
  id: string;
  draft_content: string;
  destination: string;
  destination_config?: Record<string, unknown>;
  created_at: string;
  executions?: {
    id: string;
    skills?: {
      name: string;
      slug: string;
    };
    trigger_rules?: {
      name: string;
    };
  };
}

interface ApprovalQueueProps {
  approvals: ApprovalItem[];
}

const destinationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'slack': MessageSquare,
  'gmail': Mail,
  'hubspot': FileText,
};

export function ApprovalQueue({ approvals: initialApprovals }: ApprovalQueueProps) {
  const router = useRouter();
  const [approvals, setApprovals] = useState(initialApprovals);
  const [processing, setProcessing] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ApprovalItem | null>(null);
  const [editedContent, setEditedContent] = useState('');

  const handleApprove = async (id: string, content?: string) => {
    setProcessing(id);
    try {
      const response = await fetch('/api/approvals/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalId: id,
          action: content ? 'edit' : 'approve',
          editedContent: content,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process approval');
      }

      toast.success('Approved and sent!');
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      setEditingItem(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    try {
      const response = await fetch('/api/approvals/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalId: id,
          action: 'reject',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject');
      }

      toast.success('Rejected');
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject');
    } finally {
      setProcessing(null);
    }
  };

  const openEditDialog = (item: ApprovalItem) => {
    setEditingItem(item);
    setEditedContent(item.draft_content);
  };

  const getDestinationInfo = (destination: string) => {
    const [platform, action] = destination.split('.');
    const Icon = destinationIcons[platform] || FileText;
    const labels: Record<string, string> = {
      'slack.post': 'Post to Slack',
      'gmail.send': 'Send Email',
      'gmail.draft': 'Create Draft',
      'hubspot.note': 'Add CRM Note',
      'hubspot.task': 'Create Task',
    };
    return {
      Icon,
      label: labels[destination] || destination,
    };
  };

  return (
    <>
      <div className="space-y-4">
        {approvals.map((item) => {
          const { Icon, label } = getDestinationInfo(item.destination);
          const isProcessing = processing === item.id;

          return (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-50">
                      <Icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {item.executions?.skills?.name || 'Skill Output'}
                      </CardTitle>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <Zap className="h-3 w-3" />
                        {item.executions?.trigger_rules?.name || 'Manual run'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{label}</Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {item.draft_content}
                  </pre>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Created {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </p>
              </CardContent>

              <CardFooter className="flex justify-end gap-2 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReject(item.id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-1" />
                  )}
                  Reject
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(item)}
                  disabled={isProcessing}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(item.id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  Approve & Send
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Before Sending</DialogTitle>
            <DialogDescription>
              Modify the content before approving. The edited version will be sent.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => editingItem && handleApprove(editingItem.id, editedContent)}
              disabled={processing === editingItem?.id}
            >
              {processing === editingItem?.id ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Approve & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
