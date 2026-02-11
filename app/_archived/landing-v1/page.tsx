'use client'

import Link from 'next/link'

// VARIATION 1: "Liquid Glass" - Apple-inspired with frosted glass cards, subtle gradients, ultra-clean
export default function LandingV1() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden">
      {/* Subtle gradient orbs in background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">E</span>
          </div>
          <span className="text-white/90 font-medium">ExitLayer</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-white/60 hover:text-white text-sm transition-colors">
            Sign in
          </Link>
          <Link href="/questionnaire" className="px-4 py-2 bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/10 rounded-full text-white text-sm transition-all">
            Start Diagnostic
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-white/60 text-sm mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Structural diagnostic for agency owners
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] mb-6">
          Your agency is a<br />
          <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">hollow engine.</span>
        </h1>

        <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          It runs hot. It produces revenue. But when you stop pushing, everything stops. There's nothing inside that keeps working without you.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/questionnaire" className="group px-8 py-4 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-all flex items-center gap-2">
            Take the Diagnostic
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <span className="text-white/40 text-sm">~45 minutes · Comprehensive · Save anytime</span>
        </div>
      </section>

      {/* The Structural Problem */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-10 sm:p-14">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-8">
            The harder you push,<br />the more it breaks.
          </h2>

          <div className="space-y-4 text-lg text-white/50 font-light">
            <p>More clients require more labor.</p>
            <p className="pl-4 border-l-2 border-white/10">More labor requires more staff.</p>
            <p className="pl-8 border-l-2 border-white/10 ml-4">More staff increases variability.</p>
            <p className="pl-12 border-l-2 border-white/10 ml-8">More variability requires more oversight.</p>
            <p className="pl-16 border-l-2 border-white/10 ml-12 text-white/70">More oversight pulls you deeper into operations.</p>
          </div>

          <p className="mt-10 text-white/60 text-lg">
            This isn't a management problem. It's a structural one. The agency model doesn't get stronger as it grows. <span className="text-white">It gets more fragile.</span>
          </p>
        </div>
      </section>

      {/* Before/After Comparison */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-4">
          Same revenue. Different architecture.
        </h2>
        <p className="text-white/50 text-center mb-12 text-lg">The structure determines the outcome.</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Hollow Engine */}
          <div className="bg-gradient-to-b from-red-500/[0.08] to-transparent border border-red-500/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <span className="text-red-400 text-lg">⚠</span>
              </div>
              <h3 className="text-xl font-semibold text-red-300">Hollow Engine</h3>
            </div>
            <div className="space-y-4 text-white/60">
              <div className="flex justify-between py-3 border-b border-white/5">
                <span>Revenue source</span>
                <span className="text-white/80">Your labor</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span>When you stop</span>
                <span className="text-white/80">Everything stops</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span>Client retention</span>
                <span className="text-white/80">Until they outgrow you</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span>Exit multiple</span>
                <span className="text-red-400 font-medium">1-2x EBITDA</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span>Founder role</span>
                <span className="text-white/80">Chief Everything Officer</span>
              </div>
              <div className="flex justify-between py-3">
                <span>What you sell</span>
                <span className="text-white/80">Time as expertise</span>
              </div>
            </div>
          </div>

          {/* Infrastructure Operator */}
          <div className="bg-gradient-to-b from-emerald-500/[0.08] to-transparent border border-emerald-500/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <span className="text-emerald-400 text-lg">◆</span>
              </div>
              <h3 className="text-xl font-semibold text-emerald-300">Infrastructure Operator</h3>
            </div>
            <div className="space-y-4 text-white/60">
              <div className="flex justify-between py-3 border-b border-white/5">
                <span>Revenue source</span>
                <span className="text-white/80">Installed systems</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span>When you stop</span>
                <span className="text-white/80">Systems keep running</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span>Client retention</span>
                <span className="text-white/80">Infrastructure embedded</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span>Exit multiple</span>
                <span className="text-emerald-400 font-medium">4-5x EBITDA</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span>Founder role</span>
                <span className="text-white/80">Architect & deployer</span>
              </div>
              <div className="flex justify-between py-3">
                <span>What you sell</span>
                <span className="text-white/80">Operating system</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Five Fractures */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-4">
          The five structural fractures.
        </h2>
        <p className="text-white/50 text-center mb-12 text-lg">Where agencies break under their own weight.</p>

        <div className="space-y-4">
          {[
            { num: '01', title: 'Labor-bound value', desc: 'Your output disappears the moment work stops. Nothing compounds.' },
            { num: '02', title: 'Non-proprietary delivery', desc: 'Same tools, same playbooks, same deliverables as everyone else.' },
            { num: '03', title: 'Decay by default', desc: "Campaigns fatigue. Strategies drift. Yesterday's work doesn't reduce tomorrow's." },
            { num: '04', title: 'Founder dependency', desc: 'The more you grow, the more decisions route through you.' },
            { num: '05', title: 'No durable assets', desc: 'When clients leave, they take everything. You keep nothing.' },
          ].map((item) => (
            <div key={item.num} className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] rounded-2xl p-6 transition-all">
              <div className="flex items-start gap-5">
                <span className="text-white/20 font-mono text-sm mt-1">{item.num}</span>
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">{item.title}</h3>
                  <p className="text-white/50">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Math */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-10 sm:p-14">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-10">
            The economics don't lie.
          </h2>

          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <div className="text-white/40 text-sm uppercase tracking-wider mb-2">Your hourly value</div>
              <div className="text-4xl font-semibold text-white mb-2">$192</div>
              <div className="text-white/50 text-sm">$500K/year ÷ 50hrs/week</div>
            </div>
            <div>
              <div className="text-white/40 text-sm uppercase tracking-wider mb-2">Owner tax</div>
              <div className="text-4xl font-semibold text-amber-400 mb-2">$168K</div>
              <div className="text-white/50 text-sm">20hrs/week on $30/hr work</div>
            </div>
            <div>
              <div className="text-white/40 text-sm uppercase tracking-wider mb-2">Exit gap</div>
              <div className="text-4xl font-semibold text-red-400 mb-2">$1.5M</div>
              <div className="text-white/50 text-sm">2x vs 5x on $500K profit</div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Stage Evolution */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-4">
          The two-stage evolution.
        </h2>
        <p className="text-white/50 text-center mb-16 text-lg max-w-2xl mx-auto">
          From hollow engine to infrastructure operator. This isn't a single leap—it's a structural transformation in two stages.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Stage 1 */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 font-semibold text-xl border border-blue-500/30">1</div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 pt-12">
              <h3 className="text-2xl font-semibold mb-2">Internal Infrastructure</h3>
              <p className="text-blue-400 text-sm font-medium mb-4">Optimize what you have</p>
              <p className="text-white/50 mb-6">
                Extract the implicit logic trapped in your head. Embed it into systems that run without you.
              </p>
              <ul className="space-y-3 text-white/60">
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">→</span>
                  Document the decision trees you run unconsciously
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">→</span>
                  Systematize workflows your team depends on you for
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">→</span>
                  Build the operating layer that lets you step back
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-white/10">
                <span className="text-white/40 text-sm">Outcome:</span>
                <p className="text-white/80 mt-1">Agency runs at 80% without your daily involvement.</p>
              </div>
            </div>
          </div>

          {/* Stage 2 */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 font-semibold text-xl border border-emerald-500/30">2</div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 pt-12">
              <h3 className="text-2xl font-semibold mb-2">External Infrastructure</h3>
              <p className="text-emerald-400 text-sm font-medium mb-4">Deploy what you've built</p>
              <p className="text-white/50 mb-6">
                Your internal infrastructure becomes deployable. Install a single proprietary system across every client.
              </p>
              <ul className="space-y-3 text-white/60">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">→</span>
                  Architecture & installation fees (high-ticket)
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">→</span>
                  Transformation retainers (optimization period)
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">→</span>
                  Infrastructure subscriptions (recurring revenue)
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-white/10">
                <span className="text-white/40 text-sm">Outcome:</span>
                <p className="text-white/80 mt-1">An asset that compounds. Clients pay even after service ends.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 text-white/50">
          <span className="text-blue-400">Stage 1</span> buys back your time. <span className="text-emerald-400">Stage 2</span> builds an asset that compounds.
        </div>
      </section>

      {/* What the Diagnostic Reveals */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
            This isn't a quiz.<br />It's a structural audit.
          </h2>
          <p className="text-white/50 text-lg">
            Comprehensive because surface-level assessments produce surface-level insights.
          </p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 sm:p-10">
          <h3 className="text-lg font-medium text-white/80 mb-6">What you'll uncover:</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Where your agency is structurally weak',
              'Which fractures cost you the most',
              'Your current owner tax (in dollars)',
              'Your exit value gap',
              'Specific systems to build in Stage 1',
              'Path to deployable infrastructure in Stage 2',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/60">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-12">
          For agency owners who feel the ceiling.
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            "You can't take two weeks off without things sliding",
            'Your best people still need you for the hard decisions',
            'Growth means more work, not more freedom',
            "You're not sure what you'd actually sell if you tried to exit",
          ].map((item, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
              <p className="text-white/70">{item}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-white/50 mt-10 text-lg">
          If that's familiar, the structure is the problem.<br />
          Not your work ethic. Not your team. <span className="text-white">The model itself.</span>
        </p>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl sm:text-5xl font-semibold mb-6">
          Find out what's breaking.
        </h2>
        <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
          The diagnostic becomes the foundation for a 1-hour implementation call where we map your transformation in detail.
        </p>

        <Link href="/questionnaire" className="group inline-flex items-center gap-2 px-10 py-5 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-all text-lg">
          Start the Diagnostic
          <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <p className="text-white/30 text-sm mt-6">
          162 questions · 7 sections · ~45 minutes · Save progress anytime
        </p>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-white/60 text-xs font-medium">E</span>
            </div>
            <span className="text-white/30 text-sm">© 2026 ExitLayer</span>
          </div>
          <a href="mailto:michael@exitlayer.io" className="text-white/30 hover:text-white/50 text-sm transition-colors">
            michael@exitlayer.io
          </a>
        </div>
      </footer>
    </div>
  )
}
