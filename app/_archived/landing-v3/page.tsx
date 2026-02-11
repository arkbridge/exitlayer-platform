'use client'

import Link from 'next/link'

// VARIATION 3: "Minimal Brutalist" - Extreme whitespace, system fonts feel, almost academic
export default function LandingV3() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900">
      {/* Navigation */}
      <nav className="max-w-3xl mx-auto px-6 py-8 flex items-center justify-between">
        <span className="font-medium">ExitLayer</span>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-neutral-500 hover:text-neutral-900 text-sm transition-colors">
            Sign in
          </Link>
          <Link href="/questionnaire" className="text-sm underline underline-offset-4 hover:no-underline">
            Start →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-32">
        <p className="text-neutral-400 text-sm mb-8">Structural diagnostic for agency owners</p>

        <h1 className="text-4xl sm:text-5xl font-normal leading-tight mb-8">
          Your agency is a hollow engine.
        </h1>

        <p className="text-xl text-neutral-600 mb-12 leading-relaxed max-w-2xl">
          It runs hot. It produces revenue. But when you stop pushing, everything stops. There's nothing inside that keeps working without you.
        </p>

        <Link href="/questionnaire" className="inline-flex items-center gap-2 text-lg hover:gap-3 transition-all">
          Take the diagnostic
          <span>→</span>
        </Link>

        <p className="text-neutral-400 text-sm mt-4">~45 minutes · Comprehensive · Save anytime</p>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="border-t border-neutral-200" />
      </div>

      {/* The Cascade */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <h2 className="text-2xl font-normal mb-12">The harder you push, the more it breaks.</h2>

        <div className="space-y-4 text-lg text-neutral-600 mb-12">
          <p>More clients require more labor.</p>
          <p className="pl-6">More labor requires more staff.</p>
          <p className="pl-12">More staff increases variability.</p>
          <p className="pl-18" style={{ paddingLeft: '4.5rem' }}>More variability requires more oversight.</p>
          <p className="pl-24 text-neutral-900 font-medium" style={{ paddingLeft: '6rem' }}>More oversight pulls you deeper into operations.</p>
        </div>

        <p className="text-neutral-500">
          This isn't a management problem. It's a structural one.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="border-t border-neutral-200" />
      </div>

      {/* Comparison */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <h2 className="text-2xl font-normal mb-12">Same revenue. Different architecture.</h2>

        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h3 className="text-sm text-neutral-400 uppercase tracking-wider mb-6">Hollow Engine</h3>
            <dl className="space-y-4">
              {[
                ['Revenue', 'Your labor'],
                ['When you stop', 'Everything stops'],
                ['Retention', 'Until they outgrow you'],
                ['Exit multiple', '1-2x'],
                ['Your role', 'Chief Everything Officer'],
              ].map(([term, def]) => (
                <div key={term} className="flex justify-between border-b border-neutral-100 pb-3">
                  <dt className="text-neutral-500">{term}</dt>
                  <dd className={term === 'Exit multiple' ? 'text-red-600' : ''}>{def}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h3 className="text-sm text-neutral-400 uppercase tracking-wider mb-6">Infrastructure Operator</h3>
            <dl className="space-y-4">
              {[
                ['Revenue', 'Installed systems'],
                ['When you stop', 'Systems keep running'],
                ['Retention', 'Infrastructure embedded'],
                ['Exit multiple', '4-5x'],
                ['Your role', 'Architect'],
              ].map(([term, def]) => (
                <div key={term} className="flex justify-between border-b border-neutral-100 pb-3">
                  <dt className="text-neutral-500">{term}</dt>
                  <dd className={term === 'Exit multiple' ? 'text-emerald-600' : ''}>{def}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="border-t border-neutral-200" />
      </div>

      {/* Five Fractures */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <h2 className="text-2xl font-normal mb-12">Where agencies break.</h2>

        <ol className="space-y-8">
          {[
            ['Labor-bound value', 'Your output disappears the moment work stops. Nothing compounds.'],
            ['Non-proprietary delivery', 'Same tools, same playbooks, same deliverables as everyone else.'],
            ['Decay by default', "Campaigns fatigue. Strategies drift. Yesterday's work doesn't reduce tomorrow's."],
            ['Founder dependency', 'The more you grow, the more decisions route through you.'],
            ['No durable assets', 'When clients leave, they take everything. You keep nothing.'],
          ].map(([title, desc], i) => (
            <li key={i} className="grid grid-cols-12 gap-4">
              <span className="col-span-1 text-neutral-300 font-mono text-sm">{String(i + 1).padStart(2, '0')}</span>
              <div className="col-span-11">
                <h3 className="font-medium mb-1">{title}</h3>
                <p className="text-neutral-500">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="border-t border-neutral-200" />
      </div>

      {/* The Math */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <h2 className="text-2xl font-normal mb-12">The economics.</h2>

        <div className="grid grid-cols-3 gap-8">
          <div>
            <p className="text-sm text-neutral-400 mb-2">Hourly value</p>
            <p className="text-3xl font-normal">$192</p>
            <p className="text-sm text-neutral-400 mt-1">$500K ÷ 50hrs</p>
          </div>
          <div>
            <p className="text-sm text-amber-600 mb-2">Owner tax</p>
            <p className="text-3xl font-normal text-amber-600">$168K</p>
            <p className="text-sm text-neutral-400 mt-1">20hrs × ($192-$30)</p>
          </div>
          <div>
            <p className="text-sm text-red-600 mb-2">Exit gap</p>
            <p className="text-3xl font-normal text-red-600">$1.5M</p>
            <p className="text-sm text-neutral-400 mt-1">2x vs 5x</p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="border-t border-neutral-200" />
      </div>

      {/* Two Stage Evolution */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <h2 className="text-2xl font-normal mb-4">The two-stage evolution.</h2>
        <p className="text-neutral-500 mb-16">Not a single leap. A structural transformation.</p>

        <div className="space-y-16">
          {/* Stage 1 */}
          <div>
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-4xl font-light text-blue-600">1</span>
              <div>
                <h3 className="text-xl font-medium">Internal Infrastructure</h3>
                <p className="text-blue-600 text-sm">Optimize what you have</p>
              </div>
            </div>
            <p className="text-neutral-600 mb-6">
              Extract the implicit logic trapped in your head. Embed it into systems that run without you.
            </p>
            <ul className="space-y-2 text-neutral-500 mb-6">
              <li>— Document decision trees you run unconsciously</li>
              <li>— Systematize workflows they depend on you for</li>
              <li>— Build the operating layer that lets you step back</li>
            </ul>
            <p className="text-sm border-l-2 border-blue-200 pl-4 text-neutral-600">
              <span className="text-blue-600">Outcome:</span> Agency runs at 80% without your daily involvement.
            </p>
          </div>

          {/* Stage 2 */}
          <div>
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-4xl font-light text-emerald-600">2</span>
              <div>
                <h3 className="text-xl font-medium">External Infrastructure</h3>
                <p className="text-emerald-600 text-sm">Deploy what you've built</p>
              </div>
            </div>
            <p className="text-neutral-600 mb-6">
              Internal infrastructure becomes deployable. Install a proprietary operating system across every client.
            </p>
            <ul className="space-y-2 text-neutral-500 mb-6">
              <li>— Architecture & installation fees (high-ticket)</li>
              <li>— Transformation retainers (optimization period)</li>
              <li>— Infrastructure subscriptions (recurring revenue)</li>
            </ul>
            <p className="text-sm border-l-2 border-emerald-200 pl-4 text-neutral-600">
              <span className="text-emerald-600">Outcome:</span> An asset that compounds. Clients pay even after service ends.
            </p>
          </div>
        </div>

        <p className="text-neutral-400 mt-16">
          <span className="text-blue-600">Stage 1</span> buys back your time. <span className="text-emerald-600">Stage 2</span> builds an asset.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="border-t border-neutral-200" />
      </div>

      {/* What the Diagnostic Reveals */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <h2 className="text-2xl font-normal mb-4">The diagnostic.</h2>
        <p className="text-neutral-500 mb-12">Not a quiz. A structural audit.</p>

        <div className="space-y-3 mb-12">
          {[
            'Where your agency is structurally weak',
            'Which fractures cost you the most',
            'Your current owner tax (in dollars)',
            'Your exit value gap',
            'Specific systems to build in Stage 1',
            'Path to deployable infrastructure in Stage 2',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-neutral-600">
              <span className="text-emerald-500">✓</span>
              {item}
            </div>
          ))}
        </div>

        <p className="text-sm text-neutral-400">
          162 questions · 7 sections · ~45 minutes · Save progress anytime
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="border-t border-neutral-200" />
      </div>

      {/* Who This Is For */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <h2 className="text-2xl font-normal mb-12">For owners who feel the ceiling.</h2>

        <ul className="space-y-4 text-neutral-600 mb-12">
          <li>— You can't take two weeks off without things sliding</li>
          <li>— Your best people still need you for the hard decisions</li>
          <li>— Growth means more work, not more freedom</li>
          <li>— You're not sure what you'd actually sell if you tried to exit</li>
        </ul>

        <p className="text-neutral-500">
          If that's familiar, the structure is the problem. Not your work ethic. Not your team. The model itself.
        </p>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <div className="border border-neutral-200 p-12">
          <h2 className="text-2xl font-normal mb-4">Find out what's breaking.</h2>
          <p className="text-neutral-500 mb-8">
            The diagnostic becomes the foundation for a 1-hour implementation call where we map your transformation in detail.
          </p>

          <Link href="/questionnaire" className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
            Start the Diagnostic
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between text-sm text-neutral-400">
          <span>© 2026 ExitLayer</span>
          <a href="mailto:michael@exitlayer.io" className="hover:text-neutral-600 transition-colors">
            michael@exitlayer.io
          </a>
        </div>
      </footer>
    </div>
  )
}
