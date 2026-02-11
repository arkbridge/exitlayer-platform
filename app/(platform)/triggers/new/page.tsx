'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Zap, Clock } from 'lucide-react';
import { eventTypes } from '@/lib/platform/triggers/event-handler';
import { conditionTemplates } from '@/lib/platform/triggers/condition-scanner';
import { destinationOptions } from '@/lib/platform/executor/action-router';

interface Skill {
  id: string;
  name: string;
  slug: string;
}

interface Connection {
  id: string;
  platform: string;
}

export default function NewTriggerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<'event' | 'condition'>('event');
  const [triggerSource, setTriggerSource] = useState('');
  const [skillId, setSkillId] = useState('');
  const [actionType, setActionType] = useState<'auto' | 'approval'>('approval');
  const [destination, setDestination] = useState('');
  const [destinationConfig, setDestinationConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch skills and connections
    const fetchData = async () => {
      const [skillsRes, connectionsRes] = await Promise.all([
        fetch('/api/skills'),
        fetch('/api/connections'),
      ]);

      if (skillsRes.ok) {
        const data = await skillsRes.json();
        setSkills(data.skills || []);
      }

      if (connectionsRes.ok) {
        const data = await connectionsRes.json();
        setConnections(data.connections || []);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          trigger_type: triggerType,
          trigger_source: triggerSource,
          skill_id: skillId,
          action_type: actionType,
          destination: destination || null,
          destination_config: Object.keys(destinationConfig).length > 0 ? destinationConfig : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create trigger');
      }

      toast.success('Trigger created!');
      router.push('/triggers');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create trigger');
    } finally {
      setLoading(false);
    }
  };

  // Get available event sources based on connections
  const availableEventSources = connections.flatMap((conn) => {
    const platformEvents = eventTypes[conn.platform as keyof typeof eventTypes] || [];
    return platformEvents.map((event) => ({
      value: `${conn.platform}.${event.type}`,
      label: `${conn.platform.charAt(0).toUpperCase() + conn.platform.slice(1)}: ${event.label}`,
      description: event.description,
    }));
  });

  // Get available destinations based on connections
  const availableDestinations = connections.flatMap((conn) => {
    const platformDest = destinationOptions.find((d) => d.platform === conn.platform);
    if (!platformDest) return [];
    return platformDest.actions.map((action) => ({
      value: action.value,
      label: action.label,
    }));
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Trigger</h1>
          <p className="text-gray-500">Set up automated skill execution</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Trigger Details</CardTitle>
            <CardDescription>
              Define when and how this trigger should run
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Trigger Name</Label>
              <Input
                id="name"
                placeholder="e.g., New Lead Follow-up"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Trigger Type */}
            <div className="space-y-2">
              <Label>Trigger Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    triggerType === 'event'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setTriggerType('event')}
                >
                  <Zap className={`h-5 w-5 mb-2 ${
                    triggerType === 'event' ? 'text-indigo-600' : 'text-gray-400'
                  }`} />
                  <p className="font-medium">Event</p>
                  <p className="text-sm text-gray-500">
                    Trigger when something happens
                  </p>
                </button>
                <button
                  type="button"
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    triggerType === 'condition'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setTriggerType('condition')}
                >
                  <Clock className={`h-5 w-5 mb-2 ${
                    triggerType === 'condition' ? 'text-indigo-600' : 'text-gray-400'
                  }`} />
                  <p className="font-medium">Condition</p>
                  <p className="text-sm text-gray-500">
                    Trigger on schedule/condition
                  </p>
                </button>
              </div>
            </div>

            {/* Trigger Source */}
            <div className="space-y-2">
              <Label>When</Label>
              {triggerType === 'event' ? (
                <Select value={triggerSource} onValueChange={setTriggerSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEventSources.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={triggerSource} onValueChange={setTriggerSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition..." />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.source}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Skill */}
            <div className="space-y-2">
              <Label>Run Skill</Label>
              <Select value={skillId} onValueChange={setSkillId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select skill..." />
                </SelectTrigger>
                <SelectContent>
                  {skills.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Type */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium">Require Approval</p>
                <p className="text-sm text-gray-500">
                  Queue output for review before sending
                </p>
              </div>
              <Switch
                checked={actionType === 'approval'}
                onCheckedChange={(checked) =>
                  setActionType(checked ? 'approval' : 'auto')
                }
              />
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <Label>Send Output To (Optional)</Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (display only)</SelectItem>
                  {availableDestinations.map((dest) => (
                    <SelectItem key={dest.value} value={dest.value}>
                      {dest.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !name || !triggerSource || !skillId}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Trigger
          </Button>
        </div>
      </form>
    </div>
  );
}
