'use client';

// Insight V3: The Reveal
// Build up with progressive disclosure / card stack

export default function InsightV3() {
  return (
    <div className="min-h-screen bg-[#f8f8f6] py-20 px-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-emerald-700 text-sm uppercase tracking-widest mb-4">
            What everyone gets wrong
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-[#1a1a1a] leading-tight">
            "Building to exit" isn't about selling.
          </h2>
        </div>

        {/* The cards */}
        <div className="space-y-6">

          {/* Card 1 - The reframe */}
          <div className="bg-white rounded-2xl p-8 md:p-10 border border-[#e5e5e5] shadow-sm">
            <p className="text-xl md:text-2xl text-[#1a1a1a] leading-relaxed">
              It's about building a business that <span className="font-semibold">doesn't require you to be there every day</span>.
            </p>
          </div>

          {/* Card 2 - The checklist */}
          <div className="bg-white rounded-2xl p-8 md:p-10 border border-[#e5e5e5] shadow-sm">
            <p className="text-[#999] text-sm uppercase tracking-wider mb-6">What that actually means</p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Documented processes',
                'Recurring revenue',
                'Team delivers without you',
                'Clients don\'t need your face',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                  <span className="text-[#1a1a1a] font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3 - The payoff */}
          <div className="bg-emerald-900 rounded-2xl p-8 md:p-10 text-white">
            <p className="text-emerald-300 text-sm uppercase tracking-wider mb-6">When you build these things</p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-3xl font-bold text-emerald-400">1</span>
                <p className="text-xl text-white/90">Your life gets dramatically better <span className="text-emerald-300">right now</span></p>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-3xl font-bold text-emerald-400">2</span>
                <p className="text-xl text-white/90">You have the option to leave <span className="text-emerald-300">whenever you want</span></p>
              </div>
            </div>
          </div>

          {/* Card 4 - The kicker */}
          <div className="bg-[#f0f0f0] rounded-2xl p-8 md:p-10 border border-[#e5e5e5]">
            <p className="text-lg text-[#666] leading-relaxed">
              You might not want to sell. That's fine. But right now, <span className="text-[#1a1a1a] font-medium">you couldn't if you tried</span>. And that lack of options is what's keeping you trapped.
            </p>
          </div>

        </div>

      </div>

      {/* Version label */}
      <div className="fixed bottom-4 left-4 bg-[#1a1a1a] text-white/70 text-xs px-3 py-1 rounded-full">
        V3: The Reveal (Card Stack)
      </div>
    </div>
  );
}
