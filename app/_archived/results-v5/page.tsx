'use client';

// Option 5: The Fork in the Road (New Frame)
// Two paths focused on life quality AND exit options

const mockData = {
  currentValuation: 420000,
  potentialValuation: 1800000,
  companyName: 'Acme Digital',
  ownerHoursPerWeek: 55,
  topClientPct: 35,
  currentMultiple: 1.4,
  potentialMultiple: 6.0,
};

const pathA = [
  { time: 'Now', hours: '55 hrs/week', exit: '$420K', note: 'where you are' },
  { time: '6 months', hours: '55 hrs/week', exit: '$400K', note: 'nothing changes' },
  { time: '12 months', hours: '60 hrs/week', exit: '$350K', note: 'burnout creeps in' },
  { time: '24 months', hours: '???', exit: '???', note: 'something has to give' },
];

const pathB = [
  { time: 'Now', hours: '55 hrs/week', exit: '$420K', note: 'where you are' },
  { time: '3 months', hours: '45 hrs/week', exit: '$750K', note: 'first systems in place' },
  { time: '6 months', hours: '35 hrs/week', exit: '$1.4M', note: 'team handles delivery' },
  { time: '9 months', hours: '30 hrs/week', exit: '$1.8M', note: 'you have options' },
];

const fmt = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
};

export default function ResultsV5() {
  const d = mockData;

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[#999] text-sm uppercase tracking-wider mb-3">{d.companyName}</p>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-[#1a1a1a] mb-2">
            Two Paths From Here
          </h1>
          <p className="text-[#666]">Same agency. Different next 12 months.</p>
        </div>

        {/* Two Paths Side by Side */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">

          {/* Path A - Do Nothing */}
          <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
            <div className="bg-red-50 border-b border-red-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-bold">A</span>
                </div>
                <h2 className="text-lg font-medium text-red-900">Keep Going As-Is</h2>
              </div>
              <p className="text-red-700/60 text-sm">Same structure, same problems</p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {pathA.map((step, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${i === pathA.length - 1 ? 'bg-red-500' : 'bg-red-300'}`} />
                      <div>
                        <p className="text-[#1a1a1a] font-medium">{step.time}</p>
                        <p className="text-[#999] text-xs">{step.note}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 font-medium">{step.hours}</p>
                      <p className="text-[#999] text-xs">{step.exit}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
                <p className="text-[#666] text-sm">
                  Your hours don't go down. Your exit options don't improve. Eventually something breaks.
                </p>
              </div>
            </div>
          </div>

          {/* Path B - Fix the Structure */}
          <div className="bg-white rounded-2xl border-2 border-emerald-300 overflow-hidden">
            <div className="bg-emerald-50 border-b border-emerald-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-700 font-bold">B</span>
                </div>
                <h2 className="text-lg font-medium text-emerald-900">Fix the Structure</h2>
              </div>
              <p className="text-emerald-700/60 text-sm">6-9 months of focused work</p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {pathB.map((step, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${i === pathB.length - 1 ? 'bg-emerald-500' : 'bg-emerald-300'}`} />
                      <div>
                        <p className="text-[#1a1a1a] font-medium">{step.time}</p>
                        <p className="text-[#999] text-xs">{step.note}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-700 font-medium">{step.hours}</p>
                      <p className="text-[#999] text-xs">{step.exit}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-emerald-100">
                <p className="text-[#666] text-sm">
                  Your hours go down. Your exit price goes up. You get options: stay, sell, or step back.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* The insight */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 md:p-8 mb-8">
          <h3 className="text-lg font-medium text-[#1a1a1a] mb-4">Here's what most agency owners miss:</h3>
          <div className="space-y-4 text-[#666]">
            <p>
              Path A feels like the safe option because it doesn't require change. But it's not safe. It's just slow decline.
            </p>
            <p>
              The {d.ownerHoursPerWeek}-hour weeks don't get better on their own. The client concentration risk doesn't go away. The lack of exit options doesn't resolve itself.
            </p>
            <p>
              Path B requires work upfront. But at the end, you have <span className="text-[#1a1a1a] font-medium">25 hours of your week back</span> and <span className="text-[#1a1a1a] font-medium">{fmt(d.potentialValuation - d.currentValuation)} more in exit value</span>.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 rounded-2xl p-8 md:p-10 text-white text-center">
          <h2 className="text-2xl font-serif font-medium mb-4">
            Which path are you taking?
          </h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            If it's Path B, let's talk. 30 minutes to map out the first 90 days.
          </p>
          <a
            href="https://cal.com/exit-layer/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-10 py-4 bg-white text-emerald-900 font-medium rounded-full hover:bg-[#f8f8f6] transition-colors"
          >
            Take Path B
          </a>
          <p className="text-white/30 text-sm mt-6">No pitch deck. Just the plan.</p>
        </div>
      </div>

      {/* Version label */}
      <div className="fixed bottom-4 left-4 bg-emerald-900 text-white/70 text-xs px-3 py-1 rounded-full">
        V5: Fork in the Road
      </div>
    </div>
  );
}
