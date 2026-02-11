'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { platformMeta } from '@/lib/platform/connectors';
import {
  MessageSquare,
  Users,
  Mail,
  CheckSquare,
  Check,
  Trash2,
  Loader2,
  Plus,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Connection {
  id: string;
  platform: string;
  is_active: boolean;
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface ConnectionsListProps {
  connections: Connection[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  MessageSquare,
  Users,
  Mail,
  CheckSquare,
};

const availablePlatforms = ['slack', 'hubspot', 'gmail'] as const;

export function ConnectionsList({ connections: initialConnections }: ConnectionsListProps) {
  const router = useRouter();
  const [connections, setConnections] = useState(initialConnections);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const connectedPlatforms = new Set(connections.map((c) => c.platform));

  const handleConnect = async (platform: string) => {
    setConnecting(platform);
    window.location.href = `/api/oauth/${platform}/authorize`;
  };

  const handleDisconnect = async (connectionId: string, platform: string) => {
    setDisconnecting(connectionId);

    try {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      toast.success(`Disconnected from ${platformMeta[platform as keyof typeof platformMeta]?.name || platform}`);
      setConnections((prev) => prev.filter((c) => c.id !== connectionId));
      router.refresh();
    } catch (error) {
      toast.error('Failed to disconnect');
    } finally {
      setDisconnecting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Connected platforms */}
      {connections.map((connection) => {
        const meta = platformMeta[connection.platform as keyof typeof platformMeta];
        if (!meta) return null;

        const Icon = iconMap[meta.icon] || MessageSquare;

        return (
          <Card key={connection.id} className="border-green-100">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${meta.color}15` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: meta.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{meta.name}</h3>
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        <Check className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{meta.description}</p>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={disconnecting === connection.id}
                    >
                      {disconnecting === connection.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disconnect {meta.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the connection and stop all triggers using this platform.
                        You can reconnect at any time.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDisconnect(connection.id, connection.platform)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Disconnect
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Available platforms to connect */}
      {availablePlatforms
        .filter((platform) => !connectedPlatforms.has(platform))
        .map((platform) => {
          const meta = platformMeta[platform];
          const Icon = iconMap[meta.icon] || MessageSquare;

          return (
            <Card key={platform}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="h-12 w-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${meta.color}15` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: meta.color }} />
                    </div>
                    <div>
                      <h3 className="font-medium">{meta.name}</h3>
                      <p className="text-sm text-gray-500">{meta.description}</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handleConnect(platform)}
                    disabled={connecting === platform}
                  >
                    {connecting === platform ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
