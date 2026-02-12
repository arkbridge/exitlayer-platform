'use client'

import Link from 'next/link'

export default function UpgradePage() {
  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Navigation */}
      <nav className="border-b border-[#e5e5e5] bg-[#f8f8f6]">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg font-medium text-[#1a1a1a] tracking-tight">
              ExitLayer
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-[#666] hover:text-[#1a1a1a] transition-colors text-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-medium text-[#1a1a1a] mb-4">
            Let&apos;s Talk About Your Exit
          </h1>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            You&apos;ve seen your ExitLayer Score. Book a free discovery call to
            walk through your results and map out a plan to close the gap.
          </p>
        </div>

        {/* What to expect */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-8 mb-8">
          <h2 className="text-xl font-serif font-medium text-[#1a1a1a] mb-6">
            On the Call, We&apos;ll Cover
          </h2>
          <ul className="space-y-4">
            {[
              { title: 'Your ExitLayer Score Breakdown', desc: 'Walk through your assessment results across all 5 dimensions' },
              { title: 'Where You\'re Leaving Money on the Table', desc: 'Identify the specific gaps dragging down your valuation' },
              { title: 'Your Custom Automation Roadmap', desc: 'See exactly which systems would move the needle for your agency' },
              { title: 'Implementation Timeline', desc: 'Understand what a 4-week transformation sprint looks like for your business' },
            ].map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-900/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-800 text-xs font-medium">{i + 1}</span>
                </span>
                <div>
                  <p className="font-medium text-[#1a1a1a]">{item.title}</p>
                  <p className="text-sm text-[#666]">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Calendar embed */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-8">
          <div className="text-center">
            {process.env.NEXT_PUBLIC_CALENDLY_URL ? (
              <iframe
                src={process.env.NEXT_PUBLIC_CALENDLY_URL}
                width="100%"
                height="700"
                frameBorder="0"
                className="rounded-lg"
              />
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-900/10 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif font-medium text-[#1a1a1a] mb-3">
                  Book Your Free Discovery Call
                </h3>
                <p className="text-[#666] mb-6 max-w-md mx-auto">
                  30 minutes with Michael. No pressure, no pitch deck — just a honest
                  look at where your agency stands and what&apos;s possible.
                </p>
                <a
                  href="mailto:michael@exitlayer.io?subject=ExitLayer%20Discovery%20Call"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-900 hover:bg-emerald-950 text-white font-medium rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Michael to Schedule
                </a>
                <p className="text-[#999] text-xs mt-4">
                  Calendar booking coming soon
                </p>
              </>
            )}
          </div>
        </div>

        {/* Trust */}
        <p className="text-center text-[#999] text-sm mt-8">
          150+ agency owners assessed. No obligation, no hard sell.
        </p>
      </div>
    </div>
  )
}
