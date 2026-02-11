'use client';

// Option 3: The Report Card (New Frame)
// Grade the structural issues with impact on life AND exit

const mockData = {
  currentValuation: 420000,
  potentialValuation: 1800000,
  companyName: 'Acme Digital',
  ownerHoursPerWeek: 55,
  topClientPct: 35,
  currentMultiple: 1.4,
  potentialMultiple: 6.0,
};

const grades = [
  {
    category: 'Owner Dependency',
    grade: 'F',
    lifeImpact: 'You work 55 hours because nothing moves without you. No real vacations. Constant fires.',
    exitImpact: 'Acquirers see a job, not a business. They offer 1.4x instead of 4x.',
    fix: 'Document decisions. Train someone to handle 80% of what you do.'
  },
  {
    category: 'Revenue Stability',
    grade: 'D',
    lifeImpact: 'Monthly hustle for new projects. The stress of not knowing what next month looks like.',
    exitImpact: 'Unpredictable revenue = risky investment. Heavy discount on your multiple.',
    fix: 'Convert 3 project clients to retainers. Build recurring revenue to 50%+.'
  },
  {
    category: 'Client Concentration',
    grade: 'C',
    lifeImpact: 'You think about what happens if your biggest client leaves. That anxiety never goes away.',
    exitImpact: 'One client at 35% = deal killer. Acquirers either walk or discount 40%.',
    fix: 'Add 2-3 new clients. Get no single client above 15%.'
  },
  {
    category: 'Documentation',
    grade: 'F',
    lifeImpact: 'Can\'t delegate because nothing is written down. You\'re the only one who knows how things work.',
    exitImpact: 'Nothing transfers in a sale. The business dies when you leave.',
    fix: 'Document your top 5 processes. Build a playbook someone else can follow.'
  },
];

const gradeColors: Record<string, { bg: string; text: string; border: string }> = {
  'A': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  'B': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  'C': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  'D': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  'F': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
};

const fmt = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
};

export default function ResultsV3() {
  const d = mockData;
  const failingGrades = grades.filter(g => g.grade === 'F' || g.grade === 'D').length;

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[#999] text-sm uppercase tracking-wider mb-3">{d.companyName}</p>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-[#1a1a1a] mb-2">
            Structural Assessment
          </h1>
          <p className="text-[#666]">{failingGrades} issues affecting your daily life and exit options</p>
        </div>

        {/* Grade Breakdown */}
        <div className="space-y-6 mb-8">
          {grades.map((item, i) => {
            const colors = gradeColors[item.grade] || gradeColors['D'];
            return (
              <div key={i} className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
                <div className="p-6 border-b border-[#e5e5e5]">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
                      <span className={`text-2xl font-bold ${colors.text}`}>{item.grade}</span>
                    </div>
                    <h3 className="text-lg font-medium text-[#1a1a1a]">{item.category}</h3>
                  </div>
                </div>

                <div className="p-6 grid md:grid-cols-2 gap-4">
                  <div className="bg-red-50/50 rounded-lg p-4">
                    <p className="text-red-700/60 text-xs uppercase tracking-wider mb-2">Impact on your life</p>
                    <p className="text-[#666] text-sm">{item.lifeImpact}</p>
                  </div>
                  <div className="bg-red-50/50 rounded-lg p-4">
                    <p className="text-red-700/60 text-xs uppercase tracking-wider mb-2">Impact on your exit</p>
                    <p className="text-[#666] text-sm">{item.exitImpact}</p>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <p className="text-emerald-700/60 text-xs uppercase tracking-wider mb-2">The fix</p>
                    <p className="text-emerald-800 text-sm">{item.fix}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 mb-8">
          <h3 className="text-emerald-800 font-medium mb-4 text-center">What fixing these grades gets you</h3>
          <div className="grid md:grid-cols-2 gap-6 text-center">
            <div>
              <p className="text-emerald-700/60 text-sm uppercase tracking-wider mb-1">Your week</p>
              <p className="text-2xl font-bold text-emerald-700">55 hrs → 30 hrs</p>
            </div>
            <div>
              <p className="text-emerald-700/60 text-sm uppercase tracking-wider mb-1">Your exit price</p>
              <p className="text-2xl font-bold text-emerald-700">{fmt(d.currentValuation)} → {fmt(d.potentialValuation)}</p>
            </div>
          </div>
          <p className="text-[#666] text-sm text-center mt-4">
            Same problems, same fixes. Better life now, options for later.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 rounded-2xl p-8 md:p-10 text-white text-center">
          <h2 className="text-2xl font-serif font-medium mb-4">
            Ready to improve your grades?
          </h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            30-minute call. I'll prioritize which fixes will give you the biggest improvement in both categories.
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
        V3: Report Card
      </div>
    </div>
  );
}
