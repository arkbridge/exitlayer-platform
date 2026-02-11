'use client';

// Insight V5: The Pull Quote
// Giant quote treatment, editorial style

export default function InsightV5() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-4xl text-center">

        {/* Giant opening quote mark */}
        <div className="text-[200px] md:text-[300px] font-serif text-[#f0f0f0] leading-none select-none -mb-32 md:-mb-48">
          "
        </div>

        {/* The quote */}
        <blockquote className="relative">
          <p className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#1a1a1a] leading-tight mb-8">
            Building to exit isn't about selling. It's about building a business that doesn't need you there every day.
          </p>
        </blockquote>

        {/* The explanation */}
        <div className="max-w-2xl mx-auto mt-16 space-y-6 text-left">
          <p className="text-lg text-[#666] leading-relaxed">
            Documented processes. Recurring revenue. A team that can deliver without you approving everything. Client relationships that don't depend on your personal involvement.
          </p>

          <div className="flex gap-6 py-6">
            <div className="flex-1 border-t-2 border-emerald-500 pt-4">
              <p className="text-emerald-700 text-sm uppercase tracking-wider mb-1">What you get now</p>
              <p className="text-[#1a1a1a] font-semibold text-lg">Your life gets dramatically better</p>
            </div>
            <div className="flex-1 border-t-2 border-emerald-500 pt-4">
              <p className="text-emerald-700 text-sm uppercase tracking-wider mb-1">What you get later</p>
              <p className="text-[#1a1a1a] font-semibold text-lg">The option to leave whenever you want</p>
            </div>
          </div>

          <p className="text-[#999] text-lg leading-relaxed italic">
            You might not want to sell. That's fine. But right now, you couldn't if you tried. And that lack of options is what's keeping you trapped.
          </p>
        </div>

      </div>

      {/* Version label */}
      <div className="fixed bottom-4 left-4 bg-[#1a1a1a] text-white/70 text-xs px-3 py-1 rounded-full">
        V5: Pull Quote Editorial
      </div>
    </div>
  );
}
