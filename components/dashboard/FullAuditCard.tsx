'use client'

import Link from 'next/link'

type FullAuditStatus = 'not_started' | 'in_progress' | 'completed'

interface FullAuditCardProps {
  status: FullAuditStatus
  currentQuestion?: number
  totalQuestions?: number
  startedAt?: string
  completedAt?: string
}

export default function FullAuditCard({
  status,
  currentQuestion = 0,
  totalQuestions = 74,
  startedAt,
  completedAt,
}: FullAuditCardProps) {
  const progress = status === 'completed'
    ? 100
    : Math.round((currentQuestion / totalQuestions) * 100)

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#e5e5e5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              status === 'completed'
                ? 'bg-emerald-900/10'
                : status === 'in_progress'
                ? 'bg-[#b59f3b]/10'
                : 'bg-[#e5e5e5]'
            }`}>
              {status === 'completed' ? (
                <svg className="w-5 h-5 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : status === 'in_progress' ? (
                <svg className="w-5 h-5 text-[#b59f3b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-lg font-serif font-medium text-[#1a1a1a]">Full Audit</h3>
              <p className="text-[#666] text-sm">
                {status === 'completed'
                  ? `Completed ${formatDate(completedAt)}`
                  : status === 'in_progress'
                  ? `${currentQuestion} of ${totalQuestions} questions`
                  : '74 questions • ~45 minutes'
                }
              </p>
            </div>
          </div>

          {status !== 'not_started' && (
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${
              status === 'completed'
                ? 'bg-emerald-900/10 text-emerald-800'
                : 'bg-[#b59f3b]/10 text-[#b59f3b]'
            }`}>
              {status === 'completed' ? 'Complete' : `${progress}%`}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar for in_progress */}
      {status === 'in_progress' && (
        <div className="px-6 py-4 border-b border-[#e5e5e5]">
          <div className="h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#b59f3b] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {status === 'not_started' && (
          <>
            <p className="text-[#666] text-sm mb-4">
              Complete the full audit to unlock your comprehensive transformation roadmap,
              delegation framework, and system building priorities.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
              <div className="flex items-center gap-2 text-[#666]">
                <svg className="w-4 h-4 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Delegation roadmap
              </div>
              <div className="flex items-center gap-2 text-[#666]">
                <svg className="w-4 h-4 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                System priorities
              </div>
              <div className="flex items-center gap-2 text-[#666]">
                <svg className="w-4 h-4 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                IP extraction plan
              </div>
              <div className="flex items-center gap-2 text-[#666]">
                <svg className="w-4 h-4 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Action items
              </div>
            </div>
            <Link
              href="/full-audit"
              className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-emerald-900 hover:bg-emerald-950 text-white font-medium rounded-full transition-colors"
            >
              Start Full Audit
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </>
        )}

        {status === 'in_progress' && (
          <>
            <p className="text-[#666] text-sm mb-4">
              You&apos;re making great progress. Pick up where you left off to complete your transformation roadmap.
            </p>
            <Link
              href="/full-audit"
              className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-emerald-900 hover:bg-emerald-950 text-white font-medium rounded-full transition-colors"
            >
              Continue Audit
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </>
        )}

        {status === 'completed' && (
          <>
            <p className="text-[#666] text-sm mb-4">
              Your full audit is complete. View your comprehensive results and transformation roadmap.
            </p>
            <Link
              href="/full-audit/results"
              className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-emerald-900 hover:bg-emerald-950 text-white font-medium rounded-full transition-colors"
            >
              View Results
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
