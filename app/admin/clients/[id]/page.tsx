import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AdminClientActions from './AdminClientActions'

// Helper to get score color
function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#eab308'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch submission with profile
  const { data: submission, error } = await supabase
    .from('submissions')
    .select(`
      *,
      profiles:user_id (
        id,
        email,
        full_name,
        company_name
      )
    `)
    .eq('id', id)
    .single()

  if (error || !submission) {
    notFound()
  }

  // Fetch pipeline stages
  const { data: pipelineStages } = await supabase
    .from('pipeline_stages')
    .select('*')
    .eq('submission_id', id)
    .order('created_at', { ascending: true })

  // Fetch client assets
  const { data: assets } = await supabase
    .from('client_assets')
    .select('*')
    .eq('submission_id', id)
    .order('created_at', { ascending: false })

  // Fetch admin notes
  const { data: notes } = await supabase
    .from('admin_notes')
    .select('*')
    .eq('submission_id', id)
    .order('created_at', { ascending: false })

  const questionnaire = submission.questionnaire_data || {}
  const dimensions = submission.dimension_scores || {}
  const financialMetrics = submission.financial_metrics || {}
  const callPrep = submission.call_prep

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/clients"
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">
            {submission.profiles?.company_name || 'Unknown Company'}
          </h1>
          <p className="text-gray-400">
            {submission.profiles?.full_name} • {submission.profiles?.email}
          </p>
        </div>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
          style={{ backgroundColor: getScoreColor(submission.overall_score) }}
        >
          {submission.overall_score}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dimension scores */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">Dimension Breakdown</h2>
            <div className="grid grid-cols-5 gap-4">
              {[
                { key: 'leverage', label: 'Leverage' },
                { key: 'equityPotential', label: 'Equity' },
                { key: 'revenueRisk', label: 'Revenue' },
                { key: 'productReadiness', label: 'Product' },
                { key: 'implementationCapacity', label: 'Capacity' },
              ].map((dim) => (
                <div key={dim.key} className="text-center">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: getScoreColor(dimensions[dim.key] || 0) }}
                  >
                    {dimensions[dim.key] || 0}
                  </div>
                  <div className="text-gray-400 text-sm">{dim.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key metrics */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">Key Metrics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-gray-400 text-sm">Annual Revenue</div>
                <div className="text-xl font-bold text-white">
                  ${((questionnaire.annual_revenue || 0) / 1000).toFixed(0)}K
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Team Size</div>
                <div className="text-xl font-bold text-white">
                  {questionnaire.team_size || 0} people
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Weekly Hours</div>
                <div className="text-xl font-bold text-white">
                  {financialMetrics.totalWeeklyHours || 0} hrs
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Owner Hourly Value</div>
                <div className="text-xl font-bold text-white">
                  ${financialMetrics.ownerHourlyValue || 0}/hr
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Exit Multiple</div>
                <div className="text-xl font-bold text-white">
                  {financialMetrics.currentExitMultiple || 2}x
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Value Gap</div>
                <div className="text-xl font-bold text-red-400">
                  ${((financialMetrics.valueGap || 0) / 1000000).toFixed(1)}M
                </div>
              </div>
            </div>
          </div>

          {/* Call Prep Summary */}
          {callPrep && (
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold text-white mb-4">Call Prep Highlights</h2>

              {callPrep.buildHypothesis && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                    Build Hypothesis
                  </h3>
                  <div className="space-y-2">
                    {callPrep.buildHypothesis.slice(0, 5).map((item: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-gray-300">
                        <span className="text-blue-400">•</span>
                        <span>{item.system}: {item.hypothesis}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {callPrep.redFlags && callPrep.redFlags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                    Red Flags to Probe
                  </h3>
                  <div className="space-y-2">
                    {callPrep.redFlags.map((flag: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-red-300">
                        <span className="text-red-400">⚠</span>
                        <span>{flag.flag}: {flag.probeQuestions?.[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Questionnaire Data */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">Full Questionnaire Data</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(questionnaire).map(([key, value]) => (
                <div key={key} className="border-b border-gray-800 pb-3">
                  <div className="text-gray-400 text-sm mb-1">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="text-white">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions - Client Component */}
          <AdminClientActions
            submissionId={id}
            currentStatus={submission.status}
            existingNotes={notes || []}
          />

          {/* Client Assets */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Client Assets</h3>
            {assets && assets.length > 0 ? (
              <div className="space-y-2">
                {assets.map((asset: any) => (
                  <div
                    key={asset.id}
                    className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{asset.file_name}</p>
                      <p className="text-gray-500 text-xs">{asset.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No assets uploaded yet.</p>
            )}
          </div>

          {/* Pipeline History */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Pipeline History</h3>
            {pipelineStages && pipelineStages.length > 0 ? (
              <div className="space-y-3">
                {pipelineStages.map((stage: any) => (
                  <div key={stage.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-white text-sm font-medium capitalize">
                        {stage.stage.replace(/_/g, ' ')}
                      </p>
                      {stage.notes && (
                        <p className="text-gray-400 text-sm">{stage.notes}</p>
                      )}
                      <p className="text-gray-500 text-xs">
                        {new Date(stage.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No pipeline history yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
