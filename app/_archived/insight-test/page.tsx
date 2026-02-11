'use client';

// Insight Test: Combines ideas 1, 5, 6, 7
// - Setup/eyebrow before the card
// - Sharper kicker
// - Visual element
// - Highlight the paradox

export default function InsightTest() {
  return (
    <div className="min-h-screen bg-[#f8f8f6] py-20">

      {/* The Insight Section */}
      <section className="max-w-4xl mx-auto px-6">

        {/* Setup / Eyebrow - Idea #1 */}
        <div className="text-center mb-8">
          <p className="text-emerald-700 text-sm uppercase tracking-widest font-medium">
            What "build to exit" actually means
          </p>
        </div>

        {/* The Card - Same format, enhanced content */}
        <div className="bg-white rounded-3xl border border-[#e5e5e5] p-10 md:p-14 lg:p-16">

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-medium text-[#1a1a1a] mb-8">
            Here's what nobody tells you about "building to exit":
          </h2>

          <div className="space-y-6 text-[#666] text-lg md:text-xl leading-relaxed">
            <p>
              The advice isn't really about selling. It's about building a business that doesn't require you to be there every day.
            </p>

            <p>
              Documented processes. Recurring revenue. A team that can deliver without you approving everything. Client relationships that don't depend on your personal involvement.
            </p>

            {/* Visual Element - Idea #6: Two outcomes side by side */}
            <div className="grid md:grid-cols-2 gap-4 py-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-700 font-bold text-sm">1</span>
                  </div>
                  <p className="text-emerald-800 text-sm uppercase tracking-wider font-medium">Right now</p>
                </div>
                <p className="text-[#1a1a1a] font-medium text-lg">Your life gets dramatically better</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-700 font-bold text-sm">2</span>
                  </div>
                  <p className="text-emerald-800 text-sm uppercase tracking-wider font-medium">When you're ready</p>
                </div>
                <p className="text-[#1a1a1a] font-medium text-lg">You have the option to leave</p>
              </div>
            </div>

            {/* The Paradox - Idea #7 */}
            <p className="text-[#1a1a1a] font-medium border-l-4 border-emerald-500 pl-5 py-2">
              The advice that sounds like it's about money is actually about freedom.
            </p>

            {/* Sharper Kicker - Idea #5 */}
            <p className="text-[#999]">
              You might not want to sell. That's fine. But right now, no one would buy it. And you already know that.
            </p>
          </div>

        </div>

      </section>

      {/* Version label */}
      <div className="fixed bottom-4 left-4 bg-[#1a1a1a] text-white/70 text-xs px-3 py-1 rounded-full">
        Insight Test: Ideas 1, 5, 6, 7
      </div>
    </div>
  );
}
