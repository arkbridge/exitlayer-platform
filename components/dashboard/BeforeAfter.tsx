'use client'

import { Sparkles, ArrowUp, ArrowDown } from 'lucide-react'

interface BeforeAfterProps {
  before: {
    exitMultiple: number
    weeklyHoursSaved: number
    systemsAutomated: number
    revenueRiskScore: number
  }
  after: {
    exitMultiple: number
    weeklyHoursSaved: number
    systemsAutomated: number
    revenueRiskScore: number
  }
}

export default function BeforeAfter({ before, after }: BeforeAfterProps) {
  const metrics = [
    {
      label: 'Exit Multiple',
      beforeValue: `${before.exitMultiple}x`,
      afterValue: `${after.exitMultiple}x`,
      improvement: ((after.exitMultiple - before.exitMultiple) / before.exitMultiple) * 100,
      higherIsBetter: true,
    },
    {
      label: 'Weekly Hours Saved',
      beforeValue: before.weeklyHoursSaved,
      afterValue: after.weeklyHoursSaved,
      improvement: after.weeklyHoursSaved - before.weeklyHoursSaved,
      higherIsBetter: true,
    },
    {
      label: 'Systems Automated',
      beforeValue: before.systemsAutomated,
      afterValue: after.systemsAutomated,
      improvement: after.systemsAutomated - before.systemsAutomated,
      higherIsBetter: true,
    },
    {
      label: 'Revenue Risk Score',
      beforeValue: before.revenueRiskScore,
      afterValue: after.revenueRiskScore,
      improvement: ((before.revenueRiskScore - after.revenueRiskScore) / before.revenueRiskScore) * 100,
      higherIsBetter: false,
    },
  ]

  return (
    <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#e5e5e5] flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            Transformation Complete
          </h3>
          <p className="text-sm text-neutral-500">
            Your business evolution at a glance
          </p>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-2 divide-x divide-[#e5e5e5]">
        {/* Before Column */}
        <div className="bg-neutral-50">
          <div className="p-4 border-b border-[#e5e5e5]">
            <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
              Before
            </h4>
          </div>
          <div className="divide-y divide-neutral-200">
            {metrics.map((metric, idx) => (
              <div key={idx} className="p-4">
                <div className="text-xs text-neutral-500 mb-1">
                  {metric.label}
                </div>
                <div className="text-2xl font-bold text-neutral-600">
                  {metric.beforeValue}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* After Column */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="p-4 border-b border-emerald-200">
            <h4 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">
              After
            </h4>
          </div>
          <div className="divide-y divide-emerald-100">
            {metrics.map((metric, idx) => {
              const isPositive = metric.improvement > 0
              const isNegativeGood = !metric.higherIsBetter && metric.improvement > 0
              const showPositive = (isPositive && metric.higherIsBetter) || isNegativeGood

              return (
                <div key={idx} className="p-4">
                  <div className="text-xs text-emerald-700 mb-1 flex items-center justify-between">
                    <span>{metric.label}</span>
                    <span className={`flex items-center gap-1 font-semibold ${
                      showPositive ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {showPositive ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      )}
                      {Math.abs(metric.improvement).toFixed(0)}
                      {metric.label.includes('Multiple') || metric.label.includes('Risk') ? '%' : ''}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-900">
                    {metric.afterValue}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer Badge */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-center">
        <p className="text-sm font-semibold text-white">
          🎉 Your business is now acquisition-ready
        </p>
      </div>
    </div>
  )
}
