export interface Question {
  id: string;
  question: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'slider' | 'textarea' | 'services';
  field: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  placeholder?: string;
  helpText?: string;
  // Conditional display: { field: 'other_field', notEquals: 'Yes' } or { field: 'other_field', equals: 'No' }
  showIf?: {
    field: string;
    equals?: string | string[];
    notEquals?: string | string[];
  };
}

export interface QuestionSection {
  title: string;
  description: string;
  questions: Question[];
}

export const questionSections: QuestionSection[] = [
  {
    title: "Section 1: Business Fundamentals",
    description: "Revenue model, client mix, and financial health (15 questions)",
    questions: [
      {
        id: "revenue_12mo",
        question: "What was your total revenue in the last 12 months?",
        type: "number",
        field: "revenue_12mo",
        required: true,
        placeholder: "e.g., 1200000",
        helpText: "Ballpark is fine if you don't have exact numbers"
      },
      {
        id: "revenue_monthly_avg",
        question: "What's your average monthly revenue lately?",
        type: "number",
        field: "revenue_monthly_avg",
        required: true,
        placeholder: "e.g., 100000",
        helpText: "Over the last 6 months or so"
      },
      {
        id: "pricing_models",
        question: "How do you charge clients?",
        type: "multiselect",
        field: "pricing_models",
        options: [
          "Hourly billing",
          "Fixed project fees",
          "Monthly retainers",
          "Value-based pricing",
          "Performance-based (% of results)",
          "Other"
        ],
        helpText: "Select all that apply"
      },
      {
        id: "revenue_recurring_pct",
        question: "What percentage of revenue is recurring?",
        type: "slider",
        field: "revenue_recurring_pct",
        min: 0,
        max: 100,
        helpText: "Retainers, subscriptions, ongoing contracts"
      },
      {
        id: "client_count",
        question: "How many active clients do you have?",
        type: "number",
        field: "client_count",
        required: true,
        helpText: "Currently paying or in active projects"
      },
      {
        id: "top3_concentration_pct",
        question: "What % of revenue comes from your top 3 clients?",
        type: "slider",
        field: "top3_concentration_pct",
        min: 0,
        max: 100,
        helpText: "Over 50% means high concentration risk"
      },
      {
        id: "services",
        question: "What are your top 3 services?",
        type: "services",
        field: "services",
        helpText: "Include the % of revenue each brings in and typical project value"
      },
      {
        id: "gross_margin_pct",
        question: "What's your gross profit margin (if you know it)?",
        type: "slider",
        field: "gross_margin_pct",
        min: 0,
        max: 100,
        helpText: "<30% = pricing problem, >60% = good"
      },
      {
        id: "cac",
        question: "What's your average customer acquisition cost (CAC)?",
        type: "number",
        field: "cac",
        placeholder: "Enter amount or 0 if you don't track this",
        helpText: "If you don't know = systems gap"
      },
      {
        id: "ltv",
        question: "What's your average client lifetime value (LTV)?",
        type: "number",
        field: "ltv",
        placeholder: "Enter amount or 0 if you don't track this",
        helpText: "If you don't know = systems gap. LTV:CAC ratio reveals business health"
      },
      {
        id: "acquisition_channels",
        question: "How do you acquire most of your clients? (Select top 3 in order)",
        type: "multiselect",
        field: "acquisition_channels",
        options: [
          "Referrals from past clients",
          "Inbound (website, content, SEO)",
          "Outbound (cold email, LinkedIn)",
          "Partnerships/affiliates",
          "Paid ads",
          "Events/conferences",
          "Other"
        ],
        helpText: "Referral-heavy = hard to scale. Inbound = product-ready"
      },
      {
        id: "churn_rate_pct",
        question: "What's your average annual client churn rate?",
        type: "slider",
        field: "churn_rate_pct",
        min: 0,
        max: 100,
        helpText: ">30% = delivery problem"
      },
      {
        id: "avg_client_tenure",
        question: "How long does the average client relationship last?",
        type: "select",
        field: "avg_client_tenure",
        options: [
          "Less than 3 months",
          "3-6 months",
          "6-12 months",
          "1-2 years",
          "2+ years"
        ],
        helpText: "Longer = better LTV, more productizable"
      },
      {
        id: "revenue_goal_12mo",
        question: "What's your revenue goal for the next 12 months?",
        type: "number",
        field: "revenue_goal_12mo",
        placeholder: "e.g., 2000000",
        helpText: "Shows ambition vs. realistic scaling"
      },
      {
        id: "goal_confidence",
        question: "On a scale of 1-10, how confident are you in hitting that goal?",
        type: "slider",
        field: "goal_confidence",
        min: 1,
        max: 10,
        helpText: "Low confidence = knows something's broken"
      }
    ]
  },
  {
    title: "Section 2: Time & Leverage",
    description: "Identify owner bottleneck - the core diagnostic (25 questions)",
    questions: [
      {
        id: "time_delivery_hrs",
        question: "Hours per week on client delivery?",
        type: "number",
        field: "time_delivery_hrs",
        required: true,
        min: 0,
        max: 168,
        placeholder: "e.g., 25",
        helpText: "Doing the actual work - campaigns, strategy, creative"
      },
      {
        id: "time_sales_hrs",
        question: "Hours per week on sales & BD?",
        type: "number",
        field: "time_sales_hrs",
        required: true,
        min: 0,
        max: 168,
        placeholder: "e.g., 10",
        helpText: "Sales calls, proposals, networking, outreach"
      },
      {
        id: "time_mgmt_hrs",
        question: "Hours per week on team management?",
        type: "number",
        field: "time_mgmt_hrs",
        required: true,
        min: 0,
        max: 168,
        placeholder: "e.g., 8",
        helpText: "1-on-1s, meetings, coaching, reviews"
      },
      {
        id: "time_ops_hrs",
        question: "Hours per week on operations & admin?",
        type: "number",
        field: "time_ops_hrs",
        required: true,
        min: 0,
        max: 168,
        placeholder: "e.g., 5",
        helpText: "Invoicing, emails, scheduling, admin tasks"
      },
      {
        id: "time_strategy_hrs",
        question: "Hours per week on strategy & planning?",
        type: "number",
        field: "time_strategy_hrs",
        required: true,
        min: 0,
        max: 168,
        placeholder: "e.g., 2",
        helpText: "Big picture thinking, planning, learning"
      },
      {
        id: "projects_requiring_owner_pct",
        question: "What % of projects require your involvement to succeed?",
        type: "slider",
        field: "projects_requiring_owner_pct",
        min: 0,
        max: 100,
        helpText: "Over 70% means you're the bottleneck"
      },
      {
        id: "clients_requiring_owner",
        question: "Which clients absolutely require YOU personally?",
        type: "textarea",
        field: "clients_requiring_owner",
        placeholder: "List names, or say 'All of them'...",
        helpText: "Be specific - this reveals perception vs. reality"
      },
      {
        id: "tasks_only_owner",
        question: "What tasks can only you do?",
        type: "textarea",
        field: "tasks_only_owner",
        required: true,
        placeholder: "e.g., Strategy, client calls, QA, pricing...",
        helpText: "These are our Week 3 build targets"
      },
      {
        id: "decisions_only_owner",
        question: "What decisions can only you make?",
        type: "textarea",
        field: "decisions_only_owner",
        required: true,
        placeholder: "e.g., Taking a client, pricing, scope changes...",
        helpText: "These need decision frameworks, not just SOPs"
      },
      {
        id: "vacation_breaks",
        question: "If you took 2 weeks off (no phone, no email), what breaks?",
        type: "textarea",
        field: "vacation_breaks",
        required: true,
        placeholder: "Be specific about what would fail...",
        helpText: "This reveals your critical failure points"
      },
      {
        id: "wish_could_delegate",
        question: "What ONE thing do you wish someone else could do?",
        type: "textarea",
        field: "wish_could_delegate",
        required: true,
        placeholder: "The task causing you the most pain...",
        helpText: "This becomes priority #1"
      },
      {
        id: "owner_replaceability_delivery",
        question: "How replaceable are you in delivery?",
        type: "slider",
        field: "owner_replaceability_delivery",
        min: 1,
        max: 10,
        helpText: "1 = nothing happens without me, 10 = team handles everything"
      },
      {
        id: "owner_replaceability_sales",
        question: "How replaceable are you in sales?",
        type: "slider",
        field: "owner_replaceability_sales",
        min: 1,
        max: 10,
        helpText: "1 = I close every deal, 10 = team closes without me"
      },
      {
        id: "team_can_onboard",
        question: "Can your team onboard clients without you?",
        type: "select",
        field: "team_can_onboard",
        options: ["Yes", "No", "Sometimes"],
        helpText: "Onboarding is highly systematizable"
      },
      {
        id: "onboard_blocker",
        question: "Why can't your team onboard clients without you?",
        type: "textarea",
        field: "onboard_blocker",
        placeholder: "What's the specific blocker?",
        showIf: { field: "team_can_onboard", notEquals: "Yes" }
      },
      {
        id: "team_can_deliver",
        question: "Can your team deliver a full project without you?",
        type: "select",
        field: "team_can_deliver",
        options: ["Yes", "No", "Sometimes"],
        helpText: "Reveals skill gap vs. trust gap"
      },
      {
        id: "delivery_blocker",
        question: "Why can't your team deliver projects without you?",
        type: "textarea",
        field: "delivery_blocker",
        placeholder: "What's the specific blocker?",
        showIf: { field: "team_can_deliver", notEquals: "Yes" }
      },
      {
        id: "team_can_close",
        question: "Can your team close a sale without you?",
        type: "select",
        field: "team_can_close",
        options: ["Yes", "No", "Sometimes"],
        helpText: "Sales process = systematizable"
      },
      {
        id: "sales_blocker",
        question: "Why can't your team close sales without you?",
        type: "textarea",
        field: "sales_blocker",
        placeholder: "What's the specific blocker?",
        showIf: { field: "team_can_close", notEquals: "Yes" }
      },
      {
        id: "wasted_hours_week",
        question: "How many hours per week do you spend on tasks you believe someone else SHOULD be doing?",
        type: "number",
        field: "wasted_hours_week",
        min: 0,
        max: 168,
        helpText: "Quantifies opportunity cost. 20 hours = $10K+/mo in founder time"
      },
      {
        id: "reclaimed_time_use",
        question: "If you could get back those hours, what would you do with them? (Select all that apply)",
        type: "multiselect",
        field: "reclaimed_time_use",
        options: [
          "More sales/business development",
          "Product development",
          "Strategic planning",
          "Team development",
          "Personal time/rest",
          "Other"
        ],
        helpText: "'Strategic planning' = product-ready mindset"
      },
      {
        id: "delivery_bottleneck",
        question: "What's the biggest bottleneck in your delivery process right now?",
        type: "textarea",
        field: "delivery_bottleneck",
        placeholder: "Be specific...",
        helpText: "Specific insight for Week 2 architecture"
      },
      {
        id: "sales_bottleneck",
        question: "What's the biggest bottleneck in your sales process right now?",
        type: "textarea",
        field: "sales_bottleneck",
        placeholder: "Be specific...",
        helpText: "Separate constraint to address"
      },
      {
        id: "approval_frequency",
        question: "How often do team members need your input/approval to move forward?",
        type: "select",
        field: "approval_frequency",
        options: [
          "Multiple times per day",
          "Daily",
          "Few times per week",
          "Weekly",
          "Rarely"
        ],
        helpText: "High frequency = trust gap or clarity gap (both fixable with systems)"
      },
      // Service Workflow Mapping
      {
        id: "project_trigger",
        question: "What triggers a new project to start? (Select all that apply)",
        type: "multiselect",
        field: "project_trigger",
        options: [
          "Signed contract/proposal",
          "Payment received",
          "Kickoff call scheduled",
          "Client sends brief/requirements",
          "I manually create it",
          "Other"
        ],
        helpText: "Understanding triggers helps automate project creation"
      },
      {
        id: "core_service_steps",
        question: "For your CORE service, list the main steps from start to finish:",
        type: "textarea",
        field: "core_service_steps",
        required: true,
        placeholder: "e.g., 1. Discovery call, 2. Strategy doc, 3. Client approval, 4. Execution, 5. Review, 6. Delivery...",
        helpText: "Be specific - this is the workflow we'll systematize"
      },
      {
        id: "handoff_points",
        question: "Where are the handoff points between you and your team?",
        type: "textarea",
        field: "handoff_points",
        placeholder: "e.g., I do strategy, hand to designer, they hand back for review...",
        helpText: "Handoff points are where things often break"
      },
      {
        id: "approval_gates",
        question: "What approvals/sign-offs happen during a typical project?",
        type: "textarea",
        field: "approval_gates",
        placeholder: "e.g., Strategy approval, design approval, final approval, client approval...",
        helpText: "Each approval gate is a potential bottleneck to streamline"
      },
      {
        id: "typical_project_duration",
        question: "How long does your typical project take from start to delivery?",
        type: "select",
        field: "typical_project_duration",
        options: [
          "Less than 1 week",
          "1-2 weeks",
          "2-4 weeks",
          "1-2 months",
          "2-3 months",
          "3+ months",
          "Ongoing retainer (no end date)"
        ],
        helpText: "Project duration affects automation approach"
      },
      {
        id: "concurrent_projects",
        question: "How many projects do you typically have running simultaneously?",
        type: "number",
        field: "concurrent_projects",
        placeholder: "e.g., 8",
        helpText: "Helps estimate capacity and automation needs"
      },
      {
        id: "new_clients_per_month",
        question: "How many new clients do you onboard per month (on average)?",
        type: "number",
        field: "new_clients_per_month",
        placeholder: "e.g., 3",
        helpText: "Frequency helps prioritize onboarding automation"
      }
    ]
  },
  {
    title: "Section 3: Systems & Documentation",
    description: "Process documentation and systematization readiness (30 questions)",
    questions: [
      {
        id: "has_sops",
        question: "Do you have written Standard Operating Procedures (SOPs)?",
        type: "select",
        field: "has_sops",
        options: ["Yes", "Some", "No"],
        helpText: "Existing SOPs = foundation to build on"
      },
      {
        id: "sop_list",
        question: "For which processes do you have SOPs?",
        type: "textarea",
        field: "sop_list",
        placeholder: "List the processes you've documented...",
        showIf: { field: "has_sops", notEquals: "No" }
      },
      {
        id: "documented_pct",
        question: "What percentage of your core processes are documented?",
        type: "slider",
        field: "documented_pct",
        min: 0,
        max: 100,
        helpText: "CRITICAL for Equity Potential score. <30% = red flag"
      },
      {
        id: "has_deliverable_templates",
        question: "Do you have templates for client deliverables?",
        type: "select",
        field: "has_deliverable_templates",
        options: ["Yes", "Some", "No"]
      },
      {
        id: "template_types",
        question: "Which deliverables have templates? (Select all that apply)",
        type: "multiselect",
        field: "template_types",
        options: [
          "Proposals/quotes",
          "Contracts",
          "Onboarding docs",
          "Project briefs",
          "Strategy decks",
          "Reports/dashboards",
          "Creative briefs",
          "Other"
        ],
        helpText: "Templates = productization readiness. More templates = higher Equity score",
        showIf: { field: "has_deliverable_templates", notEquals: "No" }
      },
      {
        id: "delivery_consistency",
        question: "On a scale of 1-10, how consistent is delivery quality across different clients?",
        type: "slider",
        field: "delivery_consistency",
        min: 1,
        max: 10,
        helpText: "1 = Every project is totally custom, wildly different quality | 10 = Every project follows same process, predictable quality"
      },
      {
        id: "reinvent_frequency",
        question: "How often do you 'reinvent the wheel' on projects?",
        type: "select",
        field: "reinvent_frequency",
        options: [
          "Every single project",
          "Most projects",
          "About half the time",
          "Rarely",
          "Never - we have systems"
        ],
        helpText: "'Every project' = huge waste. Easy fix with templates/skills"
      },
      {
        id: "tools_crm",
        question: "What CRM do you use?",
        type: "text",
        field: "tools_crm",
        placeholder: "e.g., HubSpot, Pipedrive, None"
      },
      {
        id: "tools_pm",
        question: "What project management tool do you use?",
        type: "text",
        field: "tools_pm",
        placeholder: "e.g., Asana, ClickUp, Monday, None"
      },
      {
        id: "tools_comm",
        question: "What communication tool(s) do you use?",
        type: "text",
        field: "tools_comm",
        placeholder: "e.g., Slack, Teams, Email"
      },
      {
        id: "tools_storage",
        question: "What file storage do you use?",
        type: "text",
        field: "tools_storage",
        placeholder: "e.g., Google Drive, Dropbox, OneDrive"
      },
      {
        id: "tools_accounting",
        question: "What invoicing/accounting tool do you use?",
        type: "text",
        field: "tools_accounting",
        placeholder: "e.g., QuickBooks, Xero, FreshBooks"
      },
      {
        id: "onboarding_documented",
        question: "Is your client onboarding process documented?",
        type: "select",
        field: "onboarding_documented",
        options: ["Yes", "Partially", "No"]
      },
      {
        id: "onboarding_consistency",
        question: "If documented: Is it followed consistently?",
        type: "select",
        field: "onboarding_consistency",
        options: ["Always", "Usually", "Sometimes", "Rarely", "N/A"],
        helpText: "Documented but not followed = adoption problem, not content problem"
      },
      {
        id: "has_kickoff_checklist",
        question: "Do you have a project kickoff checklist?",
        type: "select",
        field: "has_kickoff_checklist",
        options: ["Yes", "No"],
        helpText: "Checklists = easy to build, high impact. If No → build this in Week 3 (quick win)"
      },
      {
        id: "has_qc_checklist",
        question: "Do you have a quality control checklist before delivering work?",
        type: "select",
        field: "has_qc_checklist",
        options: ["Yes", "No"],
        helpText: "QC checklist = delegate quality assurance"
      },
      {
        id: "comm_templates",
        question: "Do you have client communication templates? (Select all that apply)",
        type: "multiselect",
        field: "comm_templates",
        options: [
          "Welcome email",
          "Status updates",
          "Revision requests",
          "Project completion",
          "Renewal/upsell",
          "Offboarding",
          "None of the above"
        ],
        helpText: "Email templates = easy to build, immediate time savings"
      },
      {
        id: "onboard_time_new_hire",
        question: "If you hired someone new tomorrow, how long until they're productive?",
        type: "select",
        field: "onboard_time_new_hire",
        options: [
          "1-2 weeks",
          "3-4 weeks",
          "2-3 months",
          "6+ months",
          "They'd never be fully productive (too custom)"
        ],
        helpText: ">2 months = documentation problem"
      },
      {
        id: "top_systematize_need",
        question: "What's the #1 process you wish was systematized/documented?",
        type: "textarea",
        field: "top_systematize_need",
        required: true,
        placeholder: "The one process that would change everything...",
        helpText: "Direct input for Week 3 priorities"
      },
      {
        id: "has_brand_guidelines",
        question: "Do you have brand guidelines documented?",
        type: "select",
        field: "has_brand_guidelines",
        options: ["Yes", "No"],
        helpText: "Brand guidelines = systematization maturity"
      },
      {
        id: "has_proposal_template",
        question: "Do you have proposal/quote templates?",
        type: "select",
        field: "has_proposal_template",
        options: ["Yes", "No"]
      },
      {
        id: "proposal_customization",
        question: "Do you customize proposals significantly each time?",
        type: "select",
        field: "proposal_customization",
        options: ["Yes", "No"],
        helpText: "Template exists but heavily customized = still manual work",
        showIf: { field: "has_proposal_template", equals: "Yes" }
      },
      {
        id: "has_contract_template",
        question: "Do you have contract templates?",
        type: "select",
        field: "has_contract_template",
        options: ["Yes", "No"],
        helpText: "Legal templates = baseline systematization"
      },
      {
        id: "knowledge_documented_pct",
        question: "What's documented vs. 'in your head'? (Estimate %)",
        type: "slider",
        field: "knowledge_documented_pct",
        min: 0,
        max: 100,
        helpText: "0% = Everything is in my head | 100% = Everything is documented. <50% = major equity risk"
      },
      {
        id: "has_rca_process",
        question: "When something goes wrong on a project, do you have a process for root cause analysis?",
        type: "select",
        field: "has_rca_process",
        options: ["Yes", "No"],
        helpText: "Systems thinking maturity. If No → reactionary culture"
      },
      {
        id: "track_profitability",
        question: "Do you track project profitability (actual hours vs. budget)?",
        type: "select",
        field: "track_profitability",
        options: ["Always", "Sometimes", "Never"],
        helpText: "If Never → flying blind on margins"
      },
      {
        id: "highest_impact_doc",
        question: "What's the ONE process that, if documented, would save you the most time?",
        type: "textarea",
        field: "highest_impact_doc",
        required: true,
        placeholder: "Be specific about the process...",
        helpText: "Week 3 Priority #1 candidate"
      },
      {
        id: "systematization_score",
        question: "On a scale of 1-10, how systematized is your agency overall?",
        type: "slider",
        field: "systematization_score",
        min: 1,
        max: 10,
        helpText: "1 = Total chaos, winging it every day | 10 = McDonald's-level systems, anyone could run this"
      },
      {
        id: "failed_systematization",
        question: "What have you tried to systematize before that didn't stick?",
        type: "textarea",
        field: "failed_systematization",
        placeholder: "e.g., Built SOPs no one uses, tried a PM tool that failed...",
        helpText: "Learn from past failures"
      },
      {
        id: "failed_systematization_reason",
        question: "Why didn't it stick?",
        type: "textarea",
        field: "failed_systematization_reason",
        placeholder: "What was the real barrier?",
        helpText: "Usually: too complex, not maintained, or lack of team buy-in"
      },
      // Existing Assets Inventory
      {
        id: "existing_sop_location",
        question: "Where do your existing SOPs/docs live?",
        type: "multiselect",
        field: "existing_sop_location",
        options: [
          "Google Docs/Drive",
          "Notion",
          "Confluence",
          "Project management tool (Asana, ClickUp, etc.)",
          "Loom videos",
          "Word docs/local files",
          "Email threads",
          "They're in my head",
          "We don't have any"
        ],
        helpText: "Knowing where docs live helps us consolidate and build on existing work"
      },
      {
        id: "existing_training_materials",
        question: "Do you have any training materials (videos, guides, walkthroughs)?",
        type: "select",
        field: "existing_training_materials",
        options: ["Yes, comprehensive", "Yes, some basics", "A few Loom videos", "No"],
        helpText: "Existing training = foundation for team enablement"
      },
      {
        id: "existing_client_assets",
        question: "What client-facing assets do you already have? (Select all that apply)",
        type: "multiselect",
        field: "existing_client_assets",
        options: [
          "Onboarding deck/presentation",
          "Welcome packet/guide",
          "Client portal",
          "Reporting templates",
          "Status update templates",
          "FAQ document",
          "Case studies",
          "Process walkthrough videos",
          "None of these"
        ],
        helpText: "Existing client assets we can systematize and automate"
      },
      {
        id: "existing_automations",
        question: "What automations do you already have running? (Select all that apply)",
        type: "multiselect",
        field: "existing_automations",
        options: [
          "Zapier/Make workflows",
          "CRM automations",
          "Email sequences",
          "Slack notifications",
          "Calendar scheduling",
          "Invoice automation",
          "Project creation triggers",
          "None yet"
        ],
        helpText: "Understanding existing automation = build on vs. rebuild"
      },
      {
        id: "tools_automation",
        question: "What automation tool(s) do you use?",
        type: "text",
        field: "tools_automation",
        placeholder: "e.g., Zapier, Make, n8n, none",
        helpText: "Integration requirement for new automations"
      },
      // Communication Cadence
      {
        id: "client_update_frequency",
        question: "How often do you send client status updates?",
        type: "select",
        field: "client_update_frequency",
        options: [
          "Daily",
          "2-3x per week",
          "Weekly",
          "Bi-weekly",
          "Monthly",
          "Only when milestones hit",
          "No regular cadence"
        ],
        helpText: "Regular updates = templatable and automatable"
      },
      {
        id: "client_meeting_frequency",
        question: "How often do you have client meetings/calls?",
        type: "select",
        field: "client_meeting_frequency",
        options: [
          "Multiple times per week",
          "Weekly",
          "Bi-weekly",
          "Monthly",
          "Only for kickoff/milestones",
          "As needed (no set schedule)"
        ],
        helpText: "Meeting frequency affects owner time reclaimed"
      },
      {
        id: "who_handles_client_comms",
        question: "Who typically handles day-to-day client communication?",
        type: "select",
        field: "who_handles_client_comms",
        options: [
          "Me (the owner) - all of it",
          "Me for strategic, team for tactical",
          "Account manager/project manager",
          "Team members directly",
          "Mixed - depends on the client"
        ],
        helpText: "Owner handling comms = delegation opportunity"
      },
      {
        id: "client_comm_channels",
        question: "What channels do clients use to communicate with you? (Select all that apply)",
        type: "multiselect",
        field: "client_comm_channels",
        options: [
          "Email",
          "Slack/Discord",
          "Project management tool comments",
          "Text/SMS",
          "Phone calls",
          "Video calls",
          "Client portal",
          "Other"
        ],
        helpText: "Multi-channel = harder to systematize. Consolidation opportunity."
      },
      // Revision/Feedback Loops
      {
        id: "avg_revision_rounds",
        question: "How many revision rounds does a typical project go through?",
        type: "select",
        field: "avg_revision_rounds",
        options: [
          "0-1 (we nail it first time)",
          "2-3 rounds",
          "4-5 rounds",
          "6+ rounds",
          "Unlimited until they're happy"
        ],
        helpText: "High revision count = briefing or QC problem"
      },
      {
        id: "revision_scope_issues",
        question: "How often do revision requests turn into scope creep?",
        type: "select",
        field: "revision_scope_issues",
        options: [
          "Rarely - we have clear boundaries",
          "Sometimes - we push back",
          "Often - we usually just do it",
          "Almost always - it's a constant battle"
        ],
        helpText: "Scope creep = decision framework opportunity"
      },
      {
        id: "client_feedback_method",
        question: "How do clients provide feedback on deliverables?",
        type: "multiselect",
        field: "client_feedback_method",
        options: [
          "Email with written feedback",
          "Comments in Google Docs/Figma/etc.",
          "Recorded Loom/video",
          "Live call walkthrough",
          "PM tool comments",
          "Text/Slack messages",
          "Annotated PDFs/screenshots"
        ],
        helpText: "Feedback method affects revision efficiency"
      },
      {
        id: "revision_approval_process",
        question: "Who approves that revisions are complete and ready to deliver?",
        type: "select",
        field: "revision_approval_process",
        options: [
          "Me (the owner) - always",
          "Senior team member",
          "Project manager",
          "The person who did the work",
          "No formal approval - we just send it"
        ],
        helpText: "Owner approval = bottleneck to systematize"
      }
    ]
  },
  {
    title: "Section 4: Team & Capabilities",
    description: "Team structure, skills, and autonomy readiness (20 questions)",
    questions: [
      {
        id: "team_size_total",
        question: "Total team size (including you)?",
        type: "number",
        field: "team_size_total",
        required: true,
        min: 1
      },
      {
        id: "team_ft",
        question: "How many are full-time employees?",
        type: "number",
        field: "team_ft",
        min: 0
      },
      {
        id: "team_pt",
        question: "How many are part-time employees?",
        type: "number",
        field: "team_pt",
        min: 0,
        helpText: "Contractor-heavy = harder to systematize"
      },
      {
        id: "team_contractors",
        question: "How many are contractors/freelancers?",
        type: "number",
        field: "team_contractors",
        min: 0
      },
      {
        id: "team_delivery",
        question: "How many team members work on delivery/execution?",
        type: "number",
        field: "team_delivery",
        min: 0
      },
      {
        id: "team_sales",
        question: "How many team members work on sales/BD?",
        type: "number",
        field: "team_sales",
        min: 0
      },
      {
        id: "team_admin",
        question: "How many team members work on admin/operations?",
        type: "number",
        field: "team_admin",
        min: 0
      },
      {
        id: "best_team_member",
        question: "Who's your best team member and why?",
        type: "textarea",
        field: "best_team_member",
        placeholder: "Describe what makes them great...",
        helpText: "Reveals what 'good' looks like. This person = template for hiring/training"
      },
      {
        id: "weakest_team_member",
        question: "Who's your weakest team member and why?",
        type: "textarea",
        field: "weakest_team_member",
        placeholder: "Be honest - this is confidential...",
        helpText: "Coaching opportunity or hiring mistake?"
      },
      {
        id: "hiring_next",
        question: "What roles are you hiring for next? (List)",
        type: "textarea",
        field: "hiring_next",
        placeholder: "e.g., Senior designer, Account manager...",
        helpText: "Hiring reveals capacity gaps"
      },
      {
        id: "missing_skills",
        question: "What skills are currently missing on your team?",
        type: "textarea",
        field: "missing_skills",
        placeholder: "List the skill gaps...",
        helpText: "Skill gaps vs. process gaps"
      },
      {
        id: "team_can_scale",
        question: "Can your team scale delivery without adding more people?",
        type: "select",
        field: "team_can_scale",
        options: ["Yes", "Maybe", "No"]
      },
      {
        id: "scale_blocker",
        question: "What's preventing your team from scaling?",
        type: "textarea",
        field: "scale_blocker",
        placeholder: "What's the specific blocker?",
        helpText: "Process problem or capacity problem?",
        showIf: { field: "team_can_scale", notEquals: "Yes" }
      },
      {
        id: "team_autonomy",
        question: "Do team members have ownership/autonomy over their work?",
        type: "select",
        field: "team_autonomy",
        options: ["Yes", "Somewhat", "No"],
        helpText: "Autonomy = systems + trust"
      },
      {
        id: "wish_team_could_decide",
        question: "What decisions do you wish your team could make without you?",
        type: "textarea",
        field: "wish_team_could_decide",
        required: true,
        placeholder: "List specific decisions...",
        helpText: "→ Build decision frameworks for these. Decision frameworks = high-value skills"
      },
      {
        id: "team_capability_score",
        question: "On a scale of 1-10, how capable is your team?",
        type: "slider",
        field: "team_capability_score",
        min: 1,
        max: 10,
        helpText: "1 = I have to redo most of their work | 10 = They consistently exceed my standards"
      },
      {
        id: "team_utilization_score",
        question: "On a scale of 1-10, how utilized is your team?",
        type: "slider",
        field: "team_utilization_score",
        min: 1,
        max: 10,
        helpText: "1 = Constantly slammed, everyone's overwhelmed | 10 = We have lots of capacity. <4 = can't take on new work"
      },
      {
        id: "has_role_descriptions",
        question: "Do you have documented role descriptions for each team member?",
        type: "select",
        field: "has_role_descriptions",
        options: ["Yes", "No"],
        helpText: "Role clarity = foundation for autonomy"
      },
      {
        id: "has_training_program",
        question: "Do you have a training program for new team members?",
        type: "select",
        field: "has_training_program",
        options: ["Yes", "Informal", "No"],
        helpText: "Training = systematization maturity"
      },
      {
        id: "training_method",
        question: "How do you currently train new team members?",
        type: "select",
        field: "training_method",
        options: [
          "Formal onboarding program",
          "Shadow experienced team members",
          "Here's the docs, figure it out",
          "I personally train everyone",
          "We don't really have a process"
        ],
        helpText: "'I personally train' = bottleneck"
      },
      // Team Member Details for Handoff
      {
        id: "has_account_manager",
        question: "Do you have a dedicated account manager or project manager?",
        type: "select",
        field: "has_account_manager",
        options: ["Yes, dedicated AM/PM", "Yes, but they also do other work", "No - I manage all clients"],
        helpText: "AM/PM = key handoff point for owner removal"
      },
      {
        id: "team_member_who_could_lead",
        question: "Is there a team member who could take over client-facing work if given the right systems?",
        type: "select",
        field: "team_member_who_could_lead",
        options: ["Yes, I have someone ready", "Maybe, with training", "No, need to hire", "I haven't thought about it"],
        helpText: "Succession planning for owner removal"
      },
      {
        id: "team_trust_level",
        question: "How much do you trust your team to handle client issues without you?",
        type: "slider",
        field: "team_trust_level",
        min: 1,
        max: 10,
        helpText: "1 = I'd never let them talk to clients alone | 10 = I trust them completely with any situation"
      },
      {
        id: "team_quality_gap",
        question: "When your team delivers work, how often do you need to redo or significantly revise it?",
        type: "select",
        field: "team_quality_gap",
        options: [
          "Almost never - they nail it",
          "Occasionally - minor tweaks",
          "Sometimes - moderate revisions",
          "Often - significant rework",
          "Almost always - I basically redo it"
        ],
        helpText: "Quality gap = training opportunity or hiring issue"
      },
      {
        id: "delegation_blockers",
        question: "What stops you from delegating more? (Select all that apply)",
        type: "multiselect",
        field: "delegation_blockers",
        options: [
          "They don't have the skills yet",
          "I can do it faster myself",
          "Clients expect to work with me",
          "No clear process to follow",
          "Trust issues with quality",
          "They're already at capacity",
          "I actually enjoy doing the work"
        ],
        helpText: "Each blocker = specific intervention in the sprint"
      }
    ]
  },
  {
    title: "Section 5: Product & Market Position",
    description: "Positioning, differentiation, and productization readiness (25 questions)",
    questions: [
      {
        id: "agency_description",
        question: "How do you describe what your agency does? (In one sentence)",
        type: "textarea",
        field: "agency_description",
        required: true,
        placeholder: "e.g., We build conversion-focused websites for DTC brands",
        helpText: "Clarity test. Rambling = positioning problem"
      },
      {
        id: "differentiation",
        question: "What makes you different from competitors?",
        type: "textarea",
        field: "differentiation",
        required: true,
        placeholder: "What's your unique approach or advantage?",
        helpText: "Unique mechanism reveals productization angle"
      },
      {
        id: "unique_strength",
        question: "What do you do better than anyone else?",
        type: "textarea",
        field: "unique_strength",
        placeholder: "Your superpower...",
        helpText: "Strength = product core"
      },
      {
        id: "has_proprietary_method",
        question: "Do you have a proprietary framework, methodology, or approach?",
        type: "select",
        field: "has_proprietary_method",
        options: ["Yes", "Sort of", "No"],
        helpText: "HUGE for Product Readiness. Named methodology = IP = productizable"
      },
      {
        id: "proprietary_method_description",
        question: "What is your methodology called and how does it work?",
        type: "textarea",
        field: "proprietary_method_description",
        placeholder: "e.g., The SaaS Growth Framework - 4-stage methodology for...",
        helpText: "If you have this, it becomes the center of your agent skills",
        showIf: { field: "has_proprietary_method", notEquals: "No" }
      },
      {
        id: "client_praise",
        question: "What do clients rave about most?",
        type: "textarea",
        field: "client_praise",
        placeholder: "What do they consistently love?",
        helpText: "This is what to productize"
      },
      {
        id: "client_complaints",
        question: "What do clients complain about most?",
        type: "textarea",
        field: "client_complaints",
        placeholder: "Be honest...",
        helpText: "Complaints reveal delivery gaps (fixable with systems)"
      },
      {
        id: "most_repeatable_service",
        question: "What's the most repeatable service you offer?",
        type: "textarea",
        field: "most_repeatable_service",
        placeholder: "Which service follows the same process every time?",
        helpText: "Repeatability = productization candidate #1"
      },
      {
        id: "highest_margin_service",
        question: "Which service has the highest profit margins?",
        type: "textarea",
        field: "highest_margin_service",
        placeholder: "Which makes you the most money per hour?",
        helpText: "High margin + repeatable = perfect product"
      },
      {
        id: "most_scalable_service",
        question: "Which service is most scalable (least dependent on custom work)?",
        type: "textarea",
        field: "most_scalable_service",
        placeholder: "Which could you scale without adding people?",
        helpText: "Scalability = product potential"
      },
      {
        id: "core_service",
        question: "If you could only offer ONE service, which would it be?",
        type: "textarea",
        field: "core_service",
        required: true,
        placeholder: "The one service you'd build the business around...",
        helpText: "Forces prioritization. This is the product."
      },
      {
        id: "tried_productization",
        question: "Have you tried to productize or package your services before?",
        type: "select",
        field: "tried_productization",
        options: ["Yes", "No", "Thinking about it"]
      },
      {
        id: "productization_attempt",
        question: "What productization did you try?",
        type: "textarea",
        field: "productization_attempt",
        placeholder: "Describe the attempt...",
        helpText: "Learn from past attempts",
        showIf: { field: "tried_productization", equals: "Yes" }
      },
      {
        id: "productization_outcome",
        question: "What happened with that productization attempt?",
        type: "textarea",
        field: "productization_outcome",
        placeholder: "What was the result?",
        showIf: { field: "tried_productization", equals: "Yes" }
      },
      {
        id: "has_audience",
        question: "Do you have an audience? (Email list, social following, etc.)",
        type: "select",
        field: "has_audience",
        options: ["Yes", "Small audience", "No"]
      },
      {
        id: "audience_size",
        question: "How big is your audience and where?",
        type: "text",
        field: "audience_size",
        placeholder: "e.g., 5K email list, 10K LinkedIn followers",
        helpText: "Audience = distribution for product launch",
        showIf: { field: "has_audience", notEquals: "No" }
      },
      {
        id: "creates_content",
        question: "Do you create content regularly? (Blog, podcast, social, etc.)",
        type: "select",
        field: "creates_content",
        options: ["Yes, consistently", "Occasionally", "No", "Want to start"]
      },
      {
        id: "content_type_frequency",
        question: "What type of content and how often?",
        type: "text",
        field: "content_type_frequency",
        placeholder: "e.g., LinkedIn 3x/week, blog monthly",
        helpText: "Content = thought leadership = product positioning",
        showIf: { field: "creates_content", equals: ["Yes, consistently", "Occasionally"] }
      },
      {
        id: "discovery_channels",
        question: "How do people currently discover your agency? (Select top 3)",
        type: "multiselect",
        field: "discovery_channels",
        options: [
          "Referrals",
          "Your content (blog, social, podcast)",
          "Google search",
          "Outbound outreach",
          "Paid ads",
          "Partnerships",
          "Events/speaking"
        ],
        helpText: "Referral-only = hard to scale product. Content/inbound = product-ready"
      },
      {
        id: "ideal_client_description",
        question: "Who is your ideal client? (Describe in detail)",
        type: "textarea",
        field: "ideal_client_description",
        required: true,
        placeholder: "Be specific about industry, size, challenges, etc.",
        helpText: "ICP clarity = productization readiness"
      },
      {
        id: "core_problem_solved",
        question: "What specific problem do you solve better than anyone?",
        type: "textarea",
        field: "core_problem_solved",
        required: true,
        placeholder: "The ONE problem you're best at solving...",
        helpText: "Problem clarity = product positioning"
      },
      {
        id: "product_buyer",
        question: "If you launched a productized offering tomorrow, who would buy it?",
        type: "textarea",
        field: "product_buyer",
        placeholder: "Describe the buyers...",
        helpText: "Market validation thinking"
      },
      {
        id: "product_blockers",
        question: "What's stopping you from launching a product right now? (Select all that apply)",
        type: "multiselect",
        field: "product_blockers",
        options: [
          "Don't know what to build",
          "Don't trust my product instincts",
          "No time to build it",
          "Internal systems are too chaotic first",
          "Don't know how to validate it",
          "Worried it won't sell",
          "Team can't handle more work",
          "Other"
        ],
        helpText: "Each blocker = something we address in the sprint"
      },
      {
        id: "positioning_clarity",
        question: "On a scale of 1-10, how clear is your market positioning?",
        type: "slider",
        field: "positioning_clarity",
        min: 1,
        max: 10,
        helpText: "1 = We're a generalist agency, we do everything | 10 = We have a laser-focused niche and everyone knows what we do"
      },
      {
        id: "dream_product",
        question: "What would your dream 'productized' offering look like?",
        type: "textarea",
        field: "dream_product",
        required: true,
        placeholder: "Describe your ideal productized offering...",
        helpText: "Reveals vision. We'll validate this in Week 4"
      },
      // Client Types/Tiers
      {
        id: "has_client_tiers",
        question: "Do you have different tiers or packages of service?",
        type: "select",
        field: "has_client_tiers",
        options: ["Yes, clearly defined tiers", "Sort of - informal differences", "No - everything is custom"],
        helpText: "Tiered services = easier to systematize and productize"
      },
      {
        id: "client_tier_description",
        question: "Describe your service tiers (names, what's included, price ranges)",
        type: "textarea",
        field: "client_tier_description",
        placeholder: "e.g., Starter: $2K/mo - basic support | Growth: $5K/mo - full service | Enterprise: $10K+ - custom",
        helpText: "Understanding tiers helps build tier-specific automations",
        showIf: { field: "has_client_tiers", notEquals: "No - everything is custom" }
      },
      {
        id: "high_touch_vs_scalable",
        question: "What percentage of your clients require high-touch, custom work vs. repeatable delivery?",
        type: "slider",
        field: "high_touch_vs_scalable",
        min: 0,
        max: 100,
        helpText: "0% = All clients are custom | 100% = All clients get same deliverables. Higher % = more productizable"
      },
      {
        id: "client_industry_concentration",
        question: "Do your clients cluster in specific industries? (Select all that apply)",
        type: "multiselect",
        field: "client_industry_concentration",
        options: [
          "SaaS/Tech",
          "E-commerce/DTC",
          "Professional services",
          "Healthcare",
          "Real estate",
          "Finance/Fintech",
          "Education",
          "Non-profit",
          "Local/small business",
          "Other",
          "No - very diverse"
        ],
        helpText: "Industry concentration = niche expertise = productization opportunity"
      },
      {
        id: "ideal_client_revenue_size",
        question: "What's the typical revenue size of your ideal client?",
        type: "select",
        field: "ideal_client_revenue_size",
        options: [
          "Pre-revenue/startup",
          "$100K - $1M",
          "$1M - $5M",
          "$5M - $20M",
          "$20M - $100M",
          "$100M+",
          "We serve all sizes"
        ],
        helpText: "Client size affects service complexity and automation approach"
      },
      // External Infrastructure Readiness
      {
        id: "interest_in_external_infra",
        question: "Are you interested in eventually embedding tools/systems into your clients' businesses (beyond your agency work)?",
        type: "select",
        field: "interest_in_external_infra",
        options: [
          "Yes, very interested",
          "Curious but not sure how",
          "Maybe in the future",
          "No, just want to improve internal operations"
        ],
        helpText: "External infrastructure = the next evolution after internal systematization"
      },
      {
        id: "client_tool_pain_points",
        question: "What tools or systems do your clients struggle with that you could solve?",
        type: "textarea",
        field: "client_tool_pain_points",
        placeholder: "e.g., They all have messy CRMs, no reporting dashboards, broken workflows...",
        helpText: "Client pain points = external infrastructure opportunities"
      },
      {
        id: "repeatable_client_setup",
        question: "Do you find yourself setting up the same systems for multiple clients?",
        type: "select",
        field: "repeatable_client_setup",
        options: [
          "Yes, all the time",
          "Sometimes",
          "Rarely",
          "No - each client is totally unique"
        ],
        helpText: "Repeatable setups = productizable infrastructure"
      }
    ]
  },
  {
    title: "Section 6: Vision & Goals",
    description: "Your vision and what success looks like (12 questions)",
    questions: [
      {
        id: "vision_12mo",
        question: "Where do you want your agency to be in 12 months?",
        type: "textarea",
        field: "vision_12mo",
        required: true,
        placeholder: "Be specific about revenue, team, time, systems...",
        helpText: "Short-term vision"
      },
      {
        id: "vision_3yr",
        question: "Where do you want your agency to be in 3 years?",
        type: "textarea",
        field: "vision_3yr",
        placeholder: "Long-term vision...",
        helpText: "Think big"
      },
      {
        id: "wants_exit",
        question: "Do you want to sell your agency eventually?",
        type: "select",
        field: "wants_exit",
        options: ["Yes", "Maybe", "No", "Haven't thought about it"],
        helpText: "Exit intent = equity matters more"
      },
      {
        id: "personal_success_definition",
        question: "What does 'success' look like for you personally?",
        type: "textarea",
        field: "personal_success_definition",
        placeholder: "Money, freedom, impact, legacy?",
        helpText: "Money vs. freedom vs. impact"
      },
      {
        id: "ideal_long_term_role",
        question: "What role do you want to play in the business long-term?",
        type: "select",
        field: "ideal_long_term_role",
        options: [
          "Still in delivery (love the work)",
          "Pure sales/BD",
          "Strategic visionary (not operations)",
          "Passive owner (business runs without me)",
          "Sell and exit completely",
          "Not sure yet"
        ],
        helpText: "Role clarity = roadmap fit"
      },
      {
        id: "sprint_excitement",
        question: "What are you most excited about building in this sprint?",
        type: "textarea",
        field: "sprint_excitement",
        placeholder: "What outcome would make this worth it?",
        helpText: "Motivation assessment"
      },
      {
        id: "sprint_anxiety",
        question: "What are you most nervous about in this sprint?",
        type: "textarea",
        field: "sprint_anxiety",
        placeholder: "Be honest...",
        helpText: "Objection surfacing"
      },
      {
        id: "magic_wand_fix",
        question: "If you could wave a magic wand and fix ONE thing about your agency, what would it be?",
        type: "textarea",
        field: "magic_wand_fix",
        required: true,
        placeholder: "The one thing that would change everything...",
        helpText: "Highest pain point. Priority #1"
      },
      {
        id: "delivery_exit_fear",
        question: "What's your biggest fear about stepping back from delivery?",
        type: "textarea",
        field: "delivery_exit_fear",
        placeholder: "What worries you most?",
        helpText: "Objection to address in systems design"
      },
      {
        id: "sprint_hope",
        question: "What's your biggest hope for what this sprint will unlock?",
        type: "textarea",
        field: "sprint_hope",
        placeholder: "Dream outcome...",
        helpText: "Outcome alignment"
      },
      {
        id: "implementation_readiness",
        question: "On a scale of 1-10, how ready are you to actually implement what we build?",
        type: "slider",
        field: "implementation_readiness",
        min: 1,
        max: 10,
        helpText: "1 = Too busy, can't do this right now | 10 = Let's do this NOW. <6 = might not execute"
      },
      {
        id: "implementation_barriers",
        question: "What could get in the way of you implementing the systems we build? (Select all that apply)",
        type: "multiselect",
        field: "implementation_barriers",
        options: [
          "Too busy with client work",
          "Team resistance",
          "I'll probably revert to old habits",
          "Client expectations",
          "Lack of time",
          "Lack of team buy-in",
          "Not confident in the systems",
          "Other"
        ],
        helpText: "Proactive barrier removal"
      }
    ]
  },
  {
    title: "Section 7: Build Materials",
    description: "Artifacts, examples, and specifics we need to build your systems (17 questions)",
    questions: [
      // Process & Workflow Details
      {
        id: "core_delivery_walkthrough",
        question: "Walk us through your typical client engagement from kickoff to final delivery. What are the major phases and who does what?",
        type: "textarea",
        field: "core_delivery_walkthrough",
        required: true,
        placeholder: "e.g., Phase 1: Discovery (I lead) - intake call, gather requirements. Phase 2: Strategy (I create) - build strategy doc. Phase 3: Execution (team does) - implement strategy. Phase 4: Review (I QA) - final check before delivery...",
        helpText: "This is the skeleton for your delivery workflow. Be as specific as possible - we'll systematize this."
      },
      {
        id: "most_repeated_tasks",
        question: "List the 3-5 tasks you or your team do repeatedly every week. Be specific.",
        type: "textarea",
        field: "most_repeated_tasks",
        required: true,
        placeholder: "e.g., 1. Write weekly status email to clients (30 min each, 8 clients). 2. Review designer's work before sending (15 min per deliverable). 3. Create project briefs from client requests (45 min each)...",
        helpText: "These become your first skills. High frequency = high impact."
      },
      {
        id: "judgment_calls",
        question: "What are the 3-5 judgment calls you make regularly? Where do you have to 'use your brain' vs. follow a process?",
        type: "textarea",
        field: "judgment_calls",
        required: true,
        placeholder: "e.g., 1. Deciding if a client request is in scope or out of scope. 2. Choosing which approach to recommend when there are multiple options. 3. Determining if work is 'good enough' to send...",
        helpText: "These become decision frameworks. The hardest part to systematize but highest value."
      },
      {
        id: "quality_criteria",
        question: "How do you know when work is 'good enough' to send to a client? What do you check for?",
        type: "textarea",
        field: "quality_criteria",
        required: true,
        placeholder: "e.g., I check: 1. Does it match the brief? 2. Is the formatting consistent? 3. Are there any typos? 4. Does it follow brand guidelines? 5. Would I be proud to put my name on it?",
        helpText: "This becomes your QA checklist and review criteria for skills."
      },
      {
        id: "common_mistakes",
        question: "What are the most common mistakes or issues that come up in delivery? How do you typically handle them?",
        type: "textarea",
        field: "common_mistakes",
        placeholder: "e.g., 1. Team misinterprets brief - I clarify and they redo. 2. Client changes scope mid-project - I have a conversation about timeline/budget. 3. Deliverable doesn't match brand - send back for revision...",
        helpText: "Edge cases and error handling for your systems."
      },
      // Artifacts & Examples
      {
        id: "example_deliverable_link",
        question: "Link to or describe an example of your best client deliverable. This could be a report, design, strategy doc, campaign, etc.",
        type: "textarea",
        field: "example_deliverable_link",
        required: true,
        placeholder: "Paste a Google Drive/Dropbox link, or describe what makes your best work great. e.g., 'Our Q4 marketing strategy for [Client] - comprehensive 30-page doc covering audience analysis, channel strategy, content calendar, and KPIs'",
        helpText: "Shows your quality bar, format, and tone. We'll reference this when building."
      },
      {
        id: "example_client_email",
        question: "Paste an example of a typical client email you send (status update, kickoff, scope clarification, etc.). Remove any sensitive info.",
        type: "textarea",
        field: "example_client_email",
        required: true,
        placeholder: "e.g., 'Hi [Client], Quick update on the project: We've completed the initial designs and are ready for your review. Key items to look at: 1) Homepage hero section 2) Navigation structure 3) Color palette application. Please share feedback by Friday so we can stay on track for the [date] launch. Let me know if you have questions! [Name]'",
        helpText: "Direct template material for client communication skills."
      },
      {
        id: "existing_docs_links",
        question: "Link to any process documentation, SOPs, templates, or checklists you currently use (even if outdated or messy). Multiple links welcome.",
        type: "textarea",
        field: "existing_docs_links",
        placeholder: "e.g., Google Drive folder: [link]. Notion workspace: [link]. Old SOP doc: [link]. It's okay if these are messy or incomplete - we'll build on them.",
        helpText: "Raw material to systematize. Shows what you've already tried."
      },
      {
        id: "client_brief_example",
        question: "Paste or describe a recent client brief or project request you received. This shows us how your clients communicate with you.",
        type: "textarea",
        field: "client_brief_example",
        placeholder: "e.g., 'Hey team, we need a landing page for our new product launch. Target audience is enterprise CTOs. Key messaging: security, scalability, cost savings. Need it by end of month. Budget is flexible but let's keep it reasonable. Can you send over a proposal?'",
        helpText: "Input format for brief-parsing skill. Shows what you're working with."
      },
      // Knowledge & Context
      {
        id: "tribal_knowledge",
        question: "What knowledge lives only in your head (or a senior team member's head) that would take weeks to teach someone new?",
        type: "textarea",
        field: "tribal_knowledge",
        required: true,
        placeholder: "e.g., 1. How to handle our biggest client's preferences (they hate certain words, prefer specific formats). 2. The nuances of our pricing - when to discount, when to hold firm. 3. Which vendors to use for different project types...",
        helpText: "Knowledge extraction priority. This is the IP that needs documenting."
      },
      {
        id: "new_hire_training",
        question: "If you hired someone tomorrow, what would the first 2 weeks of training look like? What would they need to learn?",
        type: "textarea",
        field: "new_hire_training",
        placeholder: "e.g., Week 1: Shadow me on client calls, learn our tools (Asana, Slack, Figma), review past projects. Week 2: Handle a small project with heavy supervision, learn our review process, meet the team...",
        helpText: "Shows implicit systems and training materials needed. Also reveals what's NOT documented."
      },
      {
        id: "client_vocabulary",
        question: "Are there any industry-specific terms, client-specific language, or internal jargon your team uses? List the key terms and what they mean.",
        type: "textarea",
        field: "client_vocabulary",
        placeholder: "e.g., 'Hero' = main banner section. 'Above the fold' = visible without scrolling. 'QBR' = quarterly business review. 'The deck' = our standard presentation template. '[Client name] style' = minimalist, lots of whitespace...",
        helpText: "Critical for skills to use correct language. Prevents AI-sounding outputs."
      },
      // Priorities & Constraints
      {
        id: "automate_one_thing",
        question: "If you could wave a magic wand and have ONE thing fully automated or systematized by the end of this program, what would it be?",
        type: "textarea",
        field: "automate_one_thing",
        required: true,
        placeholder: "e.g., Client status updates. I spend 3 hours every Monday writing these and they're 80% the same. If I could just click a button and have a draft ready to review, I'd get my Mondays back.",
        helpText: "Your #1 priority. This is our first build target."
      },
      {
        id: "must_stay_human",
        question: "What parts of your work should NEVER be automated or delegated? What requires your personal touch?",
        type: "textarea",
        field: "must_stay_human",
        required: true,
        placeholder: "e.g., Final client presentations - they expect me personally. Pricing negotiations - too nuanced. Creative direction for our biggest accounts - that's my superpower.",
        helpText: "Boundaries. Prevents us from building something you'll reject."
      },
      {
        id: "past_automation_attempts",
        question: "Have you tried to automate or systematize anything before? What worked? What failed?",
        type: "textarea",
        field: "past_automation_attempts",
        placeholder: "e.g., Tried Zapier for lead notifications - worked great. Tried to create SOPs in Notion - nobody used them. Tried to delegate client calls - clients complained.",
        helpText: "Avoids repeating failures. Shows what you've already attempted."
      },
      // Integration Context
      {
        id: "tool_stack_details",
        question: "List your main tools with how you use them. Be specific about what happens in each tool.",
        type: "textarea",
        field: "tool_stack_details",
        required: true,
        placeholder: "e.g., Slack: All client comms, team chat, notifications. HubSpot: Lead tracking, deal pipeline, email sequences. Asana: Project management, task assignment, timelines. Google Drive: All file storage, client deliverables, internal docs. Figma: Design work, client presentations...",
        helpText: "Integration targets. Knowing your stack shapes what we can automate and connect."
      },
      {
        id: "tool_pain_points",
        question: "Which tools cause the most friction? What do you wish worked better or was connected?",
        type: "textarea",
        field: "tool_pain_points",
        placeholder: "e.g., HubSpot and Asana don't talk to each other - when a deal closes, I manually create the project. Slack notifications are overwhelming - important stuff gets buried. Our Google Drive is a mess - can never find anything.",
        helpText: "Automation priorities. Where skill/workflow integration adds most value."
      }
    ]
  },
  {
    title: "Section 8: Final Insights & Contact",
    description: "Open-ended insights and your contact information (7 questions)",
    questions: [
      {
        id: "missing_questions",
        question: "What am I NOT asking that I should be asking?",
        type: "textarea",
        field: "missing_questions",
        placeholder: "What questions should I have asked?",
        helpText: "Fill gaps in audit"
      },
      {
        id: "additional_context",
        question: "What context do I need to understand your situation that hasn't been covered?",
        type: "textarea",
        field: "additional_context",
        placeholder: "Any unique circumstances, challenges, or context...",
        helpText: "Unique circumstances"
      },
      {
        id: "unique_factors",
        question: "What's unique about your agency that doesn't fit the questions above?",
        type: "textarea",
        field: "unique_factors",
        placeholder: "Edge cases, special situations...",
        helpText: "Edge cases"
      },
      {
        id: "contact_name",
        question: "Your full name",
        type: "text",
        field: "contact_name",
        required: true,
        placeholder: "John Doe"
      },
      {
        id: "contact_email",
        question: "Your email address",
        type: "text",
        field: "contact_email",
        required: true,
        placeholder: "john@agency.com"
      },
      {
        id: "company_name",
        question: "Company/Agency name",
        type: "text",
        field: "company_name",
        required: true,
        placeholder: "Acme Marketing"
      },
      {
        id: "other_notes",
        question: "Anything else you want to share?",
        type: "textarea",
        field: "other_notes",
        placeholder: "Any final thoughts, questions, or information...",
        helpText: "Open floor - anything goes"
      }
    ]
  }
];

// Helper to get total question count
export const getTotalQuestionCount = () => {
  return questionSections.reduce((total, section) => total + section.questions.length, 0);
};
