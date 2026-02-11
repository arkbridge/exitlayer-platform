'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, Clock, Users, MessageSquare, Mail, Calendar, Webhook, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const triggerTypes = [
  {
    id: 'hubspot_lead',
    name: 'New HubSpot Lead',
    description: 'Trigger when a new contact is added',
    icon: Users,
    iconColor: 'text-[#FF7A59]',
    iconBg: 'bg-[#FF7A59]/10',
    category: 'CRM',
  },
  {
    id: 'slack_thread',
    name: 'Long Slack Thread',
    description: 'Trigger when a thread exceeds N messages',
    icon: MessageSquare,
    iconColor: 'text-[#4A154B]',
    iconBg: 'bg-[#4A154B]/10',
    category: 'Communication',
  },
  {
    id: 'zoom_call',
    name: 'Zoom Call Ends',
    description: 'Trigger when a meeting recording is available',
    icon: Calendar,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    category: 'Meetings',
  },
  {
    id: 'schedule',
    name: 'Scheduled Time',
    description: 'Trigger at a specific time or interval',
    icon: Clock,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    category: 'Schedule',
  },
  {
    id: 'email_received',
    name: 'Email Received',
    description: 'Trigger when you receive an email',
    icon: Mail,
    iconColor: 'text-[#EA4335]',
    iconBg: 'bg-[#EA4335]/10',
    category: 'Email',
  },
  {
    id: 'webhook',
    name: 'Webhook',
    description: 'Trigger from any external service',
    icon: Webhook,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    category: 'Advanced',
  },
];

const skills = [
  { id: 'outreach', name: 'Personalized Outreach' },
  { id: 'summary', name: 'Meeting Summary' },
  { id: 'slack', name: 'Slack Thread Summary' },
  { id: 'report', name: 'Weekly Client Report' },
  { id: 'followup', name: 'Follow-up Reminder' },
  { id: 'proposal', name: 'Proposal Generator' },
];

export default function DemoNewTriggerPage() {
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/platform-demo/triggers">
          <Button variant="ghost" size="icon" className="text-[#666]">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-medium text-[#1a1a1a]">Create Trigger</h1>
          <p className="text-[#666]">Set up a new automation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Select Trigger */}
        <Card className="border-[#e5e5e5]">
          <CardHeader>
            <CardTitle className="text-base text-[#1a1a1a] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">1</span>
              Select a Trigger
            </CardTitle>
            <CardDescription className="text-[#666]">What should start this automation?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {triggerTypes.map((trigger) => {
                const IconComponent = trigger.icon;
                const isSelected = selectedTrigger === trigger.id;

                return (
                  <div
                    key={trigger.id}
                    onClick={() => setSelectedTrigger(trigger.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-2 border-emerald-500'
                        : 'bg-[#f8f8f6] border-2 border-transparent hover:border-[#e5e5e5]'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${trigger.iconBg}`}>
                      <IconComponent className={`h-4 w-4 ${trigger.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#1a1a1a] text-sm">{trigger.name}</p>
                      <p className="text-xs text-[#666]">{trigger.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Select Skill */}
        <Card className="border-[#e5e5e5]">
          <CardHeader>
            <CardTitle className="text-base text-[#1a1a1a] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">2</span>
              Select a Skill
            </CardTitle>
            <CardDescription className="text-[#666]">What should happen when triggered?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {skills.map((skill) => {
                const isSelected = selectedSkill === skill.id;

                return (
                  <div
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-2 border-emerald-500'
                        : 'bg-[#f8f8f6] border-2 border-transparent hover:border-[#e5e5e5]'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-amber-100">
                      <Zap className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#1a1a1a] text-sm">{skill.name}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary & Create */}
      {selectedTrigger && selectedSkill && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#666]">When</span>
                <span className="font-medium text-[#1a1a1a]">
                  {triggerTypes.find(t => t.id === selectedTrigger)?.name}
                </span>
                <ArrowRight className="h-4 w-4 text-[#ccc]" />
                <span className="text-sm text-[#666]">run</span>
                <span className="font-medium text-emerald-700">
                  {skills.find(s => s.id === selectedSkill)?.name}
                </span>
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Create Trigger
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
