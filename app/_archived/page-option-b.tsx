import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Nav */}
      <nav className="py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <span className="text-lg font-medium text-[#1a1a1a] tracking-tight">ExitLayer</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[#666] hover:text-[#1a1a1a] text-sm transition-colors">
              Sign in
            </Link>
            <Link
              href="/questionnaire"
              className="px-5 py-2 bg-emerald-900 text-white rounded-full text-sm font-medium hover:bg-emerald-950 transition-colors"
            >
              Get Your Exit Price
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-20 text-center">
        <p className="text-[#999] text-sm mb-4 uppercase tracking-wider">For agency owners who want out:</p>
        <h1 className="text-4xl md:text-6xl font-serif font-medium text-[#1a1a1a] leading-[1.1] mb-6">
          Right Now, Your Agency Is&nbsp;Worthless.
        </h1>
        <p className="text-[#666] text-lg leading-relaxed mb-8 max-w-xl mx-auto">
          Not because you're bad at what you do. Because no one would buy it. Everything that makes it work — is&nbsp;you.
        </p>
        <Link
          href="/questionnaire"
          className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-900 text-white rounded-full font-medium hover:bg-emerald-950 transition-colors text-lg"
        >
          Find Out Your Exit Price
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <p className="text-[#999] text-sm mt-4">14 questions · 2 minutes · Instant valuation</p>
      </section>

      {/* Connective Tissue: Hero → Symptoms */}
      <div className="max-w-xl mx-auto px-6 pb-16">
        <p className="text-[#555] text-lg leading-relaxed mb-4">
          You've probably told yourself it's fine. That when you're ready, you'll find a buyer. That your revenue proves it's valuable.
        </p>
        <p className="text-[#555] text-lg leading-relaxed mb-4">
          But there are signs — and you already know what they are.
        </p>
        <p className="text-[#555] text-lg leading-relaxed">
          They show up when you try to take time off. When a client asks if the work will continue if something happens to you. When you imagine what you'd actually hand over in a sale.
        </p>
      </div>

      {/* The Diagnosis */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="border-t border-[#e5e5e5] pt-20">
          <p className="text-red-500/80 text-xs uppercase tracking-wider text-center mb-3 font-medium">The diagnosis</p>
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-[#1a1a1a] mb-4 text-center">
            Five Symptoms of an Unsellable Business.
          </h2>
          <p className="text-[#666] text-center mb-10 max-w-lg mx-auto">
            These aren't problems to fix. They're proof that what you've built has no market value without you standing inside it.
          </p>
          <div className="space-y-8">
            {[
              ['You are the product', 'When you take a week off, revenue stalls. An acquirer sees that and walks away.'],
              ['Nothing is documented', 'Your processes, pricing, and delivery logic live in your head. None of it transfers in a sale.'],
              ['Revenue disappears when clients leave', 'No retainers, no recurring — just project fees that reset to zero every month.'],
              ['One client could sink you', 'If your top account leaves tomorrow, your business takes a critical hit. Acquirers call that concentration risk.'],
              ['There\'s no intellectual property', 'You use the same tools, same playbooks as everyone else. There\'s nothing proprietary to buy.'],
            ].map(([title, desc], i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-500 text-xs font-bold">{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-medium text-[#1a1a1a]">{title}</h3>
                  <p className="text-[#666] text-sm mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-10 text-[#999] italic text-center text-sm">
            If you recognize three or more of these — your exit price is a fraction of what it should be.
          </p>
        </div>
      </section>

      {/* Connective Tissue: Symptoms → Comparison */}
      <div className="max-w-xl mx-auto px-6 pb-16">
        <p className="text-[#555] text-lg leading-relaxed mb-4">
          Every one of those symptoms does the same thing. <strong>It pushes your multiple down.</strong>
        </p>
        <p className="text-[#555] text-lg leading-relaxed mb-4">
          Maybe you're doing $500K in revenue. Maybe $2M. Doesn't matter. If the business can't run without you, an acquirer will pay the minimum — because they're not buying a business. They're buying a job that requires <em>your</em> brain.
        </p>
        <p className="text-[#555] text-lg leading-relaxed mb-4">
          Here's what that looks like in real numbers.
        </p>
      </div>

      {/* The Gap */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="border-t border-[#e5e5e5] pt-20">
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-[#1a1a1a] mb-2 text-center">
            Same Revenue. Wildly Different Exit Price.
          </h2>
          <p className="text-[#666] text-center mb-10">The only difference is what an acquirer is actually buying.</p>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-white rounded-xl p-8 border border-[#e5e5e5]">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <h3 className="text-sm text-[#999] uppercase tracking-wider">Your Agency Today</h3>
              </div>
              <div className="space-y-4">
                {[
                  ['Revenue source', 'Your labor'],
                  ['If you leave', 'Business dies'],
                  ['What they\'re buying', 'A job'],
                  ['Exit multiple', '1-2x SDE'],
                ].map(([k, v], i) => (
                  <div key={i} className="flex justify-between border-b border-[#f0f0f0] pb-3">
                    <span className="text-[#999] text-sm">{k}</span>
                    <span className={`font-medium text-sm ${i === 3 ? 'text-red-500' : 'text-[#1a1a1a]'}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 border border-[#e5e5e5]">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <h3 className="text-sm text-[#999] uppercase tracking-wider">After ExitLayer</h3>
              </div>
              <div className="space-y-4">
                {[
                  ['Revenue source', 'Installed systems'],
                  ['If you leave', 'Business runs'],
                  ['What they\'re buying', 'A machine'],
                  ['Exit multiple', '3-5x SDE'],
                ].map(([k, v], i) => (
                  <div key={i} className="flex justify-between border-b border-[#f0f0f0] pb-3">
                    <span className="text-[#999] text-sm">{k}</span>
                    <span className={`font-medium text-sm ${i === 3 ? 'text-emerald-700' : 'text-[#1a1a1a]'}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connective Tissue: Comparison → What We Build */}
      <div className="max-w-xl mx-auto px-6 pb-16">
        <p className="text-[#555] text-lg leading-relaxed mb-4">
          The gap between those two numbers isn't permanent. <strong>It's structural.</strong> And structure can be built.
        </p>
        <p className="text-[#555] text-lg leading-relaxed mb-4">
          Most agency owners think they need to scale revenue first. They don't. They need to <em>extract themselves</em> from the revenue machine. That's what moves the multiple.
        </p>
        <p className="text-[#555] text-lg leading-relaxed mb-4">
          When an acquirer sees documented systems, proprietary IP, and recurring revenue that doesn't depend on the founder — the valuation changes completely.
        </p>
        <p className="text-[#555] text-lg leading-relaxed">
          That's what we build.
        </p>
      </div>

      {/* What We Do */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="border-t border-[#e5e5e5] pt-20">
          <p className="text-emerald-700 text-xs uppercase tracking-wider text-center mb-3 font-medium">What we build</p>
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-[#1a1a1a] mb-4 text-center">
            We Make Your Agency Sellable.
          </h2>
          <p className="text-[#666] text-center mb-10 max-w-lg mx-auto">
            ExitLayer installs the systems, documentation, and IP that turn an owner-dependent agency into something an acquirer actually wants to buy.
          </p>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-white rounded-xl p-8 border border-[#e5e5e5]">
              <span className="text-4xl font-serif text-emerald-800">1</span>
              <h3 className="text-lg font-medium text-[#1a1a1a] mt-4 mb-2">Remove You as the Bottleneck</h3>
              <p className="text-[#666] text-sm">We extract the logic in your head and embed it into documented systems, SOPs, and automations that run without you.</p>
              <div className="mt-6 p-4 bg-[#f8f8f6] rounded-lg">
                <span className="text-emerald-800 font-medium text-sm">Result:</span>
                <span className="text-[#666] text-sm ml-1">Your multiple goes up.</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 border border-[#e5e5e5]">
              <span className="text-4xl font-serif text-emerald-800">2</span>
              <h3 className="text-lg font-medium text-[#1a1a1a] mt-4 mb-2">Build Your Proprietary IP</h3>
              <p className="text-[#666] text-sm">We find your key mechanism — the thing that makes your delivery work — and turn it into a product that creates equity.</p>
              <div className="mt-6 p-4 bg-[#f8f8f6] rounded-lg">
                <span className="text-emerald-800 font-medium text-sm">Result:</span>
                <span className="text-[#666] text-sm ml-1">Now there's something to sell.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connective Tissue: What We Build → CTA */}
      <div className="max-w-xl mx-auto px-6 pb-16">
        <p className="text-[#555] text-lg leading-relaxed mb-4">
          Every month you run your agency without these systems, you're leaving money on the table. Not theoretical money. <strong>Real exit value.</strong>
        </p>
        <p className="text-[#555] text-lg leading-relaxed mb-4">
          The difference between a 1.5x multiple and a 4x multiple on $1M in profit? That's $2.5 million you don't get.
        </p>
        <p className="text-[#555] text-lg leading-relaxed mb-4">
          The first step is knowing where you actually stand. Not a guess. A number.
        </p>
      </div>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-28">
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 rounded-2xl p-10 md:p-14 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-serif font-medium mb-4">
              What's your agency actually worth?
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto leading-relaxed">
              Answer 14 questions. Get your current exit price, see exactly what's suppressing it, and find out what it could be worth after we fix it.
            </p>
            <Link
              href="/questionnaire"
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-emerald-900 rounded-full font-medium hover:bg-[#f8f8f6] transition-colors text-lg"
            >
              Get Your Exit Price
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="text-white/30 text-sm mt-6">Free · No signup required · Instant results</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e5e5e5]">
        <div className="max-w-5xl mx-auto px-6 py-10 flex items-center justify-between text-[#999] text-sm">
          <span>© 2026 ExitLayer</span>
          <a href="mailto:michael@exitlayer.io" className="hover:text-[#666] transition-colors">
            michael@exitlayer.io
          </a>
        </div>
      </footer>
    </div>
  )
}
