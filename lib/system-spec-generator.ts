/**
 * System Specification Generator
 *
 * Takes questionnaire responses and generates:
 * 1. System/agent specifications to build
 * 2. Integration requirements
 * 3. Gap analysis (what needs follow-up discovery)
 * 4. Automation coverage estimate
 * 5. PRD structure for each system
 */

import { type AuditResponse } from './score-calculator';

// ============================================================================
// TYPES
// ============================================================================

export interface SystemSpec {
  id: string;
  name: string;
  type: 'agent' | 'sop' | 'checklist' | 'template' | 'decision_framework' | 'automation' | 'dashboard';
  priority: 'P0' | 'P1' | 'P2' | 'P3'; // P0 = build immediately, P3 = nice to have
  category: 'delivery' | 'sales' | 'operations' | 'client_comms' | 'quality' | 'onboarding' | 'reporting';
  description: string;
  triggeredBy: string[]; // Which questionnaire answers triggered this
  estimatedBuildTime: string; // e.g., "2 hours", "1 day"
  ownerTimeReclaimed: number; // hours/week this will save
  prerequisites: string[];
  integrations: string[];
  prd: PRDSpec;
}

export interface PRDSpec {
  problem: string;
  solution: string;
  inputs: string[];
  outputs: string[];
  workflow: string[];
  successMetrics: string[];
  handoffProcess: string;
  clientPrerequisites: string[];
}

export interface IntegrationRequirement {
  tool: string;
  toolCategory: string;
  required: boolean;
  purpose: string;
  apiAvailable: boolean;
  alternativeIfMissing: string;
}

export interface GapAnalysis {
  field: string;
  question: string;
  reason: string;
  discoveryQuestions: string[];
  priority: 'critical' | 'important' | 'nice_to_have';
}

export interface AutomationCoverage {
  deliveryAutomation: number; // percentage
  salesAutomation: number;
  clientCommsAutomation: number;
  operationsAutomation: number;
  qualityAutomation: number;
  overall: number;
  breakdown: {
    area: string;
    currentState: string;
    targetState: string;
    automationPercentage: number;
    systemsRequired: string[];
  }[];
}

export interface SystemSpecOutput {
  clientInfo: {
    name: string;
    email: string;
    company: string;
    generatedAt: string;
  };
  summary: {
    totalSystemsTooBuild: number;
    p0Systems: number;
    p1Systems: number;
    estimatedBuildHours: number;
    weeklyHoursReclaimed: number;
    automationCoverage: number;
  };
  systems: SystemSpec[];
  integrations: IntegrationRequirement[];
  gaps: GapAnalysis[];
  automationCoverage: AutomationCoverage;
  weekByWeekBuildPlan: {
    week: number;
    focus: string;
    systems: string[];
    deliverables: string[];
  }[];
  followUpDiscoveryAgenda: {
    topic: string;
    questions: string[];
    duration: string;
  }[];
}

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export function generateSystemSpec(data: AuditResponse): SystemSpecOutput {
  const systems = identifySystems(data);
  const integrations = identifyIntegrations(data);
  const gaps = identifyGaps(data);
  const automation = calculateAutomationCoverage(data, systems);
  const buildPlan = generateBuildPlan(systems);
  const discoveryAgenda = generateDiscoveryAgenda(gaps, data);

  const p0Systems = systems.filter(s => s.priority === 'P0');
  const p1Systems = systems.filter(s => s.priority === 'P1');

  const totalBuildHours = systems.reduce((sum, s) => {
    const hours = parseEstimatedTime(s.estimatedBuildTime);
    return sum + hours;
  }, 0);

  const weeklyHoursReclaimed = systems.reduce((sum, s) => sum + s.ownerTimeReclaimed, 0);

  return {
    clientInfo: {
      name: data.contact_name || 'Unknown',
      email: data.contact_email || '',
      company: data.company_name || 'Unknown',
      generatedAt: new Date().toISOString(),
    },
    summary: {
      totalSystemsTooBuild: systems.length,
      p0Systems: p0Systems.length,
      p1Systems: p1Systems.length,
      estimatedBuildHours: totalBuildHours,
      weeklyHoursReclaimed,
      automationCoverage: automation.overall,
    },
    systems,
    integrations,
    gaps,
    automationCoverage: automation,
    weekByWeekBuildPlan: buildPlan,
    followUpDiscoveryAgenda: discoveryAgenda,
  };
}

// ============================================================================
// SYSTEM IDENTIFICATION
// ============================================================================

function identifySystems(data: AuditResponse): SystemSpec[] {
  const systems: SystemSpec[] = [];

  // -------------------------------------------------------------------------
  // DELIVERY SYSTEMS (based on owner involvement in delivery)
  // -------------------------------------------------------------------------

  const deliveryHours = data.time_delivery_hrs || 0;
  const totalHours = (data.time_delivery_hrs || 0) + (data.time_sales_hrs || 0) +
                     (data.time_mgmt_hrs || 0) + (data.time_ops_hrs || 0) +
                     (data.time_strategy_hrs || 0);
  const deliveryPct = totalHours > 0 ? (deliveryHours / totalHours) * 100 : 0;
  const ownerInvolvementPct = data.projects_requiring_owner_pct || 0;

  // If owner spends >40% in delivery OR >70% projects require owner
  if (deliveryPct > 40 || ownerInvolvementPct > 70) {
    // Parse tasks_only_owner to identify specific agent needs
    const ownerTasks = parseTextList(data.tasks_only_owner);

    ownerTasks.forEach((task, idx) => {
      const taskLower = task.toLowerCase();

      // Identify task type and create appropriate system
      if (taskLower.includes('strategy') || taskLower.includes('campaign')) {
        systems.push(createStrategySystem(task, data, idx));
      } else if (taskLower.includes('call') || taskLower.includes('client')) {
        systems.push(createClientCommsSystem(task, data, idx));
      } else if (taskLower.includes('qa') || taskLower.includes('quality') || taskLower.includes('review')) {
        systems.push(createQASystem(task, data, idx));
      } else if (taskLower.includes('pricing') || taskLower.includes('proposal') || taskLower.includes('quote')) {
        systems.push(createPricingSystem(task, data, idx));
      } else {
        // Generic task SOP
        systems.push(createGenericTaskSOP(task, data, idx));
      }
    });
  }

  // -------------------------------------------------------------------------
  // DECISION FRAMEWORKS (based on decisions_only_owner)
  // -------------------------------------------------------------------------

  const ownerDecisions = parseTextList(data.decisions_only_owner);

  ownerDecisions.forEach((decision, idx) => {
    const decisionLower = decision.toLowerCase();

    if (decisionLower.includes('pricing') || decisionLower.includes('price')) {
      systems.push(createPricingDecisionFramework(decision, data));
    } else if (decisionLower.includes('client') || decisionLower.includes('accept') || decisionLower.includes('take')) {
      systems.push(createClientQualificationFramework(decision, data));
    } else if (decisionLower.includes('scope') || decisionLower.includes('change')) {
      systems.push(createScopeChangeFramework(decision, data));
    } else if (decisionLower.includes('hire') || decisionLower.includes('hiring')) {
      systems.push(createHiringFramework(decision, data));
    } else {
      systems.push(createGenericDecisionFramework(decision, data, idx));
    }
  });

  // -------------------------------------------------------------------------
  // VACATION TEST SYSTEMS (based on vacation_breaks)
  // -------------------------------------------------------------------------

  const vacationBreaks = parseTextList(data.vacation_breaks);

  vacationBreaks.forEach((breakPoint, idx) => {
    const breakLower = breakPoint.toLowerCase();

    // These are critical failure points - need backup systems
    if (!systemAlreadyExists(systems, breakPoint)) {
      systems.push(createBackupSystem(breakPoint, data, idx));
    }
  });

  // -------------------------------------------------------------------------
  // QUICK WINS (based on missing checklists/templates)
  // -------------------------------------------------------------------------

  // Project kickoff checklist
  if (data.has_kickoff_checklist === 'No') {
    systems.push({
      id: 'checklist-kickoff',
      name: 'Project Kickoff Checklist',
      type: 'checklist',
      priority: 'P0',
      category: 'delivery',
      description: 'Standardized checklist for project kickoffs to ensure consistent starts',
      triggeredBy: ['has_kickoff_checklist = No'],
      estimatedBuildTime: '30 minutes',
      ownerTimeReclaimed: 2,
      prerequisites: [],
      integrations: [data.tools_pm || 'project management tool'],
      prd: {
        problem: 'No standard kickoff process - each project starts differently',
        solution: 'Checklist that covers all kickoff essentials',
        inputs: ['Project brief', 'Client details', 'Team assignments'],
        outputs: ['Completed kickoff checklist', 'Project setup in PM tool'],
        workflow: [
          'Receive new project notification',
          'Open kickoff checklist',
          'Complete all items',
          'Notify team project is ready'
        ],
        successMetrics: ['100% of projects use checklist', 'Reduced kickoff time by 50%'],
        handoffProcess: 'Embed in PM tool as project template',
        clientPrerequisites: ['PM tool access for team']
      }
    });
  }

  // QC checklist
  if (data.has_qc_checklist === 'No') {
    systems.push({
      id: 'checklist-qc',
      name: 'Quality Control Checklist',
      type: 'checklist',
      priority: 'P0',
      category: 'quality',
      description: 'Pre-delivery quality assurance checklist',
      triggeredBy: ['has_qc_checklist = No'],
      estimatedBuildTime: '30 minutes',
      ownerTimeReclaimed: 3,
      prerequisites: [],
      integrations: [data.tools_pm || 'project management tool'],
      prd: {
        problem: 'Quality review requires owner involvement because there\'s no standard',
        solution: 'Checklist defining quality standards anyone can verify',
        inputs: ['Deliverable to review', 'Project requirements'],
        outputs: ['QC pass/fail', 'Revision list if needed'],
        workflow: [
          'Team member completes deliverable',
          'Run through QC checklist',
          'Address any failures',
          'Mark ready for client'
        ],
        successMetrics: ['Reduced owner QA time by 80%', 'Consistent quality scores'],
        handoffProcess: 'Train team on checklist, add to delivery workflow',
        clientPrerequisites: []
      }
    });
  }

  // Communication templates
  const hasCommTemplates = data.comm_templates || [];
  const missingTemplates: string[] = [];

  const requiredTemplates = ['Welcome email', 'Status updates', 'Project completion'];
  requiredTemplates.forEach(t => {
    if (!hasCommTemplates.includes(t)) {
      missingTemplates.push(t);
    }
  });

  if (missingTemplates.length > 0) {
    systems.push({
      id: 'templates-client-comms',
      name: 'Client Communication Templates',
      type: 'template',
      priority: 'P0',
      category: 'client_comms',
      description: `Create templates for: ${missingTemplates.join(', ')}`,
      triggeredBy: ['Missing comm_templates'],
      estimatedBuildTime: '1 hour',
      ownerTimeReclaimed: 5,
      prerequisites: [],
      integrations: [data.tools_comm || 'email'],
      prd: {
        problem: 'Client communications written from scratch each time',
        solution: 'Pre-written templates for common scenarios',
        inputs: ['Client name', 'Project details', 'Status info'],
        outputs: ['Ready-to-send email'],
        workflow: [
          'Identify communication need',
          'Select appropriate template',
          'Fill in variables',
          'Send'
        ],
        successMetrics: ['5+ hours/week saved', 'Consistent communication quality'],
        handoffProcess: 'Add to email tool as templates/snippets',
        clientPrerequisites: []
      }
    });
  }

  // -------------------------------------------------------------------------
  // ONBOARDING SYSTEM (if team can't onboard without owner)
  // -------------------------------------------------------------------------

  if (data.team_can_onboard === 'No' || data.team_can_onboard === 'Sometimes') {
    systems.push({
      id: 'sop-client-onboarding',
      name: 'Client Onboarding SOP + Automation',
      type: 'sop',
      priority: 'P1',
      category: 'onboarding',
      description: `Full onboarding process documentation. Blocker: ${data.onboard_blocker || 'Not specified'}`,
      triggeredBy: ['team_can_onboard = No/Sometimes', `onboard_blocker: ${data.onboard_blocker}`],
      estimatedBuildTime: '4 hours',
      ownerTimeReclaimed: 4,
      prerequisites: ['Client intake form', 'Onboarding email templates'],
      integrations: [data.tools_crm || 'CRM', data.tools_pm || 'PM tool', data.tools_comm || 'Email'],
      prd: {
        problem: data.onboard_blocker || 'Team cannot onboard clients without owner',
        solution: 'Step-by-step onboarding process with automated triggers',
        inputs: ['Signed contract', 'Client info'],
        outputs: ['Fully onboarded client', 'Project setup', 'Team introductions made'],
        workflow: [
          'Contract signed triggers automation',
          'Welcome email sent automatically',
          'Client questionnaire sent',
          'Project created in PM tool',
          'Team assigned',
          'Kickoff scheduled',
          'Kickoff conducted using checklist'
        ],
        successMetrics: ['0 owner hours in onboarding', 'Client satisfaction with onboarding > 9/10'],
        handoffProcess: 'Train account manager on SOP, set up automations in tools',
        clientPrerequisites: ['CRM with automation', 'PM tool with templates']
      }
    });
  }

  // -------------------------------------------------------------------------
  // DELIVERY SYSTEM (if team can't deliver without owner)
  // -------------------------------------------------------------------------

  if (data.team_can_deliver === 'No' || data.team_can_deliver === 'Sometimes') {
    const coreService = data.core_service || data.services?.[0]?.name || 'core service';

    systems.push({
      id: 'sop-delivery-process',
      name: `${coreService} Delivery SOP`,
      type: 'sop',
      priority: 'P0',
      category: 'delivery',
      description: `Full delivery process for ${coreService}. Blocker: ${data.delivery_blocker || 'Not specified'}`,
      triggeredBy: ['team_can_deliver = No/Sometimes', `delivery_blocker: ${data.delivery_blocker}`],
      estimatedBuildTime: '8 hours',
      ownerTimeReclaimed: deliveryHours * 0.5, // Aim to reclaim 50% of delivery time
      prerequisites: ['QC checklist', 'Kickoff checklist'],
      integrations: [data.tools_pm || 'PM tool'],
      prd: {
        problem: data.delivery_blocker || 'Team cannot deliver without owner involvement',
        solution: 'Comprehensive delivery SOP with decision points and escalation rules',
        inputs: ['Project brief', 'Client requirements', 'Timeline'],
        outputs: ['Completed deliverable', 'Client approval'],
        workflow: [
          'Project kickoff (use checklist)',
          'Discovery/research phase',
          'Strategy development',
          'Execution phase',
          'Internal review (use QC checklist)',
          'Client presentation',
          'Revisions (use revision SOP)',
          'Final delivery',
          'Project close'
        ],
        successMetrics: ['80% of projects delivered without owner', 'Quality scores maintained'],
        handoffProcess: 'Document current process, identify owner-dependent steps, create escalation rules',
        clientPrerequisites: ['PM tool with workflow automation']
      }
    });
  }

  // -------------------------------------------------------------------------
  // SALES SYSTEM (if team can't close without owner)
  // -------------------------------------------------------------------------

  if (data.team_can_close === 'No' || data.team_can_close === 'Sometimes') {
    systems.push({
      id: 'sop-sales-process',
      name: 'Sales Process SOP + Playbook',
      type: 'sop',
      priority: 'P1',
      category: 'sales',
      description: `Sales process documentation. Blocker: ${data.sales_blocker || 'Not specified'}`,
      triggeredBy: ['team_can_close = No/Sometimes', `sales_blocker: ${data.sales_blocker}`],
      estimatedBuildTime: '6 hours',
      ownerTimeReclaimed: data.time_sales_hrs ? data.time_sales_hrs * 0.4 : 4,
      prerequisites: ['Client qualification framework', 'Pricing framework'],
      integrations: [data.tools_crm || 'CRM'],
      prd: {
        problem: data.sales_blocker || 'Team cannot close deals without owner',
        solution: 'Sales playbook with scripts, objection handling, and close criteria',
        inputs: ['Lead', 'Discovery notes'],
        outputs: ['Signed contract or qualified out'],
        workflow: [
          'Lead qualification (use framework)',
          'Discovery call (use script)',
          'Proposal creation (use template)',
          'Pricing (use pricing framework)',
          'Objection handling (use playbook)',
          'Close (use closing checklist)',
          'Handoff to delivery'
        ],
        successMetrics: ['50% of deals closed without owner', 'Maintained close rate'],
        handoffProcess: 'Train sales team, role play scenarios, shadow then reverse-shadow',
        clientPrerequisites: ['CRM with pipeline management']
      }
    });
  }

  // -------------------------------------------------------------------------
  // HIGH IMPACT DOC (from questionnaire)
  // -------------------------------------------------------------------------

  if (data.highest_impact_doc) {
    const existingIds = systems.map(s => s.id);
    const docId = `sop-${slugify(data.highest_impact_doc)}`;

    if (!existingIds.includes(docId)) {
      systems.push({
        id: docId,
        name: `${data.highest_impact_doc} SOP`,
        type: 'sop',
        priority: 'P1',
        category: 'operations',
        description: `Client identified this as highest-impact documentation need`,
        triggeredBy: [`highest_impact_doc: "${data.highest_impact_doc}"`],
        estimatedBuildTime: '4 hours',
        ownerTimeReclaimed: 3,
        prerequisites: [],
        integrations: [],
        prd: {
          problem: `"${data.highest_impact_doc}" is not documented, consuming owner time`,
          solution: 'Comprehensive SOP for this process',
          inputs: ['To be determined in discovery'],
          outputs: ['To be determined in discovery'],
          workflow: ['To be determined in discovery'],
          successMetrics: ['Process can be done without owner'],
          handoffProcess: 'Document, train, verify',
          clientPrerequisites: []
        }
      });
    }
  }

  // -------------------------------------------------------------------------
  // TOP SYSTEMATIZE NEED (from questionnaire)
  // -------------------------------------------------------------------------

  if (data.top_systematize_need) {
    const existingIds = systems.map(s => s.id);
    const sysId = `sop-${slugify(data.top_systematize_need)}`;

    if (!existingIds.includes(sysId)) {
      systems.push({
        id: sysId,
        name: `${data.top_systematize_need} System`,
        type: 'sop',
        priority: 'P1',
        category: 'operations',
        description: `Client's #1 systematization priority`,
        triggeredBy: [`top_systematize_need: "${data.top_systematize_need}"`],
        estimatedBuildTime: '4 hours',
        ownerTimeReclaimed: 3,
        prerequisites: [],
        integrations: [],
        prd: {
          problem: `"${data.top_systematize_need}" needs to be systematized`,
          solution: 'Full documentation and/or automation',
          inputs: ['To be determined in discovery'],
          outputs: ['To be determined in discovery'],
          workflow: ['To be determined in discovery'],
          successMetrics: ['Process runs without owner'],
          handoffProcess: 'Document, train, verify',
          clientPrerequisites: []
        }
      });
    }
  }

  // -------------------------------------------------------------------------
  // MAGIC WAND FIX (highest pain point)
  // -------------------------------------------------------------------------

  if (data.magic_wand_fix) {
    const existingIds = systems.map(s => s.id);
    const magicId = `system-${slugify(data.magic_wand_fix)}`;

    if (!existingIds.includes(magicId)) {
      systems.push({
        id: magicId,
        name: `Priority Fix: ${truncate(data.magic_wand_fix, 50)}`,
        type: 'sop',
        priority: 'P0',
        category: 'operations',
        description: `Client's magic wand fix - highest pain point`,
        triggeredBy: [`magic_wand_fix: "${data.magic_wand_fix}"`],
        estimatedBuildTime: '6 hours',
        ownerTimeReclaimed: 5,
        prerequisites: [],
        integrations: [],
        prd: {
          problem: data.magic_wand_fix,
          solution: 'To be designed based on specific pain point',
          inputs: ['To be determined in discovery'],
          outputs: ['Pain point resolved'],
          workflow: ['To be determined in discovery'],
          successMetrics: ['Owner reports pain point resolved'],
          handoffProcess: 'Custom based on solution',
          clientPrerequisites: []
        }
      });
    }
  }

  // -------------------------------------------------------------------------
  // WISH COULD DELEGATE (from questionnaire)
  // -------------------------------------------------------------------------

  if (data.wish_could_delegate) {
    const existingIds = systems.map(s => s.id);
    const delegateId = `system-delegate-${slugify(data.wish_could_delegate)}`;

    if (!existingIds.includes(delegateId)) {
      systems.push({
        id: delegateId,
        name: `Delegate: ${truncate(data.wish_could_delegate, 50)}`,
        type: 'sop',
        priority: 'P0',
        category: 'delivery',
        description: `Owner's #1 delegation wish`,
        triggeredBy: [`wish_could_delegate: "${data.wish_could_delegate}"`],
        estimatedBuildTime: '4 hours',
        ownerTimeReclaimed: data.wasted_hours_week || 5,
        prerequisites: [],
        integrations: [],
        prd: {
          problem: `Owner wants to delegate: "${data.wish_could_delegate}"`,
          solution: 'SOP + training to enable delegation',
          inputs: ['To be determined'],
          outputs: ['Task completed by team member'],
          workflow: ['To be determined'],
          successMetrics: ['Task done without owner'],
          handoffProcess: 'Document, train designated team member, verify quality',
          clientPrerequisites: []
        }
      });
    }
  }

  // Add workflow-based systems from new fields
  const workflowSystems = identifyWorkflowSystems(data, systems);
  systems.push(...workflowSystems);

  // Sort by priority
  const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };
  systems.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Deduplicate by ID
  const uniqueSystems = systems.filter((system, index, self) =>
    index === self.findIndex(s => s.id === system.id)
  );

  return uniqueSystems;
}

// ============================================================================
// NEW FIELD ENHANCEMENTS
// ============================================================================

function identifyWorkflowSystems(data: AuditResponse, systems: SystemSpec[]): SystemSpec[] {
  const newSystems: SystemSpec[] = [];

  // Parse core_service_steps to identify workflow automation opportunities
  if (data.core_service_steps) {
    const steps = parseTextList(data.core_service_steps);
    if (steps.length >= 3) {
      // They have a clear workflow - create workflow automation system
      const existingIds = systems.map(s => s.id);
      if (!existingIds.includes('automation-workflow')) {
        newSystems.push({
          id: 'automation-workflow',
          name: 'Core Delivery Workflow Automation',
          type: 'automation',
          priority: 'P1',
          category: 'delivery',
          description: `Automate handoffs and notifications across ${steps.length} delivery steps`,
          triggeredBy: ['core_service_steps provided'],
          estimatedBuildTime: '4 hours',
          ownerTimeReclaimed: 3,
          prerequisites: ['Delivery SOP'],
          integrations: [data.tools_pm || 'PM tool', data.tools_automation || 'Zapier'],
          prd: {
            problem: 'Manual handoffs between delivery steps cause delays',
            solution: 'Automated workflow with triggers, assignments, and notifications',
            inputs: ['Project status changes'],
            outputs: ['Automatic task creation, assignments, notifications'],
            workflow: steps,
            successMetrics: ['Zero missed handoffs', 'Reduced project cycle time'],
            handoffProcess: 'Build in automation tool, test with sample project',
            clientPrerequisites: ['PM tool with automation support']
          }
        });
      }
    }
  }

  // Handle revision process based on avg_revision_rounds
  if (data.avg_revision_rounds === '4-5 rounds' || data.avg_revision_rounds === '6+ rounds' ||
      data.avg_revision_rounds === 'Unlimited until they\'re happy') {
    newSystems.push({
      id: 'sop-revision-process',
      name: 'Revision Management SOP',
      type: 'sop',
      priority: 'P0',
      category: 'delivery',
      description: 'Reduce revision rounds through better briefing and scope control',
      triggeredBy: [`avg_revision_rounds = "${data.avg_revision_rounds}"`],
      estimatedBuildTime: '3 hours',
      ownerTimeReclaimed: 4,
      prerequisites: ['QC checklist'],
      integrations: [],
      prd: {
        problem: `Projects go through ${data.avg_revision_rounds} which extends timelines`,
        solution: 'Better upfront briefing, revision limits, and scope control',
        inputs: ['Project brief', 'Client feedback'],
        outputs: ['Controlled revision process'],
        workflow: [
          'Enhanced briefing process',
          'Clear revision limits in contract',
          'Structured feedback collection',
          'Scope change for out-of-scope requests'
        ],
        successMetrics: ['Average revisions reduced to 2-3 rounds'],
        handoffProcess: 'Train team on briefing and scope management',
        clientPrerequisites: []
      }
    });
  }

  // Scope creep handling
  if (data.revision_scope_issues === 'Often - we usually just do it' ||
      data.revision_scope_issues === 'Almost always - it\'s a constant battle') {
    const existingIds = systems.map(s => s.id);
    if (!existingIds.includes('framework-scope-change')) {
      newSystems.push({
        id: 'framework-scope-change',
        name: 'Scope Change Decision Framework',
        type: 'decision_framework',
        priority: 'P0',
        category: 'delivery',
        description: 'Clear rules for handling scope creep with client scripts',
        triggeredBy: [`revision_scope_issues = "${data.revision_scope_issues}"`],
        estimatedBuildTime: '2 hours',
        ownerTimeReclaimed: 3,
        prerequisites: [],
        integrations: [],
        prd: {
          problem: 'Scope creep is constant - team does extra work without charging',
          solution: 'Clear scope boundaries, scripts for pushing back, change order process',
          inputs: ['Client request'],
          outputs: ['In-scope approval OR change order'],
          workflow: [
            'Receive client request',
            'Compare to original scope',
            'If in scope, proceed',
            'If out of scope, use script to explain and offer change order',
            'Escalate only if client pushes back'
          ],
          successMetrics: ['Scope creep reduced by 70%', 'Additional revenue from change orders'],
          handoffProcess: 'Train team on scripts and when to use them',
          clientPrerequisites: []
        }
      });
    }
  }

  // Client communication delegation based on who_handles_client_comms
  if (data.who_handles_client_comms === 'Me (the owner) - all of it') {
    newSystems.push({
      id: 'sop-client-comms-delegation',
      name: 'Client Communication Delegation SOP',
      type: 'sop',
      priority: 'P0',
      category: 'client_comms',
      description: 'Transition client communications from owner to team',
      triggeredBy: ['who_handles_client_comms = owner only'],
      estimatedBuildTime: '4 hours',
      ownerTimeReclaimed: 6,
      prerequisites: ['Client communication templates'],
      integrations: [data.tools_comm || 'email'],
      prd: {
        problem: 'Owner handles ALL client communication - massive bottleneck',
        solution: 'Gradual transition with templates, scripts, and escalation rules',
        inputs: ['Client inquiry/need'],
        outputs: ['Response handled by team member'],
        workflow: [
          'Categorize communication type',
          'Route to appropriate team member',
          'Use templates/scripts for response',
          'Escalate to owner only for defined situations',
          'Weekly review of escalations to reduce over time'
        ],
        successMetrics: ['80% of client comms handled without owner within 4 weeks'],
        handoffProcess: 'Designate client point person, introduce to clients, shadow period',
        clientPrerequisites: []
      }
    });
  }

  // Delegation systems based on delegation_blockers
  const delegationBlockers = data.delegation_blockers || [];
  if (delegationBlockers.includes('No clear process to follow')) {
    // Already covered by SOPs
  }
  if (delegationBlockers.includes('Clients expect to work with me')) {
    newSystems.push({
      id: 'playbook-client-transition',
      name: 'Client Transition Playbook',
      type: 'sop',
      priority: 'P1',
      category: 'client_comms',
      description: 'Process for transitioning client relationships to team members',
      triggeredBy: ['delegation_blockers includes "Clients expect to work with me"'],
      estimatedBuildTime: '2 hours',
      ownerTimeReclaimed: 3,
      prerequisites: [],
      integrations: [],
      prd: {
        problem: 'Clients expect owner involvement - team introduction feels awkward',
        solution: 'Structured transition process that maintains client confidence',
        inputs: ['Client relationship'],
        outputs: ['Team member as primary contact'],
        workflow: [
          'Introduce team member in next meeting as "lead" on project',
          'Position team member as expert',
          'CC team member on all communications',
          'Gradually reduce owner involvement',
          'Owner available for escalations only'
        ],
        successMetrics: ['Smooth transitions with no client complaints'],
        handoffProcess: 'Prepare team member, practice introductions',
        clientPrerequisites: []
      }
    });
  }

  // External infrastructure readiness
  if (data.interest_in_external_infra === 'Yes, very interested' ||
      data.interest_in_external_infra === 'Curious but not sure how') {
    if (data.repeatable_client_setup === 'Yes, all the time' ||
        data.repeatable_client_setup === 'Sometimes') {
      newSystems.push({
        id: 'roadmap-external-infra',
        name: 'External Infrastructure Roadmap',
        type: 'sop',
        priority: 'P2',
        category: 'operations',
        description: 'Plan for productizing repeatable client setups into infrastructure',
        triggeredBy: ['interest_in_external_infra = interested', 'repeatable_client_setup = yes'],
        estimatedBuildTime: '4 hours',
        ownerTimeReclaimed: 0, // Strategic, not time-saving initially
        prerequisites: ['Internal systems complete'],
        integrations: [],
        prd: {
          problem: 'Setting up same systems for multiple clients - opportunity to productize',
          solution: 'Identify and document repeatable infrastructure for future productization',
          inputs: ['Client pain points', 'Repeatable setups'],
          outputs: ['Infrastructure product roadmap'],
          workflow: [
            'Document what you set up for clients',
            'Identify patterns',
            'Prioritize by value and repeatability',
            'Plan productization approach'
          ],
          successMetrics: ['Clear roadmap for post-sprint infrastructure build'],
          handoffProcess: 'Document in Week 4 as handoff planning',
          clientPrerequisites: []
        }
      });
    }
  }

  return newSystems;
}

// ============================================================================
// INTEGRATION IDENTIFICATION
// ============================================================================

function identifyIntegrations(data: AuditResponse): IntegrationRequirement[] {
  const integrations: IntegrationRequirement[] = [];

  // CRM
  if (data.tools_crm) {
    integrations.push({
      tool: data.tools_crm,
      toolCategory: 'CRM',
      required: true,
      purpose: 'Client data, pipeline, automation triggers',
      apiAvailable: isApiAvailable(data.tools_crm),
      alternativeIfMissing: 'HubSpot Free, Pipedrive, or Notion CRM'
    });
  } else {
    integrations.push({
      tool: 'None specified',
      toolCategory: 'CRM',
      required: true,
      purpose: 'Need CRM for client tracking and automation',
      apiAvailable: false,
      alternativeIfMissing: 'Recommend HubSpot Free or Pipedrive'
    });
  }

  // Project Management
  if (data.tools_pm) {
    integrations.push({
      tool: data.tools_pm,
      toolCategory: 'Project Management',
      required: true,
      purpose: 'Project tracking, task management, team collaboration',
      apiAvailable: isApiAvailable(data.tools_pm),
      alternativeIfMissing: 'ClickUp, Asana, or Monday.com'
    });
  } else {
    integrations.push({
      tool: 'None specified',
      toolCategory: 'Project Management',
      required: true,
      purpose: 'Essential for delivery process automation',
      apiAvailable: false,
      alternativeIfMissing: 'Recommend ClickUp or Asana'
    });
  }

  // Communication
  if (data.tools_comm) {
    integrations.push({
      tool: data.tools_comm,
      toolCategory: 'Communication',
      required: true,
      purpose: 'Team communication, notifications, client updates',
      apiAvailable: isApiAvailable(data.tools_comm),
      alternativeIfMissing: 'Slack'
    });
  }

  // Storage
  if (data.tools_storage) {
    integrations.push({
      tool: data.tools_storage,
      toolCategory: 'File Storage',
      required: false,
      purpose: 'Document templates, deliverables, client files',
      apiAvailable: isApiAvailable(data.tools_storage),
      alternativeIfMissing: 'Google Drive'
    });
  }

  // Accounting
  if (data.tools_accounting) {
    integrations.push({
      tool: data.tools_accounting,
      toolCategory: 'Accounting',
      required: false,
      purpose: 'Invoicing automation, financial tracking',
      apiAvailable: isApiAvailable(data.tools_accounting),
      alternativeIfMissing: 'QuickBooks or Xero'
    });
  }

  // Automation layer
  if (data.tools_automation) {
    integrations.push({
      tool: data.tools_automation,
      toolCategory: 'Automation',
      required: true,
      purpose: 'Connect tools, automate workflows between systems',
      apiAvailable: isApiAvailable(data.tools_automation),
      alternativeIfMissing: 'Zapier or Make'
    });
  } else {
    integrations.push({
      tool: 'Zapier/Make',
      toolCategory: 'Automation',
      required: true,
      purpose: 'Connect tools, automate workflows between systems',
      apiAvailable: true,
      alternativeIfMissing: 'Must have automation layer - Zapier or Make required'
    });
  }

  return integrations;
}

// ============================================================================
// GAP ANALYSIS
// ============================================================================

function identifyGaps(data: AuditResponse): GapAnalysis[] {
  const gaps: GapAnalysis[] = [];

  // Check for vague or missing critical answers

  // Tasks only owner does - if too vague
  if (!data.tasks_only_owner || data.tasks_only_owner.length < 20) {
    gaps.push({
      field: 'tasks_only_owner',
      question: 'What tasks can ONLY you do?',
      reason: 'Answer too brief - need specific task breakdown to build automation',
      discoveryQuestions: [
        'Walk me through a typical day - what tasks require your personal attention?',
        'When your team says "I need you to look at this", what are the top 5 things they bring?',
        'What tasks do you do that you\'ve never tried to delegate? Why?'
      ],
      priority: 'critical'
    });
  }

  // Decisions only owner makes - if too vague
  if (!data.decisions_only_owner || data.decisions_only_owner.length < 20) {
    gaps.push({
      field: 'decisions_only_owner',
      question: 'What decisions can ONLY you make?',
      reason: 'Answer too brief - need specific decisions to build frameworks',
      discoveryQuestions: [
        'What decisions does your team escalate to you daily?',
        'When a client asks for something custom, who decides if we do it?',
        'What decisions have you made in the past month that only you could make?'
      ],
      priority: 'critical'
    });
  }

  // Vacation breaks - if too vague
  if (!data.vacation_breaks || data.vacation_breaks.length < 30) {
    gaps.push({
      field: 'vacation_breaks',
      question: 'What would break if you took 2 weeks off?',
      reason: 'Need specific failure points to build backup systems',
      discoveryQuestions: [
        'What happened the last time you were unavailable for a day?',
        'What are the top 3 things clients would complain about if you disappeared?',
        'What balls would get dropped if no one could reach you?'
      ],
      priority: 'critical'
    });
  }

  // Delivery blocker - if team can't deliver but no blocker specified
  if ((data.team_can_deliver === 'No' || data.team_can_deliver === 'Sometimes') &&
      (!data.delivery_blocker || data.delivery_blocker.length < 10)) {
    gaps.push({
      field: 'delivery_blocker',
      question: 'Why can\'t your team deliver without you?',
      reason: 'Need to understand specific blocker to design solution',
      discoveryQuestions: [
        'At what point in the project does your team get stuck?',
        'Is it a skill issue, confidence issue, or client expectation issue?',
        'What would happen if they tried to deliver without you?'
      ],
      priority: 'critical'
    });
  }

  // Tools - if no PM or CRM
  if (!data.tools_pm || data.tools_pm.toLowerCase() === 'none') {
    gaps.push({
      field: 'tools_pm',
      question: 'What project management tool do you use?',
      reason: 'PM tool required for automation - need to set one up',
      discoveryQuestions: [
        'How do you currently track projects and tasks?',
        'What\'s your budget for PM tooling?',
        'Any tools you\'ve tried and didn\'t like?'
      ],
      priority: 'important'
    });
  }

  if (!data.tools_crm || data.tools_crm.toLowerCase() === 'none') {
    gaps.push({
      field: 'tools_crm',
      question: 'What CRM do you use?',
      reason: 'CRM required for sales automation and client tracking',
      discoveryQuestions: [
        'How do you currently track leads and clients?',
        'Do you have any existing client database/spreadsheet?',
        'What\'s your budget for CRM tooling?'
      ],
      priority: 'important'
    });
  }

  // Core service - if vague
  if (!data.core_service || data.core_service.length < 10) {
    gaps.push({
      field: 'core_service',
      question: 'If you could only offer ONE service, which would it be?',
      reason: 'Need to identify core service for productization',
      discoveryQuestions: [
        'What service generates the most revenue?',
        'What service do you enjoy delivering most?',
        'What service has the best client results/testimonials?'
      ],
      priority: 'important'
    });
  }

  // Proprietary method - if they have one but didn't describe it
  if (data.has_proprietary_method === 'Yes' &&
      (!data.proprietary_method_description || data.proprietary_method_description.length < 30)) {
    gaps.push({
      field: 'proprietary_method_description',
      question: 'Describe your proprietary methodology',
      reason: 'This is critical IP for productization - need full documentation',
      discoveryQuestions: [
        'What are the steps/phases in your methodology?',
        'What\'s unique about your approach vs competitors?',
        'Do you have this written down anywhere?'
      ],
      priority: 'critical'
    });
  }

  // Core service steps - if too brief
  if (!data.core_service_steps || data.core_service_steps.length < 50) {
    gaps.push({
      field: 'core_service_steps',
      question: 'What are the main steps in your core delivery process?',
      reason: 'Need detailed workflow to build automation and SOPs',
      discoveryQuestions: [
        'Walk me through a project from start to finish',
        'What happens after you get a signed contract?',
        'What are the main milestones in a typical project?',
        'Where are the handoff points between team members?'
      ],
      priority: 'critical'
    });
  }

  // Handoff points - if not specified but team exists
  if ((data.team_size_total || 1) > 1 && (!data.handoff_points || data.handoff_points.length < 20)) {
    gaps.push({
      field: 'handoff_points',
      question: 'Where are the handoff points between you and your team?',
      reason: 'Handoffs are where work often stalls - need to systematize these',
      discoveryQuestions: [
        'At what point do you hand work to your team?',
        'What information do you give them when you hand off?',
        'When does work come back to you?',
        'What causes delays in these handoffs?'
      ],
      priority: 'important'
    });
  }

  // Client tiers - if they have tiers but no description
  if (data.has_client_tiers === 'Yes, clearly defined tiers' &&
      (!data.client_tier_description || data.client_tier_description.length < 30)) {
    gaps.push({
      field: 'client_tier_description',
      question: 'Describe your client tiers and what\'s included in each',
      reason: 'Need tier details to build tier-specific automations and SOPs',
      discoveryQuestions: [
        'What are the names of your tiers?',
        'What\'s included in each tier?',
        'What\'s the price range for each?',
        'How do clients typically move between tiers?'
      ],
      priority: 'important'
    });
  }

  // Team member succession - if no one can lead
  if (data.team_member_who_could_lead === 'No, need to hire') {
    gaps.push({
      field: 'team_member_who_could_lead',
      question: 'Who could take over client-facing work?',
      reason: 'No succession path for owner removal - may need to hire or develop someone',
      discoveryQuestions: [
        'Is there anyone on your team who could grow into this role?',
        'What skills are missing that prevent current team from taking over?',
        'Would you consider hiring a client success/account manager?',
        'What would you need to see to trust someone with client relationships?'
      ],
      priority: 'important'
    });
  }

  return gaps;
}

// ============================================================================
// AUTOMATION COVERAGE
// ============================================================================

function calculateAutomationCoverage(data: AuditResponse, systems: SystemSpec[]): AutomationCoverage {
  const breakdown: AutomationCoverage['breakdown'] = [];

  // Delivery automation
  const deliverySystems = systems.filter(s => s.category === 'delivery');
  const deliveryAutomation = Math.min(
    (deliverySystems.length * 15) + // Each system adds 15%
    (data.has_kickoff_checklist === 'Yes' ? 10 : 0) +
    (data.has_qc_checklist === 'Yes' ? 10 : 0) +
    ((data.documented_pct || 0) * 0.3), // Documentation adds up to 30%
    85 // Cap at 85%
  );

  breakdown.push({
    area: 'Delivery',
    currentState: `${data.projects_requiring_owner_pct || 70}% requires owner`,
    targetState: `${100 - deliveryAutomation}% requires owner`,
    automationPercentage: Math.round(deliveryAutomation),
    systemsRequired: deliverySystems.map(s => s.name)
  });

  // Sales automation
  const salesSystems = systems.filter(s => s.category === 'sales');
  const salesAutomation = Math.min(
    (salesSystems.length * 20) +
    (data.has_proposal_template === 'Yes' ? 15 : 0) +
    (data.tools_crm ? 10 : 0),
    70 // Cap at 70% - sales always needs human
  );

  breakdown.push({
    area: 'Sales',
    currentState: data.team_can_close === 'Yes' ? 'Team can close' : 'Owner-dependent',
    targetState: `${salesAutomation}% automated/delegated`,
    automationPercentage: Math.round(salesAutomation),
    systemsRequired: salesSystems.map(s => s.name)
  });

  // Client comms automation
  const commsSystems = systems.filter(s => s.category === 'client_comms');
  const hasTemplates = (data.comm_templates || []).length;
  const commsAutomation = Math.min(
    (commsSystems.length * 15) +
    (hasTemplates * 10) +
    (data.tools_comm ? 10 : 0),
    80
  );

  breakdown.push({
    area: 'Client Communications',
    currentState: `${hasTemplates} templates exist`,
    targetState: `${commsAutomation}% templated/automated`,
    automationPercentage: Math.round(commsAutomation),
    systemsRequired: commsSystems.map(s => s.name)
  });

  // Operations automation
  const opsSystems = systems.filter(s => s.category === 'operations');
  const opsAutomation = Math.min(
    (opsSystems.length * 15) +
    ((data.documented_pct || 0) * 0.4) +
    (data.tools_pm ? 15 : 0),
    75
  );

  breakdown.push({
    area: 'Operations',
    currentState: `${data.documented_pct || 0}% documented`,
    targetState: `${opsAutomation}% automated`,
    automationPercentage: Math.round(opsAutomation),
    systemsRequired: opsSystems.map(s => s.name)
  });

  // Quality automation
  const qualitySystems = systems.filter(s => s.category === 'quality');
  const qualityAutomation = Math.min(
    (qualitySystems.length * 20) +
    (data.has_qc_checklist === 'Yes' ? 20 : 0) +
    ((data.delivery_consistency || 5) * 5),
    80
  );

  breakdown.push({
    area: 'Quality Assurance',
    currentState: data.has_qc_checklist === 'Yes' ? 'Checklist exists' : 'No checklist',
    targetState: `${qualityAutomation}% automated`,
    automationPercentage: Math.round(qualityAutomation),
    systemsRequired: qualitySystems.map(s => s.name)
  });

  const overall = Math.round(
    (deliveryAutomation + salesAutomation + commsAutomation + opsAutomation + qualityAutomation) / 5
  );

  return {
    deliveryAutomation: Math.round(deliveryAutomation),
    salesAutomation: Math.round(salesAutomation),
    clientCommsAutomation: Math.round(commsAutomation),
    operationsAutomation: Math.round(opsAutomation),
    qualityAutomation: Math.round(qualityAutomation),
    overall,
    breakdown
  };
}

// ============================================================================
// BUILD PLAN
// ============================================================================

function generateBuildPlan(systems: SystemSpec[]): SystemSpecOutput['weekByWeekBuildPlan'] {
  const p0Systems = systems.filter(s => s.priority === 'P0');
  const p1Systems = systems.filter(s => s.priority === 'P1');
  const p2Systems = systems.filter(s => s.priority === 'P2');

  return [
    {
      week: 2,
      focus: 'Architecture & Quick Wins',
      systems: p0Systems.slice(0, 4).map(s => s.name),
      deliverables: [
        'System architecture diagram',
        'Quick win checklists/templates',
        'Integration requirements finalized'
      ]
    },
    {
      week: 3,
      focus: 'Core Systems Build',
      systems: [...p0Systems.slice(4), ...p1Systems.slice(0, 3)].map(s => s.name),
      deliverables: [
        'Core SOPs documented',
        'Decision frameworks created',
        'Automations built and tested'
      ]
    },
    {
      week: 4,
      focus: 'Testing & Handoff',
      systems: p1Systems.slice(3).map(s => s.name),
      deliverables: [
        'All systems tested',
        'Team trained on new processes',
        'Handoff documentation complete',
        'Productization roadmap defined'
      ]
    }
  ];
}

// ============================================================================
// DISCOVERY AGENDA
// ============================================================================

function generateDiscoveryAgenda(gaps: GapAnalysis[], data: AuditResponse): SystemSpecOutput['followUpDiscoveryAgenda'] {
  const agenda: SystemSpecOutput['followUpDiscoveryAgenda'] = [];

  // Group gaps by priority
  const criticalGaps = gaps.filter(g => g.priority === 'critical');
  const importantGaps = gaps.filter(g => g.priority === 'important');

  if (criticalGaps.length > 0) {
    agenda.push({
      topic: 'Critical Information Gaps',
      questions: criticalGaps.flatMap(g => g.discoveryQuestions),
      duration: '20 minutes'
    });
  }

  if (importantGaps.length > 0) {
    agenda.push({
      topic: 'Tool & Process Deep Dive',
      questions: importantGaps.flatMap(g => g.discoveryQuestions),
      duration: '15 minutes'
    });
  }

  // Always include process mapping
  agenda.push({
    topic: 'Core Delivery Process Mapping',
    questions: [
      `Walk me through delivering "${data.core_service || 'your core service'}" from start to finish`,
      'Where do you currently get stuck or need to intervene?',
      'What does your team do while waiting for you?',
      'How do you currently handle revisions?'
    ],
    duration: '25 minutes'
  });

  // Include tool walkthrough if they have tools
  if (data.tools_pm || data.tools_crm) {
    agenda.push({
      topic: 'Tool Walkthrough & Integration Planning',
      questions: [
        'Can you show me your current PM tool setup?',
        'How are projects/tasks currently structured?',
        'What automations do you already have in place?',
        'Where do things fall through the cracks?'
      ],
      duration: '15 minutes'
    });
  }

  return agenda;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseTextList(text: string | undefined): string[] {
  if (!text) return [];

  // Split by common delimiters
  return text
    .split(/[,\n•\-\d\.\)]+/)
    .map(item => item.trim())
    .filter(item => item.length > 3);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

function parseEstimatedTime(time: string): number {
  const match = time.match(/(\d+)\s*(hour|minute|day)/i);
  if (!match) return 2;

  const num = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  if (unit.includes('minute')) return num / 60;
  if (unit.includes('day')) return num * 8;
  return num;
}

function isApiAvailable(tool: string): boolean {
  const toolsWithApi = [
    'hubspot', 'pipedrive', 'salesforce', 'zoho',
    'asana', 'clickup', 'monday', 'trello', 'notion', 'basecamp',
    'slack', 'teams', 'discord',
    'google drive', 'dropbox', 'onedrive',
    'quickbooks', 'xero', 'freshbooks', 'stripe'
  ];

  return toolsWithApi.some(t => tool.toLowerCase().includes(t));
}

function systemAlreadyExists(systems: SystemSpec[], name: string): boolean {
  const nameLower = name.toLowerCase();
  return systems.some(s =>
    s.name.toLowerCase().includes(nameLower) ||
    s.description.toLowerCase().includes(nameLower)
  );
}

// ============================================================================
// SYSTEM CREATION HELPERS
// ============================================================================

function createStrategySystem(task: string, data: AuditResponse, idx: number): SystemSpec {
  return {
    id: `agent-strategy-${idx}`,
    name: `Strategy Agent: ${truncate(task, 40)}`,
    type: 'agent',
    priority: 'P1',
    category: 'delivery',
    description: `AI agent to assist with: ${task}`,
    triggeredBy: [`tasks_only_owner includes: "${task}"`],
    estimatedBuildTime: '4 hours',
    ownerTimeReclaimed: 3,
    prerequisites: ['Core delivery SOP'],
    integrations: [],
    prd: {
      problem: `"${task}" requires owner involvement`,
      solution: 'Strategy assistance agent with templates and frameworks',
      inputs: ['Client brief', 'Goals', 'Constraints'],
      outputs: ['Strategy draft for review'],
      workflow: ['Input client context', 'Agent generates draft', 'Human review', 'Finalize'],
      successMetrics: ['Reduce strategy time by 50%'],
      handoffProcess: 'Train team on agent usage',
      clientPrerequisites: []
    }
  };
}

function createClientCommsSystem(task: string, data: AuditResponse, idx: number): SystemSpec {
  return {
    id: `sop-client-comms-${idx}`,
    name: `Client Communication SOP: ${truncate(task, 40)}`,
    type: 'sop',
    priority: 'P1',
    category: 'client_comms',
    description: `Process for: ${task}`,
    triggeredBy: [`tasks_only_owner includes: "${task}"`],
    estimatedBuildTime: '2 hours',
    ownerTimeReclaimed: 4,
    prerequisites: ['Communication templates'],
    integrations: [data.tools_comm || 'email/calendar'],
    prd: {
      problem: `"${task}" requires owner - clients expect direct owner contact`,
      solution: 'Scripts, templates, and escalation rules for client communication',
      inputs: ['Client query/situation'],
      outputs: ['Appropriate response/action'],
      workflow: ['Receive communication', 'Identify type', 'Use appropriate template/script', 'Escalate if needed'],
      successMetrics: ['80% of client comms handled without owner'],
      handoffProcess: 'Train account manager, role-play scenarios',
      clientPrerequisites: []
    }
  };
}

function createQASystem(task: string, data: AuditResponse, idx: number): SystemSpec {
  return {
    id: `checklist-qa-${idx}`,
    name: `QA Process: ${truncate(task, 40)}`,
    type: 'checklist',
    priority: 'P0',
    category: 'quality',
    description: `Quality assurance for: ${task}`,
    triggeredBy: [`tasks_only_owner includes: "${task}"`],
    estimatedBuildTime: '1 hour',
    ownerTimeReclaimed: 3,
    prerequisites: [],
    integrations: [data.tools_pm || 'PM tool'],
    prd: {
      problem: `"${task}" requires owner to ensure quality`,
      solution: 'Detailed QA checklist defining quality standards',
      inputs: ['Deliverable to review'],
      outputs: ['Pass/fail with revision list'],
      workflow: ['Complete work', 'Run QA checklist', 'Fix issues', 'Pass to next stage'],
      successMetrics: ['Quality maintained without owner review'],
      handoffProcess: 'Train team on quality standards',
      clientPrerequisites: []
    }
  };
}

function createPricingSystem(task: string, data: AuditResponse, idx: number): SystemSpec {
  return {
    id: `framework-pricing-${idx}`,
    name: 'Pricing Calculator',
    type: 'decision_framework',
    priority: 'P1',
    category: 'sales',
    description: 'Systematic pricing based on project parameters',
    triggeredBy: [`tasks_only_owner includes: "${task}"`],
    estimatedBuildTime: '3 hours',
    ownerTimeReclaimed: 2,
    prerequisites: ['Service packages defined'],
    integrations: [],
    prd: {
      problem: 'Pricing decisions require owner judgment',
      solution: 'Pricing calculator/framework based on project scope',
      inputs: ['Project type', 'Scope', 'Timeline', 'Client tier'],
      outputs: ['Recommended price range'],
      workflow: ['Input project parameters', 'Calculator provides range', 'Team selects within range or escalates'],
      successMetrics: ['80% of quotes done without owner'],
      handoffProcess: 'Build calculator, train team on usage and escalation criteria',
      clientPrerequisites: []
    }
  };
}

function createGenericTaskSOP(task: string, data: AuditResponse, idx: number): SystemSpec {
  return {
    id: `sop-task-${idx}`,
    name: `SOP: ${truncate(task, 40)}`,
    type: 'sop',
    priority: 'P1',
    category: 'operations',
    description: `Standard operating procedure for: ${task}`,
    triggeredBy: [`tasks_only_owner includes: "${task}"`],
    estimatedBuildTime: '2 hours',
    ownerTimeReclaimed: 2,
    prerequisites: [],
    integrations: [],
    prd: {
      problem: `"${task}" requires owner`,
      solution: 'Step-by-step SOP for this task',
      inputs: ['To be determined'],
      outputs: ['Task completed'],
      workflow: ['To be mapped in discovery'],
      successMetrics: ['Task can be done by team'],
      handoffProcess: 'Document process, train team',
      clientPrerequisites: []
    }
  };
}

function createPricingDecisionFramework(decision: string, data: AuditResponse): SystemSpec {
  return {
    id: 'framework-pricing-decisions',
    name: 'Pricing Decision Framework',
    type: 'decision_framework',
    priority: 'P0',
    category: 'sales',
    description: 'Framework for making pricing decisions without owner',
    triggeredBy: [`decisions_only_owner includes pricing`],
    estimatedBuildTime: '3 hours',
    ownerTimeReclaimed: 3,
    prerequisites: [],
    integrations: [data.tools_crm || 'CRM'],
    prd: {
      problem: 'All pricing decisions require owner approval',
      solution: 'Clear pricing tiers, rules, and escalation criteria',
      inputs: ['Project scope', 'Client history', 'Timeline'],
      outputs: ['Approved price or escalation'],
      workflow: [
        'Assess project scope',
        'Check pricing matrix',
        'Apply any adjustments',
        'If within approved range, proceed',
        'If outside range, escalate with recommendation'
      ],
      successMetrics: ['70% of pricing done without owner'],
      handoffProcess: 'Create pricing matrix, train sales team',
      clientPrerequisites: []
    }
  };
}

function createClientQualificationFramework(decision: string, data: AuditResponse): SystemSpec {
  return {
    id: 'framework-client-qualification',
    name: 'Client Qualification Scorecard',
    type: 'decision_framework',
    priority: 'P0',
    category: 'sales',
    description: 'Scorecard to determine if we should take a client',
    triggeredBy: [`decisions_only_owner includes client acceptance`],
    estimatedBuildTime: '2 hours',
    ownerTimeReclaimed: 2,
    prerequisites: [],
    integrations: [data.tools_crm || 'CRM'],
    prd: {
      problem: 'Deciding which clients to accept requires owner',
      solution: 'Scoring system based on ICP, budget, timeline, red flags',
      inputs: ['Lead information', 'Discovery notes'],
      outputs: ['Score + recommendation (accept/decline/escalate)'],
      workflow: [
        'Complete discovery call',
        'Score lead on criteria',
        'If score > threshold, accept',
        'If score < threshold, decline',
        'If borderline, escalate with notes'
      ],
      successMetrics: ['80% of qualification decisions made without owner'],
      handoffProcess: 'Create scorecard, train sales team, review first 10 decisions',
      clientPrerequisites: []
    }
  };
}

function createScopeChangeFramework(decision: string, data: AuditResponse): SystemSpec {
  return {
    id: 'framework-scope-change',
    name: 'Scope Change Decision Framework',
    type: 'decision_framework',
    priority: 'P1',
    category: 'delivery',
    description: 'Rules for handling scope changes and client requests',
    triggeredBy: [`decisions_only_owner includes scope`],
    estimatedBuildTime: '2 hours',
    ownerTimeReclaimed: 2,
    prerequisites: [],
    integrations: [data.tools_pm || 'PM tool'],
    prd: {
      problem: 'Scope change decisions require owner',
      solution: 'Clear rules for what\'s in scope, out of scope, and pricing for changes',
      inputs: ['Client request', 'Original scope'],
      outputs: ['Approved change or change order'],
      workflow: [
        'Receive change request',
        'Check against scope definition',
        'If minor and within bounds, approve',
        'If requires additional cost, create change order',
        'If major change, escalate'
      ],
      successMetrics: ['90% of scope discussions handled by team'],
      handoffProcess: 'Define scope boundaries, create change order template',
      clientPrerequisites: []
    }
  };
}

function createHiringFramework(decision: string, data: AuditResponse): SystemSpec {
  return {
    id: 'framework-hiring',
    name: 'Hiring Decision Framework',
    type: 'decision_framework',
    priority: 'P2',
    category: 'operations',
    description: 'Structured hiring process and criteria',
    triggeredBy: [`decisions_only_owner includes hiring`],
    estimatedBuildTime: '4 hours',
    ownerTimeReclaimed: 2,
    prerequisites: ['Role descriptions'],
    integrations: [],
    prd: {
      problem: 'All hiring decisions require owner',
      solution: 'Structured hiring process with clear criteria',
      inputs: ['Job requirements', 'Candidates'],
      outputs: ['Hiring recommendation'],
      workflow: [
        'Define role requirements',
        'Source candidates',
        'Initial screen against criteria',
        'Skills assessment',
        'Culture fit interview',
        'Make recommendation',
        'Owner final approval for offers'
      ],
      successMetrics: ['Team can screen and recommend, owner only final approval'],
      handoffProcess: 'Create interview guides, scoring rubrics',
      clientPrerequisites: []
    }
  };
}

function createGenericDecisionFramework(decision: string, data: AuditResponse, idx: number): SystemSpec {
  return {
    id: `framework-decision-${idx}`,
    name: `Decision Framework: ${truncate(decision, 40)}`,
    type: 'decision_framework',
    priority: 'P2',
    category: 'operations',
    description: `Framework for: ${decision}`,
    triggeredBy: [`decisions_only_owner includes: "${decision}"`],
    estimatedBuildTime: '2 hours',
    ownerTimeReclaimed: 1,
    prerequisites: [],
    integrations: [],
    prd: {
      problem: `"${decision}" requires owner`,
      solution: 'Decision criteria and escalation rules',
      inputs: ['Situation requiring decision'],
      outputs: ['Decision or escalation'],
      workflow: ['Assess situation', 'Apply criteria', 'Decide or escalate'],
      successMetrics: ['Decision can be made without owner'],
      handoffProcess: 'Document criteria, train team',
      clientPrerequisites: []
    }
  };
}

function createBackupSystem(breakPoint: string, data: AuditResponse, idx: number): SystemSpec {
  return {
    id: `backup-${idx}`,
    name: `Backup System: ${truncate(breakPoint, 40)}`,
    type: 'sop',
    priority: 'P0',
    category: 'operations',
    description: `Backup system to prevent: ${breakPoint}`,
    triggeredBy: [`vacation_breaks includes: "${breakPoint}"`],
    estimatedBuildTime: '3 hours',
    ownerTimeReclaimed: 2,
    prerequisites: [],
    integrations: [],
    prd: {
      problem: `If owner is unavailable: "${breakPoint}"`,
      solution: 'Documented process and designated backup person',
      inputs: ['Situation that would normally go to owner'],
      outputs: ['Situation handled or properly escalated'],
      workflow: ['Identify situation', 'Follow backup process', 'Document for owner review'],
      successMetrics: ['Business continues functioning when owner unavailable'],
      handoffProcess: 'Document process, designate and train backup',
      clientPrerequisites: []
    }
  };
}
