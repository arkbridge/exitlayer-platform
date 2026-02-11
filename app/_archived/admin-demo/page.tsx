'use client'

import { useState } from 'react'
import Link from 'next/link'

// Helper to get score color
function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#eab308'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

// Helper to get priority color
function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'P0': return '#ef4444'
    case 'P1': return '#f97316'
    case 'P2': return '#eab308'
    case 'P3': return '#22c55e'
    default: return '#666'
  }
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  submitted: { label: 'New', color: 'bg-[#3b82f6]/10 text-[#3b82f6]' },
  review: { label: 'In Review', color: 'bg-[#f59e0b]/10 text-[#f59e0b]' },
  call_scheduled: { label: 'Call Scheduled', color: 'bg-[#06b6d4]/10 text-[#06b6d4]' },
  call_complete: { label: 'Call Complete', color: 'bg-[#6366f1]/10 text-[#6366f1]' },
  building: { label: 'Building', color: 'bg-[#8b5cf6]/10 text-[#8b5cf6]' },
  complete: { label: 'Complete', color: 'bg-[#22c55e]/10 text-[#22c55e]' },
}

// Simulated client data
const DEMO_CLIENTS = [
  {
    id: '1',
    company_name: 'Apex Marketing Co',
    full_name: 'Sarah Chen',
    email: 'sarah@apexmarketing.co',
    overall_score: 38,
    status: 'submitted',
    created_at: '2024-01-28T10:30:00Z',
    annual_revenue: 850000,
    dimension_scores: {
      leverage: 32,
      equityPotential: 45,
      revenueRisk: 28,
      productReadiness: 42,
      implementationCapacity: 48,
    },
    financial_metrics: {
      totalWeeklyHours: 62,
      ownerHourlyValue: 285,
      currentExitMultiple: 2.1,
      valueGap: 1200000,
    },
    questionnaire_data: {
      team_size: 4,
      annual_revenue: 850000,
      core_service: 'Digital marketing strategy and execution',
      has_sops: 'No',
      documented_pct: 15,
      projects_requiring_owner_pct: 85,
    },
    call_prep: {
      quickContext: {
        revenue: '$850K/year',
        recurringPct: 35,
        teamSize: 4,
        ownerHours: 62,
        painSummary: 'working 62 hrs/week, 85% of projects require owner, no SOPs, only 15% documented',
      },
      buildHypothesis: [
        { priority: 1, system: 'Client Onboarding Flow', why: "Team can't onboard without owner. 3 new clients/month = significant trapped time.", hoursReclaimed: 9 },
        { priority: 2, system: 'Delivery QC Checklist + Review Skill', why: 'Owner reviews everything before delivery. 85% project involvement = delivery bottleneck.', hoursReclaimed: 8 },
        { priority: 3, system: 'Sales Qualification Framework', why: "Team can't close deals. May be qualification problem, not closing problem.", hoursReclaimed: 6 },
        { priority: 4, system: 'Client Reporting Automation', why: '12 clients with weekly updates = repeatable, automatable work.', hoursReclaimed: 6 },
      ],
      callSections: [
        {
          title: 'Onboarding Process',
          duration: '15 min',
          goal: 'Extract the actual onboarding sequence so we can build it.',
          questions: [
            'Walk me through the last client you onboarded. From signed contract to first deliverable - what happened step by step?',
            'What do you personally do vs. what does the team do?',
            'What information do you need from the client before you can start? How do you collect it?',
            "What's the first thing that breaks if you hand this to your team tomorrow?",
          ],
          listenFor: [
            "The step she thinks requires her but actually doesn't",
            "The thing she does on autopilot that she's never documented",
            'Trust issues vs. process issues',
          ],
        },
        {
          title: 'Delivery Review & QC',
          duration: '10 min',
          goal: 'Turn their quality eye into a checklist + decision tree.',
          questions: [
            'When you review work before it goes to the client, what are you actually checking?',
            "What's a recent example of something you caught that the team missed?",
            'Is there a pattern to the mistakes? Same 3-4 things, or random?',
          ],
          listenFor: [
            'The repeatable checklist hiding in their head',
            "The quality threshold that's never been defined",
            'Whether this is skill gap or trust gap',
          ],
        },
        {
          title: 'Proprietary Mechanism',
          duration: '15 min',
          goal: 'Extract and name their unique approach.',
          questions: [
            'What\'s your actual process for delivering results? Walk me through a typical engagement.',
            'Where did this approach come from? Did you invent it or learn it somewhere?',
            'What do other agencies in your space do wrong that you do right?',
          ],
          listenFor: [
            'The framework structure (steps, phases, stages)',
            'The contrarian belief behind it',
            'Language they use that we can codify',
          ],
        },
      ],
      redFlags: [
        { observation: 'Says team "can\'t onboard" but might have some onboarding docs', probe: 'Is the doc outdated? Not being followed? Or just not trusting the team?' },
        { observation: '62 hours/week but only 2 hours on strategy', probe: 'Where do they think this time should come from? What would they do with more strategic time?' },
      ],
      showMeRequests: [
        { item: 'A recent client onboarding doc or welcome email', why: 'See what exists and how systematized it is' },
        { item: 'How they review a deliverable before it goes to the client', why: 'Watch the actual QC process to extract the checklist' },
        { item: 'Their CRM/pipeline', why: 'See how leads flow, where deals stall' },
      ],
      quickWins: [
        'Your client reporting is probably 80% automatable in week 1',
        'The delivery QC checklist - we can have v1 documented by end of this call',
        'Your onboarding sequence sounds systematizable. We can have that as a skill within days.',
      ],
      postCallNeeds: [
        'Transcript for Claude to digest',
        'Any docs/assets they shared or referenced',
        'Your notes on validation (what was confirmed, what changed)',
        'Any follow-up questions that emerged',
      ],
    },
    system_spec: {
      summary: {
        totalSystemsTooBuild: 8,
        p0Systems: 3,
        p1Systems: 4,
        estimatedBuildHours: 32,
        weeklyHoursReclaimed: 29,
        automationCoverage: 65,
      },
      systems: [
        {
          id: 'checklist-qc',
          name: 'Quality Control Checklist',
          type: 'checklist',
          priority: 'P0',
          category: 'quality',
          description: 'Pre-delivery quality assurance checklist',
          estimatedBuildTime: '30 minutes',
          ownerTimeReclaimed: 3,
          prd: {
            problem: "Quality review requires owner involvement because there's no standard",
            solution: 'Checklist defining quality standards anyone can verify',
            workflow: ['Team member completes deliverable', 'Run through QC checklist', 'Address any failures', 'Mark ready for client'],
            successMetrics: ['Reduced owner QA time by 80%', 'Consistent quality scores'],
          },
        },
        {
          id: 'checklist-kickoff',
          name: 'Project Kickoff Checklist',
          type: 'checklist',
          priority: 'P0',
          category: 'delivery',
          description: 'Standardized checklist for project kickoffs to ensure consistent starts',
          estimatedBuildTime: '30 minutes',
          ownerTimeReclaimed: 2,
          prd: {
            problem: 'No standard kickoff process - each project starts differently',
            solution: 'Checklist that covers all kickoff essentials',
            workflow: ['Receive new project notification', 'Open kickoff checklist', 'Complete all items', 'Notify team project is ready'],
            successMetrics: ['100% of projects use checklist', 'Reduced kickoff time by 50%'],
          },
        },
        {
          id: 'templates-client-comms',
          name: 'Client Communication Templates',
          type: 'template',
          priority: 'P0',
          category: 'client_comms',
          description: 'Create templates for: Welcome email, Status updates, Project completion',
          estimatedBuildTime: '1 hour',
          ownerTimeReclaimed: 5,
          prd: {
            problem: 'Client communications written from scratch each time',
            solution: 'Pre-written templates for common scenarios',
            workflow: ['Identify communication need', 'Select appropriate template', 'Fill in variables', 'Send'],
            successMetrics: ['5+ hours/week saved', 'Consistent communication quality'],
          },
        },
        {
          id: 'sop-client-onboarding',
          name: 'Client Onboarding SOP + Automation',
          type: 'sop',
          priority: 'P1',
          category: 'onboarding',
          description: 'Full onboarding process documentation. Blocker: Need to understand exact client handoff process.',
          estimatedBuildTime: '4 hours',
          ownerTimeReclaimed: 4,
          prd: {
            problem: 'Team cannot onboard clients without owner',
            solution: 'Step-by-step onboarding process with automated triggers',
            workflow: ['Contract signed triggers automation', 'Welcome email sent automatically', 'Client questionnaire sent', 'Project created in PM tool', 'Team assigned', 'Kickoff scheduled'],
            successMetrics: ['0 owner hours in onboarding', 'Client satisfaction with onboarding > 9/10'],
          },
        },
        {
          id: 'sop-delivery-process',
          name: 'Digital Marketing Delivery SOP',
          type: 'sop',
          priority: 'P1',
          category: 'delivery',
          description: 'Full delivery process for core service.',
          estimatedBuildTime: '8 hours',
          ownerTimeReclaimed: 10,
          prd: {
            problem: 'Team cannot deliver without owner involvement',
            solution: 'Comprehensive delivery SOP with decision points and escalation rules',
            workflow: ['Project kickoff', 'Discovery/research phase', 'Strategy development', 'Execution phase', 'Internal review', 'Client presentation', 'Revisions', 'Final delivery'],
            successMetrics: ['80% of projects delivered without owner', 'Quality scores maintained'],
          },
        },
      ],
      integrations: [
        { tool: 'HubSpot', toolCategory: 'CRM', required: true, purpose: 'Client data, pipeline, automation triggers', apiAvailable: true },
        { tool: 'ClickUp', toolCategory: 'Project Management', required: true, purpose: 'Project tracking, task management, team collaboration', apiAvailable: true },
        { tool: 'Slack', toolCategory: 'Communication', required: true, purpose: 'Team communication, notifications, client updates', apiAvailable: true },
        { tool: 'Zapier', toolCategory: 'Automation', required: true, purpose: 'Connect tools, automate workflows between systems', apiAvailable: true },
      ],
      gaps: [
        {
          field: 'tasks_only_owner',
          question: 'What tasks can ONLY you do?',
          reason: 'Answer too brief - need specific task breakdown to build automation',
          priority: 'critical',
          discoveryQuestions: [
            'Walk me through a typical day - what tasks require your personal attention?',
            'When your team says "I need you to look at this", what are the top 5 things they bring?',
          ],
        },
        {
          field: 'core_service_steps',
          question: 'What are the main steps in your core delivery process?',
          reason: 'Need detailed workflow to build automation and SOPs',
          priority: 'critical',
          discoveryQuestions: [
            'Walk me through a project from start to finish',
            'What happens after you get a signed contract?',
            'What are the main milestones in a typical project?',
          ],
        },
      ],
      automationCoverage: {
        deliveryAutomation: 55,
        salesAutomation: 45,
        clientCommsAutomation: 70,
        operationsAutomation: 60,
        qualityAutomation: 75,
        overall: 61,
        breakdown: [
          { area: 'Delivery', currentState: '85% requires owner', targetState: '30% requires owner', automationPercentage: 55 },
          { area: 'Sales', currentState: 'Owner-dependent', targetState: '45% automated/delegated', automationPercentage: 45 },
          { area: 'Client Communications', currentState: '0 templates exist', targetState: '70% templated/automated', automationPercentage: 70 },
          { area: 'Operations', currentState: '15% documented', targetState: '60% automated', automationPercentage: 60 },
          { area: 'Quality Assurance', currentState: 'No checklist', targetState: '75% automated', automationPercentage: 75 },
        ],
      },
      weekByWeekBuildPlan: [
        {
          week: 2,
          focus: 'Architecture & Quick Wins',
          systems: ['Quality Control Checklist', 'Project Kickoff Checklist', 'Client Communication Templates'],
          deliverables: ['System architecture diagram', 'Quick win checklists/templates', 'Integration requirements finalized'],
        },
        {
          week: 3,
          focus: 'Core Systems Build',
          systems: ['Client Onboarding SOP + Automation', 'Digital Marketing Delivery SOP'],
          deliverables: ['Core SOPs documented', 'Decision frameworks created', 'Automations built and tested'],
        },
        {
          week: 4,
          focus: 'Testing & Handoff',
          systems: ['Sales Qualification Framework'],
          deliverables: ['All systems tested', 'Team trained on new processes', 'Handoff documentation complete'],
        },
      ],
    },
    pipeline_stages: [
      { stage: 'submitted', notes: 'Questionnaire submitted', created_at: '2024-01-28T10:30:00Z' },
    ],
    assets: [],
    notes: [],
  },
  {
    id: '2',
    company_name: 'Precision CFO Services',
    full_name: 'Michael Torres',
    email: 'michael@precisioncfo.com',
    overall_score: 52,
    status: 'call_scheduled',
    created_at: '2024-01-25T14:15:00Z',
    annual_revenue: 1200000,
    dimension_scores: {
      leverage: 48,
      equityPotential: 58,
      revenueRisk: 45,
      productReadiness: 55,
      implementationCapacity: 52,
    },
    financial_metrics: {
      totalWeeklyHours: 55,
      ownerHourlyValue: 420,
      currentExitMultiple: 2.8,
      valueGap: 1800000,
    },
    questionnaire_data: {
      team_size: 6,
      annual_revenue: 1200000,
      core_service: 'Fractional CFO and financial strategy',
      has_sops: 'Yes',
      documented_pct: 40,
      projects_requiring_owner_pct: 70,
    },
    call_prep: {
      quickContext: {
        revenue: '$1.2M/year',
        recurringPct: 65,
        teamSize: 6,
        ownerHours: 55,
        painSummary: 'working 55 hrs/week, 70% of projects require owner, has some SOPs, 40% documented',
      },
      buildHypothesis: [
        { priority: 1, system: 'Financial Analysis Framework', why: 'Core deliverable requires owner expertise. Need to codify methodology.', hoursReclaimed: 12 },
        { priority: 2, system: 'Client Reporting Dashboard', why: 'Monthly reports to 15 clients. Highly automatable.', hoursReclaimed: 8 },
        { priority: 3, system: 'Proposal Generator', why: 'Custom proposals take 3-4 hours each. Template + automation = 30 min.', hoursReclaimed: 6 },
      ],
      callSections: [
        {
          title: 'Financial Analysis Process',
          duration: '20 min',
          goal: 'Map the exact methodology used for financial analysis.',
          questions: [
            'Walk me through how you analyze a new client\'s financials',
            'What frameworks or models do you always use?',
            'What\'s the output - what does the client actually receive?',
          ],
          listenFor: [
            'Repeatable frameworks that can be templated',
            'Judgment calls that need decision trees',
            'Data sources and integrations needed',
          ],
        },
      ],
      redFlags: [
        { observation: 'High recurring revenue but still working 55 hours', probe: 'Where is time going if clients are recurring? Scope creep?' },
      ],
      showMeRequests: [
        { item: 'A sample financial analysis deliverable', why: 'Understand the output format and complexity' },
        { item: 'Their reporting templates', why: 'See what can be automated' },
      ],
      quickWins: [
        'Monthly reporting can be 90% automated with the right dashboard',
        'Proposal templates can cut creation time by 80%',
      ],
      postCallNeeds: [
        'Transcript for Claude to digest',
        'Sample deliverables',
        'Current templates and frameworks',
      ],
    },
    system_spec: {
      summary: {
        totalSystemsTooBuild: 6,
        p0Systems: 2,
        p1Systems: 3,
        estimatedBuildHours: 28,
        weeklyHoursReclaimed: 26,
        automationCoverage: 72,
      },
      systems: [
        {
          id: 'framework-financial-analysis',
          name: 'Financial Analysis Framework',
          type: 'decision_framework',
          priority: 'P0',
          category: 'delivery',
          description: 'Codified methodology for financial analysis with templates and decision trees',
          estimatedBuildTime: '6 hours',
          ownerTimeReclaimed: 12,
          prd: {
            problem: 'Financial analysis requires owner expertise and judgment',
            solution: 'Framework with templates, formulas, and decision trees for common scenarios',
            workflow: ['Import client data', 'Run analysis templates', 'Review flagged items', 'Generate report'],
            successMetrics: ['80% of analyses completed by team', 'Maintained quality scores'],
          },
        },
        {
          id: 'automation-reporting',
          name: 'Client Reporting Dashboard',
          type: 'automation',
          priority: 'P0',
          category: 'reporting',
          description: 'Automated monthly reporting with live dashboards',
          estimatedBuildTime: '8 hours',
          ownerTimeReclaimed: 8,
          prd: {
            problem: 'Monthly reports created manually for 15 clients',
            solution: 'Automated dashboard with scheduled email reports',
            workflow: ['Data syncs automatically', 'Dashboard updates in real-time', 'Monthly email generated and sent'],
            successMetrics: ['Reports delivered without manual work', 'Client satisfaction maintained'],
          },
        },
      ],
      integrations: [
        { tool: 'QuickBooks', toolCategory: 'Accounting', required: true, purpose: 'Financial data sync', apiAvailable: true },
        { tool: 'Notion', toolCategory: 'Project Management', required: true, purpose: 'Client workspace and documentation', apiAvailable: true },
      ],
      gaps: [],
      automationCoverage: {
        deliveryAutomation: 70,
        salesAutomation: 60,
        clientCommsAutomation: 80,
        operationsAutomation: 75,
        qualityAutomation: 70,
        overall: 71,
        breakdown: [
          { area: 'Delivery', currentState: '70% requires owner', targetState: '30% requires owner', automationPercentage: 70 },
          { area: 'Reporting', currentState: 'Manual monthly', targetState: 'Fully automated', automationPercentage: 90 },
        ],
      },
      weekByWeekBuildPlan: [
        {
          week: 2,
          focus: 'Reporting Automation',
          systems: ['Client Reporting Dashboard'],
          deliverables: ['Dashboard templates', 'Data connections', 'Automated email setup'],
        },
        {
          week: 3,
          focus: 'Core Framework',
          systems: ['Financial Analysis Framework'],
          deliverables: ['Analysis templates', 'Decision trees', 'Team training materials'],
        },
      ],
    },
    pipeline_stages: [
      { stage: 'submitted', notes: 'Questionnaire submitted', created_at: '2024-01-25T14:15:00Z' },
      { stage: 'review', notes: 'Initial review complete', created_at: '2024-01-26T09:00:00Z' },
      { stage: 'call_scheduled', notes: 'Discovery call scheduled for Feb 1', created_at: '2024-01-27T11:30:00Z' },
    ],
    assets: [
      { id: '1', file_name: 'Financial_Analysis_Template.xlsx', category: 'templates', created_at: '2024-01-26T10:00:00Z' },
      { id: '2', file_name: 'Monthly_Report_Sample.pdf', category: 'deliverables', created_at: '2024-01-26T10:05:00Z' },
    ],
    notes: [
      { id: '1', content: 'Strong candidate - has existing SOPs we can build on. High recurring revenue.', created_at: '2024-01-26T09:30:00Z' },
    ],
  },
  {
    id: '3',
    company_name: 'Velocity Creative',
    full_name: 'Jessica Park',
    email: 'jessica@velocitycreative.io',
    overall_score: 65,
    status: 'building',
    created_at: '2024-01-18T09:00:00Z',
    annual_revenue: 2100000,
    dimension_scores: {
      leverage: 62,
      equityPotential: 70,
      revenueRisk: 58,
      productReadiness: 68,
      implementationCapacity: 65,
    },
    financial_metrics: {
      totalWeeklyHours: 48,
      ownerHourlyValue: 580,
      currentExitMultiple: 3.5,
      valueGap: 2400000,
    },
    questionnaire_data: {
      team_size: 12,
      annual_revenue: 2100000,
      core_service: 'Brand strategy and creative design',
      has_sops: 'Yes',
      documented_pct: 65,
      projects_requiring_owner_pct: 45,
    },
    call_prep: {
      quickContext: {
        revenue: '$2.1M/year',
        recurringPct: 40,
        teamSize: 12,
        ownerHours: 48,
        painSummary: 'working 48 hrs/week, 45% of projects require owner, good documentation at 65%',
      },
      buildHypothesis: [
        { priority: 1, system: 'Creative Brief Generator', why: 'Briefs are bottleneck - owner writes all of them.', hoursReclaimed: 8 },
        { priority: 2, system: 'Client Presentation Framework', why: 'Strategy presentations require owner polish.', hoursReclaimed: 6 },
      ],
      callSections: [],
      redFlags: [],
      showMeRequests: [],
      quickWins: ['Creative brief template can save 6+ hours per week'],
      postCallNeeds: ['Transcript', 'Sample briefs', 'Presentation templates'],
    },
    system_spec: {
      summary: {
        totalSystemsTooBuild: 4,
        p0Systems: 1,
        p1Systems: 2,
        estimatedBuildHours: 18,
        weeklyHoursReclaimed: 14,
        automationCoverage: 78,
      },
      systems: [
        {
          id: 'agent-brief-generator',
          name: 'Creative Brief Generator',
          type: 'agent',
          priority: 'P0',
          category: 'delivery',
          description: 'AI agent that generates creative briefs from client inputs',
          estimatedBuildTime: '6 hours',
          ownerTimeReclaimed: 8,
          prd: {
            problem: 'Owner writes all creative briefs - major bottleneck',
            solution: 'AI agent that generates briefs from questionnaire and call notes',
            workflow: ['Client fills intake form', 'Agent generates brief draft', 'Team reviews and refines', 'Client approves'],
            successMetrics: ['90% of briefs generated without owner', 'Brief quality maintained'],
          },
        },
      ],
      integrations: [
        { tool: 'Figma', toolCategory: 'Design', required: true, purpose: 'Design collaboration and asset management', apiAvailable: true },
        { tool: 'Asana', toolCategory: 'Project Management', required: true, purpose: 'Project tracking', apiAvailable: true },
      ],
      gaps: [],
      automationCoverage: {
        deliveryAutomation: 75,
        salesAutomation: 70,
        clientCommsAutomation: 85,
        operationsAutomation: 80,
        qualityAutomation: 78,
        overall: 78,
        breakdown: [
          { area: 'Delivery', currentState: '45% requires owner', targetState: '15% requires owner', automationPercentage: 75 },
          { area: 'Creative', currentState: 'Briefs manual', targetState: 'AI-generated', automationPercentage: 85 },
        ],
      },
      weekByWeekBuildPlan: [
        {
          week: 2,
          focus: 'Brief Generator',
          systems: ['Creative Brief Generator'],
          deliverables: ['Brief templates', 'AI agent configuration', 'Intake form'],
        },
        {
          week: 3,
          focus: 'Presentation Framework',
          systems: ['Client Presentation Framework'],
          deliverables: ['Presentation templates', 'Brand guidelines integration'],
        },
      ],
    },
    pipeline_stages: [
      { stage: 'submitted', notes: 'Questionnaire submitted', created_at: '2024-01-18T09:00:00Z' },
      { stage: 'review', notes: 'Initial review complete', created_at: '2024-01-19T10:00:00Z' },
      { stage: 'call_scheduled', notes: 'Call scheduled', created_at: '2024-01-20T14:00:00Z' },
      { stage: 'call_complete', notes: 'Great call - validated all hypotheses', created_at: '2024-01-22T16:00:00Z' },
      { stage: 'building', notes: 'Sprint started - Week 1 complete', created_at: '2024-01-24T09:00:00Z' },
    ],
    assets: [
      { id: '1', file_name: 'Creative_Brief_Template.docx', category: 'templates', created_at: '2024-01-20T12:00:00Z' },
      { id: '2', file_name: 'Brand_Guidelines.pdf', category: 'sops', created_at: '2024-01-20T12:05:00Z' },
      { id: '3', file_name: 'Sample_Presentation.pdf', category: 'deliverables', created_at: '2024-01-20T12:10:00Z' },
      { id: '4', file_name: 'Team_Structure.pdf', category: 'other', created_at: '2024-01-20T12:15:00Z' },
    ],
    notes: [
      { id: '1', content: 'Excellent candidate - already well-organized, just needs automation layer', created_at: '2024-01-19T10:30:00Z' },
      { id: '2', content: 'Call notes: Confirmed brief generator is top priority. Jessica excited about AI assistance.', created_at: '2024-01-22T17:00:00Z' },
      { id: '3', content: 'Week 1 update: Brief generator 70% complete. Team training scheduled for Friday.', created_at: '2024-01-26T15:00:00Z' },
    ],
  },
]

export default function AdminDemoPage() {
  const [view, setView] = useState<'overview' | 'clients' | 'detail'>('overview')
  const [selectedClient, setSelectedClient] = useState<typeof DEMO_CLIENTS[0] | null>(null)

  const stats = {
    total: DEMO_CLIENTS.length,
    submitted: DEMO_CLIENTS.filter(c => c.status === 'submitted').length,
    inReview: DEMO_CLIENTS.filter(c => c.status === 'review').length,
    callScheduled: DEMO_CLIENTS.filter(c => c.status === 'call_scheduled').length,
    building: DEMO_CLIENTS.filter(c => c.status === 'building').length,
    complete: DEMO_CLIENTS.filter(c => c.status === 'complete').length,
    avgScore: Math.round(DEMO_CLIENTS.reduce((sum, c) => sum + c.overall_score, 0) / DEMO_CLIENTS.length),
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Admin nav */}
      <nav className="border-b border-[#e5e5e5] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <span className="text-lg font-serif font-medium text-[#1a1a1a]">ExitLayer</span>
                <span className="px-2 py-0.5 bg-emerald-900 text-white text-xs font-medium rounded-full">
                  Admin Demo
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setView('overview'); setSelectedClient(null); }}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                    view === 'overview' ? 'bg-[#f8f8f6] text-[#1a1a1a] font-medium' : 'text-[#666] hover:text-[#1a1a1a] hover:bg-[#f8f8f6]'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => { setView('clients'); setSelectedClient(null); }}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                    view === 'clients' ? 'bg-[#f8f8f6] text-[#1a1a1a] font-medium' : 'text-[#666] hover:text-[#1a1a1a] hover:bg-[#f8f8f6]'
                  }`}
                >
                  Clients
                </button>
              </div>
            </div>

            <Link
              href="/demo"
              className="px-4 py-2 text-[#666] hover:text-[#1a1a1a] hover:bg-[#f8f8f6] rounded-lg transition-colors text-sm"
            >
              Client View Demo →
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview */}
        {view === 'overview' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-serif font-medium text-[#1a1a1a] mb-2">Admin Dashboard</h1>
              <p className="text-[#666]">Overview of all client submissions and pipeline.</p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
              <div className="bg-white rounded-xl p-5 border border-[#e5e5e5]">
                <div className="text-[#666] text-sm mb-1">Total Clients</div>
                <div className="text-3xl font-bold text-[#1a1a1a]">{stats.total}</div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#e5e5e5]">
                <div className="text-[#666] text-sm mb-1">New</div>
                <div className="text-3xl font-bold text-[#3b82f6]">{stats.submitted}</div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#e5e5e5]">
                <div className="text-[#666] text-sm mb-1">Call Scheduled</div>
                <div className="text-3xl font-bold text-[#06b6d4]">{stats.callScheduled}</div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#e5e5e5]">
                <div className="text-[#666] text-sm mb-1">Building</div>
                <div className="text-3xl font-bold text-[#8b5cf6]">{stats.building}</div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#e5e5e5]">
                <div className="text-[#666] text-sm mb-1">Complete</div>
                <div className="text-3xl font-bold text-[#22c55e]">{stats.complete}</div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#e5e5e5]">
                <div className="text-[#666] text-sm mb-1">Avg Score</div>
                <div className="text-3xl font-bold" style={{ color: getScoreColor(stats.avgScore) }}>
                  {stats.avgScore}
                </div>
              </div>
            </div>

            {/* Recent submissions */}
            <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
                <h2 className="text-lg font-serif font-medium text-[#1a1a1a]">Recent Submissions</h2>
                <button
                  onClick={() => setView('clients')}
                  className="text-emerald-800 hover:text-[#1a1a1a] text-sm font-medium"
                >
                  View All →
                </button>
              </div>
              <div className="divide-y divide-[#f0f0f0]">
                {DEMO_CLIENTS.map((client) => {
                  const status = STATUS_LABELS[client.status] || STATUS_LABELS.submitted
                  return (
                    <button
                      key={client.id}
                      onClick={() => { setSelectedClient(client); setView('detail'); }}
                      className="w-full text-left block px-6 py-4 hover:bg-[#f8f8f6] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: getScoreColor(client.overall_score) }}
                          >
                            {client.overall_score}
                          </div>
                          <div>
                            <p className="text-[#1a1a1a] font-medium">{client.company_name}</p>
                            <p className="text-[#999] text-sm">
                              {client.full_name} • {new Date(client.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                          <svg className="w-5 h-5 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* Client List */}
        {view === 'clients' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-serif font-medium text-[#1a1a1a] mb-2">All Clients</h1>
              <p className="text-[#666]">{DEMO_CLIENTS.length} total submissions</p>
            </div>

            <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[#f8f8f6] text-xs font-medium text-[#666] uppercase tracking-wider border-b border-[#e5e5e5]">
                <div className="col-span-1">Score</div>
                <div className="col-span-3">Company</div>
                <div className="col-span-2">Contact</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Revenue</div>
                <div className="col-span-2">Date</div>
              </div>

              <div className="divide-y divide-[#f0f0f0]">
                {DEMO_CLIENTS.map((client) => {
                  const status = STATUS_LABELS[client.status] || STATUS_LABELS.submitted
                  const formattedRevenue = client.annual_revenue >= 1000000
                    ? `$${(client.annual_revenue / 1000000).toFixed(1)}M`
                    : `$${(client.annual_revenue / 1000).toFixed(0)}K`

                  return (
                    <button
                      key={client.id}
                      onClick={() => { setSelectedClient(client); setView('detail'); }}
                      className="w-full text-left grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#f8f8f6] transition-colors"
                    >
                      <div className="col-span-1">
                        <span
                          className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-white font-bold text-sm"
                          style={{ backgroundColor: getScoreColor(client.overall_score) }}
                        >
                          {client.overall_score}
                        </span>
                      </div>
                      <div className="col-span-3">
                        <p className="text-[#1a1a1a] font-medium truncate">{client.company_name}</p>
                        <p className="text-[#999] text-sm truncate">{client.email}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[#666] truncate">{client.full_name}</p>
                      </div>
                      <div className="col-span-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[#666]">{formattedRevenue}</p>
                      </div>
                      <div className="col-span-2 flex items-center justify-between">
                        <p className="text-[#999] text-sm">
                          {new Date(client.created_at).toLocaleDateString()}
                        </p>
                        <svg className="w-5 h-5 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* Client Detail */}
        {view === 'detail' && selectedClient && (
          <ClientDetailView
            client={selectedClient}
            onBack={() => { setView('clients'); setSelectedClient(null); }}
          />
        )}
      </main>
    </div>
  )
}

// Client Detail View Component
function ClientDetailView({ client, onBack }: { client: typeof DEMO_CLIENTS[0]; onBack: () => void }) {
  const status = STATUS_LABELS[client.status] || STATUS_LABELS.submitted
  const callPrep = client.call_prep
  const systemSpec = client.system_spec

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 text-[#666] hover:text-[#1a1a1a] hover:bg-white rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-serif font-medium text-[#1a1a1a]">{client.company_name}</h1>
          <p className="text-[#666]">{client.full_name} • {client.email}</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${status.color}`}>
          {status.label}
        </span>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
          style={{ backgroundColor: getScoreColor(client.overall_score) }}
        >
          {client.overall_score}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dimension scores */}
          <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
            <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Dimension Breakdown</h2>
            <div className="grid grid-cols-5 gap-4">
              {[
                { key: 'leverage', label: 'Leverage' },
                { key: 'equityPotential', label: 'Equity' },
                { key: 'revenueRisk', label: 'Revenue' },
                { key: 'productReadiness', label: 'Product' },
                { key: 'implementationCapacity', label: 'Capacity' },
              ].map((dim) => (
                <div key={dim.key} className="text-center">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: getScoreColor((client.dimension_scores as any)[dim.key] || 0) }}
                  >
                    {(client.dimension_scores as any)[dim.key] || 0}
                  </div>
                  <div className="text-[#666] text-sm">{dim.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key metrics */}
          <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
            <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Key Metrics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-[#666] text-sm">Annual Revenue</div>
                <div className="text-xl font-bold text-[#1a1a1a]">
                  ${(client.annual_revenue / 1000).toFixed(0)}K
                </div>
              </div>
              <div>
                <div className="text-[#666] text-sm">Team Size</div>
                <div className="text-xl font-bold text-[#1a1a1a]">
                  {client.questionnaire_data.team_size} people
                </div>
              </div>
              <div>
                <div className="text-[#666] text-sm">Weekly Hours</div>
                <div className="text-xl font-bold text-[#1a1a1a]">
                  {client.financial_metrics.totalWeeklyHours} hrs
                </div>
              </div>
              <div>
                <div className="text-[#666] text-sm">Owner Hourly Value</div>
                <div className="text-xl font-bold text-[#1a1a1a]">
                  ${client.financial_metrics.ownerHourlyValue}/hr
                </div>
              </div>
              <div>
                <div className="text-[#666] text-sm">Exit Multiple</div>
                <div className="text-xl font-bold text-[#1a1a1a]">
                  {client.financial_metrics.currentExitMultiple}x
                </div>
              </div>
              <div>
                <div className="text-[#666] text-sm">Value Gap</div>
                <div className="text-xl font-bold text-[#ef4444]">
                  ${(client.financial_metrics.valueGap / 1000000).toFixed(1)}M
                </div>
              </div>
            </div>
          </div>

          {/* Quick Context */}
          {callPrep?.quickContext && (
            <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
              <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Quick Context</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#666]">Revenue:</span>{' '}
                  <span className="text-[#1a1a1a] font-medium">{callPrep.quickContext.revenue}</span>
                  <span className="text-[#666]"> ({callPrep.quickContext.recurringPct}% recurring)</span>
                </div>
                <div>
                  <span className="text-[#666]">Team Size:</span>{' '}
                  <span className="text-[#1a1a1a] font-medium">{callPrep.quickContext.teamSize} people</span>
                </div>
                <div>
                  <span className="text-[#666]">Owner Hours:</span>{' '}
                  <span className="text-[#1a1a1a] font-medium">{callPrep.quickContext.ownerHours}/week</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#666]">Pain Summary:</span>{' '}
                  <span className="text-[#1a1a1a]">{callPrep.quickContext.painSummary}</span>
                </div>
              </div>
            </div>
          )}

          {/* Build Hypothesis */}
          {callPrep?.buildHypothesis && callPrep.buildHypothesis.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
              <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Build Hypothesis</h2>
              <p className="text-[#666] text-sm mb-4">Based on questionnaire answers, I'm thinking we build:</p>
              <div className="space-y-3">
                {callPrep.buildHypothesis.map((item, i) => (
                  <div key={i} className="p-4 bg-[#f8f8f6] rounded-lg border border-[#e5e5e5]">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-medium text-white bg-emerald-900 px-2 py-1 rounded-full">
                        P{item.priority}
                      </span>
                      <span className="font-medium text-[#1a1a1a]">{item.system}</span>
                      {item.hoursReclaimed && (
                        <span className="text-xs text-emerald-800 ml-auto">
                          ~{item.hoursReclaimed} hrs/week saved
                        </span>
                      )}
                    </div>
                    <p className="text-[#666] text-sm">{item.why}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call Sections */}
          {callPrep?.callSections && callPrep.callSections.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
              <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Implementation Call Questions</h2>
              <p className="text-[#666] text-sm mb-6">
                These are the questions to ask during the call to validate hypotheses and extract system specs.
              </p>
              <div className="space-y-6">
                {callPrep.callSections.map((section, i) => (
                  <div key={i} className="border-l-4 border-emerald-800 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-[#1a1a1a]">
                        {i + 1}. {section.title}
                      </h3>
                      <span className="text-xs text-[#666] bg-[#f0f0f0] px-2 py-0.5 rounded">
                        {section.duration}
                      </span>
                    </div>
                    <p className="text-sm text-emerald-800 italic mb-3">Goal: {section.goal}</p>
                    <div className="space-y-2 mb-4">
                      {section.questions.map((q, qi) => (
                        <div key={qi} className="flex items-start gap-2 text-sm">
                          <span className="text-emerald-800 font-bold mt-0.5">→</span>
                          <span className="text-[#1a1a1a]">"{q}"</span>
                        </div>
                      ))}
                    </div>
                    {section.listenFor && (
                      <div className="bg-[#fffbeb] p-3 rounded-lg">
                        <p className="text-xs font-medium text-[#92400e] uppercase mb-1">Listen for:</p>
                        <ul className="text-sm text-[#78350f] space-y-1">
                          {section.listenFor.map((l, li) => (
                            <li key={li}>• {l}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Red Flags */}
          {callPrep?.redFlags && callPrep.redFlags.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
              <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Red Flags / Contradictions to Probe</h2>
              <div className="space-y-4">
                {callPrep.redFlags.map((flag, i) => (
                  <div key={i} className="p-4 bg-[#fef2f2] rounded-lg border border-[#fecaca]">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">⚠️</span>
                      <div>
                        <p className="font-medium text-[#991b1b]">{flag.observation}</p>
                        <p className="text-sm text-[#b91c1c] mt-1">Probe: {flag.probe}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show Me Requests */}
          {callPrep?.showMeRequests && callPrep.showMeRequests.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
              <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">"Show Me" Requests</h2>
              <p className="text-[#666] text-sm mb-4">If possible, have them share screen for:</p>
              <div className="space-y-3">
                {callPrep.showMeRequests.map((req, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-[#f8f8f6] rounded-lg">
                    <span className="text-lg">📋</span>
                    <div>
                      <p className="font-medium text-[#1a1a1a]">{req.item}</p>
                      <p className="text-sm text-[#666]">{req.why}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Systems to Build */}
          {systemSpec?.systems && systemSpec.systems.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif font-medium text-[#1a1a1a]">Systems to Build</h2>
                {systemSpec.summary && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-[#666]">
                      <span className="font-bold text-[#1a1a1a]">{systemSpec.summary.totalSystemsTooBuild}</span> total
                    </span>
                    <span className="text-[#ef4444]">
                      <span className="font-bold">{systemSpec.summary.p0Systems}</span> P0
                    </span>
                    <span className="text-[#f97316]">
                      <span className="font-bold">{systemSpec.summary.p1Systems}</span> P1
                    </span>
                    <span className="text-emerald-800">
                      ~<span className="font-bold">{systemSpec.summary.weeklyHoursReclaimed}</span> hrs/week saved
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {systemSpec.systems.map((system, i) => (
                  <div
                    key={i}
                    className="p-4 border rounded-lg"
                    style={{ borderLeftColor: getPriorityColor(system.priority), borderLeftWidth: '4px' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold text-white px-2 py-0.5 rounded"
                          style={{ backgroundColor: getPriorityColor(system.priority) }}
                        >
                          {system.priority}
                        </span>
                        <span className="text-xs text-[#666] bg-[#f0f0f0] px-2 py-0.5 rounded capitalize">
                          {system.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-[#666] bg-[#f0f0f0] px-2 py-0.5 rounded capitalize">
                          {system.category.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-[#666]">{system.estimatedBuildTime}</span>
                    </div>
                    <h3 className="font-medium text-[#1a1a1a] mb-1">{system.name}</h3>
                    <p className="text-sm text-[#666] mb-3">{system.description}</p>

                    {system.prd && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-emerald-800 font-medium hover:underline">
                          View PRD Details
                        </summary>
                        <div className="mt-3 pl-4 border-l-2 border-[#e5e5e5] space-y-3">
                          <div>
                            <span className="font-medium text-[#1a1a1a]">Problem:</span>
                            <p className="text-[#666]">{system.prd.problem}</p>
                          </div>
                          <div>
                            <span className="font-medium text-[#1a1a1a]">Solution:</span>
                            <p className="text-[#666]">{system.prd.solution}</p>
                          </div>
                          {system.prd.workflow && (
                            <div>
                              <span className="font-medium text-[#1a1a1a]">Workflow:</span>
                              <ol className="list-decimal list-inside text-[#666] mt-1">
                                {system.prd.workflow.map((step, si) => (
                                  <li key={si}>{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                          {system.prd.successMetrics && (
                            <div>
                              <span className="font-medium text-[#1a1a1a]">Success Metrics:</span>
                              <ul className="list-disc list-inside text-[#666] mt-1">
                                {system.prd.successMetrics.map((m, mi) => (
                                  <li key={mi}>{m}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Build Plan */}
          {systemSpec?.weekByWeekBuildPlan && systemSpec.weekByWeekBuildPlan.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
              <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Week-by-Week Build Plan</h2>
              <div className="space-y-4">
                {systemSpec.weekByWeekBuildPlan.map((week, i) => (
                  <div key={i} className="p-4 bg-[#f8f8f6] rounded-lg border border-[#e5e5e5]">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-8 bg-emerald-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {week.week}
                      </span>
                      <h3 className="font-medium text-[#1a1a1a]">{week.focus}</h3>
                    </div>
                    {week.systems && week.systems.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-[#666] uppercase font-medium mb-1">Systems:</p>
                        <div className="flex flex-wrap gap-2">
                          {week.systems.map((sys, si) => (
                            <span key={si} className="text-xs bg-white text-[#1a1a1a] px-2 py-1 rounded border border-[#e5e5e5]">
                              {sys}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {week.deliverables && week.deliverables.length > 0 && (
                      <div>
                        <p className="text-xs text-[#666] uppercase font-medium mb-1">Deliverables:</p>
                        <ul className="text-sm text-[#1a1a1a] space-y-1">
                          {week.deliverables.map((d, di) => (
                            <li key={di} className="flex items-center gap-2">
                              <span className="text-emerald-800">✓</span>
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Integration Requirements */}
          {systemSpec?.integrations && systemSpec.integrations.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
              <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Integration Requirements</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#e5e5e5]">
                      <th className="text-left py-2 text-[#666] font-medium">Tool</th>
                      <th className="text-left py-2 text-[#666] font-medium">Category</th>
                      <th className="text-left py-2 text-[#666] font-medium">Purpose</th>
                      <th className="text-center py-2 text-[#666] font-medium">Required</th>
                      <th className="text-center py-2 text-[#666] font-medium">API</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemSpec.integrations.map((int, i) => (
                      <tr key={i} className="border-b border-[#f0f0f0]">
                        <td className="py-3 font-medium text-[#1a1a1a]">{int.tool}</td>
                        <td className="py-3 text-[#666]">{int.toolCategory}</td>
                        <td className="py-3 text-[#666]">{int.purpose}</td>
                        <td className="py-3 text-center">
                          {int.required ? <span className="text-[#ef4444]">●</span> : <span className="text-[#666]">○</span>}
                        </td>
                        <td className="py-3 text-center">
                          {int.apiAvailable ? <span className="text-[#22c55e]">✓</span> : <span className="text-[#666]">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Gap Analysis */}
          {systemSpec?.gaps && systemSpec.gaps.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
              <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Gap Analysis (Follow-up Discovery Needed)</h2>
              <div className="space-y-4">
                {systemSpec.gaps.map((gap, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border ${
                      gap.priority === 'critical'
                        ? 'bg-[#fef2f2] border-[#fecaca]'
                        : gap.priority === 'important'
                        ? 'bg-[#fffbeb] border-[#fde68a]'
                        : 'bg-[#f8f8f6] border-[#e5e5e5]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded uppercase ${
                        gap.priority === 'critical'
                          ? 'bg-[#ef4444] text-white'
                          : gap.priority === 'important'
                          ? 'bg-[#f97316] text-white'
                          : 'bg-[#666] text-white'
                      }`}>
                        {gap.priority}
                      </span>
                      <span className="text-sm font-medium text-[#1a1a1a]">{gap.question}</span>
                    </div>
                    <p className="text-sm text-[#666] mb-3">{gap.reason}</p>
                    {gap.discoveryQuestions && gap.discoveryQuestions.length > 0 && (
                      <div className="pl-4 border-l-2 border-[#e5e5e5]">
                        <p className="text-xs text-[#666] uppercase font-medium mb-1">Ask on call:</p>
                        <ul className="text-sm text-[#1a1a1a] space-y-1">
                          {gap.discoveryQuestions.map((q, qi) => (
                            <li key={qi}>• {q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Automation Coverage */}
          {systemSpec?.automationCoverage && (
            <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif font-medium text-[#1a1a1a]">Automation Coverage</h2>
                <span className="text-2xl font-bold text-emerald-800">{systemSpec.automationCoverage.overall}%</span>
              </div>
              <div className="grid grid-cols-5 gap-4 mb-6">
                {[
                  { key: 'deliveryAutomation', label: 'Delivery' },
                  { key: 'salesAutomation', label: 'Sales' },
                  { key: 'clientCommsAutomation', label: 'Client Comms' },
                  { key: 'operationsAutomation', label: 'Operations' },
                  { key: 'qualityAutomation', label: 'Quality' },
                ].map((area) => (
                  <div key={area.key} className="text-center">
                    <div className="text-xl font-bold text-[#1a1a1a]">
                      {(systemSpec.automationCoverage as any)[area.key]}%
                    </div>
                    <div className="text-xs text-[#666]">{area.label}</div>
                  </div>
                ))}
              </div>
              {systemSpec.automationCoverage.breakdown && (
                <div className="space-y-3">
                  {systemSpec.automationCoverage.breakdown.map((item, i) => (
                    <div key={i} className="p-3 bg-[#f8f8f6] rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-[#1a1a1a]">{item.area}</span>
                        <span className="text-sm font-bold text-emerald-800">{item.automationPercentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-900 rounded-full" style={{ width: `${item.automationPercentage}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-[#666] mt-1">
                        <span>{item.currentState}</span>
                        <span>→ {item.targetState}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pipeline History */}
          <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
            <h3 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Pipeline History</h3>
            {client.pipeline_stages.length > 0 ? (
              <div className="space-y-3">
                {client.pipeline_stages.map((stage, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-emerald-900" />
                    <div>
                      <p className="text-[#1a1a1a] text-sm font-medium capitalize">
                        {stage.stage.replace(/_/g, ' ')}
                      </p>
                      {stage.notes && <p className="text-[#666] text-sm">{stage.notes}</p>}
                      <p className="text-[#999] text-xs">{new Date(stage.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#999] text-sm">No pipeline history yet.</p>
            )}
          </div>

          {/* Client Assets */}
          <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
            <h3 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Client Assets</h3>
            {client.assets.length > 0 ? (
              <div className="space-y-2">
                {client.assets.map((asset) => (
                  <div key={asset.id} className="flex items-center gap-3 p-3 bg-[#f8f8f6] rounded-lg border border-[#e5e5e5]">
                    <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1a1a1a] text-sm truncate">{asset.file_name}</p>
                      <p className="text-[#999] text-xs capitalize">{asset.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-[#999] text-sm">No assets uploaded yet.</p>
                <p className="text-[#666] text-xs mt-1">Client needs to upload documents</p>
              </div>
            )}
          </div>

          {/* Admin Notes */}
          <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
            <h3 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Admin Notes</h3>
            {client.notes.length > 0 ? (
              <div className="space-y-3">
                {client.notes.map((note) => (
                  <div key={note.id} className="p-3 bg-[#f8f8f6] rounded-lg border border-[#e5e5e5]">
                    <p className="text-[#1a1a1a] text-sm">{note.content}</p>
                    <p className="text-[#999] text-xs mt-1">{new Date(note.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#999] text-sm">No notes yet.</p>
            )}
          </div>

          {/* Post-Call Needs */}
          {callPrep?.postCallNeeds && (
            <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
              <h3 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">After the Call</h3>
              <p className="text-[#666] text-sm mb-3">I'll need:</p>
              <ul className="space-y-2">
                {callPrep.postCallNeeds.map((need, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <input type="checkbox" className="mt-0.5 rounded border-[#e5e5e5]" />
                    <span className="text-[#1a1a1a]">{need}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-[#f8f8f6] rounded-lg">
                <p className="text-xs text-[#666] mb-2">Once I have the transcript, I'll generate:</p>
                <ul className="text-xs text-[#1a1a1a] space-y-1">
                  <li>✓ Final system list with confirmed priorities</li>
                  <li>✓ Process maps for each workflow</li>
                  <li>✓ Decision frameworks for judgment calls</li>
                  <li>✓ Skill specifications for each automation</li>
                  <li>✓ Named proprietary mechanism + methodology doc</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
