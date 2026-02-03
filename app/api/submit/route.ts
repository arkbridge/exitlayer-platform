import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { calculateExitLayerScore, type AuditResponse, type ExitLayerScore } from '@/lib/score-calculator';
import { generateDiagnosticReport } from '@/lib/diagnostic-report';
import { generateSystemSpec, type SystemSpecOutput } from '@/lib/system-spec-generator';
import { generateCallPrep, generateCallPrepMarkdown } from '@/lib/call-prep-generator';
import { generateSkills, generateSkillsMarkdown } from '@/lib/skill-generator';

// Constants for ROI calculations
const SPRINT_COST = 10000; // $10,000 sprint cost
const WEEKS_PER_MONTH = 4.33;
const WEEKS_PER_YEAR = 52;

// Helper to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper to generate human-readable build plan markdown
function generateBuildPlanDocument(spec: SystemSpecOutput, score: ExitLayerScore): string {
  const lines: string[] = [];

  lines.push('# ExitLayer Build Plan');
  lines.push('');
  lines.push(`**Client:** ${spec.clientInfo.company}`);
  lines.push(`**Generated:** ${new Date(spec.clientInfo.generatedAt).toLocaleDateString()}`);
  lines.push('');

  // Summary
  lines.push('## Summary');
  lines.push('');
  lines.push(`- **Total Systems to Build:** ${spec.summary.totalSystemsTooBuild}`);
  lines.push(`- **P0 (Immediate):** ${spec.summary.p0Systems}`);
  lines.push(`- **P1 (Week 2-3):** ${spec.summary.p1Systems}`);
  lines.push(`- **Estimated Build Hours:** ${spec.summary.estimatedBuildHours}`);
  lines.push(`- **Weekly Hours Reclaimed:** ${spec.summary.weeklyHoursReclaimed}`);
  lines.push(`- **Target Automation Coverage:** ${spec.summary.automationCoverage}%`);
  lines.push('');

  // ROI Analysis Section
  const ownerHourlyValue = score.financialMetrics.ownerHourlyValue;
  const weeklyHoursReclaimed = spec.summary.weeklyHoursReclaimed;
  const weeklyValueReclaimed = weeklyHoursReclaimed * ownerHourlyValue;
  const monthlyValueReclaimed = weeklyValueReclaimed * WEEKS_PER_MONTH;
  const annualValueReclaimed = weeklyValueReclaimed * WEEKS_PER_YEAR;
  const roiMultiple = annualValueReclaimed / SPRINT_COST;
  const paybackWeeks = SPRINT_COST / weeklyValueReclaimed;

  lines.push('## ROI Analysis');
  lines.push('');
  lines.push('### Your Time Value');
  lines.push(`- **Owner Hourly Value:** ${formatCurrency(ownerHourlyValue)}/hour`);
  lines.push(`  - *Based on ${formatCurrency(score.financialMetrics.monthlyRevenue)}/month revenue ÷ ${score.financialMetrics.totalWeeklyHours} hrs/week*`);
  lines.push('');
  lines.push('### Time Reclaimed');
  lines.push(`- **Weekly:** ${weeklyHoursReclaimed} hours = ${formatCurrency(weeklyValueReclaimed)}/week`);
  lines.push(`- **Monthly:** ${Math.round(weeklyHoursReclaimed * WEEKS_PER_MONTH)} hours = ${formatCurrency(monthlyValueReclaimed)}/month`);
  lines.push(`- **Annual:** ${Math.round(weeklyHoursReclaimed * WEEKS_PER_YEAR)} hours = ${formatCurrency(annualValueReclaimed)}/year`);
  lines.push('');
  lines.push('### Sprint ROI');
  lines.push(`- **Sprint Investment:** ${formatCurrency(SPRINT_COST)}`);
  lines.push(`- **First Year Value:** ${formatCurrency(annualValueReclaimed)}`);
  lines.push(`- **ROI Multiple:** ${roiMultiple.toFixed(1)}x return`);
  lines.push(`- **Payback Period:** ${paybackWeeks.toFixed(1)} weeks`);
  lines.push('');
  lines.push('### Per-System Value');
  lines.push('');
  lines.push('| System | Hours/Week | Weekly Value | Annual Value |');
  lines.push('|--------|------------|--------------|--------------|');

  // Sort systems by hours reclaimed for the table
  const systemsByValue = [...spec.systems]
    .filter(s => s.ownerTimeReclaimed > 0)
    .sort((a, b) => b.ownerTimeReclaimed - a.ownerTimeReclaimed)
    .slice(0, 10); // Top 10 systems

  systemsByValue.forEach(system => {
    const weeklyVal = system.ownerTimeReclaimed * ownerHourlyValue;
    const annualVal = weeklyVal * WEEKS_PER_YEAR;
    lines.push(`| ${system.name.substring(0, 40)} | ${system.ownerTimeReclaimed} | ${formatCurrency(weeklyVal)} | ${formatCurrency(annualVal)} |`);
  });
  lines.push('');

  // Automation Coverage Breakdown
  lines.push('## Automation Coverage');
  lines.push('');
  spec.automationCoverage.breakdown.forEach(area => {
    lines.push(`### ${area.area}`);
    lines.push(`- Current: ${area.currentState}`);
    lines.push(`- Target: ${area.targetState}`);
    lines.push(`- Automation: ${area.automationPercentage}%`);
    if (area.systemsRequired.length > 0) {
      lines.push(`- Systems: ${area.systemsRequired.join(', ')}`);
    }
    lines.push('');
  });

  // Week by Week Plan
  lines.push('## Week-by-Week Build Plan');
  lines.push('');
  spec.weekByWeekBuildPlan.forEach(week => {
    lines.push(`### Week ${week.week}: ${week.focus}`);
    lines.push('');
    lines.push('**Systems:**');
    week.systems.forEach(s => lines.push(`- ${s}`));
    lines.push('');
    lines.push('**Deliverables:**');
    week.deliverables.forEach(d => lines.push(`- ${d}`));
    lines.push('');
  });

  // Systems Detail
  lines.push('## Systems Detail');
  lines.push('');

  const p0Systems = spec.systems.filter(s => s.priority === 'P0');
  const p1Systems = spec.systems.filter(s => s.priority === 'P1');
  const p2Systems = spec.systems.filter(s => s.priority === 'P2');

  if (p0Systems.length > 0) {
    lines.push('### P0 - Build Immediately');
    lines.push('');
    p0Systems.forEach(system => {
      lines.push(`#### ${system.name}`);
      lines.push(`- **Type:** ${system.type}`);
      lines.push(`- **Category:** ${system.category}`);
      lines.push(`- **Build Time:** ${system.estimatedBuildTime}`);
      lines.push(`- **Hours Reclaimed:** ${system.ownerTimeReclaimed}/week`);
      lines.push(`- **Description:** ${system.description}`);
      lines.push(`- **Triggered By:** ${system.triggeredBy.join(', ')}`);
      if (system.integrations.length > 0) {
        lines.push(`- **Integrations:** ${system.integrations.join(', ')}`);
      }
      lines.push('');
    });
  }

  if (p1Systems.length > 0) {
    lines.push('### P1 - Week 2-3');
    lines.push('');
    p1Systems.forEach(system => {
      lines.push(`#### ${system.name}`);
      lines.push(`- **Type:** ${system.type}`);
      lines.push(`- **Category:** ${system.category}`);
      lines.push(`- **Build Time:** ${system.estimatedBuildTime}`);
      lines.push(`- **Hours Reclaimed:** ${system.ownerTimeReclaimed}/week`);
      lines.push(`- **Description:** ${system.description}`);
      lines.push('');
    });
  }

  if (p2Systems.length > 0) {
    lines.push('### P2 - Week 4 / Post-Sprint');
    lines.push('');
    p2Systems.forEach(system => {
      lines.push(`#### ${system.name}`);
      lines.push(`- **Type:** ${system.type}`);
      lines.push(`- **Description:** ${system.description}`);
      lines.push('');
    });
  }

  // Integration Requirements
  lines.push('## Integration Requirements');
  lines.push('');
  spec.integrations.forEach(integration => {
    lines.push(`### ${integration.toolCategory}: ${integration.tool}`);
    lines.push(`- **Required:** ${integration.required ? 'Yes' : 'No'}`);
    lines.push(`- **Purpose:** ${integration.purpose}`);
    lines.push(`- **API Available:** ${integration.apiAvailable ? 'Yes' : 'No'}`);
    if (!integration.apiAvailable || integration.tool === 'None specified') {
      lines.push(`- **Alternative:** ${integration.alternativeIfMissing}`);
    }
    lines.push('');
  });

  // Gaps
  if (spec.gaps.length > 0) {
    lines.push('## Information Gaps');
    lines.push('');
    lines.push('*These items need clarification in discovery call:*');
    lines.push('');
    spec.gaps.forEach(gap => {
      lines.push(`### ${gap.field}`);
      lines.push(`- **Priority:** ${gap.priority}`);
      lines.push(`- **Reason:** ${gap.reason}`);
      lines.push('');
    });
  }

  return lines.join('\n');
}

// Helper to generate discovery agenda markdown
function generateDiscoveryDocument(spec: SystemSpecOutput): string {
  const lines: string[] = [];

  lines.push('# Discovery Call Agenda');
  lines.push('');
  lines.push(`**Client:** ${spec.clientInfo.company}`);
  lines.push(`**Contact:** ${spec.clientInfo.name} (${spec.clientInfo.email})`);
  lines.push('');

  lines.push('## Objectives');
  lines.push('');
  lines.push('1. Fill information gaps from questionnaire');
  lines.push('2. Map core delivery process in detail');
  lines.push('3. Validate system priorities');
  lines.push('4. Confirm tool access and integration readiness');
  lines.push('');

  // Total time estimate
  const totalTime = spec.followUpDiscoveryAgenda.reduce((sum, item) => {
    const mins = parseInt(item.duration) || 15;
    return sum + mins;
  }, 0);
  lines.push(`**Estimated Duration:** ${totalTime} minutes`);
  lines.push('');

  lines.push('---');
  lines.push('');

  // Agenda items
  spec.followUpDiscoveryAgenda.forEach((item, idx) => {
    lines.push(`## ${idx + 1}. ${item.topic} (${item.duration})`);
    lines.push('');
    item.questions.forEach(q => {
      lines.push(`- [ ] ${q}`);
    });
    lines.push('');
  });

  // Information gaps section
  if (spec.gaps.length > 0) {
    lines.push('## Critical Information Gaps');
    lines.push('');
    lines.push('*Must resolve before building:*');
    lines.push('');

    const criticalGaps = spec.gaps.filter(g => g.priority === 'critical');
    criticalGaps.forEach(gap => {
      lines.push(`### ${gap.question}`);
      lines.push(`**Why:** ${gap.reason}`);
      lines.push('');
      lines.push('**Questions to ask:**');
      gap.discoveryQuestions.forEach(q => {
        lines.push(`- [ ] ${q}`);
      });
      lines.push('');
    });
  }

  // Validation checklist
  lines.push('## Validation Checklist');
  lines.push('');
  lines.push('*Confirm these before ending call:*');
  lines.push('');
  lines.push('- [ ] Understood core delivery process');
  lines.push('- [ ] Identified owner-only tasks clearly');
  lines.push('- [ ] Confirmed tool access (CRM, PM, etc.)');
  lines.push('- [ ] Agreed on P0 system priorities');
  lines.push('- [ ] Scheduled Week 2 check-in');
  lines.push('');

  return lines.join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json();

    // Extract analytics data before processing
    const { _analytics, _analyticsSession, ...formData } = rawData;

    // Calculate the ExitLayer score
    const score = calculateExitLayerScore(formData as AuditResponse);

    // Extract client name and create folder name
    const clientName = formData.company_name || 'Unknown-Client';
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const sanitizedName = clientName.replace(/[^a-zA-Z0-9]/g, '-');
    const folderName = `${sanitizedName}-${date}`;

    // Create client folder structure
    const baseDir = path.join(process.cwd(), '..', 'projects', 'clients');
    const clientDir = path.join(baseDir, folderName);

    try {
      // Ensure base clients directory exists
      await fs.mkdir(baseDir, { recursive: true });

      // Create client-specific folder
      await fs.mkdir(clientDir, { recursive: true });

      // Create subdirectories
      await fs.mkdir(path.join(clientDir, 'agent-skills'), { recursive: true });
      await fs.mkdir(path.join(clientDir, 'workshop-materials'), { recursive: true });
      await fs.mkdir(path.join(clientDir, 'client-assets'), { recursive: true });

      // Save questionnaire response as JSON
      const responseFile = path.join(clientDir, '01-questionnaire-response.json');
      await fs.writeFile(
        responseFile,
        JSON.stringify(formData, null, 2),
        'utf8'
      );

      // Save the calculated score
      const scoreFile = path.join(clientDir, '02-exitlayer-score.json');
      await fs.writeFile(
        scoreFile,
        JSON.stringify(score, null, 2),
        'utf8'
      );

      // Save a metadata file
      const metadata = {
        clientName: formData.company_name,
        contactName: formData.contact_name,
        contactEmail: formData.contact_email,
        submissionDate: new Date().toISOString(),
        folderPath: clientDir,
        overallScore: score.overall,
      };

      const metadataFile = path.join(clientDir, '00-metadata.json');
      await fs.writeFile(
        metadataFile,
        JSON.stringify(metadata, null, 2),
        'utf8'
      );

      // Generate the comprehensive diagnostic report
      const reportContent = generateDiagnosticReport(formData as AuditResponse, score);
      const reportFile = path.join(clientDir, '03-diagnostic-report.txt');
      await fs.writeFile(reportFile, reportContent, 'utf8');

      // Generate the system specification (build plan)
      const systemSpec = generateSystemSpec(formData as AuditResponse);
      const systemSpecFile = path.join(clientDir, '04-system-spec.json');
      await fs.writeFile(
        systemSpecFile,
        JSON.stringify(systemSpec, null, 2),
        'utf8'
      );

      // Generate a human-readable build plan
      const buildPlanContent = generateBuildPlanDocument(systemSpec, score);
      const buildPlanFile = path.join(clientDir, '05-build-plan.md');
      await fs.writeFile(buildPlanFile, buildPlanContent, 'utf8');

      // Generate discovery agenda document (legacy - keeping for reference)
      const discoveryContent = generateDiscoveryDocument(systemSpec);
      const discoveryFile = path.join(clientDir, '06-discovery-agenda.md');
      await fs.writeFile(discoveryFile, discoveryContent, 'utf8');

      // Generate the enhanced call prep document (the main one Michael uses)
      const callPrep = generateCallPrep(formData as AuditResponse);
      const callPrepJson = path.join(clientDir, '08-call-prep.json');
      await fs.writeFile(callPrepJson, JSON.stringify(callPrep, null, 2), 'utf8');

      const callPrepMarkdown = generateCallPrepMarkdown(callPrep);
      const callPrepFile = path.join(clientDir, '08-call-prep.md');
      await fs.writeFile(callPrepFile, callPrepMarkdown, 'utf8');

      // Generate skills based on system spec and questionnaire responses
      const skillsOutput = generateSkills(formData as AuditResponse, systemSpec);

      // Save skills catalog JSON
      const skillsCatalogJson = path.join(clientDir, '12-skills-catalog.json');
      await fs.writeFile(skillsCatalogJson, JSON.stringify(skillsOutput, null, 2), 'utf8');

      // Save skills catalog markdown
      const skillsCatalogMd = path.join(clientDir, '12-skills-catalog.md');
      await fs.writeFile(skillsCatalogMd, generateSkillsMarkdown(skillsOutput), 'utf8');

      // Create individual skill folders
      const skillsDir = path.join(clientDir, 'agent-skills');
      for (const skill of skillsOutput.skills) {
        const skillDir = path.join(skillsDir, skill.slug);
        await fs.mkdir(skillDir, { recursive: true });

        // Write SKILL.md
        await fs.writeFile(path.join(skillDir, 'SKILL.md'), skill.skillMd, 'utf8');

        // Write config.json
        await fs.writeFile(
          path.join(skillDir, 'config.json'),
          JSON.stringify(skill.configJson, null, 2),
          'utf8'
        );

        // Create examples folder with example if available
        const examplesDir = path.join(skillDir, 'examples');
        await fs.mkdir(examplesDir, { recursive: true });

        if (skill.exampleInput) {
          await fs.writeFile(
            path.join(examplesDir, 'example-1.json'),
            JSON.stringify(skill.exampleInput, null, 2),
            'utf8'
          );
        }

        if (skill.exampleOutput) {
          await fs.writeFile(
            path.join(examplesDir, 'example-1-output.md'),
            skill.exampleOutput,
            'utf8'
          );
        }

        // Create empty knowledge folder
        await fs.mkdir(path.join(skillDir, 'knowledge'), { recursive: true });
      }

      // Create placeholder files for the rest of the workflow
      const transcriptPlaceholder = `# Call Transcript

**Client:** ${formData.company_name}
**Date:** [Call date]

---

## Instructions

After the discovery call:
1. Paste the full transcript below
2. Save this file
3. Feed to Claude for digest and final build spec generation

---

## Transcript

[Paste transcript here]
`;
      await fs.writeFile(path.join(clientDir, '09-call-transcript.md'), transcriptPlaceholder, 'utf8');

      const finalBuildSpecPlaceholder = `# Final Build Spec

**Client:** ${formData.company_name}
**Generated:** [After transcript digest]

---

## Instructions

This file will be generated by Claude after digesting:
1. The questionnaire responses (01-questionnaire-response.json)
2. The call transcript (09-call-transcript.md)
3. Any client assets in the client-assets folder

---

## Status

- [ ] Transcript received
- [ ] Claude digest complete
- [ ] Build spec generated
- [ ] Client validation received

---

[Final build spec will be generated here]
`;
      await fs.writeFile(path.join(clientDir, '10-final-build-spec.md'), finalBuildSpecPlaceholder, 'utf8');

      const validationPlaceholder = `# Validation Sign-Off

**Client:** ${formData.company_name}
**Date:** [Validation date]

---

## Instructions

Before building, get client sign-off on the final build spec.
Send them a Loom walkthrough of 10-final-build-spec.md and record their approval here.

---

## Validation Status

- [ ] Build spec sent to client
- [ ] Client reviewed
- [ ] Changes requested: [list any]
- [ ] Final approval received

**Approved By:**
**Approval Date:**
**Notes:**

---

## Ready to Build

Once validated, the build phase can begin. Systems will be created in the agent-skills folder.
`;
      await fs.writeFile(path.join(clientDir, '11-validation-signoff.md'), validationPlaceholder, 'utf8');

      // Save analytics data if provided
      if (_analytics || _analyticsSession) {
        const analyticsData = {
          summary: _analytics,
          session: _analyticsSession,
          savedAt: new Date().toISOString(),
        };
        const analyticsFile = path.join(clientDir, '07-analytics.json');
        await fs.writeFile(
          analyticsFile,
          JSON.stringify(analyticsData, null, 2),
          'utf8'
        );

        // Log analytics summary
        if (_analytics) {
          console.log(`Analytics: ${_analytics.duration?.totalMinutes || 0} minutes, ${_analytics.completion?.percentageComplete || 0}% complete`);
        }
      }

      console.log(`Created client folder: ${folderName}`);
      console.log(`Overall Score: ${score.overall}/100`);
      console.log(`Systems to build: ${systemSpec.summary.totalSystemsTooBuild}`);
      console.log(`Skills generated: ${skillsOutput.summary.totalSkills}`);
      console.log(`Automation coverage: ${systemSpec.summary.automationCoverage}%`);
    } catch (error) {
      // Log the error but continue - we still want to return the score to the user
      console.error('Error saving files:', error);
    }

    // Return the score to the client
    return NextResponse.json({
      success: true,
      message: 'Questionnaire submitted successfully',
      clientFolder: folderName,
      score,
    });

  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}
