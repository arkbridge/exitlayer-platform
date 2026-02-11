'use client';

// Option 1: The Gut Punch (New Frame)
// Lead with the trap, show the fix = better life + exit option

import { useState } from 'react';

const mockData = {
  currentValuation: 420000,
  potentialValuation: 1800000,
  valuationGap: 1380000,
  sde: 300000,
  companyName: 'Acme Digital',
  ownerHoursPerWeek: 55,
  topClientPct: 35,
  recurringPct: 15,
  currentMultiple: 1.4,
  potentialMultiple: 6.0,
};

const fmt = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
};

export default function ResultsV1() {
  const [showDetails, setShowDetails] = useState(false);
  const d = mockData;

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* The Hit - Full screen */}
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-red-600/60 text-sm font-medium uppercase tracking-wider mb-6">
          {d.companyName} — The Problem
        </p>

        <h1 className="text-4xl md:text-6xl font-serif font-medium text-[#1a1a1a] leading-tight mb-6 max-w-2xl">
          Your agency can't run without you.
        </h1>

        <p className="text-[#666] text-xl mb-4 max-w-lg">
          That's why you're working {d.ownerHoursPerWeek} hours a week. And it's why your exit price is only <span className="text-red-600 font-bold">{fmt(d.currentValuation)}</span>.
        </p>

        <p className="text-[#999] text-lg mb-12 max-w-lg">
          Same structural problem. Two symptoms.
        </p>

        <a
          href="https://cal.com/exit-layer/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="px-12 py-5 bg-emerald-900 text-white font-medium rounded-full text-lg hover:bg-emerald-950 transition-colors mb-8"
        >
          Fix the Structure
        </a>

        <button
          onClick={() => setShowDetails(true)}
          className="text-[#999] text-sm hover:text-[#666] transition-colors flex items-center gap-2"
        >
          See what's trapping you
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Details Section */}
      {showDetails && (
        <div className="bg-white border-t border-[#e5e5e5] px-6 py-16">
          <div className="max-w-2xl mx-auto space-y-10">

            {/* The structural problems */}
            <div>
              <h3 className="text-[#999] text-sm uppercase tracking-wider mb-6">What's trapping you</h3>
              <div className="space-y-6">
                <div className="p-6 bg-[#f8f8f6] rounded-xl border border-[#e5e5e5]">
                  <p className="text-[#1a1a1a] font-medium mb-2">You're the bottleneck for everything.</p>
                  <p className="text-[#666]">Pricing, client issues, project direction. Nothing moves without your approval. That's why you can't take a real vacation and why an acquirer would only pay {d.currentMultiple}x.</p>
                </div>

                <div className="p-6 bg-[#f8f8f6] rounded-xl border border-[#e5e5e5]">
                  <p className="text-[#1a1a1a] font-medium mb-2">Your top client is {d.topClientPct}% of revenue.</p>
                  <p className="text-[#666]">You think about what would happen if they left. That stress doesn't go away. And acquirers see the same risk you do.</p>
                </div>

                <div className="p-6 bg-[#f8f8f6] rounded-xl border border-[#e5e5e5]">
                  <p className="text-[#1a1a1a] font-medium mb-2">Only {d.recurringPct}% of your revenue recurs.</p>
                  <p className="text-[#666]">Every month you're hustling for new projects. That's exhausting for you and risky for anyone thinking about buying.</p>
                </div>
              </div>
            </div>

            {/* What fixing it looks like */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8">
              <h3 className="text-emerald-800 font-medium mb-4">What happens when you fix the structure:</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-emerald-700/60 text-sm uppercase tracking-wider mb-2">Your life</p>
                  <ul className="text-[#666] space-y-2">
                    <li>• 30-35 hour weeks instead of 55</li>
                    <li>• Real vacations without checking email</li>
                    <li>• Team handles delivery without you</li>
                  </ul>
                </div>
                <div>
                  <p className="text-emerald-700/60 text-sm uppercase tracking-wider mb-2">Your options</p>
                  <ul className="text-[#666] space-y-2">
                    <li>• Exit price goes from {fmt(d.currentValuation)} to {fmt(d.potentialValuation)}</li>
                    <li>• You can sell, stay, or step back</li>
                    <li>• You're no longer trapped</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 rounded-2xl p-8 md:p-10 text-white text-center">
              <h3 className="text-xl font-serif font-medium mb-3">
                This takes 3-6 months to fix.
              </h3>
              <p className="text-white/60 mb-6 max-w-md mx-auto">
                30-minute call. I'll walk through your specific structural issues and show you the fastest path to getting your life back.
              </p>
              <a
                href="https://cal.com/exit-layer/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex px-10 py-4 bg-white text-emerald-900 font-medium rounded-full hover:bg-[#f8f8f6] transition-colors"
              >
                Book the Call
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Version label */}
      <div className="fixed bottom-4 left-4 bg-emerald-900 text-white/70 text-xs px-3 py-1 rounded-full">
        V1: Gut Punch
      </div>
    </div>
  );
}
