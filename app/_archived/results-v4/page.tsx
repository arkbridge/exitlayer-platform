'use client';

// Option 4: The Running Total (New Frame)
// Show how each structural problem costs you time AND money

const mockData = {
  currentValuation: 420000,
  potentialValuation: 1800000,
  valuationGap: 1380000,
  sde: 300000,
  companyName: 'Acme Digital',
  topClientPct: 35,
  recurringPct: 15,
  ownerHoursPerWeek: 55,
  currentMultiple: 1.4,
  potentialMultiple: 6.0,
};

const problems = [
  {
    issue: 'You handle all sales and strategy',
    lifeCost: '+15 hours/week',
    exitCost: -180000,
    fix: 'Hire or train someone to handle 80% of it'
  },
  {
    issue: 'No documented processes',
    lifeCost: 'Can\'t delegate',
    exitCost: -150000,
    fix: 'Document your top 5 processes'
  },
  {
    issue: 'Top client is 35% of revenue',
    lifeCost: 'Constant anxiety',
    exitCost: -210000,
    fix: 'Diversify with 2-3 new retainer clients'
  },
  {
    issue: 'Only 15% recurring revenue',
    lifeCost: 'Monthly hustle',
    exitCost: -240000,
    fix: 'Convert 3 project clients to retainers'
  },
];

const fmt = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
};

export default function ResultsV4() {
  const d = mockData;
  const totalExitLost = problems.reduce((sum, p) => sum + Math.abs(p.exitCost), 0);

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[#999] text-sm uppercase tracking-wider mb-3">{d.companyName}</p>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-[#1a1a1a] mb-4">
            What's Costing You
          </h1>
          <p className="text-[#666] max-w-lg mx-auto">
            Each structural problem has two costs: your time now, and your options later.
          </p>
        </div>

        {/* The problems with dual costs */}
        <div className="space-y-4 mb-8">
          {problems.map((p, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#e5e5e5] p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-[#1a1a1a] font-medium">{p.issue}</p>
                </div>
              </div>

              <div className="ml-9 grid md:grid-cols-2 gap-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-red-700/60 text-xs uppercase tracking-wider mb-1">Costs you now</p>
                  <p className="text-red-700 font-medium">{p.lifeCost}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-red-700/60 text-xs uppercase tracking-wider mb-1">Costs your exit</p>
                  <p className="text-red-700 font-medium">{fmt(Math.abs(p.exitCost))}</p>
                </div>
              </div>

              <div className="ml-9 mt-4 p-4 bg-emerald-50 rounded-lg">
                <p className="text-emerald-700/60 text-xs uppercase tracking-wider mb-1">The fix</p>
                <p className="text-emerald-800">{p.fix}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8 text-center">
            <div>
              <p className="text-[#999] text-sm uppercase tracking-wider mb-2">What you're giving up now</p>
              <p className="text-3xl font-bold text-red-600 mb-1">{d.ownerHoursPerWeek} hrs/week</p>
              <p className="text-[#666] text-sm">that you'll never get back</p>
            </div>
            <div>
              <p className="text-[#999] text-sm uppercase tracking-wider mb-2">What you're leaving on the table</p>
              <p className="text-3xl font-bold text-red-600 mb-1">{fmt(totalExitLost)}</p>
              <p className="text-[#666] text-sm">in exit value</p>
            </div>
          </div>
        </div>

        {/* What fixing looks like */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 mb-8">
          <h3 className="text-emerald-800 font-medium mb-4 text-center">After 3-6 months of structural fixes:</h3>
          <div className="grid md:grid-cols-2 gap-6 text-center">
            <div>
              <p className="text-emerald-700/60 text-sm uppercase tracking-wider mb-1">Your week</p>
              <p className="text-2xl font-bold text-emerald-700">30-35 hours</p>
            </div>
            <div>
              <p className="text-emerald-700/60 text-sm uppercase tracking-wider mb-1">Your exit price</p>
              <p className="text-2xl font-bold text-emerald-700">{fmt(d.potentialValuation)}</p>
            </div>
          </div>
          <p className="text-[#666] text-sm text-center mt-4 max-w-md mx-auto">
            You get your time back now. And you get options for later. Same revenue, different structure.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 rounded-2xl p-8 md:p-10 text-center text-white">
          <h2 className="text-2xl font-serif font-medium mb-4">
            Ready to stop paying these costs?
          </h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            30-minute call. I'll prioritize which fixes will give you the biggest time savings and the biggest exit value bump.
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

      {/* Version label */}
      <div className="fixed bottom-4 left-4 bg-emerald-900 text-white/70 text-xs px-3 py-1 rounded-full">
        V4: Running Total
      </div>
    </div>
  );
}
