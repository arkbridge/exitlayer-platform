import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import ValueSummaryRow from '@/components/dashboard/ValueSummaryRow'
import InsightsPair from '@/components/dashboard/InsightsPair'
import DimensionScores from '@/components/dashboard/DimensionScores'
import CriticalFindings from '@/components/dashboard/CriticalFindings'
import QuickWins from '@/components/dashboard/QuickWins'
import AuditProgress from '@/components/dashboard/AuditProgress'
import DocumentUpload from '@/components/dashboard/DocumentUpload'
import SprintProgress from '@/components/dashboard/SprintProgress'
import BeforeAfter from '@/components/dashboard/BeforeAfter'
import JourneyProgress from '@/components/dashboard/JourneyProgress'
import { getClientStage, type AuditSession, type ClientStage } from '@/lib/stage-utils'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's audit session
  const { data: auditSessionData } = await supabase
    .from('audit_sessions')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['submitted', 'account_created'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Type the audit session
  const auditSession: AuditSession | null = auditSessionData ? {
    id: auditSessionData.id,
    user_id: auditSessionData.user_id,
    full_name: auditSessionData.full_name,
    company_name: auditSessionData.company_name,
    email: auditSessionData.email,
    score_data: auditSessionData.score_data,
    form_data: auditSessionData.form_data,
    full_audit_status: auditSessionData.full_audit_status,
    full_audit_data: auditSessionData.full_audit_data,
    full_audit_current_question: auditSessionData.full_audit_current_question,
    full_audit_started_at: auditSessionData.full_audit_started_at,
    full_audit_completed_at: auditSessionData.full_audit_completed_at,
    client_stage: auditSessionData.client_stage,
    sprint_data: auditSessionData.sprint_data,
    documents_uploaded: auditSessionData.documents_uploaded,
    created_at: auditSessionData.created_at,
    updated_at: auditSessionData.updated_at,
  } : null

  // Determine client stage
  const stage: ClientStage = getClientStage(auditSession)

  // If no audit session found, show prompt to complete short assessment
  if (!auditSession) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <DashboardHeader
          userName={profile?.full_name?.split(' ')[0]}
          companyName={profile?.company_name}
          stage="new"
          session={null}
        />

        <div className="bg-white rounded-xl border border-[#e5e5e5] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-900/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-medium text-[#1a1a1a] mb-3">
            Complete Your Assessment
          </h2>
          <p className="text-[#666] mb-6 max-w-md mx-auto">
            Take the short assessment to unlock your personalized dashboard and transformation roadmap.
          </p>
          <Link
            href="/questionnaire"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-900 hover:bg-emerald-950 text-white font-medium rounded-full transition-colors"
          >
            Start Assessment
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    )
  }

  // Extract data from audit session
  const scoreData = auditSession.score_data || {}
  const formData = auditSession.form_data || {}
  const dimensions = scoreData.dimensions || {}
  const financials = scoreData.financialMetrics || {}

  // Build mock data for critical findings and quick wins if not present
  const criticalFindings = scoreData.criticalFindings || generateMockFindings(dimensions)
  const quickWins = scoreData.quickWins || generateMockQuickWins(dimensions)

  // Build primary constraint and highest opportunity from dimension scores
  const primaryConstraint = scoreData.primaryConstraint || findPrimaryConstraint(dimensions)
  const highestOpportunity = scoreData.highestOpportunity || findHighestOpportunity(dimensions)

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Stage-Aware Header */}
      <DashboardHeader
        userName={auditSession.full_name?.split(' ')[0] || profile?.full_name?.split(' ')[0]}
        companyName={auditSession.company_name || profile?.company_name}
        stage={stage}
        session={auditSession}
      />

      {/* Value Summary Row - Always visible after short assessment */}
      <div className="mb-8">
        <ValueSummaryRow
          currentValue={financials.currentExitValue || 0}
          potentialValue={financials.targetExitValue || 0}
          valueGap={financials.valueGap || 0}
          currentMultiple={financials.currentExitMultiple || 2}
        />
      </div>

      {/* Insights Pair - Primary Constraint & Highest Opportunity */}
      <div className="mb-8">
        <InsightsPair
          primaryConstraint={primaryConstraint}
          highestOpportunity={highestOpportunity}
        />
      </div>

      {/* Dimension Scores */}
      <div className="mb-8">
        <DimensionScores dimensions={dimensions} />
      </div>

      {/* Stage-Specific Action Section */}
      {renderStageAction(stage, auditSession)}

      {/* Critical Findings - Show after audit complete */}
      {(stage === 'docs_needed' || stage === 'ready' || stage === 'building' || stage === 'complete') && (
        <div className="mb-8">
          <CriticalFindings findings={criticalFindings} />
        </div>
      )}

      {/* Quick Wins - Show after audit complete */}
      {(stage === 'docs_needed' || stage === 'ready' || stage === 'building' || stage === 'complete') && (
        <div className="mb-8">
          <QuickWins quickWins={quickWins} />
        </div>
      )}

      {/* Journey Progress - Always visible */}
      <div className="mb-8">
        <JourneyProgress
          currentStage={stage}
          stageCompletedDates={{
            assessment: auditSession.created_at,
            full_audit: auditSession.full_audit_completed_at,
          }}
        />
      </div>

      {/* Book a Call CTA - Show for appropriate stages */}
      {(stage === 'new' || stage === 'in_audit' || stage === 'docs_needed') && (
        <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif font-medium text-[#1a1a1a] mb-2">Have Questions?</h3>
              <p className="text-[#666] text-sm">
                Book a quick call to discuss your assessment results and next steps.
              </p>
            </div>
            <a
              href="https://cal.com/exit-layer/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-900 hover:bg-emerald-950 text-white font-medium rounded-full transition-colors flex-shrink-0"
            >
              Book a Call
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

// Render stage-specific action component
function renderStageAction(stage: ClientStage, session: AuditSession) {
  switch (stage) {
    case 'new':
    case 'in_audit':
      return (
        <div className="mb-8">
          <AuditProgress
            currentQuestion={session.full_audit_current_question || 0}
            totalQuestions={74}
            status={session.full_audit_status || 'not_started'}
          />
        </div>
      )
    case 'docs_needed':
      return (
        <div className="mb-8">
          <DocumentUpload
            uploadedDocuments={session.documents_uploaded || []}
          />
        </div>
      )
    case 'building':
      return (
        <div className="mb-8">
          <SprintProgress
            week={session.sprint_data?.week || 1}
            systems={session.sprint_data?.systems || []}
            hoursReclaimed={session.sprint_data?.hoursReclaimed || 0}
            milestones={session.sprint_data?.milestones || [
              { name: 'Foundation & Discovery', completed: false },
              { name: 'Core Systems Build', completed: false },
              { name: 'Integration & Testing', completed: false },
              { name: 'Handoff & Training', completed: false },
            ]}
          />
        </div>
      )
    case 'complete':
      // Calculate before/after metrics
      const dimensions = session.score_data?.dimensions || {}
      const beforeMultiple = session.score_data?.financialMetrics?.currentExitMultiple || 2
      return (
        <div className="mb-8">
          <BeforeAfter
            before={{
              exitMultiple: beforeMultiple,
              weeklyHoursSaved: 0,
              systemsAutomated: 0,
              revenueRiskScore: dimensions.revenueRisk || 40,
            }}
            after={{
              exitMultiple: 5,
              weeklyHoursSaved: session.sprint_data?.hoursReclaimed || 20,
              systemsAutomated: session.sprint_data?.systems?.length || 8,
              revenueRiskScore: Math.min(85, (dimensions.revenueRisk || 40) + 30),
            }}
          />
        </div>
      )
    case 'ready':
      return (
        <div className="mb-8">
          <div className="bg-white rounded-xl border border-[#e5e5e5] p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-900/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-serif font-medium text-[#1a1a1a]">All Set!</h3>
                <p className="text-[#666] text-sm">We have everything we need. Let's schedule your kickoff call.</p>
              </div>
              <Link
                href="/schedule"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-900 hover:bg-emerald-950 text-white font-medium rounded-full transition-colors"
              >
                Schedule Kickoff
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )
    default:
      return null
  }
}

// Helper: Find the primary constraint (lowest scoring dimension)
function findPrimaryConstraint(dimensions: Record<string, number | undefined>) {
  const dimensionLabels: Record<string, { label: string; description: string }> = {
    leverage: { label: 'Leverage', description: 'Your business depends too heavily on you personally' },
    equityPotential: { label: 'Equity Potential', description: 'Your exit readiness needs improvement' },
    revenueRisk: { label: 'Revenue Risk', description: 'Your income streams lack diversification' },
    productReadiness: { label: 'Product Readiness', description: 'Your services need more productization' },
    implementationCapacity: { label: 'Implementation Capacity', description: 'Your team needs more capability building' },
  }

  let lowest = { key: '', score: 101, label: '', description: '' }
  for (const [key, score] of Object.entries(dimensions)) {
    if (score !== undefined && score < lowest.score) {
      lowest = {
        key,
        score,
        label: dimensionLabels[key]?.label || key,
        description: dimensionLabels[key]?.description || '',
      }
    }
  }

  if (lowest.key) {
    return {
      dimension: lowest.label,
      score: lowest.score,
      description: lowest.description,
    }
  }
  return null
}

// Helper: Find the highest opportunity (highest scoring dimension)
function findHighestOpportunity(dimensions: Record<string, number | undefined>) {
  const dimensionLabels: Record<string, { label: string; description: string }> = {
    leverage: { label: 'Leverage', description: 'Strong owner independence - great foundation' },
    equityPotential: { label: 'Equity Potential', description: 'High exit readiness - attractive to buyers' },
    revenueRisk: { label: 'Revenue Risk', description: 'Stable income streams - low risk profile' },
    productReadiness: { label: 'Product Readiness', description: 'Well-productized services - scalable' },
    implementationCapacity: { label: 'Implementation Capacity', description: 'Strong team capability - can execute' },
  }

  let highest = { key: '', score: -1, label: '', description: '' }
  for (const [key, score] of Object.entries(dimensions)) {
    if (score !== undefined && score > highest.score) {
      highest = {
        key,
        score,
        label: dimensionLabels[key]?.label || key,
        description: dimensionLabels[key]?.description || '',
      }
    }
  }

  if (highest.key) {
    return {
      dimension: highest.label,
      score: highest.score,
      description: highest.description,
    }
  }
  return null
}

// Helper: Generate mock critical findings based on dimension scores
function generateMockFindings(dimensions: Record<string, number | undefined>) {
  const findings = []

  if ((dimensions.leverage ?? 100) < 50) {
    findings.push({
      id: 'leverage-critical',
      severity: 'critical' as const,
      title: 'High Owner Dependency',
      description: 'Too many critical processes require your direct involvement',
      impact: 'Limits scalability and reduces exit value',
    })
  }

  if ((dimensions.revenueRisk ?? 100) < 60) {
    findings.push({
      id: 'revenue-warning',
      severity: 'warning' as const,
      title: 'Revenue Concentration Risk',
      description: 'Too much revenue from too few clients',
      impact: 'Single client loss could significantly impact business',
    })
  }

  if ((dimensions.productReadiness ?? 100) < 50) {
    findings.push({
      id: 'product-warning',
      severity: 'warning' as const,
      title: 'Services Not Productized',
      description: 'Custom work for each client limits efficiency',
      impact: 'Higher costs and longer delivery times',
    })
  }

  if ((dimensions.implementationCapacity ?? 100) < 60) {
    findings.push({
      id: 'capacity-info',
      severity: 'info' as const,
      title: 'Team Skill Gaps',
      description: 'Some capabilities only exist with specific team members',
      impact: 'Knowledge concentration creates risk',
    })
  }

  return findings
}

// Helper: Generate mock quick wins based on dimension scores
function generateMockQuickWins(dimensions: Record<string, number | undefined>) {
  const quickWins = []

  if ((dimensions.leverage ?? 100) < 70) {
    quickWins.push({
      id: 'qw-sop',
      title: 'Document your top 3 recurring tasks',
      description: 'Create simple SOPs for tasks you do weekly',
      timeEstimate: '2 hours',
      impact: 'high' as const,
    })
  }

  quickWins.push({
    id: 'qw-delegate',
    title: 'Identify one task to delegate this week',
    description: 'Pick something you do regularly that someone else could handle',
    timeEstimate: '30 min',
    impact: 'high' as const,
  })

  if ((dimensions.productReadiness ?? 100) < 70) {
    quickWins.push({
      id: 'qw-package',
      title: 'Package one service offering',
      description: 'Turn a custom service into a fixed-scope package',
      timeEstimate: '1 hour',
      impact: 'medium' as const,
    })
  }

  quickWins.push({
    id: 'qw-template',
    title: 'Create a client onboarding checklist',
    description: 'Standardize your new client process',
    timeEstimate: '45 min',
    impact: 'medium' as const,
  })

  quickWins.push({
    id: 'qw-automate',
    title: 'Set up one automated email response',
    description: 'Automate a common inquiry or follow-up',
    timeEstimate: '20 min',
    impact: 'low' as const,
  })

  return quickWins.slice(0, 5)
}
