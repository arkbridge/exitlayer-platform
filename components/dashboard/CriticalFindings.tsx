'use client'

interface CriticalFinding {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  impact: string
}

interface CriticalFindingsProps {
  findings: CriticalFinding[]
}

const severityConfig = {
  critical: {
    color: '#a85454',
    label: 'Critical'
  },
  warning: {
    color: '#c77d3e',
    label: 'Warning'
  },
  info: {
    color: '#666',
    label: 'Info'
  }
}

export default function CriticalFindings({ findings }: CriticalFindingsProps) {
  const hasFindings = findings && findings.length > 0

  return (
    <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#e5e5e5]">
        <div className="flex items-center gap-2.5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-[#c77d3e]"
          >
            <path
              d="M10 6V10M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h2 className="text-lg font-semibold text-[#1a1a1a]">Critical Findings</h2>
        </div>
      </div>

      {/* Content */}
      {hasFindings ? (
        <div className="divide-y divide-[#e5e5e5]">
          {findings.map((finding) => {
            const config = severityConfig[finding.severity]

            return (
              <div key={finding.id} className="p-5">
                <div className="flex gap-3.5">
                  {/* Severity Indicator */}
                  <div className="flex-shrink-0 pt-0.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h3 className="font-medium text-[#1a1a1a] leading-snug">
                        {finding.title}
                      </h3>
                      <span
                        className="flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded"
                        style={{
                          color: config.color,
                          backgroundColor: `${config.color}15`
                        }}
                      >
                        {config.label}
                      </span>
                    </div>

                    <p className="text-sm text-[#666] leading-relaxed mb-2">
                      {finding.description}
                    </p>

                    <p className="text-xs italic text-[#999]">
                      {finding.impact}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // Empty State
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#4ade80]/10 mb-3">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[#4ade80]"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-sm text-[#999] font-medium">
            No critical issues found
          </p>
        </div>
      )}
    </div>
  )
}
