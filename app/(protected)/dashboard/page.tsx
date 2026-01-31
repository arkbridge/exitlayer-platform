import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// Helper to get score color
function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e' // green-500
  if (score >= 60) return '#eab308' // yellow-500
  if (score >= 40) return '#f97316' // orange-500
  return '#ef4444' // red-500
}

// Pipeline stages
const PIPELINE_STAGES = [
  { id: 'submitted', label: 'Submitted', icon: '📝' },
  { id: 'review', label: 'In Review', icon: '🔍' },
  { id: 'call_scheduled', label: 'Call Scheduled', icon: '📅' },
  { id: 'call_complete', label: 'Call Complete', icon: '✅' },
  { id: 'building', label: 'Building', icon: '🔧' },
  { id: 'complete', label: 'Complete', icon: '🚀' },
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
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center">
            <span className="text-4xl">📋</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Welcome to ExitLayer
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            Complete your agency diagnostic to unlock your personalized transformation roadmap.
          </p>
          <Link
            href="/questionnaire"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
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
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Your ExitLayer Dashboard
        </h1>
        <p className="text-gray-400">
          Track your transformation journey and access your diagnostic results.
        </p>
      </div>

      {/* Score Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Overall Score */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="text-gray-400 text-sm font-medium mb-2">Overall Score</div>
          <div className="flex items-end gap-2">
            <span
              className="text-5xl font-bold"
              style={{ color: getScoreColor(score) }}
            >
              {score}
            </span>
            <span className="text-gray-500 text-xl mb-1">/100</span>
          </div>
          <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }}
            />
          </div>
        </div>

        {/* Owner Tax */}
        <div className="bg-gradient-to-br from-red-950 to-gray-900 rounded-2xl p-6 border border-red-900/50">
          <div className="text-red-300 text-sm font-medium mb-2">Annual Owner Tax</div>
          <div className="text-4xl font-bold text-white">
            ${Math.round((financialMetrics.ownerHourlyValue || 0) * (submission.questionnaire_data?.wasted_hours_week || 10) * 52 / 1000)}K
          </div>
          <p className="text-red-200/60 text-sm mt-2">
            Lost to tasks below your pay grade
          </p>
        </div>

        {/* Exit Value Gap */}
        <div className="bg-gradient-to-br from-blue-950 to-gray-900 rounded-2xl p-6 border border-blue-900/50">
          <div className="text-blue-300 text-sm font-medium mb-2">Exit Value Gap</div>
          <div className="text-4xl font-bold text-white">
            ${((financialMetrics.valueGap || 0) / 1000000).toFixed(1)}M
          </div>
          <p className="text-blue-200/60 text-sm mt-2">
            {financialMetrics.currentExitMultiple || 2}x → 5x potential
          </p>
        </div>
      </div>

      {/* Dimension Scores */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Dimension Breakdown</h2>
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
                className="text-3xl font-bold mb-1"
                style={{ color: getScoreColor(dimensions[dim.key] || 0) }}
              >
                {dimensions[dim.key] || 0}
              </div>
              <div className="text-white font-medium text-sm">{dim.label}</div>
              <div className="text-gray-500 text-xs">{dim.description}</div>
              <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
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
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-8">
        <h2 className="text-lg font-semibold text-white mb-6">Your Journey</h2>
        <div className="flex items-center justify-between">
          {PIPELINE_STAGES.map((stage, index) => {
            const isComplete = index <= currentStageIndex
            const isCurrent = index === currentStageIndex
            const stageData = pipelineStages?.find(p => p.stage === stage.id)

            return (
              <div key={stage.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
                      isCurrent
                        ? 'bg-blue-600 ring-4 ring-blue-600/30'
                        : isComplete
                        ? 'bg-green-600'
                        : 'bg-gray-800'
                    }`}
                  >
                    {stage.icon}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isCurrent ? 'text-blue-400' : isComplete ? 'text-green-400' : 'text-gray-500'
                    }`}
                  >
                    {stage.label}
                  </span>
                  {stageData?.completed_at && (
                    <span className="text-[10px] text-gray-600">
                      {new Date(stageData.completed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {index < PIPELINE_STAGES.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      index < currentStageIndex ? 'bg-green-600' : 'bg-gray-800'
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
        <div className="bg-gradient-to-br from-emerald-950 to-gray-900 rounded-2xl p-6 border border-emerald-900/50">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h3 className="text-lg font-semibold text-white">Highest Opportunity</h3>
          </div>
          <p className="text-emerald-200 font-medium mb-2">
            {analysis.highestOpportunity?.dimension || 'Leverage'}
          </p>
          <p className="text-emerald-200/70 text-sm">
            {analysis.highestOpportunity?.description || 'Focus on reducing owner dependency to unlock growth.'}
          </p>
        </div>

        {/* Book a Call */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-3">Ready for the Next Step?</h3>
          <p className="text-gray-400 text-sm mb-4">
            Book your discovery call to map out your personalized transformation plan.
          </p>
          <a
            href="mailto:michael@exitlayer.io?subject=ExitLayer%20Discovery%20Call%20-%20${profile?.company_name || 'My Agency'}"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
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
          className="text-gray-400 hover:text-white text-sm inline-flex items-center gap-2 transition-colors"
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
