'use client';

import { type ExitLayerScore, getScoreColor, getOverallInterpretation } from '@/lib/score-calculator';

// Simulated score data for preview
const mockScore: ExitLayerScore = {
  overall: 58,
  dimensions: {
    leverage: 42,
    equityPotential: 65,
    revenueRisk: 51,
    productReadiness: 72,
    implementationCapacity: 60,
  },
  analysis: {
    primaryConstraint: {
      dimension: 'Leverage',
      score: 42,
      description: 'You are the bottleneck. Over 70% of projects require your direct involvement, and you spend 35+ hours/week on tasks that could be systematized or delegated.',
    },
    highestOpportunity: {
      dimension: 'Product Readiness',
      score: 72,
      description: 'You have a proprietary methodology and strong client praise patterns. This is ripe for productization into a scalable offering.',
    },
    criticalFindings: [
      'Client concentration risk: Top 3 clients = 65% of revenue. Losing one would be catastrophic.',
      'Owner dependency in sales: You close 100% of deals. No sales can happen without you.',
      'No documented SOPs: Tribal knowledge makes delegation impossible and exit value low.',
      'Working 55+ hours/week with 40% on tasks below your pay grade.',
    ],
    quickWins: [
      'Document your client onboarding process this week (2-3 hours)',
      'Create a proposal template from your last 3 winning proposals',
      'Set up automatic invoice reminders in your accounting software',
      'Record a Loom of your most common client explanation',
    ],
  },
  financialMetrics: {
    monthlyRevenue: 85000,
    annualRevenue: 1020000,
    ownerHourlyValue: 387,
    totalWeeklyHours: 55,
    wastedValue: 362232,
    currentExitMultiple: 1.8,
    currentExitValue: 1836000,
    targetExitValue: 5100000,
    valueGap: 3264000,
  },
  recommendations: {
    week2to4: [
      {
        priority: 1,
        system: 'Client Onboarding Automation',
        why: 'You spend 8+ hours per new client on repetitive setup. This is highly systematizable.',
        impact: 'Save 6 hrs/client, improve consistency',
      },
      {
        priority: 2,
        system: 'Proposal Generator',
        why: 'Custom proposals take 4+ hours each. 80% of content is reusable.',
        impact: 'Cut proposal time by 75%',
      },
      {
        priority: 3,
        system: 'Client Reporting Dashboard',
        why: 'Manual reporting eats 5 hrs/week. Clients want real-time access anyway.',
        impact: 'Eliminate 5 hrs/week, increase client satisfaction',
      },
    ],
    postSprint: {
      productIdea: 'Based on your proprietary "Growth Accelerator Framework" and consistent client praise for your strategic audits, consider packaging a self-serve audit tool or group coaching program.',
      validationSteps: [
        'Survey 10 past clients about willingness to pay for DIY version',
        'Create a landing page and measure interest',
        'Run a pilot cohort at 50% of target price',
      ],
    },
  },
};

// Simulated form data that would come from the questionnaire
const mockFormData = {
  company_name: 'Acme Marketing Agency',
  contact_name: 'Sarah',
  time_delivery_hrs: 25,
  time_sales_hrs: 12,
  time_mgmt_hrs: 8,
  time_ops_hrs: 6,
  time_strategy_hrs: 4,
  projects_requiring_owner_pct: 75,
  vacation_breaks: "Everything falls apart. Client communication stops, nobody can make decisions on scope changes, and quality drops because I'm the only one who does final QA. Last time I tried to take a week off, I came back to three angry clients and a team that was paralyzed.",
  wish_could_delegate: "Writing proposals. I spend hours on each one and it's soul-crushing, but nobody else can capture our value proposition the way I can.",
  tasks_only_owner: "Strategy, pricing decisions, client escalations, final QA, closing deals",
  wasted_hours_week: 18,
  top3_concentration_pct: 65,
  has_sops: 'No',
  documented_pct: 15,
  has_deliverable_templates: 'No',
  owner_replaceability_sales: 2,
  team_can_close: 'No',
  revenue_recurring_pct: 35,
  new_clients_per_month: 2,
};

// ============================================
// INEFFICIENCY CASCADE LOGIC (same as ResultsDisplay)
// ============================================

interface Inefficiency {
  id: string;
  category: 'time' | 'systems' | 'sales' | 'risk' | 'knowledge';
  issue: string;
  yourData: string;
  directCost: string;
  directCostValue: number;
  cascadeEffect: string;
  feedsInto: string[];
}

function buildInefficiencies(score: ExitLayerScore, formData: Record<string, any>): Inefficiency[] {
  const ownerHourlyValue = score.financialMetrics.ownerHourlyValue;
  const totalWeeklyHours = score.financialMetrics.totalWeeklyHours;
  const monthlyRevenue = score.financialMetrics.monthlyRevenue;
  const annualRevenue = score.financialMetrics.annualRevenue;
  const wastedHoursWeekly = formData.wasted_hours_week || Math.round(totalWeeklyHours * 0.33);
  const wastedDollarsPerYear = wastedHoursWeekly * ownerHourlyValue * 52;

  const inefficiencies: Inefficiency[] = [];

  // 1. TIME INEFFICIENCIES
  if (wastedHoursWeekly > 5) {
    inefficiencies.push({
      id: 'wasted-hours',
      category: 'time',
      issue: 'Hours spent on tasks below your pay grade',
      yourData: `You spend ${wastedHoursWeekly} hours/week on tasks that should cost $50/hr, not your $${ownerHourlyValue}/hr`,
      directCost: `$${Math.round(wastedDollarsPerYear / 1000)}K/year in opportunity cost`,
      directCostValue: wastedDollarsPerYear,
      cascadeEffect: 'These hours aren\'t available for strategy, sales, or building systems - the only activities that grow enterprise value.',
      feedsInto: ['no-strategy-time', 'revenue-cap'],
    });
  }

  if (totalWeeklyHours > 50) {
    inefficiencies.push({
      id: 'overwork',
      category: 'time',
      issue: 'Unsustainable owner workload',
      yourData: `${totalWeeklyHours} hours/week - you're working ${Math.round((totalWeeklyHours / 40 - 1) * 100)}% more than a standard workweek`,
      directCost: 'Burnout risk, decision fatigue, reduced quality',
      directCostValue: 0,
      cascadeEffect: 'You can\'t think strategically when you\'re in survival mode. Every extra hour in the weeds is an hour not spent on the business.',
      feedsInto: ['owner-dependency', 'no-systems'],
    });
  }

  // 2. OWNER DEPENDENCY
  const projectsRequiringOwner = formData.projects_requiring_owner_pct || 0;
  if (projectsRequiringOwner > 50) {
    const revenueCappedAt = Math.round(annualRevenue * (100 / projectsRequiringOwner));
    inefficiencies.push({
      id: 'owner-dependency',
      category: 'time',
      issue: 'You are the delivery bottleneck',
      yourData: `${projectsRequiringOwner}% of projects require your direct involvement`,
      directCost: `Revenue capped at ~$${Math.round(revenueCappedAt / 1000)}K without adding more of YOU`,
      directCostValue: revenueCappedAt - annualRevenue,
      cascadeEffect: 'You can\'t scale delivery beyond your personal capacity. Every new client means more hours for you, not more leverage.',
      feedsInto: ['revenue-cap', 'exit-value'],
    });
  }

  // Sales dependency
  const salesReplaceability = formData.owner_replaceability_sales || 1;
  const teamCanClose = formData.team_can_close;
  if (salesReplaceability < 5 || teamCanClose === 'No') {
    const salesHours = formData.time_sales_hrs || 0;
    inefficiencies.push({
      id: 'sales-dependency',
      category: 'sales',
      issue: 'You are the entire sales department',
      yourData: teamCanClose === 'No' ? 'Your team cannot close deals without you' : `Sales replaceability: ${salesReplaceability}/10`,
      directCost: `Revenue growth limited to your ${salesHours || '?'} sales hours/week`,
      directCostValue: 0,
      cascadeEffect: 'Pipeline dies when you\'re sick, on vacation, or busy with delivery. No you = no new revenue.',
      feedsInto: ['revenue-cap', 'vacation-risk'],
    });
  }

  // 3. SYSTEMS INEFFICIENCIES
  const hasSOPs = formData.has_sops;
  const documentedPct = formData.documented_pct || 0;
  if (hasSOPs === 'No' || documentedPct < 30) {
    inefficiencies.push({
      id: 'no-sops',
      category: 'systems',
      issue: 'Tribal knowledge blocks delegation',
      yourData: hasSOPs === 'No' ? 'No documented SOPs' : `Only ${documentedPct}% of processes documented`,
      directCost: 'Every task requires your brain, every hire needs your time to train',
      directCostValue: 0,
      cascadeEffect: 'Without documentation, knowledge is trapped in your head. You can\'t hire to replace yourself because there\'s nothing to train from.',
      feedsInto: ['owner-dependency', 'hiring-blocked', 'exit-value'],
    });
  }

  const hasTemplates = formData.has_deliverable_templates;
  if (hasTemplates === 'No') {
    const hoursPerProject = 4;
    const projectsPerMonth = formData.new_clients_per_month || 2;
    const templateSavings = hoursPerProject * projectsPerMonth * 12 * ownerHourlyValue;
    inefficiencies.push({
      id: 'no-templates',
      category: 'systems',
      issue: 'Reinventing the wheel on every project',
      yourData: 'No templates for client deliverables',
      directCost: `~$${Math.round(templateSavings / 1000)}K/year recreating similar work`,
      directCostValue: templateSavings,
      cascadeEffect: 'Without templates, every project starts from scratch. Quality varies, delivery takes longer, and delegation is impossible.',
      feedsInto: ['wasted-hours', 'quality-inconsistency'],
    });
  }

  // 4. REVENUE RISK
  const top3Concentration = formData.top3_concentration_pct || 0;
  if (top3Concentration > 40) {
    const revenueAtRisk = Math.round((top3Concentration / 100) * annualRevenue);
    inefficiencies.push({
      id: 'client-concentration',
      category: 'risk',
      issue: 'Dangerous revenue concentration',
      yourData: `Top 3 clients = ${top3Concentration}% of revenue`,
      directCost: `$${Math.round(revenueAtRisk / 1000)}K at risk if one client leaves`,
      directCostValue: revenueAtRisk * 0.33,
      cascadeEffect: 'Acquirers see this as massive risk. One client departure could trigger a death spiral. This directly suppresses your exit multiple.',
      feedsInto: ['exit-value'],
    });
  }

  const recurringPct = formData.revenue_recurring_pct || 0;
  if (recurringPct < 50) {
    const nonRecurringRevenue = annualRevenue * ((100 - recurringPct) / 100);
    inefficiencies.push({
      id: 'low-recurring',
      category: 'risk',
      issue: 'Revenue resets every month',
      yourData: `Only ${recurringPct}% recurring revenue`,
      directCost: 'Constant hustle to replace $' + Math.round(nonRecurringRevenue / 12 / 1000) + 'K/month',
      directCostValue: 0,
      cascadeEffect: 'Project-based revenue means starting from zero each month. You\'re on a treadmill that never stops.',
      feedsInto: ['sales-dependency', 'exit-value'],
    });
  }

  // 5. KNOWLEDGE & VACATION
  const vacationBreaks = formData.vacation_breaks;
  if (vacationBreaks && vacationBreaks.length > 20) {
    inefficiencies.push({
      id: 'vacation-risk',
      category: 'knowledge',
      issue: 'The business can\'t survive without you',
      yourData: `When you leave: "${vacationBreaks.substring(0, 100)}${vacationBreaks.length > 100 ? '...' : ''}"`,
      directCost: 'You haven\'t had a real vacation in how long?',
      directCostValue: 0,
      cascadeEffect: 'This is the clearest sign of owner dependency. If the business breaks when you step away, you don\'t own a business - you own a job.',
      feedsInto: ['exit-value', 'burnout'],
    });
  }

  return inefficiencies;
}

// Individual inefficiency card component
function InefficiencyCard({ issue, index }: { issue: Inefficiency; index: number }) {
  return (
    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold flex-shrink-0 text-sm">
          {index + 1}
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="font-semibold text-slate-900">{issue.issue}</h4>
            <p className="text-sm text-slate-500 mt-1">{issue.yourData}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-red-50 rounded-lg p-3 border border-red-100">
              <div className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Direct Cost</div>
              <div className="text-sm text-red-800">{issue.directCost}</div>
            </div>
            <div className="flex-1 bg-amber-50 rounded-lg p-3 border border-amber-100">
              <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Cascade Effect</div>
              <div className="text-sm text-amber-800">{issue.cascadeEffect}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPreview() {
  const score = mockScore;
  const formData = mockFormData;

  const ownerHourlyValue = score.financialMetrics.ownerHourlyValue;
  const totalWeeklyHours = score.financialMetrics.totalWeeklyHours;
  const wastedHoursWeekly = formData.wasted_hours_week || Math.round(totalWeeklyHours * 0.33);
  const wastedHoursPerYear = wastedHoursWeekly * 52;
  const wastedDollarsPerYear = wastedHoursWeekly * ownerHourlyValue * 52;
  const exitValueGap = score.financialMetrics.valueGap;
  const currentMultiple = score.financialMetrics.currentExitMultiple;
  const targetMultiple = 5;

  const inefficiencies = buildInefficiencies(score, formData);
  const timeIssues = inefficiencies.filter(i => i.category === 'time');
  const systemsIssues = inefficiencies.filter(i => i.category === 'systems');
  const salesIssues = inefficiencies.filter(i => i.category === 'sales');
  const riskIssues = inefficiencies.filter(i => i.category === 'risk');
  const knowledgeIssues = inefficiencies.filter(i => i.category === 'knowledge');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-amber-100 border border-amber-300 rounded-xl p-4 mb-6 text-amber-800 text-sm">
          <strong>Preview Mode:</strong> This is simulated data to show what the results page looks like after completing the questionnaire.
        </div>

        <div className="space-y-6">
          {/* Hero: The Owner Tax */}
          <div className="bg-gradient-to-br from-red-950 via-red-900 to-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="text-red-300 text-sm font-semibold uppercase tracking-wider mb-2">Your Owner Tax</div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                You're losing <span className="text-red-400">${Math.round(wastedDollarsPerYear / 1000)}K</span>/year
              </h1>
              <p className="text-xl text-red-200/80 mb-8 max-w-2xl">
                to tasks below your pay grade. Here's how it adds up:
              </p>

              {/* Cascading Cost Breakdown */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                  <div className="text-red-300 text-sm font-medium mb-1">Hours Wasted Weekly</div>
                  <div className="text-4xl font-bold">{wastedHoursWeekly}</div>
                  <div className="text-red-200/60 text-sm mt-2">on tasks worth $50/hr when your time is worth ${ownerHourlyValue}/hr</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                  <div className="text-red-300 text-sm font-medium mb-1">Annual Cost</div>
                  <div className="text-4xl font-bold">${Math.round(wastedDollarsPerYear / 1000)}K</div>
                  <div className="text-red-200/60 text-sm mt-2">{wastedHoursPerYear} hours × ${ownerHourlyValue}/hr</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                  <div className="text-red-300 text-sm font-medium mb-1">Exit Value Lost</div>
                  <div className="text-4xl font-bold">${(exitValueGap / 1000000).toFixed(1)}M</div>
                  <div className="text-red-200/60 text-sm mt-2">the gap between {currentMultiple}x and {targetMultiple}x multiple</div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* THE INEFFICIENCY CASCADE - Twilight Style */}
          {/* ============================================ */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                The Inefficiency Cascade
              </h2>
              <p className="text-slate-300 mt-2">
                {inefficiencies.length} compounding issues identified. Each one feeds the others, creating a doom loop that suppresses your exit value.
              </p>
            </div>

            <div className="p-6 space-y-8">
              {/* TIME CATEGORY */}
              {timeIssues.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-slate-900">Time & Capacity</h3>
                  </div>
                  <div className="space-y-4">
                    {timeIssues.map((issue, i) => (
                      <InefficiencyCard key={issue.id} issue={issue} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* SYSTEMS CATEGORY */}
              {systemsIssues.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-slate-900">Systems & Documentation</h3>
                  </div>
                  <div className="space-y-4">
                    {systemsIssues.map((issue, i) => (
                      <InefficiencyCard key={issue.id} issue={issue} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* SALES CATEGORY */}
              {salesIssues.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-slate-900">Sales & Growth</h3>
                  </div>
                  <div className="space-y-4">
                    {salesIssues.map((issue, i) => (
                      <InefficiencyCard key={issue.id} issue={issue} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* RISK CATEGORY */}
              {riskIssues.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-slate-900">Revenue Risk</h3>
                  </div>
                  <div className="space-y-4">
                    {riskIssues.map((issue, i) => (
                      <InefficiencyCard key={issue.id} issue={issue} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* KNOWLEDGE CATEGORY */}
              {knowledgeIssues.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-slate-900">Knowledge & Continuity</h3>
                  </div>
                  <div className="space-y-4">
                    {knowledgeIssues.map((issue, i) => (
                      <InefficiencyCard key={issue.id} issue={issue} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* THE COMPOUNDING SUMMARY */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200">
                <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  How These Compound Into a ${(exitValueGap / 1000000).toFixed(1)}M Value Gap
                </h3>

                <div className="space-y-4 text-sm">
                  <p className="text-slate-700">
                    These {inefficiencies.length} inefficiencies don't exist in isolation. They feed each other in a doom loop:
                  </p>

                  <div className="bg-white/60 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                      <p className="text-slate-700"><strong>No documentation</strong> means you can't delegate, so <strong>you stay in delivery</strong></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                      <p className="text-slate-700"><strong>Stuck in delivery</strong> means no time for <strong>systems or strategy</strong></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                      <p className="text-slate-700"><strong>No systems</strong> means you can't hire to replace yourself, so <strong>revenue is capped</strong></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                      <p className="text-slate-700"><strong>Owner-dependent revenue</strong> means acquirers see risk, so <strong>your multiple stays at {currentMultiple}x</strong> instead of {targetMultiple}x</p>
                    </div>
                  </div>

                  <div className="bg-red-100 rounded-xl p-4 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-red-900">The Total Cost:</span>
                      <span className="text-2xl font-bold text-red-600">${(exitValueGap / 1000000).toFixed(1)}M</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">
                      That's the gap between your {currentMultiple}x multiple and the {targetMultiple}x you'd command with systems in place.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Your Score - Secondary info */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Your ExitLayer Score</h3>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold" style={{ color: getScoreColor(score.overall) }}>
                  {score.overall}
                </span>
                <span className="text-slate-400 text-sm">/100</span>
              </div>
            </div>
            <p className="text-slate-600 mb-4">{getOverallInterpretation(score.overall)}</p>

            <div className="grid grid-cols-5 gap-3">
              {[
                { key: 'leverage', label: 'Leverage', score: score.dimensions.leverage },
                { key: 'equityPotential', label: 'Equity', score: score.dimensions.equityPotential },
                { key: 'revenueRisk', label: 'Revenue', score: score.dimensions.revenueRisk },
                { key: 'productReadiness', label: 'Product', score: score.dimensions.productReadiness },
                { key: 'implementationCapacity', label: 'Capacity', score: score.dimensions.implementationCapacity },
              ].map((dim) => (
                <div key={dim.key} className="text-center">
                  <div className="text-lg font-bold" style={{ color: getScoreColor(dim.score) }}>
                    {dim.score}
                  </div>
                  <div className="text-xs text-slate-400 mb-1">{dim.label}</div>
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${dim.score}%`, backgroundColor: getScoreColor(dim.score) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Highest Opportunity */}
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
            <h3 className="text-lg font-bold text-emerald-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Your Highest Opportunity: {score.analysis.highestOpportunity.dimension}
            </h3>
            <p className="text-emerald-800">{score.analysis.highestOpportunity.description}</p>
          </div>

          {/* CTA */}
          <div className="bg-slate-900 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-3">Stop the bleeding.</h3>
            <p className="text-slate-300 mb-6 max-w-xl mx-auto">
              In a 30-minute discovery call, we'll map exactly which systems would break this doom loop and reclaim your ${Math.round(wastedDollarsPerYear / 1000)}K/year.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://calendly.com/michael-exitlayer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Book Your Discovery Call
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <p className="text-slate-400 text-sm mt-4">
              Your full diagnostic has been saved. Michael will review and follow up within 7-10 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
