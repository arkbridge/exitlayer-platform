import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateExitLayerScore, type AuditResponse, type ExitLayerScore } from '@/lib/score-calculator';
import { generateDiagnosticReport } from '@/lib/diagnostic-report';
import { generateSystemSpec, type SystemSpecOutput } from '@/lib/system-spec-generator';
import { generateCallPrep, generateCallPrepMarkdown } from '@/lib/call-prep-generator';
import { generateSkills, generateSkillsMarkdown } from '@/lib/skill-generator';
import { createServiceClient } from '@/lib/supabase/service';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { getClientIp, isValidSessionToken, normalizeEmail } from '@/lib/security';

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

const submitPayloadSchema = z
  .object({
    full_name: z.string().trim().min(1).max(120).optional(),
    contact_name: z.string().trim().min(1).max(120).optional(),
    email: z.string().trim().email().max(254).optional(),
    contact_email: z.string().trim().email().max(254).optional(),
    company_name: z.string().trim().min(2).max(160),
    _analytics: z.unknown().optional(),
    _analyticsSession: z.unknown().optional(),
    _session_token: z.string().trim().optional(),
    _valuation: z.unknown().optional(),
  })
  .passthrough()
  .superRefine((data, ctx) => {
    if (!data.full_name && !data.contact_name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['full_name'],
        message: 'A contact name is required',
      })
    }
    if (!data.email && !data.contact_email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email'],
        message: 'A contact email is required',
      })
    }
  })

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(`submit:${getClientIp(request.headers)}`, {
    windowMs: 60 * 60 * 1000,
    max: 20,
  })
  const rateLimitHeaders = getRateLimitHeaders(rateLimit, 20)

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many submissions. Please try again later.' },
      { status: 429, headers: rateLimitHeaders }
    )
  }

  try {
    const parsedPayload = submitPayloadSchema.safeParse(await request.json());
    if (!parsedPayload.success) {
      return NextResponse.json(
        { success: false, error: 'Please complete all required fields.' },
        { status: 400, headers: rateLimitHeaders }
      )
    }

    // Extract analytics and session data before processing
    const { _analytics, _analyticsSession, _session_token, _valuation, ...formData } = parsedPayload.data;
    void _valuation;

    if (_session_token && !isValidSessionToken(_session_token)) {
      return NextResponse.json(
        { success: false, error: 'Invalid session token.' },
        { status: 400, headers: rateLimitHeaders }
      )
    }

    const submissionEmail = normalizeEmail(
      (formData.email as string | undefined) || (formData.contact_email as string | undefined)
    )

    // Store everything in Supabase
    const supabase = createServiceClient();

    if (_session_token) {
      const { data: existingSession, error: sessionError } = await supabase
        .from('audit_sessions')
        .select('id, email, status')
        .eq('session_token', _session_token)
        .maybeSingle()

      if (sessionError || !existingSession) {
        return NextResponse.json(
          { success: false, error: 'Session not found.' },
          { status: 404, headers: rateLimitHeaders }
        )
      }

      if (!['in_progress', 'submitted'].includes(existingSession.status)) {
        return NextResponse.json(
          { success: false, error: 'Session is no longer editable.' },
          { status: 400, headers: rateLimitHeaders }
        )
      }

      const sessionEmail = normalizeEmail(existingSession.email)
      if (sessionEmail && submissionEmail && sessionEmail !== submissionEmail) {
        return NextResponse.json(
          { success: false, error: 'Session email mismatch.' },
          { status: 403, headers: rateLimitHeaders }
        )
      }
    }

    // Calculate the ExitLayer score
    const score = calculateExitLayerScore(formData as AuditResponse);

    // Extract client name for reference
    const clientName = formData.company_name || 'Unknown-Client';
    const date = new Date().toISOString().split('T')[0];
    const sanitizedName = clientName.replace(/[^a-zA-Z0-9]/g, '-');
    const folderName = `${sanitizedName}-${date}`;

    // Generate all content
    const diagnosticReport = generateDiagnosticReport(formData as AuditResponse, score);
    const systemSpec = generateSystemSpec(formData as AuditResponse);
    const buildPlan = generateBuildPlanDocument(systemSpec, score);
    const discoveryAgenda = generateDiscoveryDocument(systemSpec);
    const callPrep = generateCallPrep(formData as AuditResponse);
    const callPrepMd = generateCallPrepMarkdown(callPrep);
    const skillsOutput = generateSkills(formData as AuditResponse, systemSpec);
    const skillsMd = generateSkillsMarkdown(skillsOutput);

    // Bundle all generated content into a single JSONB object
    const generatedContent = {
      diagnosticReport,
      systemSpec,
      buildPlan,
      discoveryAgenda,
      callPrep,
      callPrepMarkdown: callPrepMd,
      skillsCatalog: skillsOutput,
      skillsCatalogMarkdown: skillsMd,
      analytics: _analytics ? {
        summary: _analytics,
        session: _analyticsSession,
        savedAt: new Date().toISOString(),
      } : null,
      metadata: {
        clientName: formData.company_name,
        contactName: formData.full_name || formData.contact_name,
        contactEmail: formData.email || formData.contact_email,
        submissionDate: new Date().toISOString(),
        overallScore: score.overall,
        totalSystems: systemSpec.summary.totalSystemsTooBuild,
        totalSkills: skillsOutput.summary.totalSkills,
        automationCoverage: systemSpec.summary.automationCoverage,
      },
    };

    if (_session_token) {
      // Update existing audit session with generated content
      const { error: updateError } = await supabase
        .from('audit_sessions')
        .update({
          status: 'submitted',
          overall_score: score.overall,
          client_folder: folderName,
          score_data: {
            overall: score.overall,
            dimensions: score.dimensions,
            financialMetrics: score.financialMetrics,
          },
          form_data: formData,
          generated_content: generatedContent,
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('session_token', _session_token)
        .in('status', ['in_progress', 'submitted']);

      if (updateError) {
        console.error('Failed to update audit session:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to save your submission.' },
          { status: 500, headers: rateLimitHeaders }
        );
      }
    } else {
      // No session token - create a new audit session record
      const { error: insertError } = await supabase
        .from('audit_sessions')
        .insert({
          full_name: formData.full_name || formData.contact_name,
          company_name: formData.company_name,
          email: formData.email || formData.contact_email,
          status: 'submitted',
          overall_score: score.overall,
          client_folder: folderName,
          score_data: {
            overall: score.overall,
            dimensions: score.dimensions,
            financialMetrics: score.financialMetrics,
          },
          form_data: formData,
          generated_content: generatedContent,
          submitted_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Failed to create audit session:', insertError);
        return NextResponse.json(
          { success: false, error: 'Failed to save your submission.' },
          { status: 500, headers: rateLimitHeaders }
        );
      }
    }

    console.log(`Submission processed: ${folderName}`);
    console.log(`Overall Score: ${score.overall}/100`);
    console.log(`Systems to build: ${systemSpec.summary.totalSystemsTooBuild}`);
    console.log(`Skills generated: ${skillsOutput.summary.totalSkills}`);
    console.log(`Automation coverage: ${systemSpec.summary.automationCoverage}%`);

    // Return the score to the client
    return NextResponse.json(
      {
        success: true,
        message: 'Questionnaire submitted successfully',
        clientFolder: folderName,
        score,
        session_token: _session_token || null,
      },
      { headers: rateLimitHeaders }
    );

  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process submission' },
      { status: 500, headers: rateLimitHeaders }
    );
  }
}
