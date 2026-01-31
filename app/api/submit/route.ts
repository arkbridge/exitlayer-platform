import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateExitLayerScore, type AuditResponse, type ExitLayerScore } from '@/lib/score-calculator';
import { generateDiagnosticReport } from '@/lib/diagnostic-report';
import { generateSystemSpec, type SystemSpecOutput } from '@/lib/system-spec-generator';
import { generateCallPrep, generateCallPrepMarkdown } from '@/lib/call-prep-generator';

// Constants for ROI calculations
const SPRINT_COST = 10000;
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

  return lines.join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const rawData = await request.json();

    // Extract analytics data before processing
    const { _analytics, _analyticsSession, ...formData } = rawData;

    // Calculate the ExitLayer score
    const score = calculateExitLayerScore(formData as AuditResponse);

    // Generate the system specification (build plan)
    const systemSpec = generateSystemSpec(formData as AuditResponse);

    // Generate reports
    const diagnosticReport = generateDiagnosticReport(formData as AuditResponse, score);
    const buildPlan = generateBuildPlanDocument(systemSpec, score);
    const callPrep = generateCallPrep(formData as AuditResponse);
    const callPrepMarkdown = generateCallPrepMarkdown(callPrep);

    // Store submission in Supabase
    const { data: submission, error: insertError } = await supabase
      .from('submissions')
      .insert({
        user_id: user.id,
        questionnaire_data: formData,
        overall_score: score.overall,
        dimension_scores: score.dimensions,
        analysis: score.analysis,
        recommendations: score.recommendations,
        financial_metrics: score.financialMetrics,
        call_prep: callPrep,
        diagnostic_report: diagnosticReport,
        build_plan: buildPlan,
        system_spec: systemSpec,
        status: 'submitted',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving submission:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to save submission' },
        { status: 500 }
      );
    }

    // Create initial pipeline stage
    await supabase.from('pipeline_stages').insert({
      submission_id: submission.id,
      stage: 'submitted',
      notes: 'Questionnaire completed',
      completed_at: new Date().toISOString(),
    });

    // Update user profile with company name if provided
    if (formData.company_name || formData.contact_name) {
      await supabase
        .from('profiles')
        .update({
          company_name: formData.company_name || null,
          full_name: formData.contact_name || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }

    // Save analytics data if provided
    if (_analytics || _analyticsSession) {
      console.log(`Analytics: ${_analytics?.duration?.totalMinutes || 0} minutes, ${_analytics?.completion?.percentageComplete || 0}% complete`);
    }

    console.log(`Submission saved: ${submission.id}`);
    console.log(`Overall Score: ${score.overall}/100`);
    console.log(`Systems to build: ${systemSpec.summary.totalSystemsTooBuild}`);

    // Return the score to the client
    return NextResponse.json({
      success: true,
      message: 'Questionnaire submitted successfully',
      submissionId: submission.id,
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
