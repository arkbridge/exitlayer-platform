import { type AuditResponse } from './score-calculator';

interface CallPrepSection {
  title: string;
  duration: string;
  goal: string;
  questions: string[];
  listenFor: string[];
}

interface BuildHypothesis {
  priority: number;
  system: string;
  why: string;
  hoursReclaimed?: number;
}

interface RedFlag {
  observation: string;
  probe: string;
}

interface ShowMeRequest {
  item: string;
  why: string;
}

interface CallPrepDocument {
  clientInfo: {
    company: string;
    contact: string;
    email: string;
    generatedAt: string;
  };
  quickContext: {
    revenue: string;
    recurringPct: number;
    teamSize: number;
    ownerHours: number;
    timeBreakdown: {
      delivery: number;
      sales: number;
      mgmt: number;
      ops: number;
      strategy: number;
    };
    painSummary: string;
  };
  buildHypothesis: BuildHypothesis[];
  proprietaryMechanismHypothesis: {
    signals: string[];
    probableCore: string;
  };
  callSections: CallPrepSection[];
  redFlags: RedFlag[];
  showMeRequests: ShowMeRequest[];
  quickWins: string[];
  postCallNeeds: string[];
}

export function generateCallPrep(formData: AuditResponse): CallPrepDocument {
  // Extract key data points
  const company = formData.company_name || 'Unknown Company';
  const contact = formData.contact_name || 'Unknown';
  const email = formData.contact_email || '';

  const revenue12mo = formData.revenue_12mo || 0;
  const monthlyRevenue = formData.revenue_monthly_avg || Math.round(revenue12mo / 12);
  const recurringPct = formData.revenue_recurring_pct || 0;
  const teamSize = formData.team_size_total || 1;

  const deliveryHrs = formData.time_delivery_hrs || 0;
  const salesHrs = formData.time_sales_hrs || 0;
  const mgmtHrs = formData.time_mgmt_hrs || 0;
  const opsHrs = formData.time_ops_hrs || 0;
  const strategyHrs = formData.time_strategy_hrs || 0;
  const totalHrs = deliveryHrs + salesHrs + mgmtHrs + opsHrs + strategyHrs;

  const wastedHours = formData.wasted_hours_week || 0;
  const projectsRequiringOwner = formData.projects_requiring_owner_pct || 0;

  // Build pain summary from their answers
  const painPoints: string[] = [];
  if (totalHrs > 50) painPoints.push(`working ${totalHrs} hrs/week`);
  if (projectsRequiringOwner > 70) painPoints.push(`${projectsRequiringOwner}% of projects require owner`);
  if (formData.team_can_close === 'No') painPoints.push("team can't close deals");
  if (formData.team_can_deliver === 'No') painPoints.push("team can't deliver without owner");
  if (formData.has_sops === 'No') painPoints.push("no SOPs");
  if ((formData.documented_pct || 0) < 30) painPoints.push(`only ${formData.documented_pct || 0}% documented`);

  const painSummary = painPoints.length > 0
    ? painPoints.join(', ')
    : 'No critical pain points identified';

  // Generate build hypothesis based on their answers
  const buildHypothesis: BuildHypothesis[] = [];

  // Onboarding
  if (formData.team_can_onboard !== 'Yes') {
    const newClientsPerMonth = formData.new_clients_per_month || 2;
    buildHypothesis.push({
      priority: 1,
      system: 'Client Onboarding Flow',
      why: `Team ${formData.team_can_onboard === 'No' ? "can't" : "sometimes can't"} onboard without owner. ${newClientsPerMonth} new clients/month = significant trapped time.`,
      hoursReclaimed: Math.round(newClientsPerMonth * 3), // ~3 hrs per onboarding
    });
  }

  // QC / Delivery Review
  if (formData.revision_approval_process === 'Me (the owner) - always' || projectsRequiringOwner > 50) {
    buildHypothesis.push({
      priority: 2,
      system: 'Delivery QC Checklist + Review Skill',
      why: `Owner reviews everything before delivery. ${projectsRequiringOwner}% project involvement = delivery bottleneck.`,
      hoursReclaimed: Math.round(deliveryHrs * 0.3), // ~30% of delivery time is review
    });
  }

  // Sales / Qualification
  if (formData.team_can_close !== 'Yes' || (formData.owner_replaceability_sales || 10) < 5) {
    buildHypothesis.push({
      priority: 3,
      system: 'Sales Qualification Framework',
      why: formData.team_can_close === 'No'
        ? "Team can't close deals. May be qualification problem, not closing problem."
        : `Sales replaceability: ${formData.owner_replaceability_sales || '?'}/10. Owner dependency in revenue generation.`,
      hoursReclaimed: Math.round(salesHrs * 0.5),
    });
  }

  // Reporting
  const clientCount = formData.client_count || 0;
  if (clientCount > 5 && formData.client_update_frequency && formData.client_update_frequency !== 'No regular cadence') {
    buildHypothesis.push({
      priority: 4,
      system: 'Client Reporting Automation',
      why: `${clientCount} clients with ${formData.client_update_frequency?.toLowerCase()} updates = repeatable, automatable work.`,
      hoursReclaimed: Math.round(clientCount * 0.5), // ~30 min per client per week
    });
  }

  // Scope Decision Framework
  if (formData.revision_scope_issues === 'Often - we usually just do it' || formData.revision_scope_issues === 'Almost always - it\'s a constant battle') {
    buildHypothesis.push({
      priority: 5,
      system: 'Scope Decision Framework',
      why: `"${formData.revision_scope_issues}" - needs guardrails for what's in/out.`,
    });
  }

  // Proposal Generation
  if (formData.has_proposal_template === 'No' || formData.proposal_customization === 'Yes') {
    buildHypothesis.push({
      priority: 6,
      system: 'Proposal Generation Skill',
      why: formData.has_proposal_template === 'No'
        ? 'No proposal templates - recreating from scratch each time.'
        : 'Templates exist but heavily customized each time.',
      hoursReclaimed: Math.round((formData.new_clients_per_month || 2) * 2), // ~2 hrs per proposal
    });
  }

  // Sort by priority
  buildHypothesis.sort((a, b) => a.priority - b.priority);

  // Proprietary mechanism signals
  const mechanismSignals: string[] = [];
  if (formData.has_proprietary_method === 'Yes' || formData.has_proprietary_method === 'Sort of') {
    mechanismSignals.push(`Has proprietary method: "${formData.proprietary_method_description || 'Not described'}"`);
  }
  if (formData.differentiation) {
    mechanismSignals.push(`Differentiation: "${formData.differentiation}"`);
  }
  if (formData.client_praise) {
    mechanismSignals.push(`Clients rave about: "${formData.client_praise}"`);
  }
  if (formData.unique_strength) {
    mechanismSignals.push(`Unique strength: "${formData.unique_strength}"`);
  }

  const probableCore = formData.proprietary_method_description
    || formData.unique_strength
    || formData.differentiation
    || 'Need to extract on call';

  // Build call sections
  const callSections: CallPrepSection[] = [];

  // Section 1: Onboarding Deep Dive (if relevant)
  if (formData.team_can_onboard !== 'Yes') {
    callSections.push({
      title: 'Onboarding Process',
      duration: '15 min',
      goal: 'Extract the actual onboarding sequence so we can build it.',
      questions: [
        'Walk me through the last client you onboarded. From signed contract to first deliverable - what happened step by step?',
        'What do you personally do vs. what does the team do?',
        'What information do you need from the client before you can start? How do you collect it?',
        "What's the first thing that breaks if you hand this to your team tomorrow?",
        "Is there a 'moment' in onboarding where you build the relationship? What happens there?",
        formData.onboard_blocker ? `You mentioned "${formData.onboard_blocker}" - tell me more about that.` : null,
      ].filter(Boolean) as string[],
      listenFor: [
        'The step she thinks requires her but actually doesn\'t',
        'The thing she does on autopilot that she\'s never documented',
        'Trust issues vs. process issues',
      ],
    });
  }

  // Section 2: Delivery / QC
  if (projectsRequiringOwner > 50 || formData.revision_approval_process === 'Me (the owner) - always') {
    callSections.push({
      title: 'Delivery Review & QC',
      duration: '10 min',
      goal: 'Turn their quality eye into a checklist + decision tree.',
      questions: [
        'When you review work before it goes to the client, what are you actually checking?',
        "What's a recent example of something you caught that the team missed?",
        'Is there a pattern to the mistakes? Same 3-4 things, or random?',
        "If something is 'wrong,' how do you decide if it needs small tweaks or a full redo?",
        'What would make you trust your team to ship without your eyes on it?',
      ],
      listenFor: [
        'The repeatable checklist hiding in their head',
        'The quality threshold that\'s never been defined',
        'Whether this is skill gap or trust gap',
      ],
    });
  }

  // Section 3: Sales Process
  if (formData.team_can_close !== 'Yes') {
    callSections.push({
      title: 'Sales & Qualification',
      duration: '10 min',
      goal: 'Separate "can\'t close" from "taking bad leads."',
      questions: [
        'You said your team can\'t close without you. When they try, what goes wrong?',
        'Tell me about a deal they lost that you would have won. What would you have done differently?',
        'What makes you excited about a prospect in the first 5 minutes of a call?',
        'What makes you want to end the call early?',
        'Do you have a defined ICP, or is it more "I know it when I see it"?',
        formData.sales_blocker ? `You mentioned "${formData.sales_blocker}" - can you give me a specific example?` : null,
      ].filter(Boolean) as string[],
      listenFor: [
        'Whether this is a closing skill gap or a qualification gap',
        'The intuition they use to filter leads',
        'Objection handling patterns',
      ],
    });
  }

  // Section 4: Proprietary Mechanism (always include)
  callSections.push({
    title: 'Proprietary Mechanism',
    duration: '15 min',
    goal: 'Extract and name their unique approach.',
    questions: [
      formData.has_proprietary_method !== 'No'
        ? `You mentioned ${formData.proprietary_method_description ? `"${formData.proprietary_method_description.substring(0, 50)}..."` : 'having a methodology'}. Walk me through how it works.`
        : 'What\'s your actual process for delivering results? Walk me through a typical engagement.',
      'Where did this approach come from? Did you invent it or learn it somewhere?',
      'What do other agencies in your space do wrong that you do right?',
      'If you had to teach this to a new hire, what would take the longest to get right?',
      'Does this approach have a name? If not, what would you call it?',
      'What\'s the contrarian belief behind how you work?',
    ],
    listenFor: [
      'The framework structure (steps, phases, stages)',
      'The contrarian belief behind it',
      'Language they use that we can codify',
      'What they\'re protective of',
    ],
  });

  // Section 5: The Clone Test (always include)
  callSections.push({
    title: 'The Clone Test',
    duration: '5 min',
    goal: 'Find what can\'t be systematized vs. what just hasn\'t been.',
    questions: [
      'If you had to train a clone of yourself - same skills, same knowledge - what would be hardest to transfer?',
      'What do you do that you genuinely believe nobody else could do as well?',
      'What would you never want to delegate, even if you could?',
    ],
    listenFor: [
      'Ego vs. reality',
      'What they think is un-delegatable but is actually just undocumented',
      'Their true zone of genius vs. comfortable habits',
    ],
  });

  // Section 6: Core Service Walkthrough
  callSections.push({
    title: 'Core Service Walkthrough',
    duration: '10 min',
    goal: 'Map the entire delivery process for their main service.',
    questions: [
      `For your core service${formData.core_service ? ` ("${formData.core_service.substring(0, 30)}...")` : ''}, walk me through a project from start to finish.`,
      'What triggers the project to start?',
      'What are the major milestones or phases?',
      'Where are the handoff points between you and the team?',
      'What approvals or sign-offs happen along the way?',
      'What typically goes wrong or causes delays?',
    ],
    listenFor: [
      'Bottleneck points',
      'Decision gates that require owner',
      'Undocumented handoff procedures',
      'Recurring friction points',
    ],
  });

  // Build red flags / contradictions
  const redFlags: RedFlag[] = [];

  if (formData.team_can_onboard !== 'Yes' && formData.onboarding_documented === 'Yes') {
    redFlags.push({
      observation: 'Says team "can\'t onboard" but also says onboarding is "documented"',
      probe: 'Is the doc outdated? Not being followed? Or just not trusting the team?',
    });
  }

  if (totalHrs > 50 && strategyHrs < 3) {
    redFlags.push({
      observation: `${totalHrs} hours/week but only ${strategyHrs} hours on strategy`,
      probe: 'Where do they think this time should come from? What would they do with more strategic time?',
    });
  }

  if (recurringPct > 50 && (formData.churn_rate_pct || 0) > 20) {
    redFlags.push({
      observation: `${recurringPct}% recurring but ${formData.churn_rate_pct}% churn`,
      probe: 'How bad is churn really? Who\'s churning? Is it delivery or fit?',
    });
  }

  if ((formData.team_contractors || 0) > (formData.team_ft || 0)) {
    redFlags.push({
      observation: `More contractors (${formData.team_contractors}) than FTEs (${formData.team_ft})`,
      probe: 'Are contractors reliable? Is contractor churn part of the problem? Can we systematize around them?',
    });
  }

  if (formData.team_capability_score && formData.team_trust_level &&
      formData.team_capability_score > 7 && formData.team_trust_level < 5) {
    redFlags.push({
      observation: `Team capability: ${formData.team_capability_score}/10, but trust: ${formData.team_trust_level}/10`,
      probe: 'They rate team as capable but don\'t trust them. Why the gap?',
    });
  }

  if (formData.has_sops === 'Yes' && (formData.documented_pct || 0) < 30) {
    redFlags.push({
      observation: `Says "Yes" to SOPs but only ${formData.documented_pct}% documented`,
      probe: 'Are the SOPs comprehensive or just a few basics?',
    });
  }

  // Show me requests
  const showMeRequests: ShowMeRequest[] = [
    {
      item: 'A recent client onboarding doc or welcome email',
      why: 'See what exists and how systematized it is',
    },
    {
      item: 'How they review a deliverable before it goes to the client',
      why: 'Watch the actual QC process to extract the checklist',
    },
    {
      item: 'Their CRM/pipeline',
      why: 'See how leads flow, where deals stall',
    },
  ];

  if (formData.client_update_frequency && formData.client_update_frequency !== 'No regular cadence') {
    showMeRequests.push({
      item: 'A weekly/monthly client report',
      why: 'See what\'s manual vs. templatized',
    });
  }

  if (formData.has_proposal_template === 'Yes') {
    showMeRequests.push({
      item: 'A recent proposal',
      why: 'See the template structure and customization level',
    });
  }

  // Quick wins to mention
  const quickWins: string[] = [];

  if (formData.client_update_frequency && formData.client_update_frequency !== 'No regular cadence') {
    quickWins.push('Your client reporting is probably 80% automatable in week 1');
  }

  if (projectsRequiringOwner > 50) {
    quickWins.push('The delivery QC checklist - we can have v1 documented by end of this call');
  }

  if (formData.team_can_onboard !== 'Yes') {
    quickWins.push('Your onboarding sequence sounds systematizable. We can have that as a skill within days.');
  }

  if (formData.has_proposal_template === 'No') {
    quickWins.push('Proposal generation is a fast win - we can template your pricing logic and scope definitions');
  }

  if (quickWins.length === 0) {
    quickWins.push('Based on your answers, we\'ll identify quick wins during the call');
  }

  return {
    clientInfo: {
      company,
      contact,
      email,
      generatedAt: new Date().toISOString(),
    },
    quickContext: {
      revenue: `$${Math.round(revenue12mo / 1000)}K/year`,
      recurringPct,
      teamSize,
      ownerHours: totalHrs,
      timeBreakdown: {
        delivery: deliveryHrs,
        sales: salesHrs,
        mgmt: mgmtHrs,
        ops: opsHrs,
        strategy: strategyHrs,
      },
      painSummary,
    },
    buildHypothesis,
    proprietaryMechanismHypothesis: {
      signals: mechanismSignals,
      probableCore,
    },
    callSections,
    redFlags,
    showMeRequests,
    quickWins,
    postCallNeeds: [
      'Transcript for Claude to digest',
      'Any docs/assets they shared or referenced',
      'Your notes on validation (what was confirmed, what changed)',
      'Any follow-up questions that emerged',
    ],
  };
}

// Generate the markdown document for Michael
export function generateCallPrepMarkdown(prep: CallPrepDocument): string {
  const lines: string[] = [];

  lines.push(`# Call Prep: ${prep.clientInfo.company}`);
  lines.push('');
  lines.push(`**Contact:** ${prep.clientInfo.contact} (${prep.clientInfo.email})`);
  lines.push(`**Generated:** ${new Date(prep.clientInfo.generatedAt).toLocaleDateString()}`);
  lines.push('');

  // Quick Context
  lines.push('---');
  lines.push('');
  lines.push('## Quick Context');
  lines.push('');
  lines.push(`- **Revenue:** ${prep.quickContext.revenue}, ${prep.quickContext.recurringPct}% recurring`);
  lines.push(`- **Team:** ${prep.quickContext.teamSize} people`);
  lines.push(`- **Owner Hours:** ${prep.quickContext.ownerHours}/week (${prep.quickContext.timeBreakdown.delivery} delivery, ${prep.quickContext.timeBreakdown.sales} sales, ${prep.quickContext.timeBreakdown.mgmt} mgmt, ${prep.quickContext.timeBreakdown.ops} ops, ${prep.quickContext.timeBreakdown.strategy} strategy)`);
  lines.push(`- **Pain Summary:** ${prep.quickContext.painSummary}`);
  lines.push('');

  // Build Hypothesis
  lines.push('---');
  lines.push('');
  lines.push('## Preliminary Build Hypothesis');
  lines.push('');
  lines.push('Based on questionnaire answers, I\'m thinking we build:');
  lines.push('');
  lines.push('| Priority | System | Why | Hours/Week |');
  lines.push('|----------|--------|-----|------------|');
  prep.buildHypothesis.forEach(h => {
    lines.push(`| ${h.priority} | **${h.system}** | ${h.why.substring(0, 60)}${h.why.length > 60 ? '...' : ''} | ${h.hoursReclaimed || '?'} |`);
  });
  lines.push('');

  // Proprietary Mechanism Hypothesis
  lines.push('---');
  lines.push('');
  lines.push('## Proprietary Mechanism Hypothesis');
  lines.push('');
  if (prep.proprietaryMechanismHypothesis.signals.length > 0) {
    lines.push('**Signals from questionnaire:**');
    prep.proprietaryMechanismHypothesis.signals.forEach(s => {
      lines.push(`- ${s}`);
    });
    lines.push('');
  }
  lines.push(`**Probable Core:** ${prep.proprietaryMechanismHypothesis.probableCore}`);
  lines.push('');

  // Call Sections
  lines.push('---');
  lines.push('');
  lines.push('## Call Questions');
  lines.push('');

  prep.callSections.forEach((section, idx) => {
    lines.push(`### ${idx + 1}. ${section.title} (${section.duration})`);
    lines.push('');
    lines.push(`*Goal: ${section.goal}*`);
    lines.push('');
    section.questions.forEach(q => {
      lines.push(`- "${q}"`);
    });
    lines.push('');
    lines.push('**Listen for:**');
    section.listenFor.forEach(l => {
      lines.push(`- ${l}`);
    });
    lines.push('');
  });

  // Red Flags
  if (prep.redFlags.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push('## Red Flags / Contradictions to Probe');
    lines.push('');
    prep.redFlags.forEach((rf, idx) => {
      lines.push(`${idx + 1}. **${rf.observation}**`);
      lines.push(`   - Probe: ${rf.probe}`);
      lines.push('');
    });
  }

  // Show Me Requests
  lines.push('---');
  lines.push('');
  lines.push('## "Show Me" Requests');
  lines.push('');
  lines.push('If possible, have them share screen for:');
  lines.push('');
  prep.showMeRequests.forEach(sm => {
    lines.push(`- **${sm.item}** - ${sm.why}`);
  });
  lines.push('');

  // Quick Wins
  lines.push('---');
  lines.push('');
  lines.push('## Quick Wins to Mention');
  lines.push('');
  lines.push('To build momentum and show we can move fast:');
  lines.push('');
  prep.quickWins.forEach(qw => {
    lines.push(`- "${qw}"`);
  });
  lines.push('');

  // Post-Call Needs
  lines.push('---');
  lines.push('');
  lines.push('## After the Call');
  lines.push('');
  lines.push('I\'ll need:');
  lines.push('');
  prep.postCallNeeds.forEach(n => {
    lines.push(`- ${n}`);
  });
  lines.push('');
  lines.push('Once I have the transcript, I\'ll generate:');
  lines.push('');
  lines.push('1. Final system list with confirmed priorities');
  lines.push('2. Process maps for each workflow');
  lines.push('3. Decision frameworks for judgment calls');
  lines.push('4. Skill specifications for each automation');
  lines.push('5. The named proprietary mechanism with full methodology doc');
  lines.push('');

  return lines.join('\n');
}
