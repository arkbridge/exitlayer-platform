'use client'

import Link from 'next/link'

// VARIATION 2: "Editorial" - Magazine-style, bold typography, high contrast, more aggressive
export default function LandingV2() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-xl tracking-tight">EXIT<span className="text-neutral-500">LAYER</span></span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-neutral-400 hover:text-white text-sm transition-colors">
            Sign in
          </Link>
          <Link href="/questionnaire" className="px-5 py-2.5 bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-colors">
            Start Diagnostic
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="max-w-4xl">
          <p className="text-amber-500 font-medium mb-6 tracking-wide">STRUCTURAL DIAGNOSTIC FOR AGENCY OWNERS</p>

          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight mb-8">
            Your agency<br />
            is a hollow<br />
            engine.
          </h1>

          <p className="text-2xl text-neutral-400 max-w-2xl mb-12 leading-relaxed">
            It runs hot. It produces revenue. But when you stop pushing, everything stops. There's nothing inside that keeps working without you.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Link href="/questionnaire" className="group px-8 py-4 bg-white text-black font-semibold hover:bg-neutral-200 transition-all inline-flex items-center gap-3">
              Take the Diagnostic
              <span className="text-neutral-500 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <div className="text-neutral-500 text-sm">
              <p>~45 minutes</p>
              <p>162 questions</p>
              <p>Comprehensive structural audit</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Cascade */}
      <section className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-5xl font-bold leading-tight mb-8">
                The harder<br />you push,<br />the more<br />it breaks.
              </h2>
            </div>
            <div className="space-y-6 text-xl text-neutral-400">
              <p>More clients require more labor.</p>
              <p className="text-neutral-300">More labor requires more staff.</p>
              <p className="text-neutral-200">More staff increases variability.</p>
              <p className="text-neutral-100">More variability requires more oversight.</p>
              <p className="text-white font-medium">More oversight pulls you deeper into operations.</p>
              <div className="pt-6 border-t border-white/10">
                <p className="text-neutral-500">
                  This isn't a management problem. It's a structural one. The agency model doesn't get stronger as it grows. It gets more fragile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-t border-white/10 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-5xl font-bold mb-4">Same revenue.</h2>
          <h2 className="text-5xl font-bold text-neutral-500 mb-16">Different architecture.</h2>

          <div className="grid lg:grid-cols-2 gap-0 border border-white/10">
            {/* Hollow Engine Column */}
            <div className="border-r border-white/10">
              <div className="p-8 border-b border-white/10 bg-red-950/20">
                <h3 className="text-2xl font-bold text-red-400">Hollow Engine</h3>
              </div>
              {[
                ['Revenue source', 'Your labor'],
                ['When you stop', 'Everything stops'],
                ['Client retention', 'Until they outgrow you'],
                ['Exit multiple', '1-2x EBITDA'],
                ['Founder role', 'Chief Everything Officer'],
                ['What you sell', 'Time disguised as expertise'],
              ].map(([label, value], i) => (
                <div key={i} className="p-6 border-b border-white/10 flex justify-between items-center">
                  <span className="text-neutral-500">{label}</span>
                  <span className={label === 'Exit multiple' ? 'text-red-400 font-semibold' : 'text-white'}>{value}</span>
                </div>
              ))}
            </div>

            {/* Infrastructure Operator Column */}
            <div>
              <div className="p-8 border-b border-white/10 bg-emerald-950/20">
                <h3 className="text-2xl font-bold text-emerald-400">Infrastructure Operator</h3>
              </div>
              {[
                ['Revenue source', 'Installed systems'],
                ['When you stop', 'Systems keep running'],
                ['Client retention', 'Infrastructure is embedded'],
                ['Exit multiple', '4-5x EBITDA'],
                ['Founder role', 'Architect & deployer'],
                ['What you sell', 'A proprietary operating system'],
              ].map(([label, value], i) => (
                <div key={i} className="p-6 border-b border-white/10 flex justify-between items-center">
                  <span className="text-neutral-500">{label}</span>
                  <span className={label === 'Exit multiple' ? 'text-emerald-400 font-semibold' : 'text-white'}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Five Fractures */}
      <section className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-5xl font-bold mb-16">Where agencies break.</h2>

          <div className="space-y-0 border-t border-white/10">
            {[
              { num: '01', title: 'Labor-bound value', desc: 'Your output disappears the moment work stops. Nothing compounds.' },
              { num: '02', title: 'Non-proprietary delivery', desc: 'Same tools, same playbooks, same deliverables as everyone else.' },
              { num: '03', title: 'Decay by default', desc: "Campaigns fatigue. Strategies drift. Yesterday's work doesn't reduce tomorrow's." },
              { num: '04', title: 'Founder dependency', desc: 'The more you grow, the more decisions route through you. Success increases entanglement.' },
              { num: '05', title: 'No durable assets', desc: 'When clients leave, they take everything. You keep nothing that retains value.' },
            ].map((item) => (
              <div key={item.num} className="grid lg:grid-cols-12 gap-8 py-8 border-b border-white/10 group hover:bg-white/[0.02] transition-colors">
                <div className="lg:col-span-1">
                  <span className="text-neutral-600 font-mono">{item.num}</span>
                </div>
                <div className="lg:col-span-4">
                  <h3 className="text-2xl font-semibold">{item.title}</h3>
                </div>
                <div className="lg:col-span-7">
                  <p className="text-neutral-400 text-lg">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Math */}
      <section className="border-t border-white/10 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-5xl font-bold mb-16">The economics don't lie.</h2>

          <div className="grid md:grid-cols-3 gap-0 border border-white/10">
            <div className="p-10 border-r border-white/10">
              <p className="text-neutral-500 text-sm uppercase tracking-wider mb-4">Your hourly value</p>
              <p className="text-6xl font-bold mb-2">$192</p>
              <p className="text-neutral-500">$500K/year ÷ 50hrs/week</p>
            </div>
            <div className="p-10 border-r border-white/10 bg-amber-950/10">
              <p className="text-amber-500 text-sm uppercase tracking-wider mb-4">Owner tax</p>
              <p className="text-6xl font-bold text-amber-400 mb-2">$168K</p>
              <p className="text-neutral-500">20hrs/week on $30/hr work</p>
            </div>
            <div className="p-10 bg-red-950/10">
              <p className="text-red-500 text-sm uppercase tracking-wider mb-4">Exit gap</p>
              <p className="text-6xl font-bold text-red-400 mb-2">$1.5M</p>
              <p className="text-neutral-500">2x vs 5x on $500K profit</p>
            </div>
          </div>
        </div>
      </section>

      {/* Two Stage Evolution */}
      <section className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-5xl font-bold mb-6">The two-stage evolution.</h2>
          <p className="text-xl text-neutral-400 mb-16 max-w-2xl">
            From hollow engine to infrastructure operator. Not a single leap—a structural transformation.
          </p>

          <div className="grid lg:grid-cols-2 gap-0 border border-white/10">
            {/* Stage 1 */}
            <div className="border-r border-white/10">
              <div className="p-8 border-b border-white/10 flex items-center gap-4">
                <span className="text-6xl font-bold text-blue-500">1</span>
                <div>
                  <h3 className="text-2xl font-bold">Internal Infrastructure</h3>
                  <p className="text-blue-400">Optimize what you have</p>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <p className="text-neutral-400">
                  Extract the implicit logic trapped in your head. Embed it into systems that run without you.
                </p>
                <ul className="space-y-3 text-neutral-300">
                  <li>→ Document decision trees you run unconsciously</li>
                  <li>→ Systematize workflows they depend on you for</li>
                  <li>→ Build the operating layer that lets you step back</li>
                </ul>
                <div className="pt-6 border-t border-white/10">
                  <p className="text-neutral-500 text-sm uppercase tracking-wider mb-2">Outcome</p>
                  <p className="text-white text-lg">Agency runs at 80% without your daily involvement.</p>
                </div>
              </div>
            </div>

            {/* Stage 2 */}
            <div>
              <div className="p-8 border-b border-white/10 flex items-center gap-4">
                <span className="text-6xl font-bold text-emerald-500">2</span>
                <div>
                  <h3 className="text-2xl font-bold">External Infrastructure</h3>
                  <p className="text-emerald-400">Deploy what you've built</p>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <p className="text-neutral-400">
                  Internal infrastructure becomes deployable. Install a proprietary operating system across every client.
                </p>
                <ul className="space-y-3 text-neutral-300">
                  <li>→ Architecture & installation fees (high-ticket)</li>
                  <li>→ Transformation retainers (optimization period)</li>
                  <li>→ Infrastructure subscriptions (recurring revenue)</li>
                </ul>
                <div className="pt-6 border-t border-white/10">
                  <p className="text-neutral-500 text-sm uppercase tracking-wider mb-2">Outcome</p>
                  <p className="text-white text-lg">An asset that compounds. Clients pay even after service ends.</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xl text-neutral-500 mt-12">
            <span className="text-blue-400">Stage 1</span> buys back your time. <span className="text-emerald-400">Stage 2</span> builds an asset that compounds.
          </p>
        </div>
      </section>

      {/* What the Diagnostic Reveals */}
      <section className="border-t border-white/10 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-5xl font-bold leading-tight mb-6">
                This isn't<br />a quiz.
              </h2>
              <p className="text-2xl text-neutral-400">
                It's a structural audit. Comprehensive because surface-level assessments produce surface-level insights.
              </p>
            </div>
            <div>
              <p className="text-neutral-500 text-sm uppercase tracking-wider mb-6">What you'll uncover</p>
              <div className="space-y-4">
                {[
                  'Where your agency is structurally weak',
                  'Which fractures cost you the most',
                  'Your current owner tax (in dollars)',
                  'Your exit value gap',
                  'Specific systems to build in Stage 1',
                  'Path to deployable infrastructure in Stage 2',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 py-3 border-b border-white/10">
                    <span className="text-emerald-500">✓</span>
                    <span className="text-white">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-5xl font-bold mb-16">For owners who feel the ceiling.</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              "You can't take two weeks off without things sliding",
              'Your best people still need you for the hard decisions',
              'Growth means more work, not more freedom',
              "You're not sure what you'd actually sell if you tried to exit",
            ].map((item, i) => (
              <div key={i} className="p-8 border border-white/10 hover:border-white/20 transition-colors">
                <p className="text-xl text-neutral-300">{item}</p>
              </div>
            ))}
          </div>

          <p className="text-2xl text-neutral-500 mt-16 max-w-3xl">
            If that's familiar, the structure is the problem. Not your work ethic. Not your team. <span className="text-white">The model itself.</span>
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-white/10 bg-white text-black">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-bold mb-6">Find out what's breaking.</h2>
              <p className="text-xl text-neutral-600 mb-8">
                The diagnostic becomes the foundation for a 1-hour implementation call where we map your transformation in detail.
              </p>
              <Link href="/questionnaire" className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white font-semibold hover:bg-neutral-800 transition-colors text-lg">
                Start the Diagnostic
                <span>→</span>
              </Link>
            </div>
            <div className="text-neutral-500">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-4xl font-bold text-black">162</p>
                  <p>questions</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-black">7</p>
                  <p>sections</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-black">~45</p>
                  <p>minutes</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-black">∞</p>
                  <p>save anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-neutral-500 text-sm">© 2026 ExitLayer</span>
          <a href="mailto:michael@exitlayer.io" className="text-neutral-500 hover:text-white text-sm transition-colors">
            michael@exitlayer.io
          </a>
        </div>
      </footer>
    </div>
  )
}
