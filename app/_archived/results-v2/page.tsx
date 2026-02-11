'use client';

// Option 2: The Side-by-Side (New Frame)
// Hit with current value, then compare life now vs life after

const mockData = {
  currentValuation: 420000,
  potentialValuation: 1800000,
  valuationGap: 1380000,
  companyName: 'Acme Digital',
  ownerHoursPerWeek: 55,
  topClientPct: 35,
  recurringPct: 15,
  currentMultiple: 1.4,
  potentialMultiple: 6.0,
  sde: 300000,
};

const comparison = [
  { category: 'Your week', now: '55+ hours', after: '10-20 hours' },
  { category: 'Vacation', now: 'Checking email constantly', after: 'Actually disconnected' },
  { category: 'Client calls', now: 'You handle them all', after: 'Team handles 80%' },
  { category: 'Revenue risk', now: 'Top client = 35%', after: 'No client > 15%' },
  { category: 'Monthly hustle', now: '85% project-based', after: '60%+ recurring' },
  { category: 'If you leave', now: 'Business dies', after: 'Business runs' },
];

const fmt = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
};

export default function ResultsV2() {
  const d = mockData;

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-[#999] text-sm uppercase tracking-wider mb-3">{d.companyName}</p>
        </div>

        {/* THE GUT PUNCH - Current Valuation */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-8 md:p-12 mb-4 text-center">
          <p className="text-[#999] text-sm uppercase tracking-wider mb-4">Your agency is currently worth</p>
          <div className="text-6xl md:text-7xl font-bold text-[#1a1a1a] mb-4">
            {fmt(d.currentValuation)}
          </div>
          <p className="text-[#999]">
            {fmt(d.sde)} SDE × {d.currentMultiple} multiple
          </p>
        </div>

        {/* The "why" teaser */}
        <div className="text-center mb-10">
          <p className="text-[#666]">
            That {d.currentMultiple}x multiple? It's not random. It's a reflection of how the business runs today.
          </p>
        </div>

        {/* The Comparison Table */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden mb-8">
          {/* Table Header */}
          <div className="grid grid-cols-3 border-b border-[#e5e5e5]">
            <div className="p-4 bg-[#f8f8f6]"></div>
            <div className="p-4 bg-red-50/50 text-center border-l border-[#e5e5e5]">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-red-800 font-medium text-sm uppercase tracking-wider">Now</span>
              </div>
            </div>
            <div className="p-4 bg-emerald-50/50 text-center border-l border-[#e5e5e5]">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-emerald-800 font-medium text-sm uppercase tracking-wider">After</span>
              </div>
            </div>
          </div>

          {/* Table Rows */}
          {comparison.map((row, i) => (
            <div key={i} className="grid grid-cols-3 border-b border-[#e5e5e5]">
              <div className="p-4 text-[#666] text-sm font-medium bg-[#f8f8f6]">
                {row.category}
              </div>
              <div className="p-4 text-center border-l border-[#e5e5e5]">
                <span className="font-medium text-red-700">{row.now}</span>
              </div>
              <div className="p-4 text-center border-l border-[#e5e5e5]">
                <span className="font-medium text-emerald-700">{row.after}</span>
              </div>
            </div>
          ))}

          {/* Exit Price Row - Highlighted */}
          <div className="grid grid-cols-3 bg-gradient-to-r from-[#f8f8f6] to-transparent">
            <div className="p-5 text-[#1a1a1a] font-semibold bg-[#f8f8f6]">
              Exit price
            </div>
            <div className="p-5 text-center border-l border-[#e5e5e5] bg-red-50">
              <span className="text-2xl font-bold text-red-600">{fmt(d.currentValuation)}</span>
            </div>
            <div className="p-5 text-center border-l border-[#e5e5e5] bg-emerald-50">
              <span className="text-2xl font-bold text-emerald-600">{fmt(d.potentialValuation)}</span>
            </div>
          </div>
        </div>

        {/* The insight */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 md:p-8 mb-8">
          <div className="space-y-4 text-[#666]">
            <p>
              The left column is why you're working {d.ownerHoursPerWeek} hours a week. The right column is what happens when you fix the structure.
            </p>
            <p>
              Same agency. Same revenue. Different multiple because the business actually runs without you in it.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 rounded-2xl p-8 md:p-10 text-white text-center">
          <h2 className="text-2xl font-serif font-medium mb-4">
            {fmt(d.currentValuation)} → {fmt(d.potentialValuation)} in 3-6 months
          </h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            30-minute call. I'll map out which fixes move the needle fastest for your situation.
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
        V2: Side-by-Side
      </div>
    </div>
  );
}
