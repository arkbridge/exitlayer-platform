'use client'

import { CheckCircle2, Circle } from 'lucide-react'

interface AuditProgressProps {
  currentQuestion: number
  totalQuestions: number
  status: 'not_started' | 'in_progress' | 'completed'
}

const AUDIT_SECTIONS = [
  { name: 'Business Overview', start: 1, end: 9 },
  { name: 'Revenue & Clients', start: 10, end: 18 },
  { name: 'Operations & Delivery', start: 19, end: 27 },
  { name: 'Team & Capacity', start: 28, end: 36 },
  { name: 'Systems & Tools', start: 37, end: 45 },
  { name: 'Sales & Marketing', start: 46, end: 54 },
  { name: 'Financial Health', start: 55, end: 63 },
  { name: 'Exit Readiness', start: 64, end: 74 },
]

export default function AuditProgress({
  currentQuestion,
  totalQuestions,
  status,
}: AuditProgressProps) {
  const overallProgress = Math.round((currentQuestion / totalQuestions) * 100)

  const getSectionProgress = (start: number, end: number) => {
    const sectionTotal = end - start + 1
    if (currentQuestion < start) return 0
    if (currentQuestion >= end) return sectionTotal
    return currentQuestion - start + 1
  }

  const isSectionComplete = (start: number, end: number) => {
    return currentQuestion >= end
  }

  return (
    <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#e5e5e5] flex items-center justify-between">
        <h3 className="text-xl font-semibold text-[#1a1a1a] tracking-tight">
          Full Audit Progress
        </h3>
        <div className="px-4 py-1.5 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60">
          <span className="text-sm font-bold text-emerald-700 tabular-nums">
            {overallProgress}%
          </span>
        </div>
      </div>

      {/* Section List */}
      <div className="p-6 space-y-5">
        {AUDIT_SECTIONS.map((section, index) => {
          const sectionTotal = section.end - section.start + 1
          const completed = getSectionProgress(section.start, section.end)
          const isComplete = isSectionComplete(section.start, section.end)
          const progressPercent = (completed / sectionTotal) * 100

          return (
            <div key={index} className="space-y-2.5">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" strokeWidth={2} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-4 mb-1.5">
                    <h4 className="font-medium text-[#1a1a1a]">
                      {section.name}
                    </h4>
                    <span className="text-sm text-[#666] tabular-nums whitespace-nowrap">
                      {completed}/{sectionTotal} questions
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ease-out rounded-full ${
                        isComplete
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : 'bg-gradient-to-r from-gray-400 to-gray-300'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Overall Progress Footer */}
      <div className="px-6 py-5 bg-gradient-to-br from-gray-50 to-gray-50/50 border-t border-[#e5e5e5]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#1a1a1a]">
            Overall Progress
          </span>
          <span className="text-sm font-bold text-[#1a1a1a] tabular-nums">
            {currentQuestion} / {totalQuestions}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 transition-all duration-700 ease-out rounded-full shadow-sm"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
