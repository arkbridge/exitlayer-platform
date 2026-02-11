'use client'

interface DimensionScoresProps {
  dimensions: {
    leverage?: number
    equityPotential?: number
    revenueRisk?: number
    productReadiness?: number
    implementationCapacity?: number
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#064e3b'
  if (score >= 60) return '#b59f3b'
  if (score >= 40) return '#c77d3e'
  return '#a85454'
}

const dimensionConfig = [
  {
    key: 'leverage' as const,
    label: 'Leverage',
    description: 'Owner independence',
  },
  {
    key: 'equityPotential' as const,
    label: 'Equity',
    description: 'Exit readiness',
  },
  {
    key: 'revenueRisk' as const,
    label: 'Revenue',
    description: 'Income stability',
  },
  {
    key: 'productReadiness' as const,
    label: 'Product',
    description: 'Productization',
  },
  {
    key: 'implementationCapacity' as const,
    label: 'Capacity',
    description: 'Team capability',
  },
]

export default function DimensionScores({ dimensions }: DimensionScoresProps) {
  return (
    <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
      <div className="p-6">
        <h3 className="font-serif font-medium text-[#1a1a1a] mb-6">
          Dimension Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {dimensionConfig.map(({ key, label, description }) => {
            const score = dimensions[key] ?? 0
            const scoreColor = getScoreColor(score)

            return (
              <div key={key} className="space-y-2">
                <div
                  className="text-2xl font-serif font-medium"
                  style={{ color: scoreColor }}
                >
                  {score}
                </div>
                <div className="text-xs font-medium text-[#1a1a1a]">
                  {label}
                </div>
                <div className="text-[10px] text-[#999]">{description}</div>
                <div className="h-1 bg-[#e5e5e5] rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{
                      width: `${score}%`,
                      backgroundColor: scoreColor,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
