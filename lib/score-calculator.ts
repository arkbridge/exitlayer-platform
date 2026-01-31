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
  // Section 1: Business Fundamentals
  revenue_12mo: number;
  revenue_monthly_avg: number;
  pricing_models: string[];
  revenue_recurring_pct: number;
  client_count: number;
  top3_concentration_pct: number;
  services: Array<{
    name: string;
    revenue_pct: number;
    avg_value: number;
  }>;
  gross_margin_pct: number | null;
  cac: number | null;
  ltv: number | null;
  acquisition_channels: string[];
  churn_rate_pct: number | null;
  avg_client_tenure: string;
  revenue_goal_12mo: number;
  goal_confidence: number;

  // Section 2: Time & Leverage
  time_delivery_hrs: number;
  time_sales_hrs: number;
  time_mgmt_hrs: number;
  time_ops_hrs: number;
  time_strategy_hrs: number;
  projects_requiring_owner_pct: number;
  clients_requiring_owner: string;
  tasks_only_owner: string;
  decisions_only_owner: string;
  vacation_breaks: string;
  wish_could_delegate: string;
  owner_replaceability_delivery: number;
  owner_replaceability_sales: number;
  team_can_onboard: string;
  team_can_deliver: string;
  team_can_close: string;
  onboard_blocker?: string;
  delivery_blocker?: string;
  sales_blocker?: string;
  wasted_hours_week: number;
  reclaimed_time_use: string[];
  delivery_bottleneck: string;
  sales_bottleneck: string;
  approval_frequency: string;
  // Service Workflow Mapping
  project_trigger?: string[];
  core_service_steps?: string;
  handoff_points?: string;
  approval_gates?: string;
  typical_project_duration?: string;
  concurrent_projects?: number;
  new_clients_per_month?: number;

  // Section 3: Systems & Documentation
  has_sops: string;
  sop_list?: string;
  documented_pct: number;
  has_deliverable_templates: string;
  template_types: string[];
  delivery_consistency: number;
  reinvent_frequency: string;
  tools_crm?: string;
  tools_pm?: string;
  tools_comm?: string;
  tools_storage?: string;
  tools_accounting?: string;
  onboarding_documented: string;
  onboarding_consistency?: string;
  has_kickoff_checklist: string;
  has_qc_checklist: string;
  comm_templates: string[];
  onboard_time_new_hire: string;
  top_systematize_need: string;
  has_brand_guidelines: string;
  has_proposal_template: string;
  proposal_customization?: string;
  has_contract_template: string;
  knowledge_documented_pct: number;
  has_rca_process: string;
  track_profitability: string;
  highest_impact_doc: string;
  systematization_score: number;
  failed_systematization: string;
  failed_systematization_reason: string;
  // Existing Assets Inventory
  existing_sop_location?: string[];
  existing_training_materials?: string;
  existing_client_assets?: string[];
  existing_automations?: string[];
  tools_automation?: string;
  // Communication Cadence
  client_update_frequency?: string;
  client_meeting_frequency?: string;
  who_handles_client_comms?: string;
  client_comm_channels?: string[];
  // Revision/Feedback Loops
  avg_revision_rounds?: string;
  revision_scope_issues?: string;
  client_feedback_method?: string[];
  revision_approval_process?: string;

  // Section 4: Team & Capabilities
  team_size_total: number;
  team_ft: number;
  team_pt: number;
  team_contractors: number;
  team_delivery: number;
  team_sales: number;
  team_admin: number;
  best_team_member: string;
  weakest_team_member: string;
  hiring_next: string;
  missing_skills: string;
  team_can_scale: string;
  scale_blocker?: string;
  team_autonomy: string;
  wish_team_could_decide: string;
  team_capability_score: number;
  team_utilization_score: number;
  has_role_descriptions: string;
  has_training_program: string;
  training_method: string;
  // Team Member Details for Handoff
  has_account_manager?: string;
  team_member_who_could_lead?: string;
  team_trust_level?: number;
  team_quality_gap?: string;
  delegation_blockers?: string[];

  // Section 5: Product & Market Position
  agency_description: string;
  differentiation: string;
  unique_strength: string;
  has_proprietary_method: string;
  proprietary_method_description?: string;
  client_praise: string;
  client_complaints: string;
  most_repeatable_service: string;
  highest_margin_service: string;
  most_scalable_service: string;
  core_service: string;
  tried_productization: string;
  productization_attempt?: string;
  productization_outcome?: string;
  has_audience: string;
  audience_size?: string;
  creates_content: string;
  content_type_frequency?: string;
  discovery_channels: string[];
  ideal_client_description: string;
  core_problem_solved: string;
  product_buyer: string;
  product_blockers: string[];
  positioning_clarity: number;
  dream_product: string;
  // Client Types/Tiers
  has_client_tiers?: string;
  client_tier_description?: string;
  high_touch_vs_scalable?: number;
  client_industry_concentration?: string[];
  ideal_client_revenue_size?: string;
  // External Infrastructure Readiness
  interest_in_external_infra?: string;
  client_tool_pain_points?: string;
  repeatable_client_setup?: string;

  // Section 6: Vision & Goals
  vision_12mo: string;
  vision_3yr: string;
  wants_exit: string;
  personal_success_definition: string;
  ideal_long_term_role: string;
  sprint_excitement: string;
  sprint_anxiety: string;
  magic_wand_fix: string;
  delivery_exit_fear: string;
  sprint_hope: string;
  implementation_readiness: number;
  implementation_barriers: string[];

  // Section 7: Open-Ended
  missing_questions: string;
  additional_context: string;
  unique_factors: string;
  contact_name: string;
  contact_email: string;
  company_name: string;
  other_notes?: string;
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

  const replaceability = ((data.owner_replaceability_delivery || 1) / 10) * 20;

  const canOnboard = data.team_can_onboard === 'Yes';
  const canDeliver = data.team_can_deliver === 'Yes';
  const canClose = data.team_can_close === 'Yes';
  const teamAutonomy = (canOnboard ? 3.3 : 0) + (canDeliver ? 3.3 : 0) + (canClose ? 3.4 : 0);

  const score = projectDependency + deliveryTime + replaceability + teamAutonomy;
  return Math.round(Math.max(0, Math.min(100, score)));
}

function calculateEquityPotentialScore(data: AuditResponse): number {
  const documentation = ((data.documented_pct || 0) / 100) * 40;
  const templateCount = Math.min((data.template_types?.length || 0) / 5, 1) * 15;
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
  const readiness = ((data.implementation_readiness || 1) / 10) * 30;

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

  if ((data.owner_replaceability_delivery || 0) <= 4) {
    findings.push(`Replaceability score: ${data.owner_replaceability_delivery}/10. The business can't run without you.`);
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
  if ((data.comm_templates?.length || 0) < 3) {
    wins.push('Build client email templates (1 hour build, saves 5+ hours/week)');
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
      system: `Document ${data.highest_impact_doc || 'core processes'}`,
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
  const coreService = data.core_service || data.most_repeatable_service || 'your core service';

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
  const monthlyRevenue = data.revenue_monthly_avg || 0;
  const annualRevenue = data.revenue_12mo || 0;

  const totalWeeklyHours = (data.time_delivery_hrs || 0) + (data.time_sales_hrs || 0) +
    (data.time_mgmt_hrs || 0) + (data.time_ops_hrs || 0) + (data.time_strategy_hrs || 0);
  const hoursPerMonth = totalWeeklyHours * 4.33;
  const ownerHourlyValue = hoursPerMonth > 0 ? monthlyRevenue / hoursPerMonth : 0;

  const wastedValue = (data.wasted_hours_week || 0) * 4.33 * ownerHourlyValue;

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
