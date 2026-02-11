'use client';

// V6: The Diagnosis
// Flow: Current Worth → Issues (with their data) → Potential Worth → CTA

const mockData = {
  companyName: 'Acme Digital',
  // Current state
  currentValuation: 420000,
  currentMultiple: 1.4,
  sde: 300000,
  // Issues (from their audit)
  ownerHoursPerWeek: 55,
  topClientPct: 35,
  recurringPct: 15,
  projectsRequiringOwner: 75,
  documentedPct: 10,
  // Potential
  potentialValuation: 1800000,
  potentialMultiple: 6.0,
};

const fmt = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
};

export default function ResultsV6() {
  const d = mockData;
  const valuationGap = d.potentialValuation - d.currentValuation;

  // Build issues from their data
  const issues = [
    {
      issue: 'Owner Dependency',
      yourData: `${d.projectsRequiringOwner}% of projects require your direct involvement`,
      impact: 'Acquirers see a job, not a business. They discount accordingly.',
      multiplierHit: '-1.5x',
    },
    {
      issue: 'Client Concentration',
      yourData: `Your top client is ${d.topClientPct}% of revenue`,
      impact: 'One phone call could cut your revenue by a third. That risk gets priced in.',
      multiplierHit: '-1.0x',
    },
    {
      issue: 'Project-Based Revenue',
      yourData: `Only ${d.recurringPct}% recurring revenue`,
      impact: 'Revenue resets every month. No predictability means lower valuation.',
      multiplierHit: '-0.8x',
    },
    {
      issue: 'Nothing Documented',
      yourData: `${d.documentedPct}% of processes written down`,
      impact: 'Knowledge lives in your head. Nothing transfers in a sale.',
      multiplierHit: '-0.5x',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#999] text-sm uppercase tracking-wider mb-3">{d.companyName}</p>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-[#1a1a1a] mb-2">
            Your Agency Valuation
          </h1>
        </div>

        {/* ========================================== */}
        {/* SECTION 1: CURRENT WORTH */}
        {/* ========================================== */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-8 md:p-10 mb-8">
          <p className="text-[#999] text-sm uppercase tracking-wider mb-4">Based on your audit</p>

          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-5xl md:text-6xl font-bold text-[#1a1a1a]">{fmt(d.currentValuation)}</span>
            <span className="text-[#999] text-lg">at {d.currentMultiple}x SDE</span>
          </div>

          <div className="bg-[#f8f8f6] rounded-xl p-4 inline-block">
            <p className="text-[#666] text-sm">
              SDE of {fmt(d.sde)} × {d.currentMultiple} multiple = {fmt(d.currentValuation)}
            </p>
          </div>
        </div>

        {/* ========================================== */}
        {/* SECTION 2: WHY IT'S THAT LOW */}
        {/* ========================================== */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-[#1a1a1a] mb-6">Why your multiple is {d.currentMultiple}x instead of {d.potentialMultiple}x</h2>

          <div className="space-y-4">
            {issues.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#e5e5e5] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-red-600 text-sm font-bold">{i + 1}</span>
                      </div>
                      <h3 className="font-medium text-[#1a1a1a]">{item.issue}</h3>
                    </div>

                    <div className="ml-11 space-y-2">
                      <p className="text-[#1a1a1a]">
                        <span className="text-[#999] text-sm">Your data: </span>
                        {item.yourData}
                      </p>
                      <p className="text-[#666] text-sm">{item.impact}</p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-red-600 font-bold text-lg">{item.multiplierHit}</span>
                    <p className="text-[#999] text-xs">multiple</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================== */}
        {/* SECTION 3: WHAT IT SHOULD BE */}
        {/* ========================================== */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 md:p-10 mb-8">
          <p className="text-emerald-700/60 text-sm uppercase tracking-wider mb-4">If you fix these structural issues</p>

          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-5xl md:text-6xl font-bold text-emerald-700">{fmt(d.potentialValuation)}</span>
            <span className="text-emerald-600/60 text-lg">at {d.potentialMultiple}x SDE</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-emerald-800/60 text-sm uppercase tracking-wider mb-2">The gap</p>
              <p className="text-2xl font-bold text-emerald-700">{fmt(valuationGap)}</p>
              <p className="text-[#666] text-sm mt-1">left on the table</p>
            </div>
            <div>
              <p className="text-emerald-800/60 text-sm uppercase tracking-wider mb-2">Your week</p>
              <p className="text-2xl font-bold text-emerald-700">{d.ownerHoursPerWeek} hrs → 30 hrs</p>
              <p className="text-[#666] text-sm mt-1">same revenue, less of you</p>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* INSIGHT */}
        {/* ========================================== */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-8 mb-8">
          <p className="text-[#666] leading-relaxed">
            The {d.ownerHoursPerWeek}-hour weeks and the {fmt(d.currentValuation)} valuation come from the same place: structural issues that make you the bottleneck. Fix the structure, and both problems go away. You get your time back now, and you get options for later.
          </p>
        </div>

        {/* ========================================== */}
        {/* CTA */}
        {/* ========================================== */}
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 rounded-2xl p-8 md:p-10 text-white">
          <div className="max-w-xl">
            <h2 className="text-2xl font-serif font-medium mb-4">
              Want to see the path from {fmt(d.currentValuation)} to {fmt(d.potentialValuation)}?
            </h2>
            <p className="text-white/60 mb-8">
              30 minutes. I'll walk through which structural fixes would have the biggest impact on your specific situation, and what the first 90 days would look like.
            </p>
            <a
              href="https://cal.com/exit-layer/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex px-8 py-4 bg-white text-emerald-900 font-medium rounded-full hover:bg-[#f8f8f6] transition-colors"
            >
              Book the Call
            </a>
          </div>
        </div>
      </div>

      {/* Version label */}
      <div className="fixed bottom-4 left-4 bg-emerald-900 text-white/70 text-xs px-3 py-1 rounded-full">
        V6: The Diagnosis
      </div>
    </div>
  );
}
