import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// Helper to get score color
function getScoreColor(score: number): string {
  if (score >= 80) return '#2d4a2d' // green (thesis color)
  if (score >= 60) return '#b59f3b' // muted gold
  if (score >= 40) return '#c77d3e' // muted orange
  return '#a85454' // muted red
}

// Pipeline stages
const PIPELINE_STAGES = [
  { id: 'submitted', label: 'Submitted', icon: '1' },
  { id: 'review', label: 'In Review', icon: '2' },
  { id: 'call_scheduled', label: 'Call Scheduled', icon: '3' },
  { id: 'call_complete', label: 'Call Complete', icon: '4' },
  { id: 'building', label: 'Building', icon: '5' },
  { id: 'complete', label: 'Complete', icon: '6' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's submission
  const { data: submission } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Fetch pipeline stages for this submission
  const { data: pipelineStages } = await supabase
    .from('pipeline_stages')
    .select('*')
    .eq('submission_id', submission?.id)
    .order('created_at', { ascending: true })

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Determine current stage
  const currentStageIndex = pipelineStages?.length
    ? PIPELINE_STAGES.findIndex(s => s.id === pipelineStages[pipelineStages.length - 1].stage)
    : 0

  // If no submission, show prompt to take questionnaire
  if (!submission) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center">
          <div className="text-6xl mb-6">📋</div>
          <h1 className="text-3xl font-serif font-medium text-[#1a1a1a] mb-4">
            Welcome to ExitLayer
          </h1>
          <p className="text-[#666] text-lg mb-8 max-w-md mx-auto">
            Complete your agency diagnostic to unlock your personalized transformation roadmap.
          </p>
          <Link
            href="/questionnaire"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#2d4a2d] hover:bg-[#1a2e1a] text-white font-medium rounded-full transition-colors"
          >
            Start Your Diagnostic
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    )
  }

  const score = submission.overall_score
  const dimensions = submission.dimension_scores || {}
  const financialMetrics = submission.financial_metrics || {}
  const analysis = submission.analysis || {}

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-medium text-[#1a1a1a] mb-2">
          Your Dashboard
        </h1>
        <p className="text-[#666]">
          Track your transformation journey and access your diagnostic results.
        </p>
      </div>

      {/* Documents Required - Front and Center */}
      <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden mb-8">
        <div className="p-6 border-b border-[#e5e5e5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#c77d3e]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#c77d3e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-serif font-medium text-[#1a1a1a]">Action Required: Upload Documents</h3>
              <p className="text-[#666] text-sm">We need these before scheduling your implementation call</p>
            </div>
          </div>
          <span className="text-xs font-medium text-[#c77d3e] bg-[#c77d3e]/10 px-3 py-1 rounded-full">0 of 4 uploaded</span>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-4">
          {[
            { name: 'Service Offerings Document', desc: 'Your current services, pricing, and packages', icon: '📋', uploaded: false },
            { name: 'Sample Client Deliverable', desc: 'A recent project or report you delivered', icon: '📄', uploaded: false },
            { name: 'Team Structure / Org Chart', desc: 'Who does what on your team', icon: '👥', uploaded: false },
            { name: 'Current SOPs (if any)', desc: 'Any documented processes you have', icon: '📝', uploaded: false },
          ].map((doc, i) => (
            <div key={i} className={`flex items-center gap-4 p-4 rounded-lg border ${doc.uploaded ? 'bg-[#2d4a2d]/5 border-[#2d4a2d]/20' : 'bg-[#f8f8f6] border-[#e5e5e5]'}`}>
              <span className="text-2xl">{doc.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[#1a1a1a] truncate">{doc.name}</div>
                <div className="text-sm text-[#666] truncate">{doc.desc}</div>
              </div>
              {doc.uploaded ? (
                <svg className="w-5 h-5 text-[#2d4a2d] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="text-xs text-[#999] flex-shrink-0">Missing</span>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 bg-[#f8f8f6] border-t border-[#e5e5e5] flex items-center justify-between">
          <p className="text-[#666] text-sm">
            These help us prepare a tailored action plan for your implementation call.
          </p>
          <Link
            href="/assets"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2d4a2d] text-white font-medium rounded-full hover:bg-[#1a2e1a] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Documents
          </Link>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Overall Score */}
        <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
          <div className="text-[#999] text-sm mb-2">Overall Score</div>
          <div className="flex items-end gap-2">
            <span
              className="text-5xl font-serif font-medium"
              style={{ color: getScoreColor(score) }}
            >
              {score}
            </span>
            <span className="text-[#ccc] text-xl mb-1">/100</span>
          </div>
          <div className="mt-4 h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }}
            />
          </div>
        </div>

        {/* Owner Tax */}
        <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
          <div className="text-[#a85454] text-sm mb-2">Annual Owner Tax</div>
          <div className="text-4xl font-serif font-medium text-[#1a1a1a]">
            ${Math.round((financialMetrics.ownerHourlyValue || 0) * (submission.questionnaire_data?.wasted_hours_week || 10) * 52 / 1000)}K
          </div>
          <p className="text-[#999] text-sm mt-2">
            Lost to tasks below your pay grade
          </p>
        </div>

        {/* Exit Value Gap */}
        <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
          <div className="text-[#2d4a2d] text-sm mb-2">Exit Value Gap</div>
          <div className="text-4xl font-serif font-medium text-[#1a1a1a]">
            ${((financialMetrics.valueGap || 0) / 1000000).toFixed(1)}M
          </div>
          <p className="text-[#999] text-sm mt-2">
            {financialMetrics.currentExitMultiple || 2}x → 5x potential
          </p>
        </div>
      </div>

      {/* Dimension Scores */}
      <div className="bg-white rounded-xl p-6 border border-[#e5e5e5] mb-8">
        <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Dimension Breakdown</h2>
        <div className="grid grid-cols-5 gap-4">
          {[
            { key: 'leverage', label: 'Leverage', description: 'Owner time independence' },
            { key: 'equityPotential', label: 'Equity', description: 'Exit-readiness' },
            { key: 'revenueRisk', label: 'Revenue', description: 'Income stability' },
            { key: 'productReadiness', label: 'Product', description: 'Productization level' },
            { key: 'implementationCapacity', label: 'Capacity', description: 'Team capability' },
          ].map((dim) => (
            <div key={dim.key} className="text-center">
              <div
                className="text-3xl font-serif font-medium mb-1"
                style={{ color: getScoreColor(dimensions[dim.key] || 0) }}
              >
                {dimensions[dim.key] || 0}
              </div>
              <div className="text-[#1a1a1a] font-medium text-sm">{dim.label}</div>
              <div className="text-[#999] text-xs">{dim.description}</div>
              <div className="mt-2 h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${dimensions[dim.key] || 0}%`,
                    backgroundColor: getScoreColor(dimensions[dim.key] || 0)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Progress */}
      <div className="bg-white rounded-xl p-6 border border-[#e5e5e5] mb-8">
        <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-6">Your Journey</h2>
        <div className="flex items-center justify-between">
          {PIPELINE_STAGES.map((stage, index) => {
            const isComplete = index <= currentStageIndex
            const isCurrent = index === currentStageIndex
            const stageData = pipelineStages?.find(p => p.stage === stage.id)

            return (
              <div key={stage.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      isCurrent
                        ? 'bg-[#2d4a2d] text-white ring-4 ring-[#2d4a2d]/20'
                        : isComplete
                        ? 'bg-[#2d4a2d] text-white'
                        : 'bg-[#e5e5e5] text-[#999]'
                    }`}
                  >
                    {stage.icon}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isCurrent ? 'text-[#2d4a2d]' : isComplete ? 'text-[#2d4a2d]' : 'text-[#999]'
                    }`}
                  >
                    {stage.label}
                  </span>
                  {stageData?.completed_at && (
                    <span className="text-[10px] text-[#ccc]">
                      {new Date(stageData.completed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {index < PIPELINE_STAGES.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded ${
                      index < currentStageIndex ? 'bg-[#2d4a2d]' : 'bg-[#e5e5e5]'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Key Insights & CTA */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Opportunity */}
        <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-[#2d4a2d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h3 className="text-lg font-medium text-[#1a1a1a]">Highest Opportunity</h3>
          </div>
          <p className="text-[#2d4a2d] font-medium mb-2">
            {analysis.highestOpportunity?.dimension || 'Leverage'}
          </p>
          <p className="text-[#666] text-sm">
            {analysis.highestOpportunity?.description || 'Focus on reducing owner dependency to unlock growth.'}
          </p>
        </div>

        {/* Book a Call */}
        <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
          <h3 className="text-lg font-medium text-[#1a1a1a] mb-3">Ready for the Next Step?</h3>
          <p className="text-[#666] text-sm mb-4">
            Book your implementation call to map out your personalized transformation plan.
          </p>
          <a
            href={`mailto:michael@exitlayer.io?subject=ExitLayer%20Discovery%20Call%20-%20${encodeURIComponent(profile?.company_name || 'My Agency')}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2d4a2d] hover:bg-[#1a2e1a] text-white font-medium rounded-full transition-colors"
          >
            Book a Call
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      {/* Upload Assets Link */}
      <div className="mt-8 text-center">
        <Link
          href="/assets"
          className="text-[#666] hover:text-[#1a1a1a] text-sm inline-flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload SOPs, templates, and other assets for your transformation
        </Link>
      </div>
    </div>
  )
}
