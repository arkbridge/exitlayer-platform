'use client'

interface ScoreData {
  overall?: number
  dimensions?: {
    leverage?: number
    equityPotential?: number
    revenueRisk?: number
    productReadiness?: number
    implementationCapacity?: number
  }
  financialMetrics?: {
    currentExitValue?: number
    targetExitValue?: number
    valueGap?: number
    currentExitMultiple?: number
    ownerHourlyValue?: number
    monthlyRevenue?: number
  }
}

interface ShortAssessmentCardProps {
  scoreData: ScoreData | null
  formData: Record<string, any> | null
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#064e3b'
  if (score >= 60) return '#b59f3b'
  if (score >= 40) return '#c77d3e'
  return '#a85454'
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  }
  return `$${amount.toLocaleString()}`
}

export default function ShortAssessmentCard({ scoreData, formData }: ShortAssessmentCardProps) {
  const overall = scoreData?.overall ?? 0
  const dimensions = scoreData?.dimensions ?? {}
  const financials = scoreData?.financialMetrics ?? {}

  const currentValue = financials.currentExitValue ?? 0
  const targetValue = financials.targetExitValue ?? 0
  const valueGap = financials.valueGap ?? 0
  const currentMultiple = financials.currentExitMultiple ?? 2

  // Calculate annual owner tax (hours wasted * hourly value * 52 weeks)
  const ownerHourlyValue = financials.ownerHourlyValue ?? 0
  const wastedHours = formData?.wasted_hours_week ?? 10
  const annualOwnerTax = ownerHourlyValue * wastedHours * 52

  const dimensionList = [
    { key: 'leverage', label: 'Leverage', desc: 'Owner independence' },
    { key: 'equityPotential', label: 'Equity', desc: 'Exit readiness' },
    { key: 'revenueRisk', label: 'Revenue', desc: 'Income stability' },
    { key: 'productReadiness', label: 'Product', desc: 'Productization' },
    { key: 'implementationCapacity', label: 'Capacity', desc: 'Team capability' },
  ]

  return (
    <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#e5e5e5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-900/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-serif font-medium text-[#1a1a1a]">Short Assessment Complete</h3>
            <p className="text-[#666] text-sm">Your initial diagnostic results</p>
          </div>
        </div>
      </div>

      {/* Score Overview */}
      <div className="p-6 grid md:grid-cols-3 gap-6 border-b border-[#e5e5e5]">
        {/* Overall Score */}
        <div className="text-center md:text-left">
          <div className="text-[#999] text-sm mb-2">Overall Score</div>
          <div className="flex items-end gap-2 justify-center md:justify-start">
            <span
              className="text-5xl font-serif font-medium"
              style={{ color: getScoreColor(overall) }}
            >
              {overall}
            </span>
            <span className="text-[#ccc] text-xl mb-1">/100</span>
          </div>
          <div className="mt-3 h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${overall}%`, backgroundColor: getScoreColor(overall) }}
            />
          </div>
        </div>

        {/* Current Valuation */}
        <div className="text-center md:text-left">
          <div className="text-[#999] text-sm mb-2">Current Valuation</div>
          <div className="text-3xl font-serif font-medium text-[#1a1a1a]">
            {formatCurrency(currentValue)}
          </div>
          <p className="text-[#999] text-sm mt-1">
            {currentMultiple}x multiple
          </p>
        </div>

        {/* Potential Valuation */}
        <div className="text-center md:text-left">
          <div className="text-emerald-800 text-sm mb-2">Potential Valuation</div>
          <div className="text-3xl font-serif font-medium text-emerald-800">
            {formatCurrency(targetValue)}
          </div>
          <p className="text-[#999] text-sm mt-1">
            +{formatCurrency(valueGap)} gap
          </p>
        </div>
      </div>

      {/* Dimension Scores */}
      <div className="p-6 border-b border-[#e5e5e5]">
        <h4 className="text-sm font-medium text-[#1a1a1a] mb-4">Dimension Breakdown</h4>
        <div className="grid grid-cols-5 gap-3">
          {dimensionList.map((dim) => {
            const score = dimensions[dim.key as keyof typeof dimensions] ?? 0
            return (
              <div key={dim.key} className="text-center">
                <div
                  className="text-2xl font-serif font-medium mb-1"
                  style={{ color: getScoreColor(score) }}
                >
                  {score}
                </div>
                <div className="text-[#1a1a1a] font-medium text-xs">{dim.label}</div>
                <div className="text-[#999] text-[10px]">{dim.desc}</div>
                <div className="mt-2 h-1 bg-[#e5e5e5] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${score}%`,
                      backgroundColor: getScoreColor(score)
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="p-6 bg-[#f8f8f6] grid md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#a85454]/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[#a85454]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-[#a85454] text-sm">Annual Owner Tax</div>
            <div className="text-xl font-serif font-medium text-[#1a1a1a]">
              {formatCurrency(annualOwnerTax)}
            </div>
            <div className="text-[#999] text-xs">Lost to tasks below your pay grade</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-800/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <div className="text-emerald-800 text-sm">Exit Value Gap</div>
            <div className="text-xl font-serif font-medium text-[#1a1a1a]">
              {formatCurrency(valueGap)}
            </div>
            <div className="text-[#999] text-xs">{currentMultiple}x → 5x potential</div>
          </div>
        </div>
      </div>
    </div>
  )
}
