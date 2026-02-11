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

// ============================================================================
// VALUATION QUIZ — 17 questions, ~3-4 minutes
// Calculates current exit price (RED) and potential exit price (GREEN)
// Every question feeds the SDE × Multiple valuation formula
// ============================================================================

export const valuationSections: QuestionSection[] = [
  {
    title: "Your Numbers",
    description: "A few financials to calculate your valuation",
    questions: [
      {
        id: "val_annual_revenue",
        question: "What was your total revenue in the last 12 months?",
        type: "number",
        field: "annual_revenue",
        required: true,
        placeholder: "e.g., 1200000",
        helpText: "Ballpark is fine. This is the foundation of your valuation."
      },
      {
        id: "val_profit_margin",
        question: "What's your approximate profit margin?",
        type: "select",
        field: "profit_margin",
        required: true,
        options: [
          "Less than 10%",
          "10-20%",
          "20-30%",
          "30-40%",
          "40%+",
          "Not sure"
        ],
        helpText: "Revenue minus all expenses, before your salary. Best guess works."
      },
      {
        id: "val_owner_comp",
        question: "What do you pay yourself per year?",
        type: "number",
        field: "owner_annual_comp",
        required: true,
        placeholder: "e.g., 150000",
        helpText: "Total compensation — salary, draws, distributions. This factors into what an acquirer gets."
      },
      {
        id: "val_revenue_model",
        question: "How do most clients pay you?",
        type: "select",
        field: "revenue_model",
        required: true,
        options: [
          "Mostly project-based",
          "Mix of projects and retainers",
          "Mostly retainers / recurring"
        ],
        helpText: "Recurring revenue commands a significantly higher exit multiple."
      }
    ]
  },
  {
    title: "Your Business",
    description: "How your agency operates today",
    questions: [
      {
        id: "val_client_count",
        question: "How many active clients do you have right now?",
        type: "number",
        field: "client_count",
        required: true,
        helpText: "Currently paying or in active engagements"
      },
      {
        id: "val_top_client_pct",
        question: "What percentage of revenue comes from your single largest client?",
        type: "select",
        field: "top_client_pct",
        required: true,
        options: [
          "Less than 10%",
          "10-25%",
          "25-50%",
          "More than 50%"
        ],
        helpText: "High concentration = high risk. Acquirers penalize this heavily."
      },
      {
        id: "val_team_size",
        question: "How many people on your team, not including you?",
        type: "number",
        field: "team_size",
        required: true,
        min: 0,
        helpText: "Full-time, part-time, and contractors all count"
      },
      {
        id: "val_owner_hours",
        question: "How many hours per week do you work?",
        type: "number",
        field: "owner_hours_per_week",
        required: true,
        min: 0,
        max: 168,
        placeholder: "e.g., 55",
        helpText: "Be honest. We've seen it all."
      },
      {
        id: "val_owner_project_involvement",
        question: "What percentage of client projects require your direct involvement?",
        type: "select",
        field: "owner_project_involvement",
        required: true,
        options: [
          "Nearly all (90%+)",
          "Most (70-90%)",
          "About half (40-70%)",
          "Some (20-40%)",
          "Few or none (<20%)"
        ],
        helpText: "Direct involvement means you're doing the work, not just reviewing it."
      },
      {
        id: "val_owner_sales_pct",
        question: "What percentage of sales do you personally close?",
        type: "select",
        field: "owner_sales_pct",
        required: true,
        options: [
          "I close all of them (100%)",
          "I close most (75%+)",
          "About half (50%)",
          "My team closes most (<25%)",
          "I don't do sales"
        ],
        helpText: "If you're the only one who can close deals, growth is capped by your calendar."
      },
      {
        id: "val_approval_frequency",
        question: "How often does your team need your approval to move forward?",
        type: "select",
        field: "approval_frequency",
        required: true,
        options: [
          "Multiple times per day",
          "Daily",
          "A few times per week",
          "Weekly or less",
          "Rarely — they operate independently"
        ],
        helpText: "High frequency = you're the bottleneck. Low frequency = you have systems."
      }
    ]
  },
  {
    title: "The Exit Test",
    description: "Three questions that determine your exit price",
    questions: [
      {
        id: "val_without_you",
        question: "If you disappeared for 4 weeks — no phone, no email, no Slack — what happens?",
        type: "select",
        field: "without_you",
        required: true,
        options: [
          "It would run fine without me",
          "Some things would slip, but it'd survive",
          "Major problems — clients would notice",
          "Everything stops. The business IS me."
        ],
        helpText: "This is the question every acquirer asks. Your answer determines your multiple."
      },
      {
        id: "val_documented",
        question: "How much of your delivery process is documented?",
        type: "select",
        field: "documented_level",
        required: true,
        options: [
          "Nothing is documented",
          "A few rough notes here and there",
          "Most processes have some documentation",
          "Fully documented with SOPs and templates"
        ],
        helpText: "Documented processes = transferable value. Undocumented = it dies with you."
      },
      {
        id: "val_proprietary",
        question: "Do you have a named, proprietary method or framework?",
        type: "select",
        field: "has_proprietary_method",
        required: true,
        options: ["Yes", "Sort of", "No"],
        helpText: "A named methodology is intellectual property. IP is what creates real equity."
      }
    ]
  },
  {
    title: "Get Your Results",
    description: "Where should we send your valuation?",
    questions: [
      {
        id: "lead_full_name",
        question: "What's your name?",
        type: "text",
        field: "full_name",
        required: true,
        placeholder: "Sarah Chen",
        helpText: "So we know who to address your valuation to"
      },
      {
        id: "lead_email",
        question: "What's your email?",
        type: "text",
        field: "email",
        required: true,
        placeholder: "sarah@agency.com",
        helpText: "We'll send your full valuation report here"
      },
      {
        id: "lead_company_name",
        question: "What's your company name?",
        type: "text",
        field: "company_name",
        required: true,
        placeholder: "Meridian Digital",
        helpText: "Your agency or company name"
      }
    ]
  }
];

// Backward compat alias — form component imports this
export const preCallSections = valuationSections;

// ============================================================================
// POST-SALE DEEP DIVE — 74 questions for building systems & extracting IP
// Sent after the sale closes. Detailed workflows, tribal knowledge, tools.
// ============================================================================

export const postSaleSections: QuestionSection[] = [
  {
    title: "Services & Revenue Details",
    description: "Detailed breakdown of how you make money (5 questions)",
    questions: [
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
        id: "services",
        question: "What are your top 3 services?",
        type: "services",
        field: "services",
        helpText: "Include the % of revenue each brings in and typical project value"
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
        placeholder: "e.g., 2000000"
      }
    ]
  },
  {
    title: "Owner Tasks & Delegation",
    description: "What only you can do — and why (11 questions)",
    questions: [
      {
        id: "tasks_only_owner",
        question: "What tasks can only you do?",
        type: "textarea",
        field: "tasks_only_owner",
        required: true,
        placeholder: "e.g., Strategy, client calls, QA, pricing...",
        helpText: "These are the highest-priority areas to systematize"
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
        id: "wish_could_delegate",
        question: "What ONE thing do you wish someone else could do?",
        type: "textarea",
        field: "wish_could_delegate",
        required: true,
        placeholder: "The task causing you the most pain...",
        helpText: "This becomes your top priority to fix"
      },
      {
        id: "delivery_bottleneck",
        question: "What's the biggest bottleneck in your delivery process right now?",
        type: "textarea",
        field: "delivery_bottleneck",
        placeholder: "Be specific..."
      },
      {
        id: "sales_bottleneck",
        question: "What's the biggest bottleneck in your sales process right now?",
        type: "textarea",
        field: "sales_bottleneck",
        placeholder: "Be specific..."
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
      {
        id: "core_service_steps",
        question: "For your CORE service, list the main steps from start to finish:",
        type: "textarea",
        field: "core_service_steps",
        required: true,
        placeholder: "e.g., 1. Discovery call, 2. Strategy doc, 3. Client approval, 4. Execution, 5. Review, 6. Delivery...",
        helpText: "Be specific — this is the workflow we'll map out"
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
        ]
      },
      {
        id: "onboard_blocker",
        question: "What's the biggest challenge when onboarding clients without you?",
        type: "textarea",
        field: "onboard_blocker",
        placeholder: "What's the specific blocker?"
      },
      {
        id: "delivery_blocker",
        question: "What's the biggest challenge when delivering projects without you?",
        type: "textarea",
        field: "delivery_blocker",
        placeholder: "What's the specific blocker?"
      },
      {
        id: "sales_blocker",
        question: "What's the biggest challenge when closing sales without you?",
        type: "textarea",
        field: "sales_blocker",
        placeholder: "What's the specific blocker?"
      }
    ]
  },
  {
    title: "Systems & Tools",
    description: "Current documentation, tools, and process maturity (15 questions)",
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
        helpText: "More templates = more productization-ready"
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
        helpText: "'Every project' = huge waste. Easy fix with templates"
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
        id: "has_kickoff_checklist",
        question: "Do you have a project kickoff checklist?",
        type: "select",
        field: "has_kickoff_checklist",
        options: ["Yes", "No"],
        helpText: "Checklists = easy to build, high impact"
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
        helpText: "This becomes a top priority for improvement"
      },
      {
        id: "failed_systematization",
        question: "What have you tried to systematize before that didn't stick, and why?",
        type: "textarea",
        field: "failed_systematization",
        placeholder: "e.g., Built SOPs no one uses because they were too complex..."
      }
    ]
  },
  {
    title: "Team Details",
    description: "Team composition, skills, and delegation readiness (12 questions)",
    questions: [
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
        helpText: "These are candidates for decision frameworks"
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
        helpText: "Each blocker has a specific solution"
      }
    ]
  },
  {
    title: "Market & Productization",
    description: "Positioning, differentiation, and product readiness (17 questions)",
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
        id: "proprietary_method_description",
        question: "What is your methodology called and how does it work?",
        type: "textarea",
        field: "proprietary_method_description",
        placeholder: "e.g., The SaaS Growth Framework - 4-stage methodology for...",
        helpText: "If you have this, it becomes the center of your productized offering",
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
        ]
      },
      {
        id: "dream_product",
        question: "What would your dream 'productized' offering look like?",
        type: "textarea",
        field: "dream_product",
        required: true,
        placeholder: "Describe your ideal productized offering..."
      },
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
        showIf: { field: "has_client_tiers", notEquals: "No - everything is custom" }
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
        ]
      }
    ]
  },
  {
    title: "Vision Details",
    description: "Long-term goals and fears (4 questions)",
    questions: [
      {
        id: "vision_12mo",
        question: "Where do you want your agency to be in 12 months?",
        type: "textarea",
        field: "vision_12mo",
        required: true,
        placeholder: "Be specific about revenue, team, time, systems..."
      },
      {
        id: "vision_3yr",
        question: "Where do you want your agency to be in 3 years?",
        type: "textarea",
        field: "vision_3yr",
        placeholder: "Long-term vision..."
      },
      {
        id: "personal_success_definition",
        question: "What does 'success' look like for you personally?",
        type: "textarea",
        field: "personal_success_definition",
        placeholder: "Money, freedom, impact, legacy?"
      },
      {
        id: "delivery_exit_fear",
        question: "What's your biggest fear about stepping back from delivery?",
        type: "textarea",
        field: "delivery_exit_fear",
        placeholder: "What worries you most?",
        helpText: "Reveals the real objection to delegation"
      }
    ]
  },
  {
    title: "Delivery Workflow & Build Materials",
    description: "How you work — the skeleton for your systems (8 questions)",
    questions: [
      {
        id: "core_delivery_walkthrough",
        question: "Walk us through your typical client engagement from kickoff to final delivery. What are the major phases and who does what?",
        type: "textarea",
        field: "core_delivery_walkthrough",
        required: true,
        placeholder: "e.g., Phase 1: Discovery (I lead) - intake call, gather requirements. Phase 2: Strategy (I create) - build strategy doc. Phase 3: Execution (team does) - implement strategy. Phase 4: Review (I QA) - final check before delivery...",
        helpText: "This is the skeleton for your delivery workflow. Be as specific as possible."
      },
      {
        id: "most_repeated_tasks",
        question: "List the 3-5 tasks you or your team do repeatedly every week. Be specific.",
        type: "textarea",
        field: "most_repeated_tasks",
        required: true,
        placeholder: "e.g., 1. Write weekly status email to clients (30 min each, 8 clients). 2. Review designer's work before sending (15 min per deliverable)...",
        helpText: "High frequency = high impact for automation"
      },
      {
        id: "judgment_calls",
        question: "What are the 3-5 judgment calls you make regularly? Where do you have to 'use your brain' vs. follow a process?",
        type: "textarea",
        field: "judgment_calls",
        required: true,
        placeholder: "e.g., 1. Deciding if a client request is in scope or out of scope. 2. Choosing which approach to recommend...",
        helpText: "These become decision frameworks. Hardest to systematize but highest value."
      },
      {
        id: "quality_criteria",
        question: "How do you know when work is 'good enough' to send to a client? What do you check for?",
        type: "textarea",
        field: "quality_criteria",
        required: true,
        placeholder: "e.g., I check: 1. Does it match the brief? 2. Is the formatting consistent? 3. Are there any typos?...",
        helpText: "This becomes your QA checklist and review criteria."
      },
      {
        id: "common_mistakes",
        question: "What are the most common mistakes or issues that come up in delivery?",
        type: "textarea",
        field: "common_mistakes",
        placeholder: "e.g., 1. Team misinterprets brief - I clarify and they redo...",
        helpText: "Edge cases and error handling for your systems."
      },
      {
        id: "tribal_knowledge",
        question: "What knowledge lives only in your head that would take weeks to teach someone new?",
        type: "textarea",
        field: "tribal_knowledge",
        required: true,
        placeholder: "e.g., 1. How to handle our biggest client's preferences. 2. The nuances of our pricing...",
        helpText: "Knowledge extraction priority. This is the IP that needs documenting."
      },
      {
        id: "must_stay_human",
        question: "What parts of your work should NEVER be automated or delegated?",
        type: "textarea",
        field: "must_stay_human",
        required: true,
        placeholder: "e.g., Final client presentations, pricing negotiations...",
        helpText: "Boundaries. Prevents building something you'll reject."
      },
      {
        id: "tool_pain_points",
        question: "Which tools cause the most friction? What do you wish worked better or was connected?",
        type: "textarea",
        field: "tool_pain_points",
        placeholder: "e.g., HubSpot and Asana don't talk to each other...",
        helpText: "Identifies where automation and integration add the most value."
      }
    ]
  },
  {
    title: "Final Insights",
    description: "Anything we missed (2 questions)",
    questions: [
      {
        id: "missing_questions",
        question: "What am I NOT asking that I should be asking?",
        type: "textarea",
        field: "missing_questions",
        placeholder: "What questions should I have asked?"
      },
      {
        id: "other_notes",
        question: "Anything else you want to share?",
        type: "textarea",
        field: "other_notes",
        placeholder: "Any final thoughts, questions, or information..."
      }
    ]
  }
];

// ============================================================================
// Combined (backward compatibility + full audit if needed)
// ============================================================================

export const questionSections: QuestionSection[] = [...valuationSections, ...postSaleSections];

// ============================================================================
// Helpers
// ============================================================================

export const getValuationQuestionCount = () => {
  return valuationSections.reduce((total, section) => total + section.questions.length, 0);
};

export const getPreCallQuestionCount = getValuationQuestionCount;

export const getPostSaleQuestionCount = () => {
  return postSaleSections.reduce((total, section) => total + section.questions.length, 0);
};

export const getTotalQuestionCount = () => {
  return questionSections.reduce((total, section) => total + section.questions.length, 0);
};
