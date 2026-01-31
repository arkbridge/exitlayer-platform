import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Nav */}
      <nav className="py-6">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <span className="text-lg font-medium text-[#1a1a1a] tracking-tight">ExitLayer</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[#666] hover:text-[#1a1a1a] text-sm transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 bg-[#2d4a2d] text-white rounded-full text-sm font-medium hover:bg-[#1a2e1a] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-2xl mx-auto px-6 pt-8 pb-16 text-center">
        <p className="text-[#666] text-sm mb-4">For Agency Owners Running a Business That Can't Run Without Them:</p>
        <h1 className="text-4xl md:text-5xl font-serif font-medium text-[#1a1a1a] leading-tight mb-6">
          Your Agency Is a Hollow Engine. Here's the Structural Fix.
        </h1>
        <p className="text-[#666] text-lg leading-relaxed mb-8">
          Discover why more clients, more staff, and more revenue won't solve your problem — and the two-stage evolution that actually creates enterprise value.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#2d4a2d] text-white rounded-full font-medium hover:bg-[#1a2e1a] transition-colors"
        >
          Take the Diagnostic
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <p className="text-[#999] text-sm mt-4">~45 minutes · Comprehensive · Save anytime</p>
      </section>

      {/* The Problem */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <div className="border-t border-[#e5e5e5] pt-16">
          <h2 className="text-2xl font-serif font-medium text-[#1a1a1a] mb-8 text-center">
            The Harder You Push, The More It Breaks.
          </h2>
          <div className="space-y-4 text-[#666]">
            <p>More clients require more labor.</p>
            <p className="pl-8">More labor requires more staff.</p>
            <p className="pl-16">More staff increases variability.</p>
            <p className="pl-24">More variability requires more oversight.</p>
            <p className="pl-32 text-[#1a1a1a] font-medium">More oversight pulls you deeper into operations.</p>
          </div>
          <p className="mt-8 text-[#999] italic text-center">This isn't a management problem. It's a structural one.</p>
        </div>
      </section>

      {/* Comparison */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="border-t border-[#e5e5e5] pt-16">
          <h2 className="text-2xl font-serif font-medium text-[#1a1a1a] mb-2 text-center">
            Same Revenue. Different Architecture.
          </h2>
          <p className="text-[#666] text-center mb-10">The difference is worth millions at exit.</p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 border border-[#e5e5e5]">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <h3 className="text-sm text-[#999] uppercase tracking-wider">Hollow Engine</h3>
              </div>
              <div className="space-y-4">
                {[
                  ['Revenue', 'Your labor'],
                  ['When you stop', 'Everything stops'],
                  ['Exit multiple', '1-2x'],
                ].map(([k, v], i) => (
                  <div key={i} className="flex justify-between border-b border-[#f0f0f0] pb-3">
                    <span className="text-[#999]">{k}</span>
                    <span className={`font-medium ${i === 2 ? 'text-red-500' : 'text-[#1a1a1a]'}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 border border-[#e5e5e5]">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 bg-[#2d4a2d] rounded-full" />
                <h3 className="text-sm text-[#999] uppercase tracking-wider">Infrastructure Operator</h3>
              </div>
              <div className="space-y-4">
                {[
                  ['Revenue', 'Installed systems'],
                  ['When you stop', 'Systems keep running'],
                  ['Exit multiple', '4-5x'],
                ].map(([k, v], i) => (
                  <div key={i} className="flex justify-between border-b border-[#f0f0f0] pb-3">
                    <span className="text-[#999]">{k}</span>
                    <span className={`font-medium ${i === 2 ? 'text-[#2d4a2d]' : 'text-[#1a1a1a]'}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Five Fractures */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <div className="border-t border-[#e5e5e5] pt-16">
          <h2 className="text-2xl font-serif font-medium text-[#1a1a1a] mb-8 text-center">
            Where Agencies Break.
          </h2>
          <div className="space-y-6">
            {[
              ['Labor-bound value', 'Your output disappears the moment work stops.'],
              ['Non-proprietary delivery', 'Same tools, same playbooks as everyone else.'],
              ['Decay by default', "Yesterday's work doesn't reduce tomorrow's load."],
              ['Founder dependency', 'The more you grow, the more decisions route through you.'],
              ['No durable assets', 'When clients leave, they take everything.'],
            ].map(([title, desc], i) => (
              <div key={i} className="flex gap-4">
                <span className="text-[#2d4a2d] font-medium">{i + 1}.</span>
                <div>
                  <h3 className="font-medium text-[#1a1a1a]">{title}</h3>
                  <p className="text-[#666] text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Stages */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="border-t border-[#e5e5e5] pt-16">
          <h2 className="text-2xl font-serif font-medium text-[#1a1a1a] mb-2 text-center">
            The Two-Stage Evolution.
          </h2>
          <p className="text-[#666] text-center mb-10">
            Stage 1 buys back your time. Stage 2 builds an asset.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 border border-[#e5e5e5]">
              <span className="text-4xl font-serif text-[#2d4a2d]">1</span>
              <h3 className="text-lg font-medium text-[#1a1a1a] mt-4 mb-2">Internal Infrastructure</h3>
              <p className="text-[#2d4a2d] text-sm mb-4">Optimize what you have</p>
              <p className="text-[#666] text-sm">Extract the logic in your head. Embed it into systems that run without you.</p>
              <div className="mt-6 p-4 bg-[#f8f8f6] rounded-lg">
                <span className="text-[#2d4a2d] font-medium text-sm">Outcome:</span>
                <span className="text-[#666] text-sm ml-1">Agency runs at 80% without you.</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 border border-[#e5e5e5]">
              <span className="text-4xl font-serif text-[#2d4a2d]">2</span>
              <h3 className="text-lg font-medium text-[#1a1a1a] mt-4 mb-2">External Infrastructure</h3>
              <p className="text-[#2d4a2d] text-sm mb-4">Deploy what you've built</p>
              <p className="text-[#666] text-sm">Install your proprietary operating system across every client.</p>
              <div className="mt-6 p-4 bg-[#f8f8f6] rounded-lg">
                <span className="text-[#2d4a2d] font-medium text-sm">Outcome:</span>
                <span className="text-[#666] text-sm ml-1">An asset that compounds.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="border-t border-[#e5e5e5] pt-16 text-center">
          <h2 className="text-2xl font-serif font-medium text-[#1a1a1a] mb-4">
            Find Out What's Breaking.
          </h2>
          <p className="text-[#666] mb-8 max-w-lg mx-auto">
            The diagnostic maps your structural weaknesses and shows you exactly which systems to build first.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#2d4a2d] text-white rounded-full font-medium hover:bg-[#1a2e1a] transition-colors"
          >
            Start the Diagnostic
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="text-[#999] text-sm mt-4">~45 minutes · 162 questions · Save anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between text-[#999] text-sm">
          <span>© 2025 ExitLayer</span>
          <a href="mailto:michael@exitlayer.io" className="hover:text-[#666] transition-colors">
            michael@exitlayer.io
          </a>
        </div>
      </footer>
    </div>
  )
}
