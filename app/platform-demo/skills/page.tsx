'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Sparkles, Mail, MessageSquare, FileText, Users, Calendar, BarChart, Zap } from 'lucide-react';

const mockSkills = [
  {
    id: '1',
    name: 'Personalized Outreach',
    description: 'Generate personalized cold emails based on lead data and company research',
    category: 'Sales',
    triggers: 2,
    executions: 127,
    icon: Mail,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  {
    id: '2',
    name: 'Meeting Summary',
    description: 'Summarize meeting recordings with action items and key decisions',
    category: 'Productivity',
    triggers: 1,
    executions: 45,
    icon: Calendar,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
  },
  {
    id: '3',
    name: 'Slack Thread Summary',
    description: 'Condense long Slack threads into actionable summaries',
    category: 'Communication',
    triggers: 1,
    executions: 234,
    icon: MessageSquare,
    iconColor: 'text-[#4A154B]',
    iconBg: 'bg-[#4A154B]/10',
  },
  {
    id: '4',
    name: 'Weekly Client Report',
    description: 'Generate weekly status reports for each client from project data',
    category: 'Reporting',
    triggers: 1,
    executions: 52,
    icon: BarChart,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
  },
  {
    id: '5',
    name: 'Follow-up Reminder',
    description: 'Draft follow-up emails for stale leads with personalized context',
    category: 'Sales',
    triggers: 1,
    executions: 89,
    icon: Users,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
  },
  {
    id: '6',
    name: 'Proposal Generator',
    description: 'Create customized proposals based on discovery call notes',
    category: 'Sales',
    triggers: 0,
    executions: 23,
    icon: FileText,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
  },
];

const categories = ['All', 'Sales', 'Productivity', 'Communication', 'Reporting'];

export default function DemoSkillsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-medium text-[#1a1a1a]">Skills</h1>
          <p className="text-[#666]">AI-powered capabilities you can automate</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Skill
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {categories.map((cat) => (
          <Badge
            key={cat}
            variant="outline"
            className={`cursor-pointer ${cat === 'All' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'text-[#666] border-[#e5e5e5] hover:bg-[#f8f8f6]'}`}
          >
            {cat}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockSkills.map((skill) => {
          const IconComponent = skill.icon;

          return (
            <Card key={skill.id} className="border-[#e5e5e5] hover:border-emerald-200 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl ${skill.iconBg}`}>
                    <IconComponent className={`h-5 w-5 ${skill.iconColor}`} />
                  </div>
                  <Badge variant="outline" className="text-xs border-[#e5e5e5] text-[#666]">
                    {skill.category}
                  </Badge>
                </div>
                <CardTitle className="text-base text-[#1a1a1a] mt-3">{skill.name}</CardTitle>
                <CardDescription className="text-[#666] text-sm">
                  {skill.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-[#999]">
                    <Zap className="h-3.5 w-3.5" />
                    <span>{skill.triggers} triggers</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#999]">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{skill.executions} runs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
