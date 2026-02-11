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

// Helper to get priority color
function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'P0': return '#ef4444'
    case 'P1': return '#f97316'
    case 'P2': return '#eab308'
    case 'P3': return '#22c55e'
    default: return '#666'
  }
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
  const systemSpec = submission.system_spec

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/clients"
          className="p-2 text-[#666] hover:text-[#1a1a1a] hover:bg-white rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-serif font-medium text-[#1a1a1a]">
            {submission.profiles?.company_name || 'Unknown Company'}
          </h1>
          <p className="text-[#666]">
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
          <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
            <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Dimension Breakdown</h2>
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
                  <div className="text-[#666] text-sm">{dim.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key metrics */}
          <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
            <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Key Metrics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-[#666] text-sm">Annual Revenue</div>
                <div className="text-xl font-bold text-[#1a1a1a]">
                  ${((questionnaire.annual_revenue || 0) / 1000).toFixed(0)}K
                </div>
              </div>
              <div>
                <div className="text-[#666] text-sm">Team Size</div>
                <div className="text-xl font-bold text-[#1a1a1a]">
                  {questionnaire.team_size || 0} people
                </div>
              </div>
              <div>
                <div className="text-[#666] text-sm">Weekly Hours</div>
                <div className="text-xl font-bold text-[#1a1a1a]">
                  {financialMetrics.totalWeeklyHours || 0} hrs
                </div>
              </div>
              <div>
                <div className="text-[#666] text-sm">Owner Hourly Value</div>
                <div className="text-xl font-bold text-[#1a1a1a]">
                  ${financialMetrics.ownerHourlyValue || 0}/hr
                </div>
              </div>
              <div>
                <div className="text-[#666] text-sm">Exit Multiple</div>
                <div className="text-xl font-bold text-[#1a1a1a]">
                  {financialMetrics.currentExitMultiple || 2}x
                </div>
              </div>
              <div>
                <div className="text-[#666] text-sm">Value Gap</div>
                <div className="text-xl font-bold text-[#ef4444]">
                  ${((financialMetrics.valueGap || 0) / 1000000).toFixed(1)}M
                </div>
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* FULL CALL PREP DOCUMENT */}
          {/* ============================================== */}
          {callPrep && (
            <>
              {/* Quick Context */}
              {callPrep.quickContext && (
                <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
                  <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Quick Context</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#666]">Revenue:</span>{' '}
                      <span className="text-[#1a1a1a] font-medium">{callPrep.quickContext.revenue}</span>
                      <span className="text-[#666]"> ({callPrep.quickContext.recurringPct}% recurring)</span>
                    </div>
                    <div>
                      <span className="text-[#666]">Team Size:</span>{' '}
                      <span className="text-[#1a1a1a] font-medium">{callPrep.quickContext.teamSize} people</span>
                    </div>
                    <div>
                      <span className="text-[#666]">Owner Hours:</span>{' '}
                      <span className="text-[#1a1a1a] font-medium">{callPrep.quickContext.ownerHours}/week</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#666]">Pain Summary:</span>{' '}
                      <span className="text-[#1a1a1a]">{callPrep.quickContext.painSummary}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Build Hypothesis */}
              {callPrep.buildHypothesis && callPrep.buildHypothesis.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
                  <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Build Hypothesis</h2>
                  <p className="text-[#666] text-sm mb-4">Based on questionnaire answers, I'm thinking we build:</p>
                  <div className="space-y-3">
                    {callPrep.buildHypothesis.map((item: any, i: number) => (
                      <div key={i} className="p-4 bg-[#f8f8f6] rounded-lg border border-[#e5e5e5]">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-medium text-white bg-emerald-900 px-2 py-1 rounded-full">
                            P{item.priority}
                          </span>
                          <span className="font-medium text-[#1a1a1a]">{item.system}</span>
                          {item.hoursReclaimed && (
                            <span className="text-xs text-emerald-800 ml-auto">
                              ~{item.hoursReclaimed} hrs/week saved
                            </span>
                          )}
                        </div>
                        <p className="text-[#666] text-sm">{item.why}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Call Sections - THE QUESTIONS TO ASK */}
              {callPrep.callSections && callPrep.callSections.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
                  <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">
                    Implementation Call Questions
                  </h2>
                  <p className="text-[#666] text-sm mb-6">
                    These are the questions to ask during the call to validate hypotheses and extract system specs.
                  </p>
                  <div className="space-y-6">
                    {callPrep.callSections.map((section: any, i: number) => (
                      <div key={i} className="border-l-4 border-emerald-800 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-[#1a1a1a]">
                            {i + 1}. {section.title}
                          </h3>
                          <span className="text-xs text-[#666] bg-[#f0f0f0] px-2 py-0.5 rounded">
                            {section.duration}
                          </span>
                        </div>
                        <p className="text-sm text-emerald-800 italic mb-3">Goal: {section.goal}</p>
                        <div className="space-y-2 mb-4">
                          {section.questions.map((q: string, qi: number) => (
                            <div key={qi} className="flex items-start gap-2 text-sm">
                              <span className="text-emerald-800 font-bold mt-0.5">→</span>
                              <span className="text-[#1a1a1a]">"{q}"</span>
                            </div>
                          ))}
                        </div>
                        {section.listenFor && (
                          <div className="bg-[#fffbeb] p-3 rounded-lg">
                            <p className="text-xs font-medium text-[#92400e] uppercase mb-1">Listen for:</p>
                            <ul className="text-sm text-[#78350f] space-y-1">
                              {section.listenFor.map((l: string, li: number) => (
                                <li key={li}>• {l}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Red Flags */}
              {callPrep.redFlags && callPrep.redFlags.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
                  <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">
                    Red Flags / Contradictions to Probe
                  </h2>
                  <div className="space-y-4">
                    {callPrep.redFlags.map((flag: any, i: number) => (
                      <div key={i} className="p-4 bg-[#fef2f2] rounded-lg border border-[#fecaca]">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">⚠️</span>
                          <div>
                            <p className="font-medium text-[#991b1b]">{flag.observation}</p>
                            <p className="text-sm text-[#b91c1c] mt-1">Probe: {flag.probe}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show Me Requests */}
              {callPrep.showMeRequests && callPrep.showMeRequests.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
                  <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">
                    "Show Me" Requests
                  </h2>
                  <p className="text-[#666] text-sm mb-4">If possible, have them share screen for:</p>
                  <div className="space-y-3">
                    {callPrep.showMeRequests.map((req: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-[#f8f8f6] rounded-lg">
                        <span className="text-lg">📋</span>
                        <div>
                          <p className="font-medium text-[#1a1a1a]">{req.item}</p>
                          <p className="text-sm text-[#666]">{req.why}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Wins */}
              {callPrep.quickWins && callPrep.quickWins.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
                  <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">
                    Quick Wins to Mention
                  </h2>
                  <p className="text-[#666] text-sm mb-4">To build momentum and show we can move fast:</p>
                  <div className="space-y-2">
                    {callPrep.quickWins.map((win: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-emerald-800">✓</span>
                        <span className="text-[#1a1a1a]">"{win}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ============================================== */}
          {/* SYSTEM SPECIFICATIONS */}
          {/* ============================================== */}
          {systemSpec && systemSpec.systems && systemSpec.systems.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif font-medium text-[#1a1a1a]">
                  Systems to Build
                </h2>
                {systemSpec.summary && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-[#666]">
                      <span className="font-bold text-[#1a1a1a]">{systemSpec.summary.totalSystemsTooBuild}</span> total
                    </span>
                    <span className="text-[#ef4444]">
                      <span className="font-bold">{systemSpec.summary.p0Systems}</span> P0
                    </span>
                    <span className="text-[#f97316]">
                      <span className="font-bold">{systemSpec.summary.p1Systems}</span> P1
                    </span>
                    <span className="text-emerald-800">
                      ~<span className="font-bold">{systemSpec.summary.weeklyHoursReclaimed}</span> hrs/week saved
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {systemSpec.systems.map((system: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 border rounded-lg"
                    style={{ borderLeftColor: getPriorityColor(system.priority), borderLeftWidth: '4px' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold text-white px-2 py-0.5 rounded"
                          style={{ backgroundColor: getPriorityColor(system.priority) }}
                        >
                          {system.priority}
                        </span>
                        <span className="text-xs text-[#666] bg-[#f0f0f0] px-2 py-0.5 rounded capitalize">
                          {system.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-[#666] bg-[#f0f0f0] px-2 py-0.5 rounded capitalize">
                          {system.category.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-[#666]">{system.estimatedBuildTime}</span>
                    </div>
                    <h3 className="font-medium text-[#1a1a1a] mb-1">{system.name}</h3>
                    <p className="text-sm text-[#666] mb-3">{system.description}</p>

                    {system.prd && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-emerald-800 font-medium hover:underline">
                          View PRD Details
                        </summary>
                        <div className="mt-3 pl-4 border-l-2 border-[#e5e5e5] space-y-3">
                          <div>
                            <span className="font-medium text-[#1a1a1a]">Problem:</span>
                            <p className="text-[#666]">{system.prd.problem}</p>
                          </div>
                          <div>
                            <span className="font-medium text-[#1a1a1a]">Solution:</span>
                            <p className="text-[#666]">{system.prd.solution}</p>
                          </div>
                          {system.prd.workflow && system.prd.workflow.length > 0 && (
                            <div>
                              <span className="font-medium text-[#1a1a1a]">Workflow:</span>
                              <ol className="list-decimal list-inside text-[#666] mt-1">
                                {system.prd.workflow.map((step: string, si: number) => (
                                  <li key={si}>{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                          {system.prd.successMetrics && (
                            <div>
                              <span className="font-medium text-[#1a1a1a]">Success Metrics:</span>
                              <ul className="list-disc list-inside text-[#666] mt-1">
                                {system.prd.successMetrics.map((m: string, mi: number) => (
                                  <li key={mi}>{m}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* BUILD PLAN / TIMELINE */}
          {/* ============================================== */}
          {systemSpec && systemSpec.weekByWeekBuildPlan && systemSpec.weekByWeekBuildPlan.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
              <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">
                Week-by-Week Build Plan
              </h2>
              <div className="space-y-4">
                {systemSpec.weekByWeekBuildPlan.map((week: any, i: number) => (
                  <div key={i} className="p-4 bg-[#f8f8f6] rounded-lg border border-[#e5e5e5]">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-8 bg-emerald-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {week.week}
                      </span>
                      <h3 className="font-medium text-[#1a1a1a]">{week.focus}</h3>
                    </div>
                    {week.systems && week.systems.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-[#666] uppercase font-medium mb-1">Systems:</p>
                        <div className="flex flex-wrap gap-2">
                          {week.systems.map((sys: string, si: number) => (
                            <span key={si} className="text-xs bg-white text-[#1a1a1a] px-2 py-1 rounded border border-[#e5e5e5]">
                              {sys}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {week.deliverables && week.deliverables.length > 0 && (
                      <div>
                        <p className="text-xs text-[#666] uppercase font-medium mb-1">Deliverables:</p>
                        <ul className="text-sm text-[#1a1a1a] space-y-1">
                          {week.deliverables.map((d: string, di: number) => (
                            <li key={di} className="flex items-center gap-2">
                              <span className="text-emerald-800">✓</span>
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* INTEGRATION REQUIREMENTS */}
          {/* ============================================== */}
          {systemSpec && systemSpec.integrations && systemSpec.integrations.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
              <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">
                Integration Requirements
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#e5e5e5]">
                      <th className="text-left py-2 text-[#666] font-medium">Tool</th>
                      <th className="text-left py-2 text-[#666] font-medium">Category</th>
                      <th className="text-left py-2 text-[#666] font-medium">Purpose</th>
                      <th className="text-center py-2 text-[#666] font-medium">Required</th>
                      <th className="text-center py-2 text-[#666] font-medium">API</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemSpec.integrations.map((int: any, i: number) => (
                      <tr key={i} className="border-b border-[#f0f0f0]">
                        <td className="py-3 font-medium text-[#1a1a1a]">{int.tool}</td>
                        <td className="py-3 text-[#666]">{int.toolCategory}</td>
                        <td className="py-3 text-[#666]">{int.purpose}</td>
                        <td className="py-3 text-center">
                          {int.required ? (
                            <span className="text-[#ef4444]">●</span>
                          ) : (
                            <span className="text-[#666]">○</span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          {int.apiAvailable ? (
                            <span className="text-[#22c55e]">✓</span>
                          ) : (
                            <span className="text-[#666]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* GAP ANALYSIS */}
          {/* ============================================== */}
          {systemSpec && systemSpec.gaps && systemSpec.gaps.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
              <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">
                Gap Analysis (Follow-up Discovery Needed)
              </h2>
              <div className="space-y-4">
                {systemSpec.gaps.map((gap: any, i: number) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border ${
                      gap.priority === 'critical'
                        ? 'bg-[#fef2f2] border-[#fecaca]'
                        : gap.priority === 'important'
                        ? 'bg-[#fffbeb] border-[#fde68a]'
                        : 'bg-[#f8f8f6] border-[#e5e5e5]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded uppercase ${
                        gap.priority === 'critical'
                          ? 'bg-[#ef4444] text-white'
                          : gap.priority === 'important'
                          ? 'bg-[#f97316] text-white'
                          : 'bg-[#666] text-white'
                      }`}>
                        {gap.priority}
                      </span>
                      <span className="text-sm font-medium text-[#1a1a1a]">{gap.question}</span>
                    </div>
                    <p className="text-sm text-[#666] mb-3">{gap.reason}</p>
                    {gap.discoveryQuestions && gap.discoveryQuestions.length > 0 && (
                      <div className="pl-4 border-l-2 border-[#e5e5e5]">
                        <p className="text-xs text-[#666] uppercase font-medium mb-1">Ask on call:</p>
                        <ul className="text-sm text-[#1a1a1a] space-y-1">
                          {gap.discoveryQuestions.map((q: string, qi: number) => (
                            <li key={qi}>• {q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* AUTOMATION COVERAGE */}
          {/* ============================================== */}
          {systemSpec && systemSpec.automationCoverage && (
            <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif font-medium text-[#1a1a1a]">
                  Automation Coverage
                </h2>
                <span className="text-2xl font-bold text-emerald-800">
                  {systemSpec.automationCoverage.overall}%
                </span>
              </div>
              <div className="grid grid-cols-5 gap-4 mb-6">
                {[
                  { key: 'deliveryAutomation', label: 'Delivery' },
                  { key: 'salesAutomation', label: 'Sales' },
                  { key: 'clientCommsAutomation', label: 'Client Comms' },
                  { key: 'operationsAutomation', label: 'Operations' },
                  { key: 'qualityAutomation', label: 'Quality' },
                ].map((area) => (
                  <div key={area.key} className="text-center">
                    <div className="text-xl font-bold text-[#1a1a1a]">
                      {systemSpec.automationCoverage[area.key]}%
                    </div>
                    <div className="text-xs text-[#666]">{area.label}</div>
                  </div>
                ))}
              </div>
              {systemSpec.automationCoverage.breakdown && (
                <div className="space-y-3">
                  {systemSpec.automationCoverage.breakdown.map((item: any, i: number) => (
                    <div key={i} className="p-3 bg-[#f8f8f6] rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-[#1a1a1a]">{item.area}</span>
                        <span className="text-sm font-bold text-emerald-800">{item.automationPercentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-900 rounded-full"
                          style={{ width: `${item.automationPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-[#666] mt-1">
                        <span>{item.currentState}</span>
                        <span>→ {item.targetState}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Questionnaire Data (collapsed by default) */}
          <details className="bg-white rounded-xl border border-[#e5e5e5]">
            <summary className="p-6 cursor-pointer text-lg font-serif font-medium text-[#1a1a1a] hover:bg-[#f8f8f6]">
              Full Questionnaire Data
            </summary>
            <div className="px-6 pb-6 space-y-4 max-h-96 overflow-y-auto border-t border-[#e5e5e5] pt-4">
              {Object.entries(questionnaire).map(([key, value]) => (
                <div key={key} className="border-b border-[#f0f0f0] pb-3">
                  <div className="text-[#666] text-sm mb-1">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="text-[#1a1a1a]">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </div>
                </div>
              ))}
            </div>
          </details>
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
          <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
            <h3 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Client Assets</h3>
            {assets && assets.length > 0 ? (
              <div className="space-y-2">
                {assets.map((asset: any) => (
                  <div
                    key={asset.id}
                    className="flex items-center gap-3 p-3 bg-[#f8f8f6] rounded-lg border border-[#e5e5e5]"
                  >
                    <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1a1a1a] text-sm truncate">{asset.file_name}</p>
                      <p className="text-[#999] text-xs capitalize">{asset.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-[#999] text-sm">No assets uploaded yet.</p>
                <p className="text-[#666] text-xs mt-1">Client needs to upload documents</p>
              </div>
            )}
          </div>

          {/* Pipeline History */}
          <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
            <h3 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Pipeline History</h3>
            {pipelineStages && pipelineStages.length > 0 ? (
              <div className="space-y-3">
                {pipelineStages.map((stage: any) => (
                  <div key={stage.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-emerald-900" />
                    <div>
                      <p className="text-[#1a1a1a] text-sm font-medium capitalize">
                        {stage.stage.replace(/_/g, ' ')}
                      </p>
                      {stage.notes && (
                        <p className="text-[#666] text-sm">{stage.notes}</p>
                      )}
                      <p className="text-[#999] text-xs">
                        {new Date(stage.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#999] text-sm">No pipeline history yet.</p>
            )}
          </div>

          {/* Post-Call Needs Checklist */}
          {callPrep && callPrep.postCallNeeds && (
            <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
              <h3 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">After the Call</h3>
              <p className="text-[#666] text-sm mb-3">I'll need:</p>
              <ul className="space-y-2">
                {callPrep.postCallNeeds.map((need: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <input type="checkbox" className="mt-0.5 rounded border-[#e5e5e5]" />
                    <span className="text-[#1a1a1a]">{need}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-[#f8f8f6] rounded-lg">
                <p className="text-xs text-[#666] mb-2">Once I have the transcript, I'll generate:</p>
                <ul className="text-xs text-[#1a1a1a] space-y-1">
                  <li>✓ Final system list with confirmed priorities</li>
                  <li>✓ Process maps for each workflow</li>
                  <li>✓ Decision frameworks for judgment calls</li>
                  <li>✓ Skill specifications for each automation</li>
                  <li>✓ Named proprietary mechanism + methodology doc</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
