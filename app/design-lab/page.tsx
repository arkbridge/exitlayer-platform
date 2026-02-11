'use client'

import { useState } from 'react'
import Link from 'next/link'

// Design Lab - 5 Landing Page Variations
// Theme: Matches ExitLayer thesis page - minimal, centered, dark green accent

export default function DesignLab() {
  const [activeVariation, setActiveVariation] = useState(1)
  const [feedback, setFeedback] = useState<Record<number, string>>({})

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Nav - matches thesis page */}
      <nav className="py-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-lg font-medium text-[#1a1a1a] tracking-tight">ExitLayer</span>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-12 text-center">
        <p className="text-[#666] text-sm mb-4">Design Lab</p>
        <h1 className="text-4xl md:text-5xl font-serif font-medium text-[#1a1a1a] leading-tight mb-6">
          Landing Page Variations
        </h1>
        <p className="text-[#666] text-lg leading-relaxed mb-8">
          Review each variation and note what you like. Use the switcher below to navigate between designs.
        </p>

        {/* Variation switcher */}
        <div className="inline-flex items-center gap-2 p-1.5 bg-white rounded-full shadow-sm border border-[#e5e5e5]">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => setActiveVariation(num)}
              className={`w-10 h-10 rounded-full font-medium text-sm transition-all ${
                activeVariation === num
                  ? 'bg-emerald-900 text-white'
                  : 'text-[#666] hover:bg-[#f0f0f0]'
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        <p className="text-[#999] text-sm mt-4">
          Viewing Variation {activeVariation} of 5
        </p>
      </div>

      {/* Variation preview frame */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-[#e5e5e5] overflow-hidden">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#fafafa] border-b border-[#e5e5e5]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 mx-4">
              <div className="max-w-md mx-auto px-4 py-1.5 bg-white rounded-md text-xs text-[#999] text-center border border-[#e5e5e5]">
                exitlayer.io
              </div>
            </div>
          </div>

          {/* Variation content */}
          <div className="max-h-[70vh] overflow-y-auto">
            {activeVariation === 1 && <Variation1 />}
            {activeVariation === 2 && <Variation2 />}
            {activeVariation === 3 && <Variation3 />}
            {activeVariation === 4 && <Variation4 />}
            {activeVariation === 5 && <Variation5 />}
          </div>
        </div>
      </div>

      {/* Feedback section */}
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <h2 className="text-xl font-medium text-[#1a1a1a] mb-4">What do you like about this variation?</h2>
        <textarea
          placeholder="Note specific elements, colors, layouts, or sections you prefer..."
          value={feedback[activeVariation] || ''}
          onChange={(e) => setFeedback({ ...feedback, [activeVariation]: e.target.value })}
          className="w-full px-4 py-3 bg-white border border-[#e5e5e5] rounded-xl text-[#1a1a1a] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 resize-none h-24"
        />
        <button className="mt-4 px-6 py-3 bg-emerald-900 text-white rounded-full font-medium hover:bg-emerald-950 transition-colors">
          Save Feedback
        </button>
      </div>

      {/* Variation descriptions */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-medium text-[#1a1a1a] mb-6 text-center">Variation Styles</h2>
        <div className="grid gap-3">
          {[
            { num: 1, name: 'Questionnaire Native', desc: 'Matches your questionnaire exactly - white cards, slate gradients, rounded corners' },
            { num: 2, name: 'Thesis Style', desc: 'Matches the ExitLayer thesis page - minimal, centered, dark green accent' },
            { num: 3, name: 'Dark Mode Premium', desc: 'Dark theme with subtle glow effects, minimal and premium feel' },
            { num: 4, name: 'Thesis + Cards Hybrid', desc: 'Thesis page style with questionnaire card elements' },
            { num: 5, name: 'Apple Minimal', desc: 'Ultra-clean with lots of whitespace, subtle animations' },
          ].map((v) => (
            <button
              key={v.num}
              onClick={() => setActiveVariation(v.num)}
              className={`flex items-start gap-4 p-4 rounded-xl text-left transition-all ${
                activeVariation === v.num
                  ? 'bg-emerald-900 text-white'
                  : 'bg-white border border-[#e5e5e5] hover:border-[#ccc]'
              }`}
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm flex-shrink-0 ${
                activeVariation === v.num ? 'bg-white/20' : 'bg-[#f0f0f0]'
              }`}>
                {v.num}
              </span>
              <div>
                <h3 className="font-medium">{v.name}</h3>
                <p className={`text-sm mt-0.5 ${activeVariation === v.num ? 'text-white/70' : 'text-[#666]'}`}>
                  {v.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// VARIATION 1: "Questionnaire Native"
// Matches questionnaire exactly - slate gradients, white cards, same typography
// ============================================
function Variation1() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50">
      {/* Nav - matches questionnaire header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-900">ExitLayer</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
              Sign in
            </Link>
            <Link href="/questionnaire" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">
              Start Diagnostic
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - Card style like questionnaire */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800" />
          <div className="p-10 md:p-14">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Structural Diagnostic for Agency Owners
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
              Your agency is a <span className="text-red-500">hollow engine</span>.
            </h1>
            <p className="text-xl text-slate-500 mb-8 leading-relaxed">
              It runs hot. It produces revenue. But when you stop pushing, everything stops.
              There's nothing inside that keeps working without you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/questionnaire"
                className="px-8 py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl font-semibold hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg shadow-slate-900/20 text-center"
              >
                Take the Diagnostic →
              </Link>
              <div className="flex items-center gap-2 text-slate-400 text-sm justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ~45 minutes · Save anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Cascade - Same card style */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">The harder you push, the more it breaks.</h2>
          <div className="space-y-4">
            {[
              { text: 'More clients require more labor.', indent: 0 },
              { text: 'More labor requires more staff.', indent: 1 },
              { text: 'More staff increases variability.', indent: 2 },
              { text: 'More variability requires more oversight.', indent: 3 },
              { text: 'More oversight pulls you deeper into operations.', indent: 4, highlight: true },
            ].map((item, i) => (
              <p
                key={i}
                className={`text-lg ${item.highlight ? 'font-semibold text-slate-900' : 'text-slate-500'}`}
                style={{ paddingLeft: `${item.indent * 1.5}rem` }}
              >
                {item.text}
              </p>
            ))}
          </div>
          <p className="mt-8 text-slate-400 border-l-2 border-slate-200 pl-4">
            This isn't a management problem. It's a structural one.
          </p>
        </div>
      </section>

      {/* Comparison - Two column cards */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Same revenue. Different architecture.</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Hollow Engine */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Hollow Engine</h3>
            <dl className="space-y-4">
              {[
                ['Revenue source', 'Your labor'],
                ['When you stop', 'Everything stops'],
                ['Client retention', 'Until they outgrow you'],
                ['Exit multiple', '1-2x', true],
                ['Your role', 'Chief Everything Officer'],
              ].map(([term, def, isRed]) => (
                <div key={term as string} className="flex justify-between items-center py-2 border-b border-slate-50">
                  <dt className="text-slate-500 text-sm">{term}</dt>
                  <dd className={`font-medium ${isRed ? 'text-red-500' : 'text-slate-900'}`}>{def}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Infrastructure Operator */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Infrastructure Operator</h3>
            <dl className="space-y-4">
              {[
                ['Revenue source', 'Installed systems'],
                ['When you stop', 'Systems keep running'],
                ['Client retention', 'Infrastructure embedded'],
                ['Exit multiple', '4-5x', false, true],
                ['Your role', 'Architect'],
              ].map(([term, def, isRed, isGreen]) => (
                <div key={term as string} className="flex justify-between items-center py-2 border-b border-slate-50">
                  <dt className="text-slate-500 text-sm">{term}</dt>
                  <dd className={`font-medium ${isGreen ? 'text-emerald-500' : 'text-slate-900'}`}>{def}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Five Fractures */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Where agencies break.</h2>
          <div className="space-y-6">
            {[
              ['Labor-bound value', 'Your output disappears the moment work stops. Nothing compounds.'],
              ['Non-proprietary delivery', 'Same tools, same playbooks, same deliverables as everyone else.'],
              ['Decay by default', "Campaigns fatigue. Strategies drift. Yesterday's work doesn't reduce tomorrow's."],
              ['Founder dependency', 'The more you grow, the more decisions route through you.'],
              ['No durable assets', 'When clients leave, they take everything. You keep nothing.'],
            ].map(([title, desc], i) => (
              <div key={i} className="flex gap-4">
                <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                  <p className="text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Stage Evolution */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">The two-stage evolution.</h2>
        <p className="text-slate-500 text-center mb-8">Not a single leap. A structural transformation.</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Stage 1 */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="h-1 bg-blue-500" />
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl font-light text-blue-500">1</span>
                <div>
                  <h3 className="font-bold text-slate-900">Internal Infrastructure</h3>
                  <p className="text-blue-500 text-sm">Optimize what you have</p>
                </div>
              </div>
              <p className="text-slate-600 mb-6">
                Extract the implicit logic trapped in your head. Embed it into systems that run without you.
              </p>
              <ul className="space-y-2 text-slate-500">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">—</span>
                  Document decision trees you run unconsciously
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">—</span>
                  Systematize workflows they depend on you for
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">—</span>
                  Build the operating layer that lets you step back
                </li>
              </ul>
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                <span className="text-blue-600 font-medium">Outcome:</span>
                <span className="text-slate-600 ml-1">Agency runs at 80% without your daily involvement.</span>
              </div>
            </div>
          </div>

          {/* Stage 2 */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="h-1 bg-emerald-500" />
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl font-light text-emerald-500">2</span>
                <div>
                  <h3 className="font-bold text-slate-900">External Infrastructure</h3>
                  <p className="text-emerald-500 text-sm">Deploy what you've built</p>
                </div>
              </div>
              <p className="text-slate-600 mb-6">
                Internal infrastructure becomes deployable. Install a proprietary operating system across every client.
              </p>
              <ul className="space-y-2 text-slate-500">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">—</span>
                  Architecture & installation fees (high-ticket)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">—</span>
                  Transformation retainers (optimization period)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">—</span>
                  Infrastructure subscriptions (recurring revenue)
                </li>
              </ul>
              <div className="mt-6 p-4 bg-emerald-50 rounded-xl border-l-4 border-emerald-500">
                <span className="text-emerald-600 font-medium">Outcome:</span>
                <span className="text-slate-600 ml-1">An asset that compounds. Clients pay even after service ends.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-10 md:p-14 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Find out what's breaking.</h2>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto">
            The diagnostic maps your structural weaknesses and shows you exactly which systems to build first.
          </p>
          <Link
            href="/questionnaire"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-slate-900 rounded-2xl font-semibold hover:bg-slate-100 transition-colors shadow-lg"
          >
            Start the Diagnostic
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="text-slate-400 text-sm mt-6">~45 minutes · 162 questions · Save progress anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
          <span className="text-slate-400 text-sm">© 2026 ExitLayer</span>
          <a href="mailto:michael@exitlayer.io" className="text-slate-400 hover:text-slate-600 text-sm transition-colors">
            michael@exitlayer.io
          </a>
        </div>
      </footer>
    </div>
  )
}

// ============================================
// VARIATION 2: "Thesis Style"
// Matches the ExitLayer thesis page - minimal, centered, dark green accent
// ============================================
function Variation2() {
  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Nav */}
      <nav className="py-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-lg font-medium text-[#1a1a1a] tracking-tight">ExitLayer</span>
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
          href="/questionnaire"
          className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-900 text-white rounded-full font-medium hover:bg-emerald-950 transition-colors"
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
                <div className="w-2 h-2 bg-emerald-900 rounded-full" />
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
                    <span className={`font-medium ${i === 2 ? 'text-emerald-800' : 'text-[#1a1a1a]'}`}>{v}</span>
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
                <span className="text-emerald-800 font-medium">{i + 1}.</span>
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
              <span className="text-4xl font-serif text-emerald-800">1</span>
              <h3 className="text-lg font-medium text-[#1a1a1a] mt-4 mb-2">Internal Infrastructure</h3>
              <p className="text-emerald-800 text-sm mb-4">Optimize what you have</p>
              <p className="text-[#666] text-sm">Extract the logic in your head. Embed it into systems that run without you.</p>
              <div className="mt-6 p-4 bg-[#f8f8f6] rounded-lg">
                <span className="text-emerald-800 font-medium text-sm">Outcome:</span>
                <span className="text-[#666] text-sm ml-1">Agency runs at 80% without you.</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 border border-[#e5e5e5]">
              <span className="text-4xl font-serif text-emerald-800">2</span>
              <h3 className="text-lg font-medium text-[#1a1a1a] mt-4 mb-2">External Infrastructure</h3>
              <p className="text-emerald-800 text-sm mb-4">Deploy what you've built</p>
              <p className="text-[#666] text-sm">Install your proprietary operating system across every client.</p>
              <div className="mt-6 p-4 bg-[#f8f8f6] rounded-lg">
                <span className="text-emerald-800 font-medium text-sm">Outcome:</span>
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
            href="/questionnaire"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-900 text-white rounded-full font-medium hover:bg-emerald-950 transition-colors"
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
          <span>© 2026 ExitLayer</span>
          <a href="mailto:michael@exitlayer.io" className="hover:text-[#666] transition-colors">
            michael@exitlayer.io
          </a>
        </div>
      </footer>
    </div>
  )
}

// ============================================
// VARIATION 3: "Dark Mode Premium"
// Dark theme with subtle gradients, premium feel
// ============================================
function Variation3() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Subtle gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-medium text-white/90">ExitLayer</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-white/60 hover:text-white text-sm transition-colors">
              Sign in
            </Link>
            <Link href="/questionnaire" className="px-5 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-4xl mx-auto px-6 pt-24 pb-20">
        <div className="text-center">
          <p className="text-white/40 text-sm uppercase tracking-widest mb-6">Structural Diagnostic</p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
            Your agency is a<br />
            <span className="text-red-400">hollow engine</span>.
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
            It runs hot. It produces revenue. But when you stop pushing, everything stops.
          </p>
          <Link
            href="/questionnaire"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-semibold hover:bg-white/90 transition-colors"
          >
            Take the Diagnostic
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <p className="text-white/30 text-sm mt-4">~45 minutes · Save anytime</p>
        </div>
      </section>

      {/* The Cascade */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white/90 mb-8">The harder you push, the more it breaks.</h2>
          <div className="space-y-3 text-white/60">
            <p>More clients require more labor.</p>
            <p className="pl-6">More labor requires more staff.</p>
            <p className="pl-12">More staff increases variability.</p>
            <p className="pl-18" style={{ paddingLeft: '4.5rem' }}>More variability requires more oversight.</p>
            <p className="pl-24 text-white font-medium" style={{ paddingLeft: '6rem' }}>More oversight pulls you deeper into operations.</p>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-xl font-semibold text-white/90 mb-8 text-center">Same revenue. Different architecture.</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <h3 className="text-white/40 text-sm uppercase tracking-wider">Hollow Engine</h3>
            </div>
            <div className="space-y-4">
              {[
                ['Revenue', 'Your labor'],
                ['When you stop', 'Everything stops'],
                ['Exit multiple', '1-2x'],
              ].map(([k, v], i) => (
                <div key={i} className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-white/40">{k}</span>
                  <span className={i === 2 ? 'text-red-400' : 'text-white/80'}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              <h3 className="text-white/40 text-sm uppercase tracking-wider">Infrastructure Operator</h3>
            </div>
            <div className="space-y-4">
              {[
                ['Revenue', 'Installed systems'],
                ['When you stop', 'Systems keep running'],
                ['Exit multiple', '4-5x'],
              ].map(([k, v], i) => (
                <div key={i} className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-white/40">{k}</span>
                  <span className={i === 2 ? 'text-emerald-400' : 'text-white/80'}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Five Fractures */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-xl font-semibold text-white/90 mb-8">Where agencies break.</h2>
        <div className="space-y-4">
          {[
            ['Labor-bound value', 'Output disappears when work stops.'],
            ['Non-proprietary delivery', 'Same playbooks as everyone else.'],
            ['Decay by default', "Yesterday's work doesn't reduce tomorrow's."],
            ['Founder dependency', 'Growth means more decisions through you.'],
            ['No durable assets', 'Clients leave, they take everything.'],
          ].map(([title, desc], i) => (
            <div key={i} className="flex gap-4 p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
              <span className="text-white/20 font-mono text-sm">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="text-white/90 font-medium">{title}</h3>
                <p className="text-white/40 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Two Stages */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-xl font-semibold text-white/90 mb-8 text-center">The two-stage evolution.</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-8">
            <span className="text-4xl font-light text-blue-400">1</span>
            <h3 className="text-lg font-semibold text-white mt-4 mb-2">Internal Infrastructure</h3>
            <p className="text-blue-300 text-sm mb-4">Optimize what you have</p>
            <p className="text-white/60 text-sm">Extract the logic in your head. Embed it into systems that run without you.</p>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-8">
            <span className="text-4xl font-light text-emerald-400">2</span>
            <h3 className="text-lg font-semibold text-white mt-4 mb-2">External Infrastructure</h3>
            <p className="text-emerald-300 text-sm mb-4">Deploy what you've built</p>
            <p className="text-white/60 text-sm">Install your proprietary operating system across every client.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-32">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Find out what's breaking.</h2>
          <p className="text-white/50 mb-8">The diagnostic maps your structural weaknesses.</p>
          <Link
            href="/questionnaire"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-semibold hover:bg-white/90 transition-colors"
          >
            Start the Diagnostic →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-white/30 text-sm">
          <span>© 2026 ExitLayer</span>
          <a href="mailto:michael@exitlayer.io" className="hover:text-white/50 transition-colors">
            michael@exitlayer.io
          </a>
        </div>
      </footer>
    </div>
  )
}

// ============================================
// VARIATION 4: "Editorial Clean"
// Magazine-style with strong typography hierarchy
// ============================================
function Variation4() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className="text-xl font-semibold text-slate-900 tracking-tight">ExitLayer</span>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-slate-500 hover:text-slate-900 text-sm transition-colors">
              Sign in
            </Link>
            <Link href="/questionnaire" className="text-sm text-slate-900 underline underline-offset-4 hover:no-underline">
              Start →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16">
        <p className="text-slate-400 text-sm uppercase tracking-widest mb-6">Structural Diagnostic</p>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight tracking-tight">
          Your agency is a hollow engine.
        </h1>
        <p className="text-2xl text-slate-500 leading-relaxed mb-10 font-light">
          It runs hot. It produces revenue. But when you stop pushing, everything stops.
          There's nothing inside that keeps working without you.
        </p>
        <div className="flex items-center gap-6">
          <Link
            href="/questionnaire"
            className="px-8 py-4 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Take the Diagnostic →
          </Link>
          <span className="text-slate-400 text-sm">~45 min</span>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="border-t border-slate-100" />
      </div>

      {/* The Cascade */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-10">The harder you push, the more it breaks.</h2>
        <div className="space-y-4 text-lg text-slate-600">
          <p>More clients require more labor.</p>
          <p className="pl-8">More labor requires more staff.</p>
          <p className="pl-16">More staff increases variability.</p>
          <p className="pl-24">More variability requires more oversight.</p>
          <p className="pl-32 text-slate-900 font-semibold">More oversight pulls you deeper into operations.</p>
        </div>
        <p className="mt-10 text-slate-400 italic">This isn't a management problem. It's a structural one.</p>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="border-t border-slate-100" />
      </div>

      {/* Comparison */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-10">Same revenue. Different architecture.</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-sm text-slate-400 uppercase tracking-widest mb-6">Hollow Engine</h3>
            <table className="w-full">
              <tbody>
                {[
                  ['Revenue', 'Your labor'],
                  ['When you stop', 'Everything stops'],
                  ['Retention', 'Until they outgrow you'],
                  ['Exit multiple', '1-2x'],
                  ['Your role', 'Chief Everything Officer'],
                ].map(([k, v], i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-3 text-slate-400">{k}</td>
                    <td className={`py-3 text-right font-medium ${i === 3 ? 'text-red-500' : 'text-slate-900'}`}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-sm text-slate-400 uppercase tracking-widest mb-6">Infrastructure Operator</h3>
            <table className="w-full">
              <tbody>
                {[
                  ['Revenue', 'Installed systems'],
                  ['When you stop', 'Systems keep running'],
                  ['Retention', 'Infrastructure embedded'],
                  ['Exit multiple', '4-5x'],
                  ['Your role', 'Architect'],
                ].map(([k, v], i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-3 text-slate-400">{k}</td>
                    <td className={`py-3 text-right font-medium ${i === 3 ? 'text-emerald-500' : 'text-slate-900'}`}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="border-t border-slate-100" />
      </div>

      {/* Five Fractures */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-10">Where agencies break.</h2>
        <ol className="space-y-8">
          {[
            ['Labor-bound value', 'Your output disappears the moment work stops. Nothing compounds.'],
            ['Non-proprietary delivery', 'Same tools, same playbooks, same deliverables as everyone else.'],
            ['Decay by default', "Campaigns fatigue. Strategies drift. Yesterday's work doesn't reduce tomorrow's."],
            ['Founder dependency', 'The more you grow, the more decisions route through you.'],
            ['No durable assets', 'When clients leave, they take everything. You keep nothing.'],
          ].map(([title, desc], i) => (
            <li key={i} className="flex gap-6">
              <span className="text-slate-300 font-mono text-sm mt-1">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
                <p className="text-slate-500">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Two Stages */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">The two-stage evolution.</h2>
        <p className="text-slate-500 mb-12">
          <span className="text-blue-500">Stage 1</span> buys back your time.
          <span className="text-emerald-500 ml-1">Stage 2</span> builds an asset.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="border-l-4 border-blue-500 pl-6">
            <span className="text-5xl font-light text-blue-500">1</span>
            <h3 className="text-xl font-bold text-slate-900 mt-4 mb-2">Internal Infrastructure</h3>
            <p className="text-blue-500 text-sm mb-4">Optimize what you have</p>
            <p className="text-slate-600">Extract the logic in your head. Embed it into systems that run without you.</p>
            <p className="mt-6 text-sm text-slate-500">
              <span className="text-blue-500 font-medium">Outcome:</span> Agency runs at 80% without your daily involvement.
            </p>
          </div>

          <div className="border-l-4 border-emerald-500 pl-6">
            <span className="text-5xl font-light text-emerald-500">2</span>
            <h3 className="text-xl font-bold text-slate-900 mt-4 mb-2">External Infrastructure</h3>
            <p className="text-emerald-500 text-sm mb-4">Deploy what you've built</p>
            <p className="text-slate-600">Install your proprietary operating system across every client.</p>
            <p className="mt-6 text-sm text-slate-500">
              <span className="text-emerald-500 font-medium">Outcome:</span> An asset that compounds. Clients pay even after service ends.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Find out what's breaking.</h2>
          <p className="text-slate-400 mb-8">The diagnostic maps your structural weaknesses.</p>
          <Link
            href="/questionnaire"
            className="inline-block px-10 py-4 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-colors"
          >
            Start the Diagnostic →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-slate-400 text-sm">
          <span>© 2026 ExitLayer</span>
          <a href="mailto:michael@exitlayer.io" className="hover:text-slate-600 transition-colors">
            michael@exitlayer.io
          </a>
        </div>
      </footer>
    </div>
  )
}

// ============================================
// VARIATION 5: "Liquid Cards"
// Card-heavy with depth, shadows, and subtle animations
// ============================================
function Variation5() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/25">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-900">ExitLayer</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
              Sign in
            </Link>
            <Link href="/questionnaire" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/25 hover:shadow-slate-900/40 hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12">
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/80 p-10 md:p-14 relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-100/50 to-orange-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative">
            <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 mb-6">
              Structural Diagnostic for Agency Owners
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
              Your agency is a <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">hollow engine</span>.
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed mb-8 max-w-2xl">
              It runs hot. It produces revenue. But when you stop pushing, everything stops.
              There's nothing inside that keeps working without you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/questionnaire"
                className="px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/25 hover:shadow-slate-900/40 hover:-translate-y-0.5 text-center"
              >
                Take the Diagnostic →
              </Link>
              <div className="flex items-center gap-2 text-slate-400 text-sm justify-center sm:justify-start">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ~45 minutes · Save anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Cascade */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/80 p-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">The harder you push, the more it breaks.</h2>
          <div className="space-y-3">
            {[
              { text: 'More clients require more labor.', level: 0 },
              { text: 'More labor requires more staff.', level: 1 },
              { text: 'More staff increases variability.', level: 2 },
              { text: 'More variability requires more oversight.', level: 3 },
              { text: 'More oversight pulls you deeper into operations.', level: 4, highlight: true },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl transition-all hover:scale-[1.01] ${
                  item.highlight
                    ? 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 shadow-sm'
                    : 'bg-slate-50'
                }`}
                style={{ marginLeft: `${item.level * 1.25}rem` }}
              >
                <p className={`text-lg ${item.highlight ? 'font-semibold text-red-900' : 'text-slate-600'}`}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Same revenue. Different architecture.</h2>
        <p className="text-slate-500 text-center mb-8">The difference is worth millions at exit.</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Hollow */}
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/80 p-8 relative overflow-hidden hover:shadow-2xl transition-shadow">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-400 to-orange-400 rounded-t-[2rem]" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900">Hollow Engine</h3>
            </div>
            <div className="space-y-3">
              {[
                ['Revenue', 'Your labor'],
                ['When you stop', 'Everything stops'],
                ['Exit multiple', '1-2x'],
              ].map(([k, v], i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-sm">{k}</span>
                  <span className={`font-semibold ${i === 2 ? 'text-red-500' : 'text-slate-900'}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure */}
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/80 p-8 relative overflow-hidden hover:shadow-2xl transition-shadow">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-t-[2rem]" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900">Infrastructure Operator</h3>
            </div>
            <div className="space-y-3">
              {[
                ['Revenue', 'Installed systems'],
                ['When you stop', 'Systems keep running'],
                ['Exit multiple', '4-5x'],
              ].map(([k, v], i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-sm">{k}</span>
                  <span className={`font-semibold ${i === 2 ? 'text-emerald-500' : 'text-slate-900'}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Five Fractures */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/80 p-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Where agencies break.</h2>
          <div className="grid gap-4">
            {[
              ['Labor-bound value', 'Output disappears when work stops.'],
              ['Non-proprietary delivery', 'Same playbooks as everyone else.'],
              ['Decay by default', "Yesterday's work doesn't reduce tomorrow's."],
              ['Founder dependency', 'Growth means more decisions through you.'],
              ['No durable assets', 'Clients leave, they take everything.'],
            ].map(([title, desc], i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="text-slate-500 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Stages */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">The two-stage evolution.</h2>
        <p className="text-slate-500 text-center mb-8">Stage 1 buys time. Stage 2 builds an asset.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-[2rem] shadow-xl shadow-blue-200/50 p-8 border border-blue-100">
            <span className="text-5xl font-light text-blue-400">1</span>
            <h3 className="text-xl font-bold text-slate-900 mt-4 mb-2">Internal Infrastructure</h3>
            <p className="text-blue-600 text-sm font-medium mb-4">Optimize what you have</p>
            <p className="text-slate-600 mb-6">Extract the logic in your head. Embed it into systems.</p>
            <div className="p-4 bg-blue-100/50 rounded-xl">
              <span className="text-blue-700 font-medium">Outcome:</span>
              <span className="text-slate-700 ml-1">Agency runs at 80% without you.</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-[2rem] shadow-xl shadow-emerald-200/50 p-8 border border-emerald-100">
            <span className="text-5xl font-light text-emerald-400">2</span>
            <h3 className="text-xl font-bold text-slate-900 mt-4 mb-2">External Infrastructure</h3>
            <p className="text-emerald-600 text-sm font-medium mb-4">Deploy what you've built</p>
            <p className="text-slate-600 mb-6">Install your proprietary OS across every client.</p>
            <div className="p-4 bg-emerald-100/50 rounded-xl">
              <span className="text-emerald-700 font-medium">Outcome:</span>
              <span className="text-slate-700 ml-1">An asset that compounds.</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-12 text-center shadow-2xl shadow-slate-900/25">
          <h2 className="text-3xl font-bold text-white mb-4">Find out what's breaking.</h2>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto">
            The diagnostic maps your structural weaknesses and shows exactly which systems to build.
          </p>
          <Link
            href="/questionnaire"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-all shadow-lg hover:-translate-y-0.5"
          >
            Start the Diagnostic
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <p className="text-slate-400 text-sm mt-6">~45 minutes · 162 questions · Save anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-slate-400 text-sm">
          <span>© 2026 ExitLayer</span>
          <a href="mailto:michael@exitlayer.io" className="hover:text-slate-600 transition-colors">
            michael@exitlayer.io
          </a>
        </div>
      </footer>
    </div>
  )
}
