'use client';

// Insight V4: Split Layout
// Left side = headline, Right side = content

export default function InsightV4() {
  return (
    <div className="min-h-screen bg-[#f8f8f6] flex items-center p-6">
      <div className="max-w-6xl mx-auto">

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left - The headline */}
          <div className="lg:sticky lg:top-20">
            <p className="text-emerald-700 text-sm uppercase tracking-widest mb-6">
              The real secret
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-[#1a1a1a] leading-[1.1]">
              "Building to exit" isn't about selling.
            </h2>
          </div>

          {/* Right - The content */}
          <div className="space-y-8">

            <p className="text-xl md:text-2xl text-[#666] leading-relaxed">
              It's about building a business that doesn't require you to be there every day.
            </p>

            <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
              <p className="text-[#999] text-xs uppercase tracking-wider mb-4">The building blocks</p>
              <ul className="space-y-3 text-[#1a1a1a]">
                <li className="flex items-center gap-3">
                  <span className="text-emerald-500">→</span>
                  Documented processes
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-emerald-500">→</span>
                  Recurring revenue
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-emerald-500">→</span>
                  A team that can deliver without you approving everything
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-emerald-500">→</span>
                  Client relationships that don't depend on your personal involvement
                </li>
              </ul>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <p className="text-emerald-900 text-lg leading-relaxed">
                When you build these things, two things happen: <strong>your life gets dramatically better</strong>, and <strong>you have the option to leave</strong> whenever you want.
              </p>
            </div>

            <p className="text-[#999] text-lg leading-relaxed border-l-2 border-[#e5e5e5] pl-6">
              You might not want to sell. That's fine. But right now, you couldn't if you tried. And that lack of options is what's keeping you trapped.
            </p>

          </div>

        </div>

      </div>

      {/* Version label */}
      <div className="fixed bottom-4 left-4 bg-[#1a1a1a] text-white/70 text-xs px-3 py-1 rounded-full">
        V4: Split Layout
      </div>
    </div>
  );
}
