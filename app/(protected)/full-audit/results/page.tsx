import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// Helper to get score color
function getScoreColor(score: number): string {
  if (score >= 80) return '#064e3b'
  if (score >= 60) return '#b59f3b'
  if (score >= 40) return '#c77d3e'
  return '#a85454'
}

// Analyze delegation opportunities from full audit data
function analyzeDelegation(data: Record<string, any>) {
  const opportunities: { task: string; priority: 'high' | 'medium' | 'low'; reason: string }[] = []

  // Tasks only owner can do
  if (data.tasks_only_owner) {
    const tasks = data.tasks_only_owner.split(/[,\n]/).filter(Boolean)
    tasks.forEach((task: string) => {
      opportunities.push({
        task: task.trim(),
        priority: 'high',
        reason: 'Currently owner-only task - needs system or delegation'
      })
    })
  }

  // What they wish they could delegate
  if (data.wish_could_delegate) {
    opportunities.push({
      task: data.wish_could_delegate,
      priority: 'high',
      reason: 'Explicitly identified as pain point'
    })
  }

  // Decisions only owner makes
  if (data.decisions_only_owner) {
    const decisions = data.decisions_only_owner.split(/[,\n]/).filter(Boolean)
    decisions.forEach((decision: string) => {
      opportunities.push({
        task: `Decision: ${decision.trim()}`,
        priority: 'medium',
        reason: 'Needs decision framework to delegate'
      })
    })
  }

  return opportunities.slice(0, 10) // Top 10
}

// Analyze system building priorities
function analyzeSystemPriorities(data: Record<string, any>) {
  const systems: { name: string; impact: 'high' | 'medium' | 'low'; reason: string }[] = []

  // Based on what's not documented
  if (data.has_sops === 'No') {
    systems.push({
      name: 'Core Process Documentation',
      impact: 'high',
      reason: 'No SOPs exist - foundation needed'
    })
  }

  if (data.onboarding_documented === 'No') {
    systems.push({
      name: 'Client Onboarding System',
      impact: 'high',
      reason: 'Undocumented onboarding creates inconsistency'
    })
  }

  if (data.has_kickoff_checklist === 'No') {
    systems.push({
      name: 'Project Kickoff Checklist',
      impact: 'medium',
      reason: 'Quick win - easy to create, high impact'
    })
  }

  if (data.has_qc_checklist === 'No') {
    systems.push({
      name: 'Quality Control Checklist',
      impact: 'high',
      reason: 'Enables delegation of quality assurance'
    })
  }

  // What they want systematized
  if (data.top_systematize_need) {
    systems.push({
      name: data.top_systematize_need,
      impact: 'high',
      reason: 'Explicitly identified as top priority'
    })
  }

  // Delivery workflow
  if (data.core_delivery_walkthrough) {
    systems.push({
      name: 'Delivery Workflow Automation',
      impact: 'high',
      reason: 'Core service process needs systemization'
    })
  }

  return systems.slice(0, 8)
}

// Extract key insights from responses
function extractInsights(data: Record<string, any>, shortAssessment: Record<string, any>) {
  const insights: { category: string; finding: string; action: string }[] = []

  // Delegation blockers
  if (data.delegation_blockers && Array.isArray(data.delegation_blockers)) {
    const blockers = data.delegation_blockers
    if (blockers.includes('No clear process to follow')) {
      insights.push({
        category: 'Delegation',
        finding: 'Team lacks clear processes to follow',
        action: 'Document top 3 recurring tasks as SOPs'
      })
    }
    if (blockers.includes('I can do it faster myself')) {
      insights.push({
        category: 'Mindset',
        finding: 'Speed-trap: doing it yourself feels faster',
        action: 'Calculate true cost of not training team'
      })
    }
    if (blockers.includes('Clients expect to work with me')) {
      insights.push({
        category: 'Positioning',
        finding: 'Client expectations tied to owner',
        action: 'Introduce team members gradually on new clients'
      })
    }
  }

  // Training method
  if (data.training_method === 'I personally train everyone') {
    insights.push({
      category: 'Scalability',
      finding: 'Owner is the training bottleneck',
      action: 'Create onboarding documentation and video library'
    })
  }

  // Productization blockers
  if (data.product_blockers && Array.isArray(data.product_blockers)) {
    if (data.product_blockers.includes('Internal systems are too chaotic first')) {
      insights.push({
        category: 'Productization',
        finding: 'Internal chaos blocking product development',
        action: 'Stabilize core delivery before launching product'
      })
    }
  }

  // Revenue model vs vision
  if (shortAssessment?.revenue_model === 'Mostly project-based' && data.revenue_goal_12mo) {
    insights.push({
      category: 'Revenue',
      finding: 'Project-based model limits recurring revenue',
      action: 'Identify retainer opportunity within current services'
    })
  }

  return insights.slice(0, 6)
}

export default async function FullAuditResultsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's audit session
  const { data: auditSession } = await supabase
    .from('audit_sessions')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['submitted', 'account_created'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!auditSession) {
    redirect('/dashboard')
  }

  // Check if full audit is completed
  if (auditSession.full_audit_status !== 'completed') {
    redirect('/full-audit')
  }

  const fullAuditData = auditSession.full_audit_data || {}
  const shortAssessmentData = auditSession.form_data || {}
  const scoreData = auditSession.score_data || {}

  // Generate analysis
  const delegationOpportunities = analyzeDelegation(fullAuditData)
  const systemPriorities = analyzeSystemPriorities(fullAuditData)
  const keyInsights = extractInsights(fullAuditData, shortAssessmentData)

  // Section completion stats
  const sections = [
    { name: 'Services & Revenue', key: 'pricing_models' },
    { name: 'Owner Tasks', key: 'tasks_only_owner' },
    { name: 'Systems & Tools', key: 'has_sops' },
    { name: 'Team Details', key: 'team_ft' },
    { name: 'Market & Productization', key: 'agency_description' },
    { name: 'Vision', key: 'vision_12mo' },
    { name: 'Delivery Workflow', key: 'core_delivery_walkthrough' },
    { name: 'Final Insights', key: 'other_notes' },
  ]

  const completedSections = sections.filter(s => fullAuditData[s.key]).length

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0d1c18] via-emerald-950 to-[#0a1612] py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-2 text-emerald-400/60 text-sm mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Full Audit Complete
          </div>
          <h1
            className="text-3xl md:text-4xl font-serif font-medium tracking-tight mb-4"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 40%, rgba(167,243,208,0.85) 80%, rgba(110,231,183,0.7) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Your Transformation Roadmap
          </h1>
          <p className="text-white/50 max-w-xl">
            Based on your {completedSections} completed sections and {Object.keys(fullAuditData).length} responses,
            here&apos;s your personalized action plan.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Overall Score Reminder */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-1">Overall Score</h2>
              <p className="text-[#666] text-sm">From your initial assessment</p>
            </div>
            <div className="text-right">
              <span
                className="text-5xl font-serif font-medium"
                style={{ color: getScoreColor(scoreData.overall || 0) }}
              >
                {scoreData.overall || 0}
              </span>
              <span className="text-[#ccc] text-xl">/100</span>
            </div>
          </div>
        </div>

        {/* Delegation Roadmap */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden mb-8">
          <div className="p-6 border-b border-[#e5e5e5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-900/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-serif font-medium text-[#1a1a1a]">Delegation Roadmap</h2>
                <p className="text-[#666] text-sm">Tasks to remove from your plate</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {delegationOpportunities.length > 0 ? (
              <div className="space-y-3">
                {delegationOpportunities.map((opp, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border ${
                      opp.priority === 'high'
                        ? 'bg-red-50/50 border-red-200/50'
                        : opp.priority === 'medium'
                        ? 'bg-yellow-50/50 border-yellow-200/50'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium text-[#1a1a1a]">{opp.task}</div>
                        <div className="text-sm text-[#666] mt-1">{opp.reason}</div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                        opp.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : opp.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {opp.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#666] text-center py-4">
                Complete the delegation questions to see opportunities
              </p>
            )}
          </div>
        </div>

        {/* System Building Priorities */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden mb-8">
          <div className="p-6 border-b border-[#e5e5e5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#b59f3b]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#b59f3b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-serif font-medium text-[#1a1a1a]">System Building Priorities</h2>
                <p className="text-[#666] text-sm">What to build first</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {systemPriorities.length > 0 ? (
              <div className="space-y-3">
                {systemPriorities.map((sys, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-[#f8f8f6] rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      sys.impact === 'high'
                        ? 'bg-emerald-900 text-white'
                        : sys.impact === 'medium'
                        ? 'bg-[#b59f3b] text-white'
                        : 'bg-[#999] text-white'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-[#1a1a1a]">{sys.name}</div>
                      <div className="text-sm text-[#666]">{sys.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#666] text-center py-4">
                Complete the systems questions to see priorities
              </p>
            )}
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden mb-8">
          <div className="p-6 border-b border-[#e5e5e5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#c77d3e]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#c77d3e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-serif font-medium text-[#1a1a1a]">Key Insights</h2>
                <p className="text-[#666] text-sm">Patterns we noticed in your responses</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {keyInsights.length > 0 ? (
              <div className="space-y-4">
                {keyInsights.map((insight, i) => (
                  <div key={i} className="border-l-2 border-emerald-800 pl-4">
                    <div className="text-xs font-medium text-emerald-800 uppercase tracking-wider mb-1">
                      {insight.category}
                    </div>
                    <div className="font-medium text-[#1a1a1a] mb-1">{insight.finding}</div>
                    <div className="text-sm text-[#666]">
                      <span className="font-medium">Action:</span> {insight.action}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#666] text-center py-4">
                Complete more sections to unlock insights
              </p>
            )}
          </div>
        </div>

        {/* Vision Alignment */}
        {fullAuditData.vision_12mo && (
          <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden mb-8">
            <div className="p-6 border-b border-[#e5e5e5]">
              <h2 className="text-lg font-serif font-medium text-[#1a1a1a]">Your 12-Month Vision</h2>
            </div>
            <div className="p-6">
              <blockquote className="text-[#1a1a1a] italic border-l-2 border-emerald-800 pl-4">
                &ldquo;{fullAuditData.vision_12mo}&rdquo;
              </blockquote>
              {fullAuditData.personal_success_definition && (
                <div className="mt-4 pt-4 border-t border-[#e5e5e5]">
                  <div className="text-sm text-[#666] mb-1">Personal definition of success:</div>
                  <div className="text-[#1a1a1a]">{fullAuditData.personal_success_definition}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Steps CTA */}
        <div className="bg-gradient-to-br from-[#0d1c18] via-emerald-950 to-[#0a1612] rounded-xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2
              className="text-2xl font-serif font-medium mb-3"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(167,243,208,0.85) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Ready to Start Building?
            </h2>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Book your implementation call to turn this roadmap into a 4-week sprint plan.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href={`mailto:michael@exitlayer.io?subject=ExitLayer%20Implementation%20Call%20-%20${encodeURIComponent(auditSession.company_name || 'My Agency')}`}
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-emerald-900 font-medium rounded-full hover:bg-emerald-50 transition-colors"
              >
                Book Implementation Call
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <Link
                href="/dashboard"
                className="text-white/60 hover:text-white transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
