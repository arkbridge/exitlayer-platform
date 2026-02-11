'use client'

import { useState } from 'react'
import Link from 'next/link'

// Simulated score data
const simulatedScore = {
  overall: 42,
  dimensions: {
    leverage: 35,
    equityPotential: 48,
    revenueRisk: 52,
    productReadiness: 38,
    implementationCapacity: 45,
  },
  financialMetrics: {
    ownerHourlyValue: 285,
    totalWeeklyHours: 55,
    monthlyRevenue: 85000,
    annualRevenue: 1020000,
    currentExitMultiple: 2.1,
    valueGap: 2958000,
  },
  analysis: {
    primaryConstraint: {
      dimension: 'Leverage',
      score: 35,
      description: 'You are deeply embedded in day-to-day operations, making it impossible to scale without burning out.',
    },
    highestOpportunity: {
      dimension: 'Revenue Risk',
      score: 52,
      description: 'Your recurring revenue base provides a foundation to build systematic delivery on top of.',
    },
    criticalFindings: [
      'Owner spends 55+ hours/week, with 18 hours on tasks below pay grade',
      'Top 3 clients represent 62% of revenue - dangerous concentration',
      'No documented SOPs - tribal knowledge blocks delegation',
      'Team cannot close deals without owner involvement',
    ],
    quickWins: [
      'Document your client onboarding process this week',
      'Create a simple sales qualification checklist',
      'Record yourself doing one delivery task, turn into SOP',
    ],
  },
}

const simulatedFormData = {
  wasted_hours_week: 18,
  projects_requiring_owner_pct: 75,
  owner_replaceability_sales: 3,
  team_can_close: 'No',
  has_sops: 'No',
  documented_pct: 15,
  has_deliverable_templates: 'No',
  top3_concentration_pct: 62,
  revenue_recurring_pct: 35,
  vacation_breaks: 'Everything falls apart. Clients get frustrated, team makes mistakes, fires pile up. I haven\'t taken more than 3 days off in 2 years.',
  time_sales_hrs: 12,
  new_clients_per_month: 2,
}

// Helper to get score color
function getScoreColor(score: number): string {
  if (score >= 80) return '#064e3b'
  if (score >= 60) return '#b59f3b'
  if (score >= 40) return '#c77d3e'
  return '#a85454'
}

export default function DemoPage() {
  const [view, setView] = useState<'results' | 'dashboard'>('results')

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Demo Nav */}
      <nav className="border-b border-[#e5e5e5] bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-lg font-medium text-[#1a1a1a]">ExitLayer</Link>
              <span className="text-xs font-medium text-[#c77d3e] bg-[#c77d3e]/10 px-2 py-1 rounded-full">Demo Mode</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('results')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  view === 'results' ? 'bg-emerald-900 text-white' : 'text-[#666] hover:bg-[#e5e5e5]'
                }`}
              >
                Results Page
              </button>
              <button
                onClick={() => setView('dashboard')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  view === 'dashboard' ? 'bg-emerald-900 text-white' : 'text-[#666] hover:bg-[#e5e5e5]'
                }`}
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {view === 'results' ? (
        <ResultsDemo score={simulatedScore} formData={simulatedFormData} />
      ) : (
        <DashboardDemo score={simulatedScore} />
      )}
    </div>
  )
}

function ResultsDemo({ score, formData }: { score: typeof simulatedScore; formData: typeof simulatedFormData }) {
  const ownerHourlyValue = score.financialMetrics.ownerHourlyValue
  const wastedHoursWeekly = formData.wasted_hours_week
  const wastedHoursPerYear = wastedHoursWeekly * 52
  const wastedDollarsPerYear = wastedHoursWeekly * ownerHourlyValue * 52
  const exitValueGap = score.financialMetrics.valueGap
  const currentMultiple = score.financialMetrics.currentExitMultiple
  const targetMultiple = 5
  const annualRevenue = score.financialMetrics.annualRevenue

  // Build inefficiencies based on form data
  const inefficiencies = []

  if (wastedHoursWeekly > 5) {
    inefficiencies.push({
      id: 'wasted-hours',
      category: 'time',
      issue: 'Hours spent on tasks below your pay grade',
      yourData: `You spend ${wastedHoursWeekly} hours/week on tasks that should cost $50/hr, not your $${ownerHourlyValue}/hr`,
      directCost: `$${Math.round(wastedDollarsPerYear / 1000)}K/year in opportunity cost`,
      cascadeEffect: 'These hours aren\'t available for strategy, sales, or building systems.',
    })
  }

  if (formData.projects_requiring_owner_pct > 50) {
    inefficiencies.push({
      id: 'owner-dependency',
      category: 'time',
      issue: 'You are the delivery bottleneck',
      yourData: `${formData.projects_requiring_owner_pct}% of projects require your direct involvement`,
      directCost: 'Revenue capped at your personal capacity',
      cascadeEffect: 'Every new client means more hours for you, not more leverage.',
    })
  }

  if (formData.has_sops === 'No' || formData.documented_pct < 30) {
    inefficiencies.push({
      id: 'no-sops',
      category: 'systems',
      issue: 'Tribal knowledge blocks delegation',
      yourData: formData.has_sops === 'No' ? 'No documented SOPs' : `Only ${formData.documented_pct}% of processes documented`,
      directCost: 'Every task requires your brain, every hire needs your time',
      cascadeEffect: 'Without documentation, you can\'t hire to replace yourself.',
    })
  }

  if (formData.top3_concentration_pct > 40) {
    inefficiencies.push({
      id: 'client-concentration',
      category: 'risk',
      issue: 'Dangerous revenue concentration',
      yourData: `Top 3 clients = ${formData.top3_concentration_pct}% of revenue`,
      directCost: `$${Math.round((formData.top3_concentration_pct / 100) * annualRevenue / 1000)}K at risk if one client leaves`,
      cascadeEffect: 'Acquirers see this as massive risk. Suppresses your exit multiple.',
    })
  }

  if (formData.vacation_breaks && formData.vacation_breaks.length > 20) {
    inefficiencies.push({
      id: 'vacation-risk',
      category: 'knowledge',
      issue: 'The business can\'t survive without you',
      yourData: `"${formData.vacation_breaks.substring(0, 80)}..."`,
      directCost: 'You haven\'t had a real vacation in how long?',
      cascadeEffect: 'If the business breaks when you leave, you own a job, not a business.',
    })
  }

  const timeIssues = inefficiencies.filter(i => i.category === 'time')
  const systemsIssues = inefficiencies.filter(i => i.category === 'systems')
  const riskIssues = inefficiencies.filter(i => i.category === 'risk')
  const knowledgeIssues = inefficiencies.filter(i => i.category === 'knowledge')

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Hero: The Owner Tax */}
        <div className="bg-gradient-to-br from-[#a85454] to-[#8b4545] rounded-xl p-8 md:p-12 text-white">
          <div className="text-white/70 text-sm font-medium uppercase tracking-wider mb-2">Your Owner Tax</div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium mb-4">
            You're losing <span className="text-white">${Math.round(wastedDollarsPerYear / 1000)}K</span>/year
          </h1>
          <p className="text-xl text-white/70 mb-8 max-w-2xl">
            to tasks below your pay grade. Here's how it adds up:
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/10">
              <div className="text-white/70 text-sm mb-1">Hours Wasted Weekly</div>
              <div className="text-4xl font-serif font-medium">{wastedHoursWeekly}</div>
              <div className="text-white/50 text-sm mt-2">on tasks worth $50/hr when your time is worth ${ownerHourlyValue}/hr</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/10">
              <div className="text-white/70 text-sm mb-1">Annual Cost</div>
              <div className="text-4xl font-serif font-medium">${Math.round(wastedDollarsPerYear / 1000)}K</div>
              <div className="text-white/50 text-sm mt-2">{wastedHoursPerYear} hours × ${ownerHourlyValue}/hr</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/10">
              <div className="text-white/70 text-sm mb-1">Exit Value Lost</div>
              <div className="text-4xl font-serif font-medium">${(exitValueGap / 1000000).toFixed(1)}M</div>
              <div className="text-white/50 text-sm mt-2">the gap between {currentMultiple}x and {targetMultiple}x multiple</div>
            </div>
          </div>
        </div>

        {/* The Inefficiency Cascade */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
          <div className="bg-[#1a1a1a] p-6">
            <h2 className="text-xl font-serif font-medium text-white flex items-center gap-3">
              <svg className="w-6 h-6 text-[#a85454]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              The Inefficiency Cascade
            </h2>
            <p className="text-white/60 mt-2">
              {inefficiencies.length} compounding issues identified. Each one feeds the others.
            </p>
          </div>

          <div className="p-6 space-y-8">
            {/* TIME CATEGORY */}
            {timeIssues.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#a85454]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#a85454]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-[#1a1a1a]">Time & Capacity</h3>
                </div>
                <div className="space-y-4">
                  {timeIssues.map((issue, i) => (
                    <InefficiencyCard key={issue.id} issue={issue} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* SYSTEMS CATEGORY */}
            {systemsIssues.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#c77d3e]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#c77d3e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-[#1a1a1a]">Systems & Documentation</h3>
                </div>
                <div className="space-y-4">
                  {systemsIssues.map((issue, i) => (
                    <InefficiencyCard key={issue.id} issue={issue} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* RISK CATEGORY */}
            {riskIssues.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#b59f3b]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#b59f3b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-[#1a1a1a]">Revenue Risk</h3>
                </div>
                <div className="space-y-4">
                  {riskIssues.map((issue, i) => (
                    <InefficiencyCard key={issue.id} issue={issue} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* KNOWLEDGE CATEGORY */}
            {knowledgeIssues.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#6b5b95]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#6b5b95]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-[#1a1a1a]">Knowledge & Continuity</h3>
                </div>
                <div className="space-y-4">
                  {knowledgeIssues.map((issue, i) => (
                    <InefficiencyCard key={issue.id} issue={issue} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Compounding Summary */}
            <div className="bg-[#a85454]/5 rounded-xl p-6 border border-[#a85454]/20">
              <h3 className="font-medium text-[#a85454] mb-4">How These Compound Into a ${(exitValueGap / 1000000).toFixed(1)}M Value Gap</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#a85454] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                  <p className="text-[#666]"><strong className="text-[#1a1a1a]">No documentation</strong> means you can't delegate, so <strong className="text-[#1a1a1a]">you stay in delivery</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#a85454] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                  <p className="text-[#666]"><strong className="text-[#1a1a1a]">Stuck in delivery</strong> means no time for <strong className="text-[#1a1a1a]">systems or strategy</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#a85454] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                  <p className="text-[#666]"><strong className="text-[#1a1a1a]">No systems</strong> means you can't hire to replace yourself, so <strong className="text-[#1a1a1a]">revenue is capped</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#a85454] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                  <p className="text-[#666]"><strong className="text-[#1a1a1a]">Owner-dependent revenue</strong> means acquirers see risk, so <strong className="text-[#1a1a1a]">your multiple stays at {currentMultiple}x</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Your Score */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-serif font-medium text-[#1a1a1a]">Your ExitLayer Score</h3>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-serif font-medium" style={{ color: getScoreColor(score.overall) }}>
                {score.overall}
              </span>
              <span className="text-[#999] text-sm">/100</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {[
              { key: 'leverage', label: 'Leverage', score: score.dimensions.leverage },
              { key: 'equityPotential', label: 'Equity', score: score.dimensions.equityPotential },
              { key: 'revenueRisk', label: 'Revenue', score: score.dimensions.revenueRisk },
              { key: 'productReadiness', label: 'Product', score: score.dimensions.productReadiness },
              { key: 'implementationCapacity', label: 'Capacity', score: score.dimensions.implementationCapacity },
            ].map((dim) => (
              <div key={dim.key} className="text-center">
                <div className="text-lg font-serif font-medium" style={{ color: getScoreColor(dim.score) }}>
                  {dim.score}
                </div>
                <div className="text-xs text-[#999] mb-1">{dim.label}</div>
                <div className="h-1 bg-[#e5e5e5] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${dim.score}%`, backgroundColor: getScoreColor(dim.score) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents Required Section */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
          <div className="p-6 border-b border-[#e5e5e5]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-emerald-900/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-serif font-medium text-[#1a1a1a]">Before Your Implementation Call</h3>
                <p className="text-[#666] text-sm">Upload these documents so we can prepare a tailored action plan</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {[
              { name: 'Service Offerings Document', desc: 'Your current services, pricing, and packages', icon: '📋' },
              { name: 'Sample Client Deliverable', desc: 'A recent project or report you delivered', icon: '📄' },
              { name: 'Team Structure / Org Chart', desc: 'Who does what on your team', icon: '👥' },
              { name: 'Current SOPs (if any)', desc: 'Any documented processes you have', icon: '📝' },
            ].map((doc, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-[#f8f8f6] rounded-lg border border-[#e5e5e5]">
                <span className="text-2xl">{doc.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-[#1a1a1a]">{doc.name}</div>
                  <div className="text-sm text-[#666]">{doc.desc}</div>
                </div>
                <span className="text-xs text-[#999] bg-white px-2 py-1 rounded border border-[#e5e5e5]">Not uploaded</span>
              </div>
            ))}
          </div>

          <div className="p-6 bg-[#f8f8f6] border-t border-[#e5e5e5]">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-900 text-white font-medium rounded-full hover:bg-emerald-950 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Documents
            </button>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-emerald-900 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-serif font-medium mb-3">Ready to stop the bleeding?</h3>
          <p className="text-white/70 mb-6 max-w-xl mx-auto">
            In a 1-hour deep implementation call, we'll map exactly which systems would break this doom loop, define the build plan, and reclaim your ${Math.round(wastedDollarsPerYear / 1000)}K/year.
          </p>
          <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-800 font-medium rounded-full hover:bg-[#f8f8f6] transition-colors">
            Book Your Implementation Call
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function DashboardDemo({ score }: { score: typeof simulatedScore }) {
  const PIPELINE_STAGES = [
    { id: 'submitted', label: 'Submitted', icon: '1' },
    { id: 'review', label: 'In Review', icon: '2' },
    { id: 'call_scheduled', label: 'Call Scheduled', icon: '3' },
    { id: 'call_complete', label: 'Call Complete', icon: '4' },
    { id: 'building', label: 'Building', icon: '5' },
    { id: 'complete', label: 'Complete', icon: '6' },
  ]
  const currentStageIndex = 0 // Just submitted

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-medium text-[#1a1a1a] mb-2">Your Dashboard</h1>
        <p className="text-[#666]">Track your transformation journey and access your diagnostic results.</p>
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
            <div key={i} className={`flex items-center gap-4 p-4 rounded-lg border ${doc.uploaded ? 'bg-emerald-900/5 border-emerald-800/20' : 'bg-[#f8f8f6] border-[#e5e5e5]'}`}>
              <span className="text-2xl">{doc.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[#1a1a1a] truncate">{doc.name}</div>
                <div className="text-sm text-[#666] truncate">{doc.desc}</div>
              </div>
              {doc.uploaded ? (
                <svg className="w-5 h-5 text-emerald-800 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="text-xs text-[#999] flex-shrink-0">Missing</span>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 bg-[#f8f8f6] border-t border-[#e5e5e5] flex items-center justify-between">
          <p className="text-[#666] text-sm">These help us prepare a tailored action plan for your implementation call.</p>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-900 text-white font-medium rounded-full hover:bg-emerald-950 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Documents
          </button>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
          <div className="text-[#999] text-sm mb-2">Overall Score</div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-serif font-medium" style={{ color: getScoreColor(score.overall) }}>{score.overall}</span>
            <span className="text-[#ccc] text-xl mb-1">/100</span>
          </div>
          <div className="mt-4 h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${score.overall}%`, backgroundColor: getScoreColor(score.overall) }} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
          <div className="text-[#a85454] text-sm mb-2">Annual Owner Tax</div>
          <div className="text-4xl font-serif font-medium text-[#1a1a1a]">$267K</div>
          <p className="text-[#999] text-sm mt-2">Lost to tasks below your pay grade</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
          <div className="text-emerald-800 text-sm mb-2">Exit Value Gap</div>
          <div className="text-4xl font-serif font-medium text-[#1a1a1a]">$3.0M</div>
          <p className="text-[#999] text-sm mt-2">2.1x → 5x potential</p>
        </div>
      </div>

      {/* Dimension Scores */}
      <div className="bg-white rounded-xl p-6 border border-[#e5e5e5] mb-8">
        <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">Dimension Breakdown</h2>
        <div className="grid grid-cols-5 gap-4">
          {[
            { key: 'leverage', label: 'Leverage', description: 'Owner time independence', score: score.dimensions.leverage },
            { key: 'equityPotential', label: 'Equity', description: 'Exit-readiness', score: score.dimensions.equityPotential },
            { key: 'revenueRisk', label: 'Revenue', description: 'Income stability', score: score.dimensions.revenueRisk },
            { key: 'productReadiness', label: 'Product', description: 'Productization level', score: score.dimensions.productReadiness },
            { key: 'implementationCapacity', label: 'Capacity', description: 'Team capability', score: score.dimensions.implementationCapacity },
          ].map((dim) => (
            <div key={dim.key} className="text-center">
              <div className="text-3xl font-serif font-medium mb-1" style={{ color: getScoreColor(dim.score) }}>{dim.score}</div>
              <div className="text-[#1a1a1a] font-medium text-sm">{dim.label}</div>
              <div className="text-[#999] text-xs">{dim.description}</div>
              <div className="mt-2 h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${dim.score}%`, backgroundColor: getScoreColor(dim.score) }} />
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

            return (
              <div key={stage.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    isCurrent ? 'bg-emerald-900 text-white ring-4 ring-emerald-800/20' : isComplete ? 'bg-emerald-900 text-white' : 'bg-[#e5e5e5] text-[#999]'
                  }`}>
                    {stage.icon}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${isCurrent ? 'text-emerald-800' : isComplete ? 'text-emerald-800' : 'text-[#999]'}`}>
                    {stage.label}
                  </span>
                </div>
                {index < PIPELINE_STAGES.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded ${index < currentStageIndex ? 'bg-emerald-900' : 'bg-[#e5e5e5]'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Key Insights & CTA */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h3 className="text-lg font-medium text-[#1a1a1a]">Highest Opportunity</h3>
          </div>
          <p className="text-emerald-800 font-medium mb-2">{score.analysis.highestOpportunity.dimension}</p>
          <p className="text-[#666] text-sm">{score.analysis.highestOpportunity.description}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
          <h3 className="text-lg font-medium text-[#1a1a1a] mb-3">Ready for the Next Step?</h3>
          <p className="text-[#666] text-sm mb-4">Book your implementation call to map out your personalized transformation plan.</p>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-900 hover:bg-emerald-950 text-white font-medium rounded-full transition-colors">
            Book a Call
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function InefficiencyCard({ issue, index }: { issue: { id: string; issue: string; yourData: string; directCost: string; cascadeEffect: string }; index: number }) {
  return (
    <div className="bg-[#f8f8f6] rounded-xl p-5 border border-[#e5e5e5]">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-[#a85454]/10 text-[#a85454] flex items-center justify-center font-medium flex-shrink-0 text-sm">
          {index + 1}
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="font-medium text-[#1a1a1a]">{issue.issue}</h4>
            <p className="text-sm text-[#666] mt-1">{issue.yourData}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-white rounded-lg p-3 border border-[#e5e5e5]">
              <div className="text-xs font-medium text-[#a85454] uppercase tracking-wide mb-1">Direct Cost</div>
              <div className="text-sm text-[#1a1a1a]">{issue.directCost}</div>
            </div>
            <div className="flex-1 bg-white rounded-lg p-3 border border-[#e5e5e5]">
              <div className="text-xs font-medium text-[#c77d3e] uppercase tracking-wide mb-1">Cascade Effect</div>
              <div className="text-sm text-[#1a1a1a]">{issue.cascadeEffect}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
