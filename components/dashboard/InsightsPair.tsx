'use client'

import { AlertCircle, TrendingUp } from 'lucide-react'

interface InsightsPairProps {
  primaryConstraint: {
    dimension: string
    score: number
    description: string
  } | null
  highestOpportunity: {
    dimension: string
    score: number
    description: string
  } | null
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#064e3b'
  if (score >= 60) return '#b59f3b'
  if (score >= 40) return '#c77d3e'
  return '#a85454'
}

export default function InsightsPair({ primaryConstraint, highestOpportunity }: InsightsPairProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Primary Constraint Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        {primaryConstraint ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div
                className="rounded-full p-2.5 flex-shrink-0"
                style={{
                  backgroundColor: `${getScoreColor(primaryConstraint.score)}15`
                }}
              >
                <AlertCircle
                  className="w-5 h-5"
                  style={{ color: getScoreColor(primaryConstraint.score) }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#999] mb-1">
                  Primary Constraint
                </div>
                <div className="text-xl font-serif font-medium text-[#1a1a1a]">
                  {primaryConstraint.dimension}
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <div
                className="text-2xl font-semibold"
                style={{ color: getScoreColor(primaryConstraint.score) }}
              >
                {primaryConstraint.score}
              </div>
              <div className="text-sm text-[#999]">/ 100</div>
            </div>

            <p className="text-[#666] text-sm leading-relaxed">
              {primaryConstraint.description}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[200px] text-[#999]">
            No constraint data available
          </div>
        )}
      </div>

      {/* Highest Opportunity Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        {highestOpportunity ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full p-2.5 bg-emerald-900/10 flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-emerald-800" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-emerald-800 mb-1">
                  Highest Opportunity
                </div>
                <div className="text-xl font-serif font-medium text-[#1a1a1a]">
                  {highestOpportunity.dimension}
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-semibold text-emerald-700">
                {highestOpportunity.score}
              </div>
              <div className="text-sm text-[#999]">/ 100</div>
            </div>

            <p className="text-[#666] text-sm leading-relaxed">
              {highestOpportunity.description}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[200px] text-[#999]">
            No opportunity data available
          </div>
        )}
      </div>
    </div>
  )
}
