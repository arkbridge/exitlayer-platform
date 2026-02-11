'use client';

// Insight V1: Full-Width Dramatic
// Big typography, full bleed, statement style

export default function InsightV1() {
  return (
    <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center p-6">
      <div className="max-w-4xl">

        {/* Big statement header */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-[#1a1a1a] leading-tight mb-12">
          Here's what nobody tells you about "building to exit":
        </h2>

        {/* Large body copy */}
        <div className="space-y-8 text-xl md:text-2xl text-[#666] leading-relaxed">
          <p>
            The advice isn't really about selling. It's about building a business that doesn't require you to be there every day.
          </p>

          <p className="text-[#1a1a1a] font-medium">
            Documented processes. Recurring revenue. A team that can deliver without you approving everything. Client relationships that don't depend on your personal involvement.
          </p>

          <p>
            When you build these things, two things happen: <span className="text-[#1a1a1a] font-semibold">your life gets dramatically better</span>, and <span className="text-[#1a1a1a] font-semibold">you have the option to leave</span> whenever you want.
          </p>

          <p className="text-[#999]">
            You might not want to sell. That's fine. But right now, you couldn't if you tried. And that lack of options is what's keeping you trapped.
          </p>
        </div>

      </div>

      {/* Version label */}
      <div className="fixed bottom-4 left-4 bg-[#1a1a1a] text-white/70 text-xs px-3 py-1 rounded-full">
        V1: Full-Width Dramatic
      </div>
    </div>
  );
}
