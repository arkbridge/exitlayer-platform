'use client'

import { useEffect, useRef } from 'react'
import {
  ArrowRight,
  Inbox,
  RefreshCw,
  GitBranch,
  CheckSquare,
  XCircle,
  CheckCircle2,
} from 'lucide-react'

export default function MarketingHome() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    const elements = ref.current?.querySelectorAll('.reveal')
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="marketing-page overflow-x-hidden font-sans selection:bg-brand-950 selection:text-white grid-bg"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-base/90 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl tracking-tight text-brand-950 flex items-center gap-2" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            <div className="w-2.5 h-2.5 bg-brand-950" />
            ExitLayer
          </div>
          <div className="flex items-center gap-8">
            <a href="https://cal.com/exit-layer/30min" className="hidden md:block font-mono text-[10px] uppercase tracking-widest text-brand-muted hover:text-brand-950 transition-colors">
              The Audit
            </a>
            <a
              href="https://cal.com/exit-layer/30min"
              className="font-mono text-[11px] uppercase tracking-widest bg-brand-950 text-white px-6 py-2.5 hover:bg-brand-800 transition-all"
            >
              Book Call
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-24 md:pb-32 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="reveal max-w-5xl">
            <div className="mono-label mb-8 flex items-center gap-3">
              <span className="w-1 h-1 bg-brand-950" />
              Business Aerodynamics
            </div>
            <h1 className="h-hero text-brand-950 mb-12 text-balance" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              Half the work in your business <em className="italic font-light text-brand-muted">doesn&apos;t need a person</em> doing it anymore.
            </h1>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-start mt-12 md:mt-20">
            <div className="lg:col-span-1 hidden lg:block pt-4">
              <div className="w-full h-px bg-brand-950" />
            </div>
            <div className="lg:col-span-7 reveal">
              <p className="text-xl md:text-2xl font-light text-brand-900 leading-relaxed mb-12 text-balance">
                I find the functions that are dead weight, replace them with systems, and install everything without breaking what works. You keep the people who matter.{' '}
                <span className="font-medium underline decoration-brand-border decoration-2 underline-offset-4">The weight goes.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <a
                  href="https://cal.com/exit-layer/30min"
                  className="w-full sm:w-auto px-10 py-5 bg-brand-950 text-white font-mono text-xs uppercase tracking-widest hover:bg-brand-800 transition-all flex items-center justify-center gap-3"
                >
                  Book a call <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="https://cal.com/exit-layer/30min"
                  className="w-full sm:w-auto px-10 py-5 bg-transparent text-brand-950 border border-brand-border font-mono text-xs uppercase tracking-widest hover:border-brand-950 transition-all text-center"
                >
                  Get an audit
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Problem */}
      <section className="py-24 md:py-32 bg-white border-b border-brand-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 mb-20">
            <div className="lg:col-span-8 reveal">
              <div className="section-marker">
                <span>01</span>
                <div className="line" />
                <span className="text-brand-muted uppercase tracking-widest">The Problem</span>
              </div>
              <h2 className="h-section text-brand-950 text-balance mb-12" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                You don&apos;t have a people problem. You have a drag problem.
              </h2>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5 reveal">
              <div className="prose prose-lg text-brand-900 font-light leading-relaxed space-y-8">
                <p className="text-xl font-normal leading-snug">Watch what actually happens in your business on a Tuesday.</p>
                <p>A lead comes in. Someone logs it. Someone else qualifies it. Someone routes it. Someone follows up. Someone checks the follow-up. Someone enters the data into a second system because the first one doesn&apos;t talk to it. And someone manages all of these people.</p>
                <p>Everyone&apos;s doing their job. That&apos;s the problem. <span className="italic">Doing the job and being necessary for the job are two different things now.</span></p>
              </div>
            </div>

            <div className="lg:col-span-7 reveal lg:pl-12">
              <div className="bg-brand-base border border-brand-border p-10 relative overflow-hidden">
                <div className="mono-label mb-10 flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-red-600 animate-pulse" />
                  The Human Middleware Chain
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                  {[
                    { icon: <Inbox className="w-4 h-4 text-brand-950" />, label: 'Receive', person: 'Human 1' },
                    { icon: <RefreshCw className="w-4 h-4 text-brand-950" />, label: 'Process', person: 'Human 2' },
                    { icon: <GitBranch className="w-4 h-4 text-brand-950" />, label: 'Route', person: 'Human 3' },
                    { icon: <CheckSquare className="w-4 h-4 text-brand-950" />, label: 'Verify', person: 'Human 4' },
                  ].map((step) => (
                    <div key={step.label} className="bg-white border border-brand-border p-5 text-center">
                      <div className="w-10 h-10 border border-brand-border bg-brand-base mx-auto mb-4 flex items-center justify-center">
                        {step.icon}
                      </div>
                      <div className="font-mono text-[10px] uppercase font-bold text-brand-950">{step.label}</div>
                      <div className="font-mono text-[9px] text-brand-muted mt-1 uppercase">{step.person}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-10 border-t border-brand-border flex items-center justify-between">
                  <div className="text-xs font-mono text-brand-muted uppercase">Status: Inefficient</div>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-red-600" />
                    <div className="w-1 h-1 bg-red-600 opacity-50" />
                    <div className="w-1 h-1 bg-red-600 opacity-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Grid */}
          <div className="mt-32 border-x border-brand-border reveal">
            <div className="grid md:grid-cols-2">
              <div className="p-12 md:p-20 border-y md:border-r border-brand-border bg-white relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600" />
                <div className="mono-label text-red-600 mb-10 font-bold">Your Team Today</div>
                <div className="mb-12">
                  <div className="text-6xl md:text-7xl text-brand-950 tracking-tighter" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>$40,000</div>
                  <div className="mono-label mt-2">Per Month / Loaded Labor</div>
                </div>
                <ul className="space-y-6">
                  {['12 people doing process work', 'Manual handoffs between systems', 'Error risk at every transfer point', 'Margin erodes every quarter'].map((item) => (
                    <li key={item} className="flex items-start gap-4 font-light">
                      <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-12 md:p-20 border-y border-brand-border bg-brand-base relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-950" />
                <div className="mono-label text-brand-950 mb-10 font-bold">Their Systems</div>
                <div className="mb-12">
                  <div className="text-6xl md:text-7xl text-brand-950 tracking-tighter" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>$2,000</div>
                  <div className="mono-label mt-2">Per Month / 70% Automated</div>
                </div>
                <ul className="space-y-6">
                  {['Same output, fewer humans', 'Connected systems, zero manual bridging', 'Zero transfer errors', 'Margin compounds every quarter'].map((item) => (
                    <li key={item} className="flex items-start gap-4 font-light">
                      <CheckCircle2 className="w-5 h-5 text-brand-950 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-20 max-w-4xl mx-auto text-center reveal">
            <p className="text-3xl md:text-4xl text-brand-950 italic leading-snug" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              Every month you carry that weight, someone in your market is figuring out how to run without it.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Invalidation */}
      <section className="py-24 md:py-32 bg-brand-base border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 reveal">
            <div className="section-marker">
              <span>02</span>
              <div className="line" />
              <span className="text-brand-muted uppercase tracking-widest">The Graveyard</span>
            </div>
            <h2 className="h-section text-brand-950 max-w-4xl text-balance" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              You&apos;ve tried to fix this before.<br />Here&apos;s why it didn&apos;t work.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-brand-border border border-brand-border">
            {[
              { num: '01', title: 'Hiring more people', desc: 'You added headcount. Revenue went up. So did management, Slack channels, standups, and coordination overhead. Complexity scaled faster than revenue. Margins went sideways.', dark: false, span: false },
              { num: '02', title: 'Buying more software', desc: "Fifteen SaaS tools. CRM, project management, invoicing, support desk, analytics. Half overlap. None talk to each other. You still need a person sitting between every two systems making them play nice.", dark: false, span: false },
              { num: '03', title: 'Outsourcing', desc: "Cheaper labor, different timezone, same ceiling. The work still requires a human. You just pay that human less. The model didn't change. The geography did.", dark: true, span: false },
              { num: '04', title: '"Automation" consultants', desc: 'Someone sold you Zapier workflows and Notion templates. The Zaps broke the first time a field name changed. You paid $10K to automate the easy 10% and nobody touched the hard 90%.', dark: false, span: false },
              { num: '05', title: 'AI tools without architecture', desc: "ChatGPT Enterprise. Your team rewrites emails and summarizes meetings with it. Helpful, not structural. Nobody mapped which functions are drag, which are load-bearing, and what order to strip them in without the whole thing falling over.", dark: false, span: true },
            ].map((card) => (
              <div
                key={card.num}
                className={`p-10 reveal group transition-colors ${card.dark ? 'bg-brand-950' : 'bg-brand-base hover:bg-white'} ${card.span ? 'md:col-span-2' : ''}`}
              >
                <div className={`font-mono text-[40px] mb-8 transition-colors ${card.dark ? 'text-white/70 group-hover:text-white' : 'text-brand-borderHeavy group-hover:text-brand-950'}`}>
                  {card.num}
                </div>
                <h3 className={`text-xl font-bold mb-5 ${card.dark ? 'text-white' : 'text-brand-950'}`}>{card.title}</h3>
                <p className={`text-sm leading-relaxed font-light ${card.dark ? 'text-white/70' : 'text-brand-muted'} ${card.span ? 'max-w-2xl' : ''}`}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Mechanism */}
      <section className="py-24 md:py-32 bg-white border-b border-brand-border relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 reveal">
            <div className="section-marker">
              <span>03</span>
              <div className="line" />
              <span className="text-brand-muted uppercase tracking-widest">The Mechanism</span>
            </div>
            <h2 className="h-section text-brand-950 text-balance" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              This isn&apos;t about automation.<br />It&apos;s about <em className="italic font-light text-brand-muted">aerodynamics.</em>
            </h2>
          </div>

          <div className="grid lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-7 prose prose-xl text-brand-900 font-light leading-relaxed reveal">
              <p>Forget &ldquo;automation.&rdquo; Every consultant with a Zapier account uses that word. This is different.</p>
              <p>Your business is a vehicle. Some of what it carries moves it forward. Some of it is just weight. Before AI agents, every person was load-bearing by default. You needed humans for everything.</p>

              <div className="my-16 py-12 border-y border-brand-border text-center">
                <p className="text-3xl md:text-5xl text-brand-950 leading-tight m-0" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                  That&apos;s over. AI agents execute now.<br /><em className="italic font-light">Not assist. Execute.</em>
                </p>
              </div>

              <p>Receive the input. Apply the logic. Produce the output. Route it forward. No human in the middle. Which means you can finally ask the real question: is this person structural to my business, or are they weight?</p>
              <p>Aerodynamics is the answer. Map what&apos;s load-bearing. Identify the drag. Strip the drag in the right order so nothing collapses. Not random automation. Not layoffs. Surgery.</p>
            </div>

            {/* Sticky Doctrine */}
            <div className="lg:col-span-5 lg:sticky sticky-doctrine reveal">
              <div className="bg-white border-2 border-brand-950 p-10">
                <div className="mono-label text-brand-950 mb-8 font-bold">The Doctrine</div>
                <p className="text-2xl leading-relaxed mb-8 text-brand-950" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                  The winners over the next three years won&apos;t be the biggest or the best-funded. They&apos;ll be the leanest. The ones who figured out what to strip and what to keep before their competitors did.
                </p>
                <div className="h-px bg-brand-border mb-8" />
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-brand-muted">ExitLayer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Proof */}
      <section className="py-24 md:py-32 bg-brand-base border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 reveal">
            <div className="mono-label mb-6">04 &mdash; Track Record</div>
            <h2 className="h-section text-brand-950" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              Not theory.<br />Thirty builds and counting.
            </h2>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 reveal">
            {[
              { value: '30+', label: 'Engagements' },
              { value: '12', label: 'Industries' },
              { value: '70%', label: 'Time Saved' },
              { value: '70x', label: 'Returns Built' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-brand-border p-8 text-center">
                <div className="text-6xl text-brand-950 mb-2" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>{stat.value}</div>
                <div className="mono-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Case Studies */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 reveal">
            {[
              { category: 'Agencies', headline: '20 founders removed from the loop', desc: 'Operational infrastructure that got founders out of delivery. Weekends back. Quality held.' },
              { category: 'Health-tech', headline: '70% manual cut for 9-figure brand', desc: 'Integration layer for a wearable company. Connected isolated data silos, killed human routing between them.' },
              { category: 'Biotech', headline: 'US Peptide Manufacturing Stack', desc: 'Custom manufacturing infrastructure. Replaced manual workflows with systems the ops team owns outright.' },
            ].map((study) => (
              <div key={study.category} className="border-l border-brand-950 pl-8 py-4">
                <div className="mono-label mb-4">{study.category}</div>
                <h4 className="text-2xl mb-4" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>{study.headline}</h4>
                <p className="text-brand-muted text-sm leading-relaxed font-light">{study.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: The Offer */}
      <section className="py-24 md:py-32 bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 reveal">
            <div className="section-marker">
              <span>05</span>
              <div className="line" />
              <span className="text-brand-muted uppercase tracking-widest">The Offer</span>
            </div>
            <h2 className="h-section text-brand-950" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              What you get.<br />Three phases. One operator.
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 mb-24">
            {[
              {
                phase: 'Phase 01',
                title: 'Aerodynamics Audit',
                desc: "I map your business function by function. Where the drag is. What's load-bearing. What to strip first. You walk away knowing exactly what to systematize, in what order, and what it costs to leave things as they are.",
                quote: '"First time someone looked at how my business actually runs, not how the org chart says it should."',
                border: 'border-brand-950',
              },
              {
                phase: 'Phase 02',
                title: 'Architecture + Installation',
                desc: "The surgery. Custom platform. AI agents underneath doing the repetitive cognitive work your team used to do. Built for your operations, tested against your actual workflows. You own the code. You own the system.",
                quote: '"One operator. One system. One business. No cohort. No course."',
                border: 'border-brand-borderHeavy',
              },
              {
                phase: 'Phase 03',
                title: 'Fractional AI Operations',
                desc: "The person who built it stays on. Monitors. Adjusts. Optimizes as your business shifts. First call when something breaks. Not a handoff to a support team you've never met.",
                quote: '"Fraction of a full-time hire. From the person who already knows your stack cold."',
                border: 'border-brand-borderHeavy',
              },
            ].map((phase) => (
              <div key={phase.phase} className="reveal">
                <div className={`bg-brand-base p-10 h-full border-t-4 ${phase.border}`}>
                  <div className="mono-label mb-8">{phase.phase}</div>
                  <h3 className="text-3xl text-brand-950 mb-6" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>{phase.title}</h3>
                  <p className="text-brand-900 text-sm leading-relaxed font-light mb-6">{phase.desc}</p>
                  <div className="text-[11px] font-mono text-brand-muted italic">{phase.quote}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Table */}
          <div className="max-w-5xl mx-auto reveal">
            <div className="editorial-border bg-white overflow-hidden">
              <div className="bg-brand-950 text-white px-8 py-4 font-mono text-[10px] uppercase tracking-widest flex justify-between">
                <span>Investment Structure</span>
                <span>FY 2026</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border">
                      <th className="py-5 px-8 mono-label font-bold">Business Type</th>
                      <th className="py-5 px-8 mono-label font-bold">Build (Ph 1+2)</th>
                      <th className="py-5 px-8 mono-label font-bold">Ongoing (Ph 3)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {[
                      { type: 'Solo founders', build: '$5-10K', ongoing: '$1-2K/mo' },
                      { type: 'Agencies ($50-150K/mo)', build: '$15-25K', ongoing: '$2-3K/mo' },
                      { type: 'Operations-heavy businesses', build: '$25-75K', ongoing: '$3-5K/mo' },
                      { type: 'Mid-size companies (50-500 people)', build: '$50-150K', ongoing: '$5-10K/mo' },
                      { type: 'Enterprise', build: 'Custom', ongoing: 'Custom' },
                    ].map((row) => (
                      <tr key={row.type} className="hover:bg-brand-base transition-colors">
                        <td className="py-6 px-8 font-medium">{row.type}</td>
                        <td className="py-6 px-8 font-mono text-sm">{row.build}</td>
                        <td className="py-6 px-8 font-mono text-sm text-brand-muted">{row.ongoing}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Who This Is For */}
      <section className="py-24 md:py-32 bg-brand-base border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 reveal">
            <div className="section-marker">
              <span>06</span>
              <div className="line" />
              <span className="text-brand-muted uppercase tracking-widest">Who This Is For</span>
            </div>
            <h2 className="h-section text-brand-950" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              This isn&apos;t for everyone.<br />Here&apos;s who it works for.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 reveal">
            {[
              { title: 'Solo founders building something real.', desc: "Building what used to take ten people. You can do it alone now if the architecture is right. Get the foundation wrong and you're rebuilding in six months while your competitor ships.", dark: false, span: false },
              { title: 'Agency owners who feel the ceiling.', desc: "$50K, $80K, $100K a month. Should feel free. Feels like a trap. Revenue requires your involvement. Your clients are getting smarter about what AI can do. Some are wondering why they pay you for work a system handles. The model has a timer on it.", dark: false, span: false },
              { title: 'Operations-heavy businesses bleeding margin.', desc: "Twenty, forty, sixty people reconciling data, routing information, keying numbers into three systems. That processing layer is your most expensive integration point. And every person in it is salary, benefits, management overhead, and institutional knowledge that walks out the door on two weeks' notice.", dark: false, span: false },
              { title: 'Mid-size companies stuck between pilot and production.', desc: "Board keeps asking about AI strategy. You've run the pilots. They produced decks, not results. Competitors are visibly getting leaner. You don't need another firm that charges by the slide. You need someone who builds the thing, proves it on one function, and scales from there.", dark: false, span: false },
              { title: 'Enterprise organizations tired of consulting theater.', desc: 'Big firms hired. Task force formed. Twelve pilots run. Two showed promise. Zero made it to production. Skip the strategy document. One operator, one function, proven ROI, then scale. Evidence over PowerPoint.', dark: true, span: true },
            ].map((card) => (
              <div
                key={card.title}
                className={`p-10 editorial-border flex flex-col group transition-all ${card.dark ? 'bg-brand-950 border-brand-950' : 'bg-white hover:border-brand-950'} ${card.span ? 'md:col-span-2' : ''}`}
              >
                <h3 className={`text-xl font-bold mb-6 ${card.dark ? 'text-white' : 'text-brand-950'}`}>{card.title}</h3>
                <p className={`text-sm leading-relaxed font-light mb-8 flex-grow ${card.dark ? 'text-white/70' : 'text-brand-muted'}`}>{card.desc}</p>
                <div className={`h-1 w-12 group-hover:w-full transition-all duration-500 ${card.dark ? 'bg-white/20' : 'bg-brand-950'}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: How It Works */}
      <section className="py-24 md:py-32 bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 reveal">
            <div className="section-marker">
              <span>07</span>
              <div className="line" />
              <span className="text-brand-muted uppercase tracking-widest">How It Works</span>
            </div>
            <h2 className="h-section text-brand-950" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              Four steps from call<br />to running system.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-brand-border border border-brand-border reveal">
            {[
              { step: 'Step 01', title: 'The call.', desc: "We talk operations. Not goals, not vision. What happens every day. Where information moves. If there's nothing to fix, I'll tell you and we part ways." },
              { step: 'Step 02', title: 'The audit.', desc: 'Function-by-function map. Drag versus load-bearing. What to systematize, in what order, and what it costs you every month to leave things as they are.' },
              { step: 'Step 03', title: 'The build.', desc: 'Custom platform. AI agents. Operational infrastructure. Built 1:1, installed into your live operations, tested against real workflows. You see progress weekly. You own the code.' },
              { step: 'Step 04', title: 'The ongoing.', desc: 'System goes live. I stay on. Monitor, adjust, optimize. The person who built it maintains it. No handoff. Direct line to the operator.' },
            ].map((item) => (
              <div key={item.step} className="bg-white p-10">
                <div className="mono-label mb-8">{item.step}</div>
                <h4 className="text-lg font-bold text-brand-950 mb-4">{item.title}</h4>
                <p className="text-brand-muted text-sm leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: FAQ */}
      <section className="py-24 md:py-32 bg-brand-base border-b border-brand-border">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-20 reveal">
            <div className="mono-label mb-6">08 &mdash; Questions</div>
            <h2 className="h-section text-brand-950" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              Questions you&apos;re probably asking.
            </h2>
          </div>

          <div className="space-y-4 reveal">
            {[
              { q: 'How is this different from every other AI consultant?', a: "I build systems. The deliverable isn't a deck or a list of recommendations. It's a working platform with AI agents running live in your operations. If it breaks, that's my problem. Not yours." },
              { q: 'What if my business is too complex for this?', a: "Peptide manufacturing. 20-million-email martech platforms. Publicly traded commerce operations. The approach maps real complexity, finds what's repeatable, and systematizes that layer. Your business isn't too complex. It's under-mapped." },
              { q: 'What happens to my team?', a: "Nobody gets fired on day one. System runs in parallel until it's proven. Then you decide what to do with the freed-up capacity. Most clients move people to higher-value work. The point is removing work that doesn't require a person, not removing people." },
              { q: 'How long does this take?', a: 'Solo founder: 2-4 weeks. Agency and ops-heavy: 4-8 weeks. Mid-size and enterprise: phased, starting with one function. You see working output in the first two weeks regardless.' },
              { q: 'Why should I trust one person over a consulting firm?', a: 'One person built thirty of these across twelve verticals. A consulting firm assigns a junior analyst and bills partner rates. I do the work. Same person who sells it builds it and maintains it. That\'s the proposition.' },
              { q: "What if I'm not sure this is right for my business?", a: "That's what the audit is for. I map your operations, show you where the drag is, give you the sequence. If the math doesn't work, I'll say so. No engagement unless the ROI is obvious to both of us." },
            ].map((faq) => (
              <details key={faq.q} className="group bg-white editorial-border">
                <summary className="list-none cursor-pointer p-8 flex items-center justify-between">
                  <span className="font-bold text-brand-950 tracking-tight">{faq.q}</span>
                  <span className="w-6 h-6 flex items-center justify-center border border-brand-border group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-8 pb-8 prose prose-sm text-brand-muted font-light">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-brand-base border-b border-brand-border relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="bg-brand-950 text-white p-12 md:p-20 text-center reveal">
            <h2 className="h-section mb-10 text-balance leading-tight" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              Someone in your market is getting leaner right now.
            </h2>
            <p className="text-xl font-light text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
              Every month you carry operational drag is a month they spend building a margin advantage you&apos;ll have to close later. That gap compounds.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <a
                href="https://cal.com/exit-layer/30min"
                className="w-full md:w-auto px-12 py-6 bg-white text-brand-950 font-mono text-xs uppercase tracking-widest hover:bg-brand-base transition-all flex items-center justify-center gap-3"
              >
                Book a call <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://cal.com/exit-layer/30min"
                className="w-full md:w-auto px-12 py-6 border border-white/50 text-white font-mono text-xs uppercase tracking-widest hover:border-white transition-all flex items-center justify-center gap-3"
              >
                Get an audit
              </a>
            </div>

            <div className="mt-16 pt-16 border-t border-white/30">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 mb-8">Not sure if you&apos;re a fit? &mdash; The Diagnostic</p>
              <div className="flex flex-col items-center">
                <p className="text-white/90 font-light text-sm mb-6 italic">I map your operations, show you the drag, and give you the sequence.</p>
                <a href="https://cal.com/exit-layer/30min" className="text-white font-mono text-xs uppercase tracking-[0.2em] border-b border-white/50 pb-2 hover:border-white transition-all">
                  Get an Aerodynamics Audit
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <div>
              <div className="text-3xl tracking-tight text-brand-950 flex items-center gap-2 mb-6" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                <div className="w-2.5 h-2.5 bg-brand-950" />
                ExitLayer
              </div>
              <p className="text-brand-muted text-sm font-light max-w-xs">Strip the drag. Install the systems. Keep what&apos;s load-bearing.</p>
            </div>
            <div className="flex flex-col gap-4 items-start md:items-end">
              <a href="mailto:michael@exitlayer.com" className="font-mono text-[11px] uppercase tracking-widest text-brand-950 hover:underline">michael@exitlayer.com</a>
              <div className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">&copy; 2026 ExitLayer Operations LLC</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
