/**
 * ExitLayer Score Calculator
 *
 * Takes audit questionnaire responses and calculates:
 * - 5 dimensional scores (0-100 each)
 * - Overall ExitLayer Score (weighted average)
 * - Primary constraint (lowest score)
 * - Highest opportunity (highest score)
 * - Insights and recommendations
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AuditResponse {
  // Section 0: About You
  full_name?: string;
  email?: string;
  company_name?: string;

  // Section 1: Business Fundamentals
  revenue_12mo: number;
  pricing_models?: string[];
  revenue_recurring_pct?: number;
  client_count?: number;
  top3_concentration_pct?: number;
  services?: Array<{
    name: string;
    revenue_pct: number;
    avg_value: number;
  }>;
  gross_margin_pct?: number | null;
  acquisition_channels?: string[];
  churn_rate_pct?: number | null;
  avg_client_tenure?: string;
  revenue_goal_12mo?: number;

  // Section 2: Time & Leverage
  time_delivery_hrs?: number;
  time_sales_hrs?: number;
  time_mgmt_hrs?: number;
  time_ops_hrs?: number;
  time_strategy_hrs?: number;
  projects_requiring_owner_pct?: number;
  owner_project_involvement?: string;  // New: % of projects requiring owner
  owner_sales_pct?: string;            // New: % of sales closed by owner
  tasks_only_owner?: string;
  decisions_only_owner?: string;
  vacation_breaks?: string;
  wish_could_delegate?: string;
  team_can_onboard?: string;
  team_can_deliver?: string;
  team_can_close?: string;
  onboard_blocker?: string;
  delivery_blocker?: string;
  sales_blocker?: string;
  delivery_bottleneck?: string;
  sales_bottleneck?: string;
  approval_frequency?: string;
  core_service_steps?: string;
  typical_project_duration?: string;

  // Section 3: Systems & Documentation
  has_sops?: string;
  sop_list?: string;
  documented_pct?: number;
  has_deliverable_templates?: string;
  template_types?: string[];
  delivery_consistency?: number;
  reinvent_frequency?: string;
  tools_crm?: string;
  tools_pm?: string;
  tools_comm?: string;
  tools_storage?: string;
  tools_accounting?: string;
  onboarding_documented?: string;
  has_kickoff_checklist?: string;
  has_qc_checklist?: string;
  onboard_time_new_hire?: string;
  top_systematize_need?: string;
  systematization_score?: number;
  failed_systematization?: string;

  // Section 4: Team & Capabilities
  team_size_total?: number;
  team_ft?: number;
  team_pt?: number;
  team_contractors?: number;
  missing_skills?: string;
  team_can_scale?: string;
  scale_blocker?: string;
  team_autonomy?: string;
  wish_team_could_decide?: string;
  team_capability_score?: number;
  team_utilization_score?: number;
  training_method?: string;
  has_account_manager?: string;
  team_member_who_could_lead?: string;
  team_trust_level?: number;
  delegation_blockers?: string[];

  // Section 5: Product & Market Position
  agency_description?: string;
  differentiation?: string;
  has_proprietary_method?: string;
  proprietary_method_description?: string;
  client_praise?: string;
  client_complaints?: string;
  core_service?: string;
  tried_productization?: string;
  productization_attempt?: string;
  productization_outcome?: string;
  has_audience?: string;
  audience_size?: string;
  creates_content?: string;
  ideal_client_description?: string;
  core_problem_solved?: string;
  product_blockers?: string[];
  positioning_clarity?: number;
  dream_product?: string;
  has_client_tiers?: string;
  client_tier_description?: string;
  high_touch_vs_scalable?: number;
  client_industry_concentration?: string[];

  // Section 6: Vision & Goals
  vision_12mo?: string;
  vision_3yr?: string;
  wants_exit?: string;
  personal_success_definition?: string;
  ideal_long_term_role?: string;
  magic_wand_fix?: string;
  delivery_exit_fear?: string;

  // Section 7: Delivery Workflow & Build Priorities
  core_delivery_walkthrough?: string;
  most_repeated_tasks?: string;
  judgment_calls?: string;
  quality_criteria?: string;
  common_mistakes?: string;
  tribal_knowledge?: string;
  must_stay_human?: string;
  tool_pain_points?: string;

  // Section 8: Final Insights
  missing_questions?: string;
  other_notes?: string;

  // Legacy fields (backward compatibility with old submissions)
  contact_name?: string;
  contact_email?: string;
  revenue_monthly_avg?: number;
  [key: string]: any;
}

export interface ExitLayerScore {
  overall: number;
  dimensions: {
    leverage: number;
    equityPotential: number;
    revenueRisk: number;
    productReadiness: number;
    implementationCapacity: number;
  };
  analysis: {
    primaryConstraint: {
      dimension: string;
      score: number;
      description: string;
    };
    highestOpportunity: {
      dimension: string;
      score: number;
      description: string;
    };
    criticalFindings: string[];
    quickWins: string[];
  };
  recommendations: {
    week2to4: Array<{
      priority: number;
      system: string;
      why: string;
      impact: string;
    }>;
    postSprint: {
      productIdea: string;
      validationSteps: string[];
    };
  };
  financialMetrics: {
    monthlyRevenue: number;
    annualRevenue: number;
    ownerHourlyValue: number;
    totalWeeklyHours: number;
    wastedValue: number;
    currentExitMultiple: number;
    currentExitValue: number;
    targetExitValue: number;
    valueGap: number;
  };
}

// ============================================================================
// Scoring Functions
// ============================================================================

function calculateLeverageScore(data: AuditResponse): number {
  const projectDependency = 40 * (1 - (data.projects_requiring_owner_pct || 0) / 100);

  const totalHours = (data.time_delivery_hrs || 0) + (data.time_sales_hrs || 0) +
    (data.time_mgmt_hrs || 0) + (data.time_ops_hrs || 0) + (data.time_strategy_hrs || 0);
  const deliveryPct = totalHours > 0 ? ((data.time_delivery_hrs || 0) / totalHours) * 100 : 0;
  const deliveryTime = 30 * (1 - deliveryPct / 100);

  // Derive replaceability from team autonomy signals
  const canDo = [data.team_can_onboard, data.team_can_deliver, data.team_can_close]
    .filter(v => v === 'Yes').length;
  const replaceability = (canDo / 3) * 20;

  const canOnboard = data.team_can_onboard === 'Yes';
  const canDeliver = data.team_can_deliver === 'Yes';
  const canClose = data.team_can_close === 'Yes';
  const teamAutonomy = (canOnboard ? 3.3 : 0) + (canDeliver ? 3.3 : 0) + (canClose ? 3.4 : 0);

  const score = projectDependency + deliveryTime + replaceability + teamAutonomy;
  return Math.round(Math.max(0, Math.min(100, score)));
}

function calculateEquityPotentialScore(data: AuditResponse): number {
  const documentation = ((data.documented_pct || 0) / 100) * 40;
  // Use template_types count if available (post-sale), fallback to has_deliverable_templates (pre-call)
  const templateCount = data.template_types?.length
    ? Math.min(data.template_types.length / 5, 1) * 15
    : (data.has_deliverable_templates === 'Yes' ? 15 : data.has_deliverable_templates === 'Some' ? 7.5 : 0);
  const systematization = ((data.systematization_score || 1) / 10) * 30;
  const proprietary = data.has_proprietary_method === 'Yes' ? 15 :
    data.has_proprietary_method === 'Sort of' ? 7.5 : 0;

  const score = documentation + templateCount + systematization + proprietary;
  return Math.round(Math.max(0, Math.min(100, score)));
}

function calculateRevenueRiskScore(data: AuditResponse): number {
  let score = 100;

  const concentrationRisk = Math.min((data.top3_concentration_pct || 0) / 100, 0.7) * (40 / 0.7);
  score -= concentrationRisk;

  if (data.churn_rate_pct !== null && data.churn_rate_pct !== undefined) {
    const churnRisk = Math.min(data.churn_rate_pct / 100, 0.5) * (30 / 0.5);
    score -= churnRisk;
  } else {
    score -= 10;
  }

  const recurringRisk = (1 - (data.revenue_recurring_pct || 0) / 100) * 20;
  score -= recurringRisk;

  const topChannel = data.acquisition_channels?.[0];
  const diversityRisk = topChannel === 'Referrals from past clients' ? 10 : 0;
  score -= diversityRisk;

  return Math.round(Math.max(0, Math.min(100, score)));
}

function calculateProductReadinessScore(data: AuditResponse): number {
  const repeatability = ((data.delivery_consistency || 1) / 10) * 30;
  const methodology = data.has_proprietary_method === 'Yes' ? 25 :
    data.has_proprietary_method === 'Sort of' ? 12.5 : 0;
  const positioning = ((data.positioning_clarity || 1) / 10) * 25;

  let audience = 0;
  if (data.has_audience === 'Yes' || data.has_audience === 'Small audience') {
    audience = data.creates_content === 'Yes, consistently' ? 20 : 10;
  }

  const score = repeatability + methodology + positioning + audience;
  return Math.round(Math.max(0, Math.min(100, score)));
}

function calculateImplementationCapacityScore(data: AuditResponse): number {
  const workloadCapacity = ((data.team_utilization_score || 1) / 10) * 40;
  const teamCapability = ((data.team_capability_score || 1) / 10) * 30;
  // Use team trust level as implementation readiness proxy
  const readiness = ((data.team_trust_level || 5) / 10) * 30;

  const score = workloadCapacity + teamCapability + readiness;
  return Math.round(Math.max(0, Math.min(100, score)));
}

function calculateOverallScore(dimensions: ExitLayerScore['dimensions']): number {
  const weighted = (
    dimensions.leverage * 0.30 +
    dimensions.productReadiness * 0.25 +
    dimensions.revenueRisk * 0.20 +
    dimensions.equityPotential * 0.15 +
    dimensions.implementationCapacity * 0.10
  );
  return Math.round(weighted);
}

// ============================================================================
// Analysis Functions
// ============================================================================

function identifyPrimaryConstraint(dimensions: ExitLayerScore['dimensions']): ExitLayerScore['analysis']['primaryConstraint'] {
  const scores = [
    { dimension: 'Leverage', score: dimensions.leverage, key: 'leverage' },
    { dimension: 'Equity Potential', score: dimensions.equityPotential, key: 'equityPotential' },
    { dimension: 'Revenue Risk', score: dimensions.revenueRisk, key: 'revenueRisk' },
    { dimension: 'Product Readiness', score: dimensions.productReadiness, key: 'productReadiness' },
    { dimension: 'Implementation Capacity', score: dimensions.implementationCapacity, key: 'implementationCapacity' },
  ];

  const lowest = scores.reduce((min, curr) => curr.score < min.score ? curr : min);

  const descriptions: Record<string, string> = {
    leverage: 'You ARE the bottleneck. Most projects require your direct involvement, limiting scale.',
    equityPotential: 'Limited documented IP. Your business value is tied to your personal labor.',
    revenueRisk: 'Revenue is fragile. High client concentration or churn creates instability.',
    productReadiness: 'Not ready for productization. Services lack repeatability or clear positioning.',
    implementationCapacity: 'Team is maxed out. No bandwidth to implement new systems.',
  };

  return {
    dimension: lowest.dimension,
    score: lowest.score,
    description: descriptions[lowest.key],
  };
}

function identifyHighestOpportunity(dimensions: ExitLayerScore['dimensions']): ExitLayerScore['analysis']['highestOpportunity'] {
  const scores = [
    { dimension: 'Leverage', score: dimensions.leverage, key: 'leverage' },
    { dimension: 'Equity Potential', score: dimensions.equityPotential, key: 'equityPotential' },
    { dimension: 'Revenue Risk', score: dimensions.revenueRisk, key: 'revenueRisk' },
    { dimension: 'Product Readiness', score: dimensions.productReadiness, key: 'productReadiness' },
    { dimension: 'Implementation Capacity', score: dimensions.implementationCapacity, key: 'implementationCapacity' },
  ];

  const highest = scores.reduce((max, curr) => curr.score > max.score ? curr : max);

  const descriptions: Record<string, string> = {
    leverage: 'Strong leverage already. Team is capable of autonomous delivery.',
    equityPotential: 'Strong IP foundation. Well-documented systems and processes.',
    revenueRisk: 'Revenue is stable. Diversified client base and strong retention.',
    productReadiness: 'Closest to productization. Clear positioning and repeatable services.',
    implementationCapacity: 'Bandwidth to execute. Team has capacity and capability.',
  };

  return {
    dimension: highest.dimension,
    score: highest.score,
    description: descriptions[highest.key],
  };
}

function generateCriticalFindings(data: AuditResponse, dimensions: ExitLayerScore['dimensions']): string[] {
  const findings: string[] = [];

  if ((data.projects_requiring_owner_pct || 0) >= 70) {
    findings.push(`${data.projects_requiring_owner_pct}% of projects require YOUR direct involvement. This is unsustainable.`);
  }

  const totalHours = (data.time_delivery_hrs || 0) + (data.time_sales_hrs || 0) +
    (data.time_mgmt_hrs || 0) + (data.time_ops_hrs || 0) + (data.time_strategy_hrs || 0);
  const deliveryPct = totalHours > 0 ? Math.round(((data.time_delivery_hrs || 0) / totalHours) * 100) : 0;
  if (deliveryPct >= 40) {
    findings.push(`You spend ${deliveryPct}% of your time in delivery. You ARE the product.`);
  }

  if (data.team_can_deliver !== 'Yes' && data.team_can_close !== 'Yes') {
    findings.push('Your team cannot deliver or close sales without you. The business can\'t run without you.');
  }

  if ((data.top3_concentration_pct || 0) >= 50) {
    findings.push(`Top 3 clients = ${data.top3_concentration_pct}% of revenue. Losing one could be catastrophic.`);
  }

  if ((data.churn_rate_pct || 0) >= 30) {
    findings.push(`${data.churn_rate_pct}% annual churn. This indicates a delivery or value problem.`);
  }

  if ((data.revenue_recurring_pct || 0) < 30) {
    findings.push(`Only ${data.revenue_recurring_pct}% recurring revenue. You're constantly hunting for new business.`);
  }

  if ((data.documented_pct || 0) < 30) {
    findings.push(`Only ${data.documented_pct}% of processes documented. Your business can't scale or sell.`);
  }

  if ((data.positioning_clarity || 0) <= 5) {
    findings.push(`Positioning clarity: ${data.positioning_clarity}/10. Unclear positioning makes growth hard.`);
  }

  if ((data.team_utilization_score || 0) <= 3) {
    findings.push(`Team utilization: ${data.team_utilization_score}/10. Everyone is slammed.`);
  }

  return findings.slice(0, 5);
}

function generateQuickWins(data: AuditResponse): string[] {
  const wins: string[] = [];

  if (data.has_kickoff_checklist !== 'Yes') {
    wins.push('Build project kickoff checklist (30 min build, immediate impact)');
  }
  if (data.has_qc_checklist !== 'Yes') {
    wins.push('Build QA/quality control checklist (30 min build, delegate quality assurance)');
  }
  if (data.has_deliverable_templates !== 'Yes') {
    wins.push('Build client deliverable templates (1 hour build, saves 5+ hours/week)');
  }
  if (data.onboarding_documented !== 'Yes') {
    wins.push('Document client onboarding process (2 hours, enables team autonomy)');
  }
  if (data.magic_wand_fix) {
    wins.push(`Address your #1 pain point: "${data.magic_wand_fix.substring(0, 60)}..."`);
  }

  return wins.slice(0, 5);
}

function generateWeek2to4Recommendations(
  data: AuditResponse,
  dimensions: ExitLayerScore['dimensions']
): ExitLayerScore['recommendations']['week2to4'] {
  const recommendations: ExitLayerScore['recommendations']['week2to4'] = [];
  const constraint = identifyPrimaryConstraint(dimensions);

  if (constraint.dimension === 'Leverage' || dimensions.leverage < 50) {
    recommendations.push({
      priority: 1,
      system: `Systematize: ${data.top_systematize_need || 'core delivery process'}`,
      why: 'Owner delivery dependency is your biggest bottleneck',
      impact: 'Reclaim time for growth activities',
    });

    if (data.decisions_only_owner) {
      recommendations.push({
        priority: 2,
        system: 'Build decision frameworks for key judgment calls',
        why: 'Team needs your approval too frequently',
        impact: 'Enable team autonomy, reduce approval dependency',
      });
    }
  }

  if (constraint.dimension === 'Equity Potential' || dimensions.equityPotential < 50) {
    recommendations.push({
      priority: recommendations.length + 1,
      system: `Document ${data.top_systematize_need || 'core processes'}`,
      why: `Only ${data.documented_pct || 0}% of processes documented`,
      impact: 'Create sellable IP, reduce key person dependency',
    });
  }

  if (dimensions.productReadiness >= 60) {
    recommendations.push({
      priority: recommendations.length + 1,
      system: `Package "${data.core_service}" as productized offering`,
      why: `High repeatability and clear positioning ready for scale`,
      impact: 'Create scalable revenue stream',
    });
  }

  if (data.has_kickoff_checklist !== 'Yes') {
    recommendations.push({
      priority: recommendations.length + 1,
      system: 'Project kickoff checklist',
      why: 'Quick win - standardizes project starts',
      impact: 'Consistent delivery, faster onboarding',
    });
  }

  return recommendations.slice(0, 5);
}

function generateProductIdea(data: AuditResponse): string {
  const coreService = data.core_service || 'your core service';

  if (data.has_proprietary_method === 'Yes' && data.proprietary_method_description) {
    return `Productize your "${data.proprietary_method_description}" methodology applied to ${coreService}. Package it as a fixed-scope offering with your internal systems as the delivery engine.`;
  }

  return `Productize "${coreService}" as a standardized offering. Use the internal systems we build as the foundation for predictable, scalable delivery.`;
}

function generateValidationSteps(data: AuditResponse): string[] {
  const service = data.core_service || 'your core service';
  return [
    `Validate demand: Talk to 5 ideal clients about packaged "${service}" offering`,
    'Price test: Run pricing experiments (survey or direct conversations)',
    'Pilot offer: Run 3 clients through productized version, gather feedback',
    'Refine delivery: Optimize internal systems based on pilot learnings',
    'Launch: Public announcement, waitlist, first cohort',
  ];
}

function calculateFinancialMetrics(data: AuditResponse): ExitLayerScore['financialMetrics'] {
  const annualRevenue = data.revenue_12mo || 0;
  const monthlyRevenue = Math.round(annualRevenue / 12);

  const totalWeeklyHours = (data.time_delivery_hrs || 0) + (data.time_sales_hrs || 0) +
    (data.time_mgmt_hrs || 0) + (data.time_ops_hrs || 0) + (data.time_strategy_hrs || 0);
  const hoursPerMonth = totalWeeklyHours * 4.33;
  const ownerHourlyValue = hoursPerMonth > 0 ? monthlyRevenue / hoursPerMonth : 0;

  // Estimate wasted value from delivery hours (owner doing delivery = delegatable time)
  const estimatedWastedHours = (data.time_delivery_hrs || 0) * ((data.projects_requiring_owner_pct || 0) / 100);
  const wastedValue = estimatedWastedHours * 4.33 * ownerHourlyValue;

  const ownerDependency = (data.projects_requiring_owner_pct || 0) / 100;
  const currentExitMultiple = 2 + (1 - ownerDependency) * 2;
  const currentExitValue = annualRevenue * currentExitMultiple;
  const targetExitValue = annualRevenue * 5;
  const valueGap = targetExitValue - currentExitValue;

  return {
    monthlyRevenue,
    annualRevenue,
    ownerHourlyValue: Math.round(ownerHourlyValue),
    totalWeeklyHours,
    wastedValue: Math.round(wastedValue),
    currentExitMultiple: Math.round(currentExitMultiple * 10) / 10,
    currentExitValue: Math.round(currentExitValue),
    targetExitValue: Math.round(targetExitValue),
    valueGap: Math.round(valueGap),
  };
}

// ============================================================================
// Main Calculator Function
// ============================================================================

export function calculateExitLayerScore(data: AuditResponse): ExitLayerScore {
  const dimensions = {
    leverage: calculateLeverageScore(data),
    equityPotential: calculateEquityPotentialScore(data),
    revenueRisk: calculateRevenueRiskScore(data),
    productReadiness: calculateProductReadinessScore(data),
    implementationCapacity: calculateImplementationCapacityScore(data),
  };

  const overall = calculateOverallScore(dimensions);
  const primaryConstraint = identifyPrimaryConstraint(dimensions);
  const highestOpportunity = identifyHighestOpportunity(dimensions);
  const criticalFindings = generateCriticalFindings(data, dimensions);
  const quickWins = generateQuickWins(data);
  const week2to4 = generateWeek2to4Recommendations(data, dimensions);
  const productIdea = generateProductIdea(data);
  const validationSteps = generateValidationSteps(data);
  const financialMetrics = calculateFinancialMetrics(data);

  return {
    overall,
    dimensions,
    analysis: {
      primaryConstraint,
      highestOpportunity,
      criticalFindings,
      quickWins,
    },
    recommendations: {
      week2to4,
      postSprint: {
        productIdea,
        validationSteps,
      },
    },
    financialMetrics,
  };
}

// ============================================================================
// Score Interpretation Helpers
// ============================================================================

export function getScoreLevel(score: number): 'red' | 'yellow' | 'green' {
  if (score <= 30) return 'red';
  if (score <= 60) return 'yellow';
  return 'green';
}

export function getOverallInterpretation(score: number): string {
  if (score <= 40) return 'Crisis mode. Multiple critical issues need immediate attention.';
  if (score <= 55) return 'Significant gaps. Major improvements needed before productization.';
  if (score <= 70) return 'On track. Good foundation, need to address key bottlenecks.';
  if (score <= 85) return 'Strong position. Ready for productization with minor refinements.';
  return 'Exceptional. You have strong systems and clear path to scale.';
}

export function getDimensionDescription(dimension: string): string {
  const descriptions: Record<string, string> = {
    leverage: 'How dependent is the business on you personally?',
    equityPotential: 'How much sellable IP and infrastructure do you own?',
    revenueRisk: 'How stable and diversified is your revenue?',
    productReadiness: 'How close are you to a productized offering?',
    implementationCapacity: 'Can you actually execute on new systems?',
  };
  return descriptions[dimension] || '';
}

export function getScoreColor(score: number): string {
  if (score <= 30) return '#ef4444'; // red-500
  if (score <= 60) return '#f59e0b'; // amber-500
  return '#10b981'; // emerald-500
}

// ============================================================================
// VALUATION ENGINE — SDE × Multiple
// Takes the 17-question quiz data and produces current/potential exit prices
// Now includes 7 multiple factors + qualification staging
// ============================================================================

export interface MultipleFactor {
  id: string;
  name: string;
  currentAdjustment: number;
  potentialAdjustment: number;
  dollarImpact: number;
  description: string;
  userAnswer: string;
  severity: 'critical' | 'moderate' | 'good';
}

export interface ActionItem {
  rank: number;
  action: string;
  dollarImpact: number;
  factorId: string;
  description: string;
}

export interface ValuationResult {
  currentValuation: number;
  potentialValuation: number;
  valuationGap: number;
  sde: number;
  annualRevenue: number;
  annualProfit: number;
  ownerComp: number;
  currentMultiple: number;
  potentialMultiple: number;
  factors: MultipleFactor[];
  actionItems: ActionItem[];
  ownerHoursPerWeek: number;
  teamSize: number;
  clientCount: number;
  // New precision fields
  ownerProjectInvolvement: string;
  ownerSalesPct: string;
  approvalFrequency: string;
  // Qualification
  stage: 0 | 1 | 2 | 3;
  stageLabel: string;
  ctaType: 'free-guide' | 'book-call' | 'darwin-group';
}

const BASE_MULTIPLE = 2.5;

const MARGIN_MAP: Record<string, number> = {
  'Less than 10%': 0.05,
  '10-20%': 0.15,
  '20-30%': 0.25,
  '30-40%': 0.35,
  '40%+': 0.50,
  'Not sure': 0.25,
};

export function calculateValuation(data: Record<string, any>): ValuationResult {
  // --- Step 1: Calculate SDE (Seller's Discretionary Earnings) ---
  const annualRevenue = Number(data.annual_revenue) || 0;
  const ownerComp = Number(data.owner_annual_comp) || 0;
  const margin = MARGIN_MAP[data.profit_margin] || 0.25;
  const annualProfit = annualRevenue * margin;
  const sde = annualProfit + ownerComp;

  // --- Step 2: Calculate each multiple factor ---
  const factors: MultipleFactor[] = [];

  // Factor 1: Owner Dependency (biggest lever — ±1.0x)
  const depMap: Record<string, { adj: number; sev: 'critical' | 'moderate' | 'good' }> = {
    'Everything stops. The business IS me.': { adj: -1.0, sev: 'critical' },
    'Major problems — clients would notice': { adj: -0.5, sev: 'critical' },
    "Some things would slip, but it'd survive": { adj: 0.0, sev: 'moderate' },
    'It would run fine without me': { adj: 0.5, sev: 'good' },
  };
  const dep = depMap[data.without_you] || { adj: -0.5, sev: 'moderate' as const };
  const depPotential = 0.5; // after ExitLayer: business runs without you
  factors.push({
    id: 'owner-dependency',
    name: 'Owner Dependency',
    currentAdjustment: dep.adj,
    potentialAdjustment: Math.max(dep.adj, depPotential),
    dollarImpact: Math.round(Math.abs(Math.max(dep.adj, depPotential) - dep.adj) * sde),
    description: dep.adj <= -0.5
      ? "Your business can't function without you. Acquirers see this as their biggest risk."
      : dep.adj < 0.5
      ? 'Some dependency remains. Reducing it further would increase your multiple.'
      : 'Low owner dependency. This is what acquirers want to see.',
    userAnswer: data.without_you || 'Not answered',
    severity: dep.sev,
  });

  // Factor 2: Revenue Model (±0.4x)
  const revMap: Record<string, { adj: number; sev: 'critical' | 'moderate' | 'good' }> = {
    'Mostly project-based': { adj: -0.3, sev: 'moderate' },
    'Mix of projects and retainers': { adj: 0.0, sev: 'moderate' },
    'Mostly retainers / recurring': { adj: 0.4, sev: 'good' },
  };
  const rev = revMap[data.revenue_model] || { adj: 0, sev: 'moderate' as const };
  const revPotential = data.revenue_model === 'Mostly retainers / recurring' ? 0.4 :
    data.revenue_model === 'Mix of projects and retainers' ? 0.4 : 0.0;
  factors.push({
    id: 'revenue-model',
    name: 'Revenue Model',
    currentAdjustment: rev.adj,
    potentialAdjustment: Math.max(rev.adj, revPotential),
    dollarImpact: Math.round(Math.abs(Math.max(rev.adj, revPotential) - rev.adj) * sde),
    description: rev.adj < 0
      ? 'Project-based revenue means starting from zero every month. Retainers are valued far higher.'
      : rev.adj === 0
      ? 'Mix of project and recurring. Moving toward more retainers would boost your multiple.'
      : 'Strong recurring revenue. This makes your business predictable and valuable.',
    userAnswer: data.revenue_model || 'Not answered',
    severity: rev.sev,
  });

  // Factor 3: Client Concentration (±0.5x)
  const concMap: Record<string, { adj: number; sev: 'critical' | 'moderate' | 'good' }> = {
    'More than 50%': { adj: -0.5, sev: 'critical' },
    '25-50%': { adj: -0.3, sev: 'moderate' },
    '10-25%': { adj: 0.0, sev: 'moderate' },
    'Less than 10%': { adj: 0.2, sev: 'good' },
  };
  const conc = concMap[data.top_client_pct] || { adj: 0, sev: 'moderate' as const };
  const concPotential = data.top_client_pct === 'More than 50%' ? -0.3 :
    data.top_client_pct === '25-50%' ? 0.0 :
    data.top_client_pct === '10-25%' ? 0.2 : 0.2;
  factors.push({
    id: 'client-concentration',
    name: 'Client Concentration',
    currentAdjustment: conc.adj,
    potentialAdjustment: Math.max(conc.adj, concPotential),
    dollarImpact: Math.round(Math.abs(Math.max(conc.adj, concPotential) - conc.adj) * sde),
    description: conc.adj <= -0.3
      ? 'Losing your top client could be catastrophic. Acquirers price this risk in heavily.'
      : conc.adj < 0.2
      ? 'Moderate concentration. Diversifying would reduce risk and increase your multiple.'
      : 'Well-diversified client base. Low risk for acquirers.',
    userAnswer: data.top_client_pct || 'Not answered',
    severity: conc.sev,
  });

  // Factor 4: Documentation & Systems (±0.4x)
  const docMap: Record<string, { adj: number; sev: 'critical' | 'moderate' | 'good' }> = {
    'Nothing is documented': { adj: -0.4, sev: 'critical' },
    'A few rough notes here and there': { adj: -0.2, sev: 'moderate' },
    'Most processes have some documentation': { adj: 0.2, sev: 'moderate' },
    'Fully documented with SOPs and templates': { adj: 0.4, sev: 'good' },
  };
  const doc = docMap[data.documented_level] || { adj: -0.2, sev: 'moderate' as const };
  const docPotential = 0.4; // after ExitLayer: fully documented
  factors.push({
    id: 'documentation',
    name: 'Documentation & Systems',
    currentAdjustment: doc.adj,
    potentialAdjustment: Math.max(doc.adj, docPotential),
    dollarImpact: Math.round(Math.abs(Math.max(doc.adj, docPotential) - doc.adj) * sde),
    description: doc.adj <= -0.2
      ? "Without documentation, your business knowledge dies with you. Nothing to transfer in a sale."
      : doc.adj < 0.4
      ? 'Some documentation exists. Full SOPs would significantly increase transferability.'
      : 'Fully documented. This is a major asset in any acquisition.',
    userAnswer: data.documented_level || 'Not answered',
    severity: doc.sev,
  });

  // Factor 5: Proprietary IP (±0.4x)
  const ipMap: Record<string, { adj: number; sev: 'critical' | 'moderate' | 'good' }> = {
    'No': { adj: -0.2, sev: 'moderate' },
    'Sort of': { adj: 0.1, sev: 'moderate' },
    'Yes': { adj: 0.4, sev: 'good' },
  };
  const ip = ipMap[data.has_proprietary_method] || { adj: -0.1, sev: 'moderate' as const };
  const ipPotential = 0.4; // after ExitLayer: formalized named methodology
  factors.push({
    id: 'proprietary-ip',
    name: 'Proprietary IP',
    currentAdjustment: ip.adj,
    potentialAdjustment: Math.max(ip.adj, ipPotential),
    dollarImpact: Math.round(Math.abs(Math.max(ip.adj, ipPotential) - ip.adj) * sde),
    description: ip.adj < 0
      ? "No differentiated methodology. You're selling commoditized labor — and labor is what AI replaces."
      : ip.adj < 0.4
      ? "You have something unique but it's not formalized. Formalizing it creates sellable IP."
      : 'Strong proprietary methodology. This is what acquirers pay a premium for.',
    userAnswer: data.has_proprietary_method || 'Not answered',
    severity: ip.sev,
  });

  // Factor 6: Delivery Involvement (±0.3x) - NEW
  const deliveryMap: Record<string, { adj: number; sev: 'critical' | 'moderate' | 'good' }> = {
    'Nearly all (90%+)': { adj: -0.3, sev: 'critical' },
    'Most (70-90%)': { adj: -0.2, sev: 'critical' },
    'About half (40-70%)': { adj: -0.1, sev: 'moderate' },
    'Some (20-40%)': { adj: 0.1, sev: 'moderate' },
    'Few or none (<20%)': { adj: 0.3, sev: 'good' },
  };
  const delivery = deliveryMap[data.owner_project_involvement] || { adj: -0.1, sev: 'moderate' as const };
  const deliveryPotential = 0.3; // after ExitLayer: minimal owner involvement
  factors.push({
    id: 'delivery-involvement',
    name: 'Delivery Involvement',
    currentAdjustment: delivery.adj,
    potentialAdjustment: Math.max(delivery.adj, deliveryPotential),
    dollarImpact: Math.round(Math.abs(Math.max(delivery.adj, deliveryPotential) - delivery.adj) * sde),
    description: delivery.adj <= -0.2
      ? "You're in the weeds on most projects. Your capacity limits the business's capacity."
      : delivery.adj < 0.1
      ? "You're still involved in too many projects. Delegation would free you for growth work."
      : "Low delivery involvement. Your team handles execution well.",
    userAnswer: data.owner_project_involvement || 'Not answered',
    severity: delivery.sev,
  });

  // Factor 7: Sales Dependency (±0.3x) - NEW
  const salesMap: Record<string, { adj: number; sev: 'critical' | 'moderate' | 'good' }> = {
    'I close all of them (100%)': { adj: -0.3, sev: 'critical' },
    'I close most (75%+)': { adj: -0.2, sev: 'critical' },
    'About half (50%)': { adj: 0.0, sev: 'moderate' },
    'My team closes most (<25%)': { adj: 0.2, sev: 'good' },
    "I don't do sales": { adj: 0.3, sev: 'good' },
  };
  const sales = salesMap[data.owner_sales_pct] || { adj: -0.1, sev: 'moderate' as const };
  const salesPotential = 0.2; // after ExitLayer: sales process systematized
  factors.push({
    id: 'sales-dependency',
    name: 'Sales Dependency',
    currentAdjustment: sales.adj,
    potentialAdjustment: Math.max(sales.adj, salesPotential),
    dollarImpact: Math.round(Math.abs(Math.max(sales.adj, salesPotential) - sales.adj) * sde),
    description: sales.adj <= -0.2
      ? "You're the only one who can close deals. Growth is capped by your calendar."
      : sales.adj < 0.2
      ? "You're still too involved in sales. A sales system would unlock growth."
      : "Sales doesn't depend on you. This is scalable.",
    userAnswer: data.owner_sales_pct || 'Not answered',
    severity: sales.sev,
  });

  // --- Step 3: Calculate multiples ---
  const rawCurrentMultiple = BASE_MULTIPLE + factors.reduce((sum, f) => sum + f.currentAdjustment, 0);
  const rawPotentialMultiple = BASE_MULTIPLE + factors.reduce((sum, f) => sum + f.potentialAdjustment, 0);
  const currentMultiple = Math.round(Math.max(1.0, Math.min(5.0, rawCurrentMultiple)) * 10) / 10;
  const potentialMultiple = Math.round(Math.max(1.0, Math.min(5.0, rawPotentialMultiple)) * 10) / 10;

  // --- Step 4: Calculate valuations ---
  const currentValuation = Math.round(sde * currentMultiple);
  const potentialValuation = Math.round(sde * potentialMultiple);
  const valuationGap = potentialValuation - currentValuation;

  // --- Step 5: Generate action items sorted by dollar impact ---
  const ACTION_MAP: Record<string, { action: string; description: string }> = {
    'owner-dependency': {
      action: 'Remove yourself as the delivery bottleneck',
      description: 'Build systems and train your team so the business runs without your daily involvement.',
    },
    'revenue-model': {
      action: 'Shift from project-based to recurring revenue',
      description: 'Restructure offerings into retainer packages that create predictable monthly income.',
    },
    'client-concentration': {
      action: 'Diversify your client base',
      description: 'Reduce dependence on top clients by systematizing lead generation and sales.',
    },
    'documentation': {
      action: 'Document all processes into transferable SOPs',
      description: 'Create standard operating procedures so anyone can run your delivery without tribal knowledge.',
    },
    'proprietary-ip': {
      action: 'Formalize your methodology into named IP',
      description: 'Extract and package your unique approach into a defined, repeatable framework.',
    },
    'delivery-involvement': {
      action: 'Extract yourself from project delivery',
      description: 'Build delivery systems and train your team to execute without your direct involvement.',
    },
    'sales-dependency': {
      action: 'Systematize your sales process',
      description: 'Document your sales methodology so others can close deals using your approach.',
    },
  };

  const actionItems: ActionItem[] = factors
    .filter(f => f.dollarImpact > 0)
    .sort((a, b) => b.dollarImpact - a.dollarImpact)
    .map((f, i) => ({
      rank: i + 1,
      action: ACTION_MAP[f.id]?.action || `Improve ${f.name}`,
      dollarImpact: f.dollarImpact,
      factorId: f.id,
      description: ACTION_MAP[f.id]?.description || f.description,
    }));

  // --- Step 6: Determine qualification stage ---
  const teamSize = Number(data.team_size) || 0;
  const ownerHoursPerWeek = Number(data.owner_hours_per_week) || 0;
  const ownerProjectInvolvement = data.owner_project_involvement || 'Not answered';
  const ownerSalesPct = data.owner_sales_pct || 'Not answered';
  const approvalFrequency = data.approval_frequency || 'Not answered';

  // Stage determination logic
  let stage: 0 | 1 | 2 | 3 = 1; // Default to Stage 1
  let stageLabel = 'Needs Internal Systems';
  let ctaType: 'free-guide' | 'book-call' | 'darwin-group' = 'book-call';

  const isHighOwnerDependency =
    data.without_you === 'Everything stops. The business IS me.' ||
    data.without_you === 'Major problems — clients would notice';

  const isLowDocumentation =
    data.documented_level === 'Nothing is documented' ||
    data.documented_level === 'A few rough notes here and there';

  const isHighDeliveryInvolvement =
    data.owner_project_involvement === 'Nearly all (90%+)' ||
    data.owner_project_involvement === 'Most (70-90%)';

  const isLowOwnerDependency =
    data.without_you === 'It would run fine without me' ||
    data.without_you === "Some things would slip, but it'd survive";

  const isWellDocumented =
    data.documented_level === 'Fully documented with SOPs and templates' ||
    data.documented_level === 'Most processes have some documentation';

  const isProjectBased = data.revenue_model === 'Mostly project-based';
  const hasRecurring = data.revenue_model === 'Mostly retainers / recurring';
  const hasProprietary = data.has_proprietary_method === 'Yes';

  // Stage 0: Too Early (revenue < $300K or no team)
  if (annualRevenue < 300000 || teamSize === 0) {
    stage = 0;
    stageLabel = 'Too Early';
    ctaType = 'free-guide';
  }
  // Stage 3: Already Optimized (low dependency + documented + recurring + IP)
  else if (isLowOwnerDependency && isWellDocumented && hasRecurring && hasProprietary) {
    stage = 3;
    stageLabel = 'Already Optimized';
    ctaType = 'darwin-group';
  }
  // Stage 2: Needs External Product (has systems but no product/MRR)
  else if (isLowOwnerDependency && isWellDocumented && (isProjectBased || !hasProprietary)) {
    stage = 2;
    stageLabel = 'Needs External Product';
    ctaType = 'book-call';
  }
  // Stage 1: Needs Internal Systems (default for high dependency)
  else {
    stage = 1;
    stageLabel = 'Needs Internal Systems';
    ctaType = 'book-call';
  }

  return {
    currentValuation,
    potentialValuation,
    valuationGap,
    sde: Math.round(sde),
    annualRevenue,
    annualProfit: Math.round(annualProfit),
    ownerComp,
    currentMultiple,
    potentialMultiple,
    factors,
    actionItems,
    ownerHoursPerWeek,
    teamSize,
    clientCount: Number(data.client_count) || 0,
    // New precision fields
    ownerProjectInvolvement,
    ownerSalesPct,
    approvalFrequency,
    // Qualification
    stage,
    stageLabel,
    ctaType,
  };
}
