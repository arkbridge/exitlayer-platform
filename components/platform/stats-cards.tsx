'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Activity, CheckSquare, Zap, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    executionsToday: number;
    pendingApprovals: number;
    activeTriggers: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Executions Today',
      value: stats.executionsToday,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: CheckSquare,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      alert: stats.pendingApprovals > 0,
    },
    {
      title: 'Active Triggers',
      value: stats.activeTriggers,
      icon: Zap,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className={card.alert ? 'border-amber-200' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className={`text-3xl font-bold mt-1 ${card.color}`}>
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
