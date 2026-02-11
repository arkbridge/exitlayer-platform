/**
 * ExitLayer Diagnostic Report Generator
 *
 * Purpose: Clinical analysis of current state, consequences, and fixes
 * Format: Data-driven, mathematical, presentation-ready
 * Usage: Day 10 call - walk through with client
 */

import { type AuditResponse, type ExitLayerScore } from './score-calculator';

// ============================================================================
// Financial Analysis
// ============================================================================

interface FinancialMetrics {
  // Current state
  monthlyRevenue: number;
  annualRevenue: number;
  ownerHourlyValue: number;
  hoursPerMonth: number;

  // Time allocation
  deliveryHours: number;
  salesHours: number;
  strategyHours: number;
  opsHours: number;
  mgmtHours: number;

  // Efficiency analysis
  highValueHours: number;
  lowValueHours: number;
  wastedHours: number;
  wastedValue: number;

  // Opportunity cost
  potentialRevenue: number;
  monthlyGap: number;
  annualGap: number;

  // Scale analysis
  hoursPerClient: number;
  additionalHoursFor5Clients: number;
  totalHoursNeeded: number;
  weeksPerWeekNeeded: number;
  scalable: boolean;

  // Exit value
  currentMultiple: number;
  currentExitValue: number;
  targetMultiple: number;
  targetExitValue: number;
  valueGap: number;
}

export function calculateFinancialMetrics(data: AuditResponse): FinancialMetrics {
  const monthlyRevenue = data.revenue_monthly_avg || 0;
  const annualRevenue = data.revenue_12mo || 0;

  const totalWeeklyHours = (data.time_delivery_hrs || 0) + (data.time_sales_hrs || 0) +
    (data.time_mgmt_hrs || 0) + (data.time_ops_hrs || 0) + (data.time_strategy_hrs || 0);
  const hoursPerMonth = totalWeeklyHours * 4.33;
  const ownerHourlyValue = hoursPerMonth > 0 ? monthlyRevenue / hoursPerMonth : 0;

  const deliveryHours = (data.time_delivery_hrs || 0) * 4.33;
  const salesHours = (data.time_sales_hrs || 0) * 4.33;
  const strategyHours = (data.time_strategy_hrs || 0) * 4.33;
  const opsHours = (data.time_ops_hrs || 0) * 4.33;
  const mgmtHours = (data.time_mgmt_hrs || 0) * 4.33;

  const highValueHours = salesHours + strategyHours;
  const lowValueHours = deliveryHours + opsHours;
  const wastedHours = (data.wasted_hours_week || 0) * 4.33;
  const wastedValue = wastedHours * ownerHourlyValue;

  const potentialRevenue = monthlyRevenue + (lowValueHours * ownerHourlyValue * 3);
  const monthlyGap = potentialRevenue - monthlyRevenue;
  const annualGap = monthlyGap * 12;

  const clientCount = data.client_count || 1;
  const hoursPerClient = deliveryHours / clientCount;
  const additionalHoursFor5Clients = hoursPerClient * 5;
  const totalHoursNeeded = hoursPerMonth + additionalHoursFor5Clients;
  const weeksPerWeekNeeded = totalHoursNeeded / 4.33;
  const scalable = weeksPerWeekNeeded <= 60;

  const ownerDependency = (data.projects_requiring_owner_pct || 0) / 100;
  const currentMultiple = 2 + (1 - ownerDependency) * 2;
  const currentExitValue = annualRevenue * currentMultiple;
  const targetMultiple = 5;
  const targetExitValue = annualRevenue * targetMultiple;
  const valueGap = targetExitValue - currentExitValue;

  return {
    monthlyRevenue,
    annualRevenue,
    ownerHourlyValue,
    hoursPerMonth,
    deliveryHours,
    salesHours,
    strategyHours,
    opsHours,
    mgmtHours,
    highValueHours,
    lowValueHours,
    wastedHours,
    wastedValue,
    potentialRevenue,
    monthlyGap,
    annualGap,
    hoursPerClient,
    additionalHoursFor5Clients,
    totalHoursNeeded,
    weeksPerWeekNeeded,
    scalable,
    currentMultiple,
    currentExitValue,
    targetMultiple,
    targetExitValue,
    valueGap,
  };
}

// ============================================================================
// Constraint Analysis
// ============================================================================

interface Constraint {
  area: string;
  observation: string;
  measurement: string;
  firstOrder: string[];
  secondOrder: string[];
  thirdOrder: string[];
  monthlyCost: {
    hours: number;
    dollars: number;
  };
}

export function identifyConstraints(data: AuditResponse, metrics: FinancialMetrics): Constraint[] {
  const constraints: Constraint[] = [];

  const totalWeeklyHrs = (data.time_delivery_hrs || 0) + (data.time_sales_hrs || 0) +
    (data.time_mgmt_hrs || 0) + (data.time_ops_hrs || 0) + (data.time_strategy_hrs || 0);
  const deliveryPct = totalWeeklyHrs > 0 ? Math.round(((data.time_delivery_hrs || 0) / totalWeeklyHrs) * 100) : 0;

  // Constraint 1: Owner time allocation
  if (deliveryPct >= 40) {
    constraints.push({
      area: 'Time Allocation',
      observation: `Owner spends ${data.time_delivery_hrs || 0} hrs/week (${deliveryPct}%) in delivery`,
      measurement: `${Math.round(metrics.deliveryHours)} hours/month, $${Math.round(metrics.deliveryHours * metrics.ownerHourlyValue).toLocaleString()} in time value`,
      firstOrder: [
        `${Math.round(metrics.deliveryHours)} hours/month not available for sales or strategy`,
        `${data.projects_requiring_owner_pct || 0}% of projects blocked without owner involvement`,
        `Team handles ${100 - (data.projects_requiring_owner_pct || 0)}% of projects independently`,
      ],
      secondOrder: [
        'Team skill development stagnates (owner always handles complex work)',
        `Sales pipeline receives ${Math.round(metrics.salesHours)} hrs/month vs needed ${Math.round(metrics.hoursPerMonth * 0.4)} hrs/month`,
        'Client service model depends on owner availability',
        'Quality assurance cannot scale beyond owner capacity',
      ],
      thirdOrder: [
        `Scale ceiling: ${Math.round(metrics.hoursPerMonth / (metrics.hoursPerClient || 1))} clients max at current model`,
        `Exit value: Business valued as owner-dependent (${metrics.currentMultiple.toFixed(1)}x vs ${metrics.targetMultiple}x multiple)`,
        `Burnout trajectory: ${totalWeeklyHrs} hrs/week unsustainable long-term`,
        'Team retention: Limited growth opportunities for senior talent',
      ],
      monthlyCost: {
        hours: Math.round(metrics.deliveryHours),
        dollars: Math.round(metrics.deliveryHours * metrics.ownerHourlyValue),
      },
    });
  }

  // Constraint 2: Documentation gap
  if ((data.documented_pct || 0) < 50) {
    const knowledgeTransferHours = 20;
    constraints.push({
      area: 'Process Documentation',
      observation: `${data.documented_pct || 0}% of processes documented, ${100 - (data.documented_pct || 0)}% undocumented`,
      measurement: `${100 - (data.knowledge_documented_pct || 0)}% of institutional knowledge not captured in systems`,
      firstOrder: [
        `~${knowledgeTransferHours} hours/month answering repeated questions`,
        `New hire productivity: ${data.onboard_time_new_hire || 'Unknown'} onboarding time`,
        `Process consistency: ${data.delivery_consistency || 0}/10 across team`,
      ],
      secondOrder: [
        'Vacation/absence creates operational gaps',
        'Quality variance across team members',
        'Decision-making bottlenecks at owner level',
        'Knowledge loss risk with any team member departure',
      ],
      thirdOrder: [
        `Exit due diligence: ${100 - (data.knowledge_documented_pct || 0)}% of value tied to individuals, not systems`,
        `Valuation impact: Multiple reduction from ${metrics.targetMultiple}x to ${metrics.currentMultiple.toFixed(1)}x`,
        'Scalability: Cannot franchise, license, or replicate without documentation',
      ],
      monthlyCost: {
        hours: knowledgeTransferHours,
        dollars: Math.round(knowledgeTransferHours * metrics.ownerHourlyValue),
      },
    });
  }

  // Constraint 3: Revenue concentration
  if ((data.top3_concentration_pct || 0) >= 50) {
    const monthlyRisk = ((data.top3_concentration_pct || 0) / 3 / 100) * metrics.monthlyRevenue;
    constraints.push({
      area: 'Revenue Concentration',
      observation: `${data.top3_concentration_pct || 0}% of revenue from top 3 clients`,
      measurement: `Single client departure = ${Math.round((data.top3_concentration_pct || 0) / 3)}% revenue loss ($${Math.round(monthlyRisk).toLocaleString()}/month)`,
      firstOrder: [
        `${data.client_count || 0} total clients, top 3 represent ${data.top3_concentration_pct || 0}% of revenue`,
        `Client pricing power: Concentrated revenue limits negotiating leverage`,
        `Churn rate: ${data.churn_rate_pct || 'Not tracked'}% annually`,
      ],
      secondOrder: [
        'Strategic decision-making constrained by client concentration risk',
        'Growth investment limited by need to protect existing revenue',
        'Team morale impacted by revenue volatility perception',
        'Operational flexibility reduced (cannot fire problematic clients)',
      ],
      thirdOrder: [
        `Exit risk: Acquirer discount of ~50% for concentration risk`,
        `Value impact: $${Math.round(metrics.valueGap / 1000).toLocaleString()}K in potential exit value reduction`,
        'Transaction risk: Key client departure during sale process',
      ],
      monthlyCost: {
        hours: 0,
        dollars: Math.round(monthlyRisk),
      },
    });
  }

  // Constraint 4: Team autonomy
  const teamCanDeliver = data.team_can_deliver === 'Yes';
  const approvalFrequency = data.approval_frequency || '';
  if (!teamCanDeliver || approvalFrequency === 'Multiple times per day' || approvalFrequency === 'Daily') {
    const approvalHours =
      approvalFrequency === 'Multiple times per day' ? 40 :
      approvalFrequency === 'Daily' ? 20 :
      approvalFrequency === 'Few times per week' ? 10 : 5;

    constraints.push({
      area: 'Team Autonomy',
      observation: `Team requires owner input ${approvalFrequency.toLowerCase() || 'frequently'}`,
      measurement: `Owner replaceability: ${data.owner_replaceability_delivery || 0}/10 in delivery, ${data.owner_replaceability_sales || 0}/10 in sales`,
      firstOrder: [
        `${approvalHours} hours/month in approval cycles`,
        `Team capabilities: Onboarding=${data.team_can_onboard === 'Yes' ? 'Yes' : 'No'}, Delivery=${teamCanDeliver ? 'Yes' : 'No'}, Sales=${data.team_can_close === 'Yes' ? 'Yes' : 'No'}`,
        `Team utilization: ${data.team_utilization_score || 0}/10 (capacity constraint)`,
      ],
      secondOrder: [
        'Team skill development blocked by lack of decision-making authority',
        'Employee retention risk: Senior talent seeks autonomy',
        'Operational delays during owner unavailability',
        'Timeline slippage from approval bottlenecks',
      ],
      thirdOrder: [
        'Organizational culture: Learned helplessness vs ownership mindset',
        'Talent acquisition: Difficulty attracting senior-level hires',
        'Business continuity: Complete dependency on owner presence',
      ],
      monthlyCost: {
        hours: approvalHours,
        dollars: Math.round(approvalHours * metrics.ownerHourlyValue),
      },
    });
  }

  // Constraint 5: Low recurring revenue
  if ((data.revenue_recurring_pct || 0) < 30) {
    const salesHoursNeeded = Math.round(metrics.hoursPerMonth * 0.4);
    constraints.push({
      area: 'Revenue Model',
      observation: `Only ${data.revenue_recurring_pct || 0}% recurring revenue`,
      measurement: `${100 - (data.revenue_recurring_pct || 0)}% of revenue requires constant new business development`,
      firstOrder: [
        `Constant pressure to close new deals`,
        `Revenue volatility month-to-month`,
        `Sales time required: ${salesHoursNeeded} hrs/month to maintain revenue`,
      ],
      secondOrder: [
        'Strategic planning impossible (uncertain cash flow)',
        'Hiring decisions constrained by revenue uncertainty',
        'Team stability at risk during slow sales periods',
        'Growth investment limited by cash flow volatility',
      ],
      thirdOrder: [
        'Business valuation: Lower multiple for project-based revenue',
        'Exit complexity: Acquirers discount non-recurring revenue',
        'Scale limitation: Linear growth (more clients = more sales effort)',
      ],
      monthlyCost: {
        hours: Math.round(salesHoursNeeded * 0.3),
        dollars: Math.round(salesHoursNeeded * 0.3 * metrics.ownerHourlyValue),
      },
    });
  }

  return constraints;
}

// ============================================================================
// Visual Charts (ASCII)
// ============================================================================

function generateTimeAllocationChart(data: AuditResponse): string {
  const makeBar = (pct: number) => '█'.repeat(Math.round(pct / 2));

  const totalHrs = (data.time_delivery_hrs || 0) + (data.time_sales_hrs || 0) +
    (data.time_mgmt_hrs || 0) + (data.time_ops_hrs || 0) + (data.time_strategy_hrs || 0);
  const delPct = totalHrs > 0 ? Math.round(((data.time_delivery_hrs || 0) / totalHrs) * 100) : 0;
  const salesPct = totalHrs > 0 ? Math.round(((data.time_sales_hrs || 0) / totalHrs) * 100) : 0;
  const mgmtPct = totalHrs > 0 ? Math.round(((data.time_mgmt_hrs || 0) / totalHrs) * 100) : 0;
  const stratPct = totalHrs > 0 ? Math.round(((data.time_strategy_hrs || 0) / totalHrs) * 100) : 0;
  const opsPct = totalHrs > 0 ? Math.round(((data.time_ops_hrs || 0) / totalHrs) * 100) : 0;

  return `
Current Time Allocation (${totalHrs} hrs/week):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Delivery      ${(data.time_delivery_hrs || 0).toString().padStart(3)}h (${delPct.toString().padStart(3)}%)  [${makeBar(delPct)}]
Sales         ${(data.time_sales_hrs || 0).toString().padStart(3)}h (${salesPct.toString().padStart(3)}%)  [${makeBar(salesPct)}]
Management    ${(data.time_mgmt_hrs || 0).toString().padStart(3)}h (${mgmtPct.toString().padStart(3)}%)  [${makeBar(mgmtPct)}]
Strategy      ${(data.time_strategy_hrs || 0).toString().padStart(3)}h (${stratPct.toString().padStart(3)}%)  [${makeBar(stratPct)}]
Operations    ${(data.time_ops_hrs || 0).toString().padStart(3)}h (${opsPct.toString().padStart(3)}%)  [${makeBar(opsPct)}]

Target Allocation (Industry Standard for Scalable Agency):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Delivery       10%  [█████]
Sales          40%  [████████████████████]
Management     20%  [██████████]
Strategy       15%  [███████]
Operations      5%  [██]
Buffer         10%  [█████]

Variance Analysis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Delivery:     ${delPct >= 10 ? '+' : ''}${delPct - 10} percentage points ${delPct > 10 ? '⚠️ TOO HIGH - You are the product' : '✓ Good'}
Sales:        ${salesPct >= 40 ? '+' : ''}${salesPct - 40} percentage points ${salesPct < 30 ? '⚠️ TOO LOW - Growth bottleneck' : '✓ Good'}
Strategy:     ${stratPct >= 15 ? '+' : ''}${stratPct - 15} percentage points ${stratPct < 10 ? '⚠️ TOO LOW - No thinking time' : '✓ Good'}
`;
}

function generateScaleAnalysis(data: AuditResponse, metrics: FinancialMetrics): string {
  const clientCount = data.client_count || 1;
  return `
Scale Analysis: What Happens When You Add 5 More Clients?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current State:
  Clients:                    ${clientCount}
  Owner hours/month:          ${Math.round(metrics.hoursPerMonth)}
  Hours per client (avg):     ${Math.round(metrics.hoursPerClient)}
  Delivery hours/month:       ${Math.round(metrics.deliveryHours)}

Projected State (+5 clients):
  Total clients:              ${clientCount + 5}
  Additional hours needed:    +${Math.round(metrics.additionalHoursFor5Clients)}
  Total hours required:       ${Math.round(metrics.totalHoursNeeded)}
  Hours per week:             ${Math.round(metrics.weeksPerWeekNeeded)}

Feasibility Assessment:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${metrics.scalable
  ? `⚠️  Technically possible but at capacity limit.
     → ${Math.round(metrics.weeksPerWeekNeeded)} hours/week is near burnout threshold.
     → No buffer for unexpected issues.
     → Quality will likely suffer.`
  : `❌  NOT FEASIBLE without structural changes.
     → ${Math.round(metrics.weeksPerWeekNeeded)} hours/week exceeds sustainable workload (60 hrs max).
     → You physically cannot add 5 clients at current model.
     → Must systematize before scaling.`}

The Math:
  Current max capacity:       ${Math.round(60 / (metrics.hoursPerClient || 1))} clients (at 60 hrs/week)
  Current client count:       ${clientCount}
  Remaining capacity:         ${Math.max(0, Math.round(60 / (metrics.hoursPerClient || 1)) - clientCount)} more clients
  To double clients:          Need to cut hours/client by 50% (systematization)
`;
}

function generateExitValueAnalysis(data: AuditResponse, metrics: FinancialMetrics): string {
  const ownerDep = data.projects_requiring_owner_pct || 0;
  return `
Exit Value Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current Valuation:
  Annual Revenue:             $${Math.round(metrics.annualRevenue / 1000).toLocaleString()}K
  Multiple:                   ${metrics.currentMultiple.toFixed(1)}x
  Exit Value:                 $${Math.round(metrics.currentExitValue / 1000).toLocaleString()}K

Target Valuation (Post-Optimization):
  Annual Revenue:             $${Math.round(metrics.annualRevenue / 1000).toLocaleString()}K
  Multiple:                   ${metrics.targetMultiple}x
  Exit Value:                 $${Math.round(metrics.targetExitValue / 1000).toLocaleString()}K

VALUE GAP:                    $${Math.round(metrics.valueGap / 1000).toLocaleString()}K
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is money you're leaving on the table by staying owner-dependent.

Why Your Multiple Is ${metrics.currentMultiple.toFixed(1)}x (Not ${metrics.targetMultiple}x):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current State (${metrics.currentMultiple.toFixed(1)}x):
  ❌ ${ownerDep}% of projects require owner
  ❌ ${data.documented_pct || 0}% of processes documented
  ❌ Key person risk (you)
  ❌ Revenue tied to your labor

Target State (${metrics.targetMultiple}x):
  ✓ Team-operated delivery (<20% owner involvement)
  ✓ 80%+ processes documented
  ✓ Transferable systems and IP
  ✓ Scalable without founder

Multiple Improvement Path:
  ${metrics.currentMultiple.toFixed(1)}x → 3.0x: Document core processes
  3.0x → 4.0x: Build team autonomy
  4.0x → 5.0x: Create productized offering
`;
}

function generateOwnerBottleneckAnalysis(data: AuditResponse, metrics: FinancialMetrics): string {
  const tasks = data.tasks_only_owner || 'Not specified';
  const decisions = data.decisions_only_owner || 'Not specified';
  const vacationBreaks = data.vacation_breaks || 'Not specified';
  const wishDelegate = data.wish_could_delegate || 'Not specified';

  return `
Owner Bottleneck Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What ONLY You Can Do (Tasks):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${tasks}

→ These are Week 3 build priorities. Each one needs:
  • SOP (how to do it)
  • Checklist (quality control)
  • Decision framework (when to escalate)

What ONLY You Can Decide:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${decisions}

→ These need decision frameworks, not just documentation.
  A decision framework = rules for WHEN to do what.
  Example: "If project value > $10K, owner approval required"

The Vacation Test (What Breaks If You Disappear for 2 Weeks):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${vacationBreaks}

→ This is your critical failure point list.
  These are the systems that MUST be built first.

What You WISH Someone Else Could Do:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${wishDelegate}

→ This is your highest pain point.
  Priority #1 for Week 3 systematization.
`;
}

function generateTeamAnalysis(data: AuditResponse): string {
  const teamSize = data.team_size_total || 0;
  const ft = data.team_ft || 0;
  const pt = data.team_pt || 0;
  const contractors = data.team_contractors || 0;

  return `
Team & Capability Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Team Composition:
  Total team size:            ${teamSize}
  Full-time:                  ${ft}
  Part-time:                  ${pt}
  Contractors:                ${contractors}

Team by Function:
  Delivery:                   ${data.team_delivery || 0}
  Sales:                      ${data.team_sales || 0}
  Admin/Ops:                  ${data.team_admin || 0}

Team Capability Assessment:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Team capability score:      ${data.team_capability_score || 0}/10
  Team utilization score:     ${data.team_utilization_score || 0}/10 ${(data.team_utilization_score || 0) <= 4 ? '⚠️ Team is slammed' : ''}

  Can onboard clients:        ${data.team_can_onboard || 'Unknown'} ${data.team_can_onboard === 'No' ? '← Easy win to fix' : ''}
  Can deliver projects:       ${data.team_can_deliver || 'Unknown'}
  Can close sales:            ${data.team_can_close || 'Unknown'}

Team Autonomy Gap:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Approval frequency:           ${data.approval_frequency || 'Not specified'}
Owner replaceability (delivery): ${data.owner_replaceability_delivery || 0}/10
Owner replaceability (sales):    ${data.owner_replaceability_sales || 0}/10

Decisions team SHOULD make but currently can't:
${data.wish_team_could_decide || 'Not specified'}

Missing skills on team:
${data.missing_skills || 'Not specified'}
`;
}

// ============================================================================
// Main Report Generator
// ============================================================================

export function generateDiagnosticReport(data: AuditResponse, score: ExitLayerScore): string {
  const metrics = calculateFinancialMetrics(data);
  const constraints = identifyConstraints(data, metrics);

  let report = '';

  // Header
  report += `
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                        EXITLAYER DIAGNOSTIC REPORT                          │
│                                                                             │
│  Client: ${(data.company_name || 'Unknown').substring(0, 65).padEnd(65)} │
│  Contact: ${(data.contact_name || 'Unknown').substring(0, 63).padEnd(63)} │
│  Date: ${new Date().toISOString().split('T')[0]}                                                      │
│                                                                             │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║                     OVERALL SCORE: ${score.overall.toString().padStart(2)}/100                          ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


════════════════════════════════════════════════════════════════════════════════
                              SECTION 1: CURRENT STATE
════════════════════════════════════════════════════════════════════════════════

Financial Metrics:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Monthly Revenue:              $${metrics.monthlyRevenue.toLocaleString()}
  Annual Revenue:               $${metrics.annualRevenue.toLocaleString()}
  Owner Hourly Value:           $${Math.round(metrics.ownerHourlyValue).toLocaleString()}/hour
  Hours Worked/Month:           ${Math.round(metrics.hoursPerMonth)}
  Hours Worked/Week:            ${Math.round(metrics.hoursPerMonth / 4.33)}

Operational Metrics:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Team Size:                    ${data.team_size_total || 0} (${data.team_ft || 0} FT, ${data.team_pt || 0} PT, ${data.team_contractors || 0} contractors)
  Client Count:                 ${data.client_count || 0}
  Avg Hours/Client:             ${Math.round(metrics.hoursPerClient)}
  Top 3 Concentration:          ${data.top3_concentration_pct || 0}%
  Recurring Revenue:            ${data.revenue_recurring_pct || 0}%
  Churn Rate:                   ${data.churn_rate_pct || 'Not tracked'}%

${generateTimeAllocationChart(data)}

ExitLayer Score Breakdown:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  OVERALL SCORE:                ${score.overall}/100

  Leverage:                     ${score.dimensions.leverage}/100 ${getScoreIndicator(score.dimensions.leverage)}
  Equity Potential:             ${score.dimensions.equityPotential}/100 ${getScoreIndicator(score.dimensions.equityPotential)}
  Revenue Risk:                 ${score.dimensions.revenueRisk}/100 ${getScoreIndicator(score.dimensions.revenueRisk)}
  Product Readiness:            ${score.dimensions.productReadiness}/100 ${getScoreIndicator(score.dimensions.productReadiness)}
  Implementation Capacity:      ${score.dimensions.implementationCapacity}/100 ${getScoreIndicator(score.dimensions.implementationCapacity)}

  PRIMARY CONSTRAINT:           ${score.analysis.primaryConstraint.dimension}
                                ${score.analysis.primaryConstraint.description}

  HIGHEST OPPORTUNITY:          ${score.analysis.highestOpportunity.dimension}
                                ${score.analysis.highestOpportunity.description}


════════════════════════════════════════════════════════════════════════════════
                           SECTION 2: CONSTRAINT ANALYSIS
════════════════════════════════════════════════════════════════════════════════

Identified ${constraints.length} primary constraints affecting your business:

`;

  constraints.forEach((constraint, index) => {
    report += `
┌─────────────────────────────────────────────────────────────────────────────┐
│ CONSTRAINT ${index + 1}: ${constraint.area.toUpperCase().padEnd(59)}│
└─────────────────────────────────────────────────────────────────────────────┘

Observation:
  ${constraint.observation}

Measurement:
  ${constraint.measurement}

First-Order Effects (Immediate):
${constraint.firstOrder.map(e => `  • ${e}`).join('\n')}

Second-Order Effects (Within 6 months):
${constraint.secondOrder.map(e => `  • ${e}`).join('\n')}

Third-Order Effects (Long-term/Exit Impact):
${constraint.thirdOrder.map(e => `  • ${e}`).join('\n')}

Monthly Cost:
  Time:     ${constraint.monthlyCost.hours} hours
  Value:    $${constraint.monthlyCost.dollars.toLocaleString()}
  Annual:   $${(constraint.monthlyCost.dollars * 12).toLocaleString()}

`;
  });

  // Aggregate impact
  const totalHours = constraints.reduce((sum, c) => sum + c.monthlyCost.hours, 0);
  const totalValue = constraints.reduce((sum, c) => sum + c.monthlyCost.dollars, 0);

  report += `
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AGGREGATE CONSTRAINT IMPACT                         │
└─────────────────────────────────────────────────────────────────────────────┘

  Total Monthly Cost:           ${totalHours} hours, $${totalValue.toLocaleString()}
  Total Annual Cost:            ${totalHours * 12} hours, $${(totalValue * 12).toLocaleString()}
  Exit Value Gap:               $${Math.round(metrics.valueGap / 1000).toLocaleString()}K

  → You are losing $${(totalValue * 12).toLocaleString()}/year in opportunity cost
  → Plus $${Math.round(metrics.valueGap / 1000).toLocaleString()}K in unrealized exit value


${generateOwnerBottleneckAnalysis(data, metrics)}

${generateTeamAnalysis(data)}


════════════════════════════════════════════════════════════════════════════════
                          SECTION 3: SCALE & EXIT ANALYSIS
════════════════════════════════════════════════════════════════════════════════

${generateScaleAnalysis(data, metrics)}

${generateExitValueAnalysis(data, metrics)}


════════════════════════════════════════════════════════════════════════════════
                            SECTION 4: CRITICAL FINDINGS
════════════════════════════════════════════════════════════════════════════════

Top findings that require immediate attention:

${score.analysis.criticalFindings.map((f, i) => `  ${i + 1}. ${f}`).join('\n\n')}


════════════════════════════════════════════════════════════════════════════════
                              SECTION 5: QUICK WINS
════════════════════════════════════════════════════════════════════════════════

These can be implemented this week with minimal effort:

${score.analysis.quickWins.map((w, i) => `  ${i + 1}. ${w}`).join('\n\n')}


════════════════════════════════════════════════════════════════════════════════
                          SECTION 6: RECOMMENDATIONS
════════════════════════════════════════════════════════════════════════════════

Based on your constraint analysis, here are your build priorities:

Week 2-4: System Development
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${score.recommendations.week2to4.map((rec) => `
┌─ PRIORITY ${rec.priority} ─────────────────────────────────────────────────────────┐
│
│  System:     ${rec.system}
│
│  Rationale:  ${rec.why}
│
│  Impact:     ${rec.impact}
│
└─────────────────────────────────────────────────────────────────────────────┘
`).join('\n')}

Post-Sprint: Productization Path
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Direction:
  ${score.recommendations.postSprint.productIdea}

Validation Sequence:
${score.recommendations.postSprint.validationSteps.map((step, i) => `  ${i + 1}. ${step}`).join('\n')}


════════════════════════════════════════════════════════════════════════════════
                              SECTION 7: THEIR WORDS
════════════════════════════════════════════════════════════════════════════════

Magic Wand Fix (What They'd Change First):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.magic_wand_fix || 'Not specified'}

What They're Most Excited About:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.sprint_excitement || 'Not specified'}

What They're Most Nervous About:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.sprint_anxiety || 'Not specified'}

Their Biggest Hope:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.sprint_hope || 'Not specified'}

Fear About Stepping Back From Delivery:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.delivery_exit_fear || 'Not specified'}

12-Month Vision:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.vision_12mo || 'Not specified'}

3-Year Vision:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.vision_3yr || 'Not specified'}


════════════════════════════════════════════════════════════════════════════════
                               END OF REPORT
════════════════════════════════════════════════════════════════════════════════

Next Session: Week 2 Architecture Workshop (Day 11)

Prepared by ExitLayer
${new Date().toISOString()}

════════════════════════════════════════════════════════════════════════════════
`;

  return report;
}

function getScoreIndicator(score: number): string {
  if (score <= 30) return '[RED - CRITICAL]';
  if (score <= 60) return '[YELLOW - NEEDS WORK]';
  return '[GREEN - STRONG]';
}

export default generateDiagnosticReport;
