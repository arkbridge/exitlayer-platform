/**
 * Skill Generator
 *
 * Converts system specs into ExitLayer skill format (SKILL-SCHEMA.md compliant).
 * Generates SKILL.md and config.json files for each identified skill.
 */

import { type SystemSpec, type SystemSpecOutput } from './system-spec-generator';
import { type AuditResponse } from './score-calculator';

// ============================================================================
// TYPES
// ============================================================================

export interface SkillConfig {
  name: string;
  slug: string;
  description: string;
  category: 'communication' | 'delivery' | 'operations' | 'sales' | 'qa';
  version: string;
  inputs: SkillInput[];
  output: {
    type: 'text' | 'email' | 'document' | 'slack_message' | 'task';
    format: 'markdown' | 'plain' | 'html';
    destination: 'display' | 'clipboard' | 'slack' | 'email_draft' | 'hubspot';
  };
  integrations: string[];
  triggers: {
    keywords: string[];
    schedule?: string;
    event?: string;
  };
  permissions: {
    read: string[];
    write: string[];
  };
}

export interface SkillInput {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'date';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  source?: string;
}

export interface GeneratedSkill {
  slug: string;
  skillMd: string;
  configJson: SkillConfig;
  exampleInput?: Record<string, unknown>;
  exampleOutput?: string;
}

export interface SkillGeneratorOutput {
  clientName: string;
  generatedAt: string;
  skills: GeneratedSkill[];
  summary: {
    totalSkills: number;
    byCategory: Record<string, number>;
    integrationsCovered: string[];
  };
}

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export function generateSkills(
  data: AuditResponse,
  systemSpec: SystemSpecOutput
): SkillGeneratorOutput {
  const skills: GeneratedSkill[] = [];

  // Convert applicable SystemSpecs to Skills
  systemSpec.systems.forEach(system => {
    const skill = convertSystemToSkill(system, data);
    if (skill) {
      skills.push(skill);
    }
  });

  // Add skills based on Build Materials section responses
  const buildMaterialsSkills = generateFromBuildMaterials(data);
  skills.push(...buildMaterialsSkills);

  // Add common skills that most agencies need
  const commonSkills = generateCommonSkills(data, systemSpec);
  skills.push(...commonSkills);

  // Deduplicate by slug
  const uniqueSkills = skills.filter((skill, index, self) =>
    index === self.findIndex(s => s.slug === skill.slug)
  );

  // Calculate summary
  const byCategory: Record<string, number> = {};
  const allIntegrations = new Set<string>();

  uniqueSkills.forEach(skill => {
    const cat = skill.configJson.category;
    byCategory[cat] = (byCategory[cat] || 0) + 1;
    skill.configJson.integrations.forEach(i => allIntegrations.add(i));
  });

  return {
    clientName: data.company_name || 'Unknown',
    generatedAt: new Date().toISOString(),
    skills: uniqueSkills,
    summary: {
      totalSkills: uniqueSkills.length,
      byCategory,
      integrationsCovered: Array.from(allIntegrations),
    },
  };
}

// ============================================================================
// SYSTEM TO SKILL CONVERTER
// ============================================================================

function convertSystemToSkill(system: SystemSpec, data: AuditResponse): GeneratedSkill | null {
  // Only convert certain system types to skills
  const skillableTypes = ['agent', 'template', 'checklist', 'automation'];
  if (!skillableTypes.includes(system.type)) {
    return null;
  }

  const slug = system.id.replace(/^(agent|template|checklist|automation)-/, '');
  const category = mapCategory(system.category);

  const config: SkillConfig = {
    name: system.name,
    slug,
    description: system.description,
    category,
    version: '1.0',
    inputs: generateInputsFromPRD(system),
    output: inferOutputType(system),
    integrations: system.integrations.filter(i => i && i !== 'None'),
    triggers: {
      keywords: extractKeywords(system),
    },
    permissions: {
      read: inferReadPermissions(system),
      write: inferWritePermissions(system),
    },
  };

  const skillMd = generateSkillMd(system, data);

  return {
    slug,
    skillMd,
    configJson: config,
    exampleInput: generateExampleInput(config),
    exampleOutput: generateExampleOutput(system),
  };
}

// ============================================================================
// BUILD MATERIALS SKILL GENERATOR
// ============================================================================

function generateFromBuildMaterials(data: AuditResponse): GeneratedSkill[] {
  const skills: GeneratedSkill[] = [];

  // If they have repeated tasks, create a skill for the most common one
  if (data.repeated_tasks_weekly) {
    const tasks = parseTextList(data.repeated_tasks_weekly);
    if (tasks.length > 0) {
      const mainTask = tasks[0];
      const skill = createTaskAutomationSkill(mainTask, data);
      if (skill) skills.push(skill);
    }
  }

  // If they have judgment calls that follow patterns, create decision skills
  if (data.judgment_calls_patterns) {
    const patterns = parseTextList(data.judgment_calls_patterns);
    patterns.slice(0, 2).forEach((pattern, idx) => {
      const skill = createDecisionSkill(pattern, data, idx);
      if (skill) skills.push(skill);
    });
  }

  // If they have quality criteria, create a QA skill
  if (data.quality_criteria_good_work) {
    const skill = createQASkill(data);
    if (skill) skills.push(skill);
  }

  // If they want to automate something specific
  if (data.automate_one_thing) {
    const skill = createAutomationSkill(data.automate_one_thing, data);
    if (skill) skills.push(skill);
  }

  return skills;
}

function createTaskAutomationSkill(task: string, data: AuditResponse): GeneratedSkill | null {
  const slug = `task-${slugify(task).substring(0, 30)}`;
  const name = `${truncate(task, 40)} Assistant`;

  const config: SkillConfig = {
    name,
    slug,
    description: `Automate or assist with: ${task}`,
    category: 'operations',
    version: '1.0',
    inputs: [
      {
        name: 'context',
        label: 'Context',
        type: 'textarea',
        required: true,
        placeholder: 'Describe what needs to be done...',
        helpText: 'Provide context for this task',
      },
      {
        name: 'client',
        label: 'Client (if applicable)',
        type: 'select',
        required: false,
        source: 'hubspot.contacts',
      },
    ],
    output: {
      type: 'text',
      format: 'markdown',
      destination: 'display',
    },
    integrations: data.tools_pm ? [data.tools_pm] : [],
    triggers: {
      keywords: [task.toLowerCase(), 'task', 'help with'],
    },
    permissions: {
      read: [],
      write: [],
    },
  };

  const skillMd = `# ${name}

## Purpose
Assist with "${task}" - a repeated weekly task identified in the audit.

## When to Use
- When this task comes up during the week
- To standardize how this task is completed
- To reduce time spent on repetitive work

## Instructions

### Input
- Context about the specific instance of this task
- Client information if relevant

### Process
1. Review the context provided
2. Apply standard process for this task type
3. Generate appropriate output or next steps
4. Flag any items that need human review

### Output
- Task completion checklist or output
- Flagged items for review
- Time saved vs manual process

## Quality Criteria
${data.quality_criteria_good_work || '- Task completed correctly\n- Follows standard process\n- No errors or omissions'}

## Constraints
- Always flag unusual situations for human review
- Don't make assumptions about client preferences
- Escalate if unsure
`;

  return {
    slug,
    skillMd,
    configJson: config,
  };
}

function createDecisionSkill(pattern: string, data: AuditResponse, idx: number): GeneratedSkill | null {
  const slug = `decision-${idx + 1}`;
  const name = `Decision: ${truncate(pattern, 40)}`;

  const config: SkillConfig = {
    name,
    slug,
    description: `Decision framework for: ${pattern}`,
    category: 'operations',
    version: '1.0',
    inputs: [
      {
        name: 'situation',
        label: 'Situation',
        type: 'textarea',
        required: true,
        placeholder: 'Describe the situation requiring a decision...',
        helpText: 'What decision needs to be made?',
      },
      {
        name: 'constraints',
        label: 'Constraints',
        type: 'textarea',
        required: false,
        placeholder: 'Any constraints or special circumstances?',
      },
    ],
    output: {
      type: 'text',
      format: 'markdown',
      destination: 'display',
    },
    integrations: [],
    triggers: {
      keywords: ['decision', 'should I', 'what do I do'],
    },
    permissions: {
      read: [],
      write: [],
    },
  };

  const skillMd = `# ${name}

## Purpose
Provide decision guidance for: "${pattern}"

## When to Use
- When facing this type of decision
- To ensure consistent decision-making
- To reduce owner involvement in routine decisions

## Instructions

### Input
- Description of the situation
- Any special constraints or circumstances

### Process
1. Analyze the situation against known patterns
2. Apply decision criteria
3. Generate recommendation with reasoning
4. Flag edge cases for human review

### Output
- Clear recommendation
- Reasoning behind the recommendation
- Confidence level
- Escalation flag if needed

## Quality Criteria
- Decision aligns with company values and policies
- Reasoning is clear and logical
- Edge cases are properly flagged

## Constraints
- Never make decisions outside defined scope
- Always explain reasoning
- Escalate low-confidence situations
`;

  return {
    slug,
    skillMd,
    configJson: config,
  };
}

function createQASkill(data: AuditResponse): GeneratedSkill | null {
  const slug = 'qa-checklist';
  const name = 'Quality Assurance Checklist';

  const qualityCriteria = data.quality_criteria_good_work || '';
  const commonMistakes = data.common_mistakes_team || '';

  const config: SkillConfig = {
    name,
    slug,
    description: 'Pre-delivery quality assurance checklist based on your standards',
    category: 'qa',
    version: '1.0',
    inputs: [
      {
        name: 'deliverable_type',
        label: 'Deliverable Type',
        type: 'select',
        required: true,
        options: ['Design', 'Copy', 'Strategy', 'Report', 'Campaign', 'Other'],
        helpText: 'What type of deliverable is this?',
      },
      {
        name: 'deliverable_description',
        label: 'Description',
        type: 'textarea',
        required: true,
        placeholder: 'Briefly describe what was created...',
      },
      {
        name: 'client',
        label: 'Client',
        type: 'select',
        required: true,
        source: 'hubspot.contacts',
      },
    ],
    output: {
      type: 'document',
      format: 'markdown',
      destination: 'display',
    },
    integrations: data.tools_pm ? [data.tools_pm] : [],
    triggers: {
      keywords: ['qa', 'quality', 'check', 'review', 'before sending'],
    },
    permissions: {
      read: [],
      write: [],
    },
  };

  const skillMd = `# Quality Assurance Checklist

## Purpose
Ensure deliverables meet quality standards before client delivery.

## When to Use
- Before sending ANY deliverable to a client
- After completing a project phase
- When doing peer review

## Instructions

### Input
- Type of deliverable
- Brief description
- Client name

### Process
1. Run through quality criteria checklist
2. Check for common mistakes
3. Verify client-specific requirements
4. Generate pass/fail report

### Output
- Checklist with pass/fail for each item
- List of issues found
- Recommendation (ready to send / needs fixes)

## Quality Criteria

${qualityCriteria ? qualityCriteria.split('\n').map((c: string) => `- [ ] ${c.trim()}`).join('\n') : `- [ ] Meets project requirements
- [ ] No spelling/grammar errors
- [ ] Brand guidelines followed
- [ ] Reviewed by second team member`}

## Common Mistakes to Check

${commonMistakes ? commonMistakes.split('\n').map((m: string) => `- [ ] NOT: ${m.trim()}`).join('\n') : `- [ ] NOT: Missing client name/details
- [ ] NOT: Using placeholder text
- [ ] NOT: Wrong file format`}

## Constraints
- Never skip the checklist
- All items must pass before delivery
- Document any exceptions with reasoning
`;

  return {
    slug,
    skillMd,
    configJson: config,
  };
}

function createAutomationSkill(wishItem: string, data: AuditResponse): GeneratedSkill | null {
  const slug = `automate-${slugify(wishItem).substring(0, 25)}`;
  const name = `Automate: ${truncate(wishItem, 40)}`;

  const config: SkillConfig = {
    name,
    slug,
    description: `Automation for: ${wishItem}`,
    category: 'operations',
    version: '1.0',
    inputs: [
      {
        name: 'trigger_data',
        label: 'Input Data',
        type: 'textarea',
        required: true,
        placeholder: 'Paste or enter the data that triggers this automation...',
        helpText: 'What information starts this process?',
      },
    ],
    output: {
      type: 'text',
      format: 'markdown',
      destination: 'display',
    },
    integrations: extractToolsFromText(data),
    triggers: {
      keywords: wishItem.toLowerCase().split(' ').slice(0, 3),
    },
    permissions: {
      read: [],
      write: [],
    },
  };

  const skillMd = `# ${name}

## Purpose
${data.automate_one_thing}

This was identified as the #1 thing you'd want automated.

## When to Use
- Whenever this task needs to be done
- To save time on repetitive work
- To ensure consistency

## Instructions

### Input
- The data or trigger that starts this process

### Process
1. Parse the input data
2. Execute the automated steps
3. Generate the output
4. Notify relevant parties

### Output
- Completed automation result
- Any items flagged for review
- Confirmation of completion

## Quality Criteria
- Automation completes without errors
- Output matches expected format
- No manual intervention needed (except edge cases)

## Constraints
- Flag unusual inputs for review
- Don't proceed if data is incomplete
- Log all automation runs
`;

  return {
    slug,
    skillMd,
    configJson: config,
  };
}

// ============================================================================
// COMMON SKILLS GENERATOR
// ============================================================================

function generateCommonSkills(data: AuditResponse, spec: SystemSpecOutput): GeneratedSkill[] {
  const skills: GeneratedSkill[] = [];

  // Client Status Update skill (almost every agency needs this)
  if (!spec.systems.some(s => s.id.includes('status'))) {
    skills.push(createClientStatusSkill(data));
  }

  // Meeting Summary skill
  skills.push(createMeetingSummarySkill(data));

  // Brief Parser skill (if they receive briefs from clients)
  if (data.core_service_steps?.toLowerCase().includes('brief') ||
      data.example_client_brief) {
    skills.push(createBriefParserSkill(data));
  }

  return skills;
}

function createClientStatusSkill(data: AuditResponse): GeneratedSkill {
  const slug = 'client-status-update';

  const config: SkillConfig = {
    name: 'Client Status Update',
    slug,
    description: 'Draft a professional status update email for any client project',
    category: 'communication',
    version: '1.0',
    inputs: [
      {
        name: 'client',
        label: 'Client',
        type: 'select',
        required: true,
        source: data.tools_crm ? `${data.tools_crm.toLowerCase()}.contacts` : 'manual',
        helpText: 'Select the client to update',
      },
      {
        name: 'project',
        label: 'Project',
        type: 'select',
        required: true,
        source: data.tools_pm ? `${data.tools_pm.toLowerCase()}.projects` : 'manual',
        helpText: 'Which project is this update for?',
      },
      {
        name: 'status_type',
        label: 'Update Type',
        type: 'select',
        required: true,
        options: ['Weekly Update', 'Milestone Complete', 'Issue/Blocker', 'General Check-in'],
        helpText: 'What kind of update is this?',
      },
      {
        name: 'updates',
        label: 'Key Updates',
        type: 'textarea',
        required: true,
        placeholder: 'What was accomplished? Be specific.',
        helpText: 'List the main things completed or in progress',
      },
      {
        name: 'blockers',
        label: 'Blockers (if any)',
        type: 'textarea',
        required: false,
        placeholder: 'Any issues or things you need from the client?',
        helpText: 'Leave blank if no blockers',
      },
      {
        name: 'next_steps',
        label: 'Next Steps',
        type: 'textarea',
        required: true,
        placeholder: "What's happening next?",
        helpText: 'What should the client expect?',
      },
      {
        name: 'tone',
        label: 'Tone',
        type: 'select',
        required: false,
        options: ['Professional', 'Friendly', 'Formal', 'Casual'],
        helpText: "Match the client's preferred communication style",
      },
    ],
    output: {
      type: 'email',
      format: 'plain',
      destination: 'display',
    },
    integrations: [data.tools_crm, data.tools_pm].filter(Boolean) as string[],
    triggers: {
      keywords: ['status update', 'update email', 'client update', 'weekly update'],
    },
    permissions: {
      read: [data.tools_crm, data.tools_pm].filter(Boolean).map(t => `${t?.toLowerCase()}.read`) as string[],
      write: [],
    },
  };

  const skillMd = `# Client Status Update

## Purpose
Draft a professional status update email for a client project.

## When to Use
- Weekly status updates
- Milestone completions
- When client needs project visibility
- After significant progress

## Instructions

### Input
- Client name
- Project name
- Status type (weekly, milestone, issue)
- Key updates (what was done)
- Blockers (if any)
- Next steps
- Tone preference

### Process
1. Review the client's communication preferences
2. Structure the email: greeting, updates, blockers (if any), next steps, closing
3. Keep it concise - aim for 150-250 words
4. Use bullet points for easy scanning
5. End with a clear call-to-action if needed

### Output
A complete email draft ready to send, including:
- Subject line
- Email body
- Suggested send time (if relevant)

## Quality Criteria
- Professional but warm tone
- Specific, not vague ("completed homepage design" not "made progress")
- No jargon the client wouldn't understand
- Actionable next steps
- Appropriate length (not too long, not too short)

## Constraints
- Never include internal team discussions
- Never mention budget/pricing unless specifically asked
- Never commit to dates without checking capacity
- Match the client's communication style (formal vs casual)
`;

  return {
    slug,
    skillMd,
    configJson: config,
    exampleInput: {
      client: 'Acme Corp',
      project: 'Website Redesign',
      status_type: 'Weekly Update',
      updates: 'Completed homepage wireframes. Started design system. Finalized color palette with stakeholders.',
      blockers: 'Waiting on final logo files from brand team.',
      next_steps: 'Begin homepage high-fidelity designs once logo received. Schedule mid-week check-in.',
      tone: 'Professional',
    },
    exampleOutput: `Subject: Website Redesign - Weekly Update (Jan 27)

Hi Sarah,

Quick update on the website redesign project:

**Completed This Week:**
- Homepage wireframes finalized
- Design system framework started
- Color palette approved with your team

**Waiting On:**
- Final logo files from your brand team (needed to proceed with high-fidelity designs)

**Next Steps:**
- Begin homepage designs once logo received
- Mid-week check-in scheduled for Wednesday

Let me know if you have any questions or if there's anything you need from our side.

Best,
[Name]`,
  };
}

function createMeetingSummarySkill(data: AuditResponse): GeneratedSkill {
  const slug = 'meeting-summary';

  const config: SkillConfig = {
    name: 'Meeting Summary',
    slug,
    description: 'Generate a structured summary from meeting notes or transcript',
    category: 'communication',
    version: '1.0',
    inputs: [
      {
        name: 'meeting_type',
        label: 'Meeting Type',
        type: 'select',
        required: true,
        options: ['Client Call', 'Internal Sync', 'Discovery Call', 'Project Kickoff', 'Review Meeting'],
      },
      {
        name: 'attendees',
        label: 'Attendees',
        type: 'text',
        required: true,
        placeholder: 'Who was on the call?',
      },
      {
        name: 'notes_or_transcript',
        label: 'Notes or Transcript',
        type: 'textarea',
        required: true,
        placeholder: 'Paste your notes or transcript here...',
        helpText: 'Raw notes, bullet points, or full transcript',
      },
    ],
    output: {
      type: 'document',
      format: 'markdown',
      destination: 'display',
    },
    integrations: [data.tools_comm].filter(Boolean) as string[],
    triggers: {
      keywords: ['meeting summary', 'summarize call', 'meeting notes', 'call summary'],
    },
    permissions: {
      read: [],
      write: [],
    },
  };

  const skillMd = `# Meeting Summary

## Purpose
Generate a clean, structured summary from messy meeting notes or transcripts.

## When to Use
- After any client call
- After internal meetings
- When you need to share meeting outcomes
- For documentation and records

## Instructions

### Input
- Meeting type
- Attendees
- Raw notes or transcript

### Process
1. Parse the notes/transcript
2. Identify key discussion points
3. Extract action items with owners
4. Note decisions made
5. Capture questions/follow-ups needed
6. Format into standard structure

### Output
Structured summary with:
- Meeting details (date, type, attendees)
- Key discussion points
- Decisions made
- Action items (with owners and due dates if mentioned)
- Questions/Follow-ups
- Next meeting (if scheduled)

## Quality Criteria
- All action items captured with clear owners
- No important points missed
- Easy to scan quickly
- Professional formatting

## Constraints
- Don't add information not in the source
- Flag unclear action items for clarification
- Keep it factual, not interpretive
`;

  return {
    slug,
    skillMd,
    configJson: config,
  };
}

function createBriefParserSkill(data: AuditResponse): GeneratedSkill {
  const slug = 'brief-parser';

  const config: SkillConfig = {
    name: 'Brief Parser',
    slug,
    description: 'Parse and structure incoming client briefs for project setup',
    category: 'delivery',
    version: '1.0',
    inputs: [
      {
        name: 'raw_brief',
        label: 'Client Brief',
        type: 'textarea',
        required: true,
        placeholder: 'Paste the client brief or request here...',
        helpText: 'Raw brief from client email, form, or document',
      },
      {
        name: 'client',
        label: 'Client',
        type: 'select',
        required: true,
        source: data.tools_crm ? `${data.tools_crm.toLowerCase()}.contacts` : 'manual',
      },
      {
        name: 'service_type',
        label: 'Service Type',
        type: 'select',
        required: false,
        options: data.services?.map(s => s.name) || ['Strategy', 'Design', 'Content', 'Campaign'],
      },
    ],
    output: {
      type: 'document',
      format: 'markdown',
      destination: 'display',
    },
    integrations: [data.tools_pm].filter(Boolean) as string[],
    triggers: {
      keywords: ['parse brief', 'new brief', 'client request', 'new project'],
    },
    permissions: {
      read: [],
      write: data.tools_pm ? [`${data.tools_pm.toLowerCase()}.tasks`] : [],
    },
  };

  const skillMd = `# Brief Parser

## Purpose
Parse incoming client briefs into structured project requirements.

## When to Use
- When a new client brief/request comes in
- To standardize project setup
- To ensure nothing is missed from the brief

## Instructions

### Input
- Raw client brief (email, document, form submission)
- Client name
- Service type (if known)

### Process
1. Extract project objectives
2. Identify deliverables requested
3. Note timeline/deadline requirements
4. Capture any specific requirements or preferences
5. Flag missing information
6. Generate structured brief document

### Output
Structured brief containing:
- Project summary
- Objectives
- Deliverables list
- Timeline
- Requirements/constraints
- Missing information (questions to ask)
- Suggested project tasks

## Quality Criteria
- All deliverables clearly identified
- Missing info flagged before starting
- Timeline clearly stated
- Actionable task list generated

## Constraints
- Don't assume scope beyond what's stated
- Always flag ambiguous requirements
- Include original brief text for reference
`;

  return {
    slug,
    skillMd,
    configJson: config,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function mapCategory(systemCategory: string): SkillConfig['category'] {
  const mapping: Record<string, SkillConfig['category']> = {
    delivery: 'delivery',
    sales: 'sales',
    operations: 'operations',
    client_comms: 'communication',
    quality: 'qa',
    onboarding: 'operations',
    reporting: 'operations',
  };
  return mapping[systemCategory] || 'operations';
}

function generateInputsFromPRD(system: SystemSpec): SkillInput[] {
  const inputs: SkillInput[] = [];

  // Generate inputs based on PRD inputs
  system.prd.inputs.forEach((input, idx) => {
    if (input === 'To be determined' || input === 'To be determined in discovery') {
      return;
    }

    inputs.push({
      name: slugify(input),
      label: input,
      type: inferInputType(input),
      required: idx < 2, // First two inputs are required
      placeholder: `Enter ${input.toLowerCase()}...`,
    });
  });

  // Ensure at least one input
  if (inputs.length === 0) {
    inputs.push({
      name: 'input',
      label: 'Input',
      type: 'textarea',
      required: true,
      placeholder: 'Enter information...',
    });
  }

  return inputs;
}

function inferInputType(input: string): SkillInput['type'] {
  const lower = input.toLowerCase();

  if (lower.includes('date') || lower.includes('deadline') || lower.includes('timeline')) {
    return 'date';
  }
  if (lower.includes('type') || lower.includes('category') || lower.includes('status')) {
    return 'select';
  }
  if (lower.includes('description') || lower.includes('details') || lower.includes('notes') ||
      lower.includes('brief') || lower.includes('context')) {
    return 'textarea';
  }
  if (lower.includes('number') || lower.includes('count') || lower.includes('amount')) {
    return 'number';
  }

  return 'text';
}

function inferOutputType(system: SystemSpec): SkillConfig['output'] {
  const type = system.type;
  const prdOutputs = system.prd.outputs.join(' ').toLowerCase();

  if (prdOutputs.includes('email') || system.category === 'client_comms') {
    return { type: 'email', format: 'plain', destination: 'display' };
  }
  if (type === 'checklist' || prdOutputs.includes('checklist')) {
    return { type: 'document', format: 'markdown', destination: 'display' };
  }
  if (prdOutputs.includes('slack') || prdOutputs.includes('message')) {
    return { type: 'slack_message', format: 'plain', destination: 'slack' };
  }
  if (prdOutputs.includes('task') || prdOutputs.includes('project')) {
    return { type: 'task', format: 'markdown', destination: 'display' };
  }

  return { type: 'text', format: 'markdown', destination: 'display' };
}

function extractKeywords(system: SystemSpec): string[] {
  const words = new Set<string>();

  // Extract from name
  system.name.toLowerCase().split(/\s+/).forEach(w => {
    if (w.length > 3) words.add(w);
  });

  // Extract from description
  system.description.toLowerCase().split(/\s+/).slice(0, 5).forEach(w => {
    if (w.length > 3) words.add(w);
  });

  return Array.from(words).slice(0, 5);
}

function inferReadPermissions(system: SystemSpec): string[] {
  const perms: string[] = [];
  system.integrations.forEach(integration => {
    if (integration && integration !== 'None') {
      perms.push(`${integration.toLowerCase()}.read`);
    }
  });
  return perms;
}

function inferWritePermissions(system: SystemSpec): string[] {
  const perms: string[] = [];
  if (system.type === 'automation') {
    system.integrations.forEach(integration => {
      if (integration && integration !== 'None') {
        perms.push(`${integration.toLowerCase()}.write`);
      }
    });
  }
  return perms;
}

function generateSkillMd(system: SystemSpec, data: AuditResponse): string {
  const lines: string[] = [];

  lines.push(`# ${system.name}`);
  lines.push('');
  lines.push('## Purpose');
  lines.push(system.prd.problem);
  lines.push('');
  lines.push('## When to Use');
  system.triggeredBy.forEach(trigger => {
    lines.push(`- ${trigger}`);
  });
  lines.push('');
  lines.push('## Instructions');
  lines.push('');
  lines.push('### Input');
  system.prd.inputs.forEach(input => {
    lines.push(`- ${input}`);
  });
  lines.push('');
  lines.push('### Process');
  system.prd.workflow.forEach((step, idx) => {
    lines.push(`${idx + 1}. ${step}`);
  });
  lines.push('');
  lines.push('### Output');
  system.prd.outputs.forEach(output => {
    lines.push(`- ${output}`);
  });
  lines.push('');
  lines.push('## Quality Criteria');
  system.prd.successMetrics.forEach(metric => {
    lines.push(`- ${metric}`);
  });
  lines.push('');
  lines.push('## Constraints');
  lines.push('- Follow the process exactly');
  lines.push('- Escalate edge cases');
  if (system.prerequisites.length > 0) {
    lines.push(`- Prerequisites: ${system.prerequisites.join(', ')}`);
  }
  lines.push('');

  return lines.join('\n');
}

function generateExampleInput(config: SkillConfig): Record<string, unknown> {
  const example: Record<string, unknown> = {};

  config.inputs.forEach(input => {
    switch (input.type) {
      case 'text':
        example[input.name] = `Example ${input.label}`;
        break;
      case 'textarea':
        example[input.name] = `Example content for ${input.label}...`;
        break;
      case 'select':
        example[input.name] = input.options?.[0] || 'Option 1';
        break;
      case 'number':
        example[input.name] = 5;
        break;
      case 'date':
        example[input.name] = new Date().toISOString().split('T')[0];
        break;
      default:
        example[input.name] = `Example ${input.label}`;
    }
  });

  return example;
}

function generateExampleOutput(system: SystemSpec): string {
  return `[Example output for ${system.name}]

Based on the inputs provided, here is the generated output...

${system.prd.outputs.map(o => `- ${o}`).join('\n')}
`;
}

function extractToolsFromText(data: AuditResponse): string[] {
  const tools: string[] = [];
  if (data.tools_pm) tools.push(data.tools_pm);
  if (data.tools_crm) tools.push(data.tools_crm);
  if (data.tools_comm) tools.push(data.tools_comm);
  if (data.tools_automation) tools.push(data.tools_automation);
  return tools.filter(Boolean);
}

function parseTextList(text: string | undefined): string[] {
  if (!text) return [];
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

// ============================================================================
// MARKDOWN GENERATOR
// ============================================================================

export function generateSkillsMarkdown(output: SkillGeneratorOutput): string {
  const lines: string[] = [];

  lines.push('# Generated Skills Catalog');
  lines.push('');
  lines.push(`**Client:** ${output.clientName}`);
  lines.push(`**Generated:** ${new Date(output.generatedAt).toLocaleDateString()}`);
  lines.push(`**Total Skills:** ${output.summary.totalSkills}`);
  lines.push('');

  lines.push('## Summary by Category');
  lines.push('');
  Object.entries(output.summary.byCategory).forEach(([category, count]) => {
    lines.push(`- **${category}:** ${count} skills`);
  });
  lines.push('');

  lines.push('## Integrations Covered');
  lines.push('');
  output.summary.integrationsCovered.forEach(integration => {
    lines.push(`- ${integration}`);
  });
  lines.push('');

  lines.push('---');
  lines.push('');

  lines.push('## Skills');
  lines.push('');

  output.skills.forEach((skill, idx) => {
    lines.push(`### ${idx + 1}. ${skill.configJson.name}`);
    lines.push('');
    lines.push(`**Slug:** \`${skill.slug}\``);
    lines.push(`**Category:** ${skill.configJson.category}`);
    lines.push(`**Description:** ${skill.configJson.description}`);
    lines.push('');
    lines.push('**Inputs:**');
    skill.configJson.inputs.forEach(input => {
      lines.push(`- ${input.label} (${input.type}${input.required ? ', required' : ''})`);
    });
    lines.push('');
    lines.push('**Output:** ' + skill.configJson.output.type);
    lines.push('');
    if (skill.configJson.integrations.length > 0) {
      lines.push('**Integrations:** ' + skill.configJson.integrations.join(', '));
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  });

  return lines.join('\n');
}
