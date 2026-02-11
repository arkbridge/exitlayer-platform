'use client';

// Insight V2: The Manifesto
// Dark background, centered, impactful

export default function InsightV2() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-6">
      <div className="max-w-3xl text-center">

        {/* Eyebrow */}
        <p className="text-emerald-500 text-sm uppercase tracking-widest mb-8">
          The truth about "building to exit"
        </p>

        {/* The manifesto */}
        <div className="space-y-8">
          <p className="text-2xl md:text-3xl lg:text-4xl text-white/90 leading-relaxed font-light">
            The advice isn't about selling.
          </p>

          <p className="text-2xl md:text-3xl lg:text-4xl text-white font-medium leading-relaxed">
            It's about building a business that doesn't need you there every day.
          </p>

          <div className="py-8 border-t border-b border-white/10 my-12">
            <p className="text-lg md:text-xl text-white/60 leading-relaxed">
              Documented processes. Recurring revenue. A team that delivers without your approval. Client relationships that don't depend on you.
            </p>
          </div>

          <p className="text-xl md:text-2xl text-white/80 leading-relaxed">
            Build these things and two things happen:
          </p>

          <div className="grid md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <p className="text-emerald-400 text-sm uppercase tracking-wider mb-2">Now</p>
              <p className="text-white text-xl font-medium">Your life gets dramatically better</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <p className="text-emerald-400 text-sm uppercase tracking-wider mb-2">Later</p>
              <p className="text-white text-xl font-medium">You have the option to leave</p>
            </div>
          </div>

          <p className="text-white/40 text-lg mt-12 max-w-xl mx-auto">
            You might not want to sell. That's fine. But right now, you couldn't if you tried. That lack of options is what's keeping you trapped.
          </p>
        </div>

      </div>

      {/* Version label */}
      <div className="fixed bottom-4 left-4 bg-white/10 text-white/70 text-xs px-3 py-1 rounded-full">
        V2: The Manifesto
      </div>
    </div>
  );
}
