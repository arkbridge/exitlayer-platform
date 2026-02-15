import Link from 'next/link'

export default function SchedulePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-[#666] hover:text-[#1a1a1a] text-sm transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-serif font-medium text-[#1a1a1a] mb-2">
          Schedule Your Kickoff Call
        </h1>
        <p className="text-[#666]">
          Your audit is complete and we have everything we need. Book a time to meet with Michael
          and kick off your 4-week transformation sprint.
        </p>
      </div>

      {/* What to expect */}
      <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 mb-8">
        <h2 className="text-lg font-serif font-medium text-[#1a1a1a] mb-4">What to Expect</h2>
        <ul className="space-y-3">
          {[
            'Review your audit results and custom build plan',
            'Validate system priorities and fill any gaps',
            'Confirm tool access and integration readiness',
            'Set expectations for the 4-week sprint',
            'Schedule your Week 2 check-in',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-900/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-800 text-xs font-medium">{i + 1}</span>
              </span>
              <span className="text-[#1a1a1a] text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Calendar embed placeholder */}
      <div className="bg-white rounded-xl border border-[#e5e5e5] p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-900/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <h3 className="text-xl font-serif font-medium text-[#1a1a1a] mb-3">
            Book Your Kickoff Call
          </h3>
          <p className="text-[#666] mb-6 max-w-md mx-auto">
            Choose a time that works for you. Calls typically last 45-60 minutes.
          </p>
          <a
            href="https://cal.com/exit-layer/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-900 hover:bg-emerald-950 text-white font-medium rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book a Call with Michael
          </a>
        </div>
      </div>
    </div>
  )
}
