'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

// Word-by-word animated text component
function AnimatedHeadline({
  text,
  className,
  gradient = false
}: {
  text: string;
  className?: string;
  gradient?: boolean;
}) {
  const words = text.split(' ')

  const gradientStyle = gradient ? {
    background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 40%, rgba(167,243,208,0.85) 80%, rgba(110,231,183,0.7) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  } : {}

  return (
    <h1 className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className="word-animate inline-block"
          style={{
            animationDelay: `${i * 0.08}s`,
            ...gradientStyle
          }}
        >
          {word}
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </h1>
  )
}

// Hook for scroll-triggered animations
function useScrollAnimation() {
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

    const elements = ref.current?.querySelectorAll('.fade-up, .slide-in-left, .scale-up, .stagger-children, .reveal-paragraph, .highlight-text')
    elements?.forEach((el) => observer.observe(el))

    // Progress bar scroll tracking for insight section
    const handleScroll = () => {
      const insightSection = document.querySelector('.pull-quote')?.closest('section')
      const progressBar = document.getElementById('insight-progress')

      if (insightSection && progressBar) {
        const rect = insightSection.getBoundingClientRect()
        const windowHeight = window.innerHeight
        const sectionHeight = insightSection.offsetHeight

        // Calculate how far through the section we've scrolled
        const scrolledIntoSection = windowHeight - rect.top
        const totalScrollableDistance = sectionHeight + windowHeight
        const progress = Math.max(0, Math.min(100, (scrolledIntoSection / totalScrollableDistance) * 100))

        progressBar.style.height = `${progress}%`
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return ref
}

export default function Home() {
  const scrollRef = useScrollAnimation()
  const [showStickyCTA, setShowStickyCTA] = useState(false)

  // Show sticky CTA after scrolling past hero
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = 600 // Approximate hero height
      setShowStickyCTA(window.scrollY > heroHeight)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div ref={scrollRef} className="min-h-screen bg-[#f8f8f6]">
      {/* Hero section with dark gradient */}
      <div className="bg-gradient-to-br from-[#0d1c18] via-emerald-950 to-[#0a1612] relative overflow-hidden">
        {/* Decorative blur elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-600/5 rounded-full blur-3xl" />

        {/* Nav */}
        <nav className="py-6 relative z-10">
          <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
            <span
              className="text-xl font-serif font-medium tracking-tight"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(167,243,208,0.8) 50%, rgba(110,231,183,0.6) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 2px 4px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.3)',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))'
              }}
            >
              ExitLayer
            </span>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-white/60 hover:text-white text-sm transition-colors">
                Sign in
              </Link>
              <Link
                href="/questionnaire"
                className="px-5 py-2 bg-white text-emerald-900 rounded-full text-sm font-medium hover:bg-emerald-50 transition-all hover:scale-105"
              >
                Get Your Exit Price
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero content */}
        <section className="max-w-3xl mx-auto px-6 pt-20 pb-32 md:pt-28 md:pb-40 text-center relative z-10">
          <p
            className="text-emerald-400/60 text-sm mb-4 uppercase tracking-wider word-animate font-medium"
            style={{ animationDelay: '0s' }}
          >
            Making great money. Building nothing.
          </p>
          <div
            className="mb-6"
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15)) drop-shadow(0 2px 4px rgba(6,95,70,0.2))'
            }}
          >
            <AnimatedHeadline
              text="Don't Spend Another Year Building Something You Can't Sell."
              className="text-4xl md:text-6xl font-serif font-medium leading-[1.1]"
              gradient
            />
          </div>
          <p
            className="text-white/60 text-lg leading-relaxed mb-8 max-w-xl mx-auto word-animate"
            style={{ animationDelay: '0.8s' }}
          >
            Most agencies are worth 1-2x profit. Yours could be worth 4-6x. The difference is structure. Find out where you stand.
          </p>
          <div className="word-animate" style={{ animationDelay: '1s' }}>
            <Link
              href="/questionnaire"
              className="hero-cta inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-900 rounded-full font-medium hover:bg-emerald-50 transition-all text-lg hover:scale-105"
            >
              Find Out Your Exit Price
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <p
            className="text-white/40 text-sm mt-4 word-animate"
            style={{ animationDelay: '1.1s' }}
          >
            14 questions · 2 minutes · Instant valuation
          </p>
          {/* Social proof */}
          <div className="mt-8 word-animate" style={{ animationDelay: '1.3s' }}>
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-[#0d1c18] flex items-center justify-center text-[10px] text-white font-medium"
                  >
                    {['M', 'J', 'S', 'A'][i - 1]}
                  </div>
                ))}
              </div>
              <span className="text-white/60 text-sm">
                <span className="text-white/80 font-medium">150+</span> agency owners assessed
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* The Symptoms - with scroll animation */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="border-t border-[#e5e5e5] pt-20">
          <p className="text-red-500/80 text-xs uppercase tracking-wider text-center mb-3 font-medium fade-up">
            <span className="inline-block px-3 py-1 bg-red-500/5 rounded-full">Sound familiar?</span>
          </p>
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-[#1a1a1a] mb-4 text-center fade-up">
            Five Signs Your Agency Owns You.
          </h2>
          <p className="text-[#666] text-center mb-10 max-w-lg mx-auto fade-up">
            These aren't random problems. They're symptoms of a business that was never built to run without you.
          </p>
          <div className="space-y-6">
            {[
              ['You can\'t take a real vacation', 'Two days off and the fires start. A week away and revenue dips. You haven\'t actually disconnected in years.'],
              ['Everything requires your approval', 'Pricing, client issues, hiring decisions, project direction. The bottleneck is always you.'],
              ['Revenue resets every month', 'No retainers, no recurring. Just hustling for new projects while hoping existing clients come back.'],
              ['One client leaving would hurt', 'You know which one. They\'re 30% of revenue. You think about it more than you admit.'],
              ['There\'s nothing to hand off', 'No documented processes. No playbooks. If you got hit by a bus, the business dies with you.'],
            ].map(([title, desc], i) => (
              <div
                key={i}
                className="flex gap-4 items-start slide-in-left bg-white/50 p-5 rounded-xl border border-transparent hover:border-[#e5e5e5] transition-all"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-500 text-sm font-bold">{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-medium text-[#1a1a1a] text-lg">{title}</h3>
                  <p className="text-[#666] text-sm mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Integrated CTA - flows naturally from content */}
          <div className="mt-12 pt-8 border-t border-[#e5e5e5] fade-up">
            <p className="text-[#1a1a1a] text-lg font-medium mb-2">
              If you recognize three or more of these, your business has a structural problem.
            </p>
            <p className="text-[#666] mb-6">
              The good news? <span className="text-emerald-700 font-medium">It's fixable.</span>
            </p>
            <Link
              href="/questionnaire"
              className="inline-flex items-center gap-2 text-emerald-700 font-medium hover:text-emerald-800 transition-colors group"
            >
              See exactly what's holding you back
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* The Insight - Enhanced with progressive reveal, highlights, and progress bar */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="border-t border-[#e5e5e5] pt-24">
          {/* Progress bar + Card container */}
          <div className="flex gap-4 md:gap-6">
            {/* Standalone progress bar */}
            <div className="hidden md:block w-1 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
              <div
                className="insight-progress-bar w-full bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full"
                style={{ height: '0%' }}
                id="insight-progress"
              />
            </div>

            {/* Main card with premium shadows */}
            <div
              className="scale-up flex-1 bg-white rounded-3xl p-10 md:p-14 lg:p-20 card-hover relative"
              style={{
                boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.04), 0 16px 32px rgba(0,0,0,0.06), 0 32px 64px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.06)'
              }}
            >
              <p className="text-xs text-emerald-600 uppercase tracking-wider mb-6 font-semibold fade-up">The truth about exits</p>

              {/* Pull quote headline */}
              <div className="pull-quote pl-4 md:pl-8 mb-12 fade-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-[#1a1a1a] leading-tight italic">
                  "Building to exit" isn't about selling.
                </h2>
                <p className="text-xl md:text-2xl text-[#666] mt-4 font-light">
                  It's about building a business that doesn't require you.
                </p>
              </div>

              {/* Progressive reveal paragraphs with highlights */}
              <div className="space-y-8 text-[#666] text-lg md:text-xl leading-relaxed">
                <p className="reveal-paragraph" style={{ animationDelay: '0.2s' }}>
                  <span className="text-2xl md:text-3xl font-serif text-[#1a1a1a] block mb-2">The real goal?</span>
                  Documented processes. Recurring revenue. A team that delivers without your constant approval. Client relationships that don't depend on <em>you</em> personally.
                </p>

                <p className="reveal-paragraph" style={{ animationDelay: '0.3s' }}>
                  When you build these things, something remarkable happens:
                </p>

                <div className="reveal-paragraph grid md:grid-cols-2 gap-6" style={{ animationDelay: '0.4s' }}>
                  <div className="bg-emerald-50/50 rounded-xl p-6 border border-emerald-100">
                    <span className="text-emerald-600 text-sm font-semibold uppercase tracking-wider">First</span>
                    <p className="text-[#1a1a1a] font-medium text-xl mt-2">
                      Your life gets <span className="highlight-text">dramatically better</span>
                    </p>
                  </div>
                  <div className="bg-emerald-50/50 rounded-xl p-6 border border-emerald-100">
                    <span className="text-emerald-600 text-sm font-semibold uppercase tracking-wider">Second</span>
                    <p className="text-[#1a1a1a] font-medium text-xl mt-2">
                      You have the <span className="highlight-text">option to leave</span>
                    </p>
                  </div>
                </div>

                <div className="reveal-paragraph pt-6 border-t border-[#e5e5e5]" style={{ animationDelay: '0.5s' }}>
                  <p className="text-xl md:text-2xl text-[#1a1a1a] font-medium leading-relaxed">
                    You might not want to sell. That's fine.
                  </p>
                  <p className="mt-4 text-[#666]">
                    But right now, <span className="highlight-text font-medium text-[#1a1a1a]">you couldn't if you tried</span>. And that lack of options is what's keeping you trapped.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Comparison - with staggered animation */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="border-t border-[#e5e5e5] pt-20">
          <p className="text-xs text-[#999] uppercase tracking-wider text-center mb-3 font-medium fade-up">The transformation</p>
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-[#1a1a1a] mb-2 text-center fade-up">
            Same Agency. Different Structure.
          </h2>
          <p className="text-[#666] text-center mb-10 fade-up">The revenue doesn't change. Your life does.</p>

          <div className="grid md:grid-cols-2 gap-8">
            <div
              className="scale-up bg-white rounded-2xl p-8 md:p-10 card-hover"
              style={{
                animationDelay: '0s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.04), 0 12px 24px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.06)'
              }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <h3 className="text-sm text-[#999] uppercase tracking-wider">How It Feels Now</h3>
              </div>
              <div className="space-y-4">
                {[
                  ['Your week', '55+ hours'],
                  ['Vacation', 'Checking email constantly'],
                  ['If you stop', 'Revenue stops'],
                  ['Exit options', 'None'],
                ].map(([k, v], i) => (
                  <div key={i} className="flex justify-between border-b border-[#f0f0f0] pb-3">
                    <span className="text-[#999] text-sm">{k}</span>
                    <span className={`font-medium text-sm ${i === 3 ? 'text-red-500' : 'text-[#1a1a1a]'}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="scale-up bg-white rounded-2xl p-8 md:p-10 card-hover relative overflow-hidden"
              style={{
                animationDelay: '0.15s',
                boxShadow: '0 1px 2px rgba(16,185,129,0.04), 0 4px 8px rgba(16,185,129,0.06), 0 12px 24px rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.15)'
              }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <h3 className="text-sm text-emerald-800 uppercase tracking-wider font-medium">After You Fix the Structure</h3>
                </div>
                <div className="space-y-4">
                  {[
                    ['Your week', '10-20 hours'],
                    ['Vacation', 'Actually disconnected'],
                    ['If you stop', 'Business runs'],
                    ['Exit options', 'Stay, sell, or step back'],
                  ].map(([k, v], i) => (
                    <div key={i} className="flex justify-between border-b border-emerald-100 pb-3">
                      <span className="text-[#999] text-sm">{k}</span>
                      <span className={`font-medium text-sm ${i === 3 ? 'text-emerald-700' : 'text-[#1a1a1a]'}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Math - makes stakes concrete */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="scale-up text-center">
          <p className="text-xs text-[#999] uppercase tracking-wider mb-6 font-medium fade-up">The math</p>
          <div
            className="bg-white rounded-3xl p-10 md:p-16"
            style={{
              boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.04), 0 16px 32px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.06)'
            }}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-medium text-[#1a1a1a] mb-8 fade-up">
              Same $1M agency. <span className="text-[#999]">Different multiple.</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-3xl mx-auto mb-10">
              <div className="fade-up" style={{ animationDelay: '0.1s' }}>
                <div className="text-[#999] text-sm uppercase tracking-wider mb-2">Unstructured</div>
                <div className="text-4xl md:text-5xl font-serif font-medium text-[#1a1a1a]">
                  $1.5M
                </div>
                <div className="text-[#999] text-sm mt-1">1.5x profit multiple</div>
              </div>

              <div className="fade-up" style={{ animationDelay: '0.2s' }}>
                <div className="text-emerald-600 text-sm uppercase tracking-wider mb-2 font-medium">Structured for exit</div>
                <div className="text-4xl md:text-5xl font-serif font-medium text-emerald-700">
                  $4M+
                </div>
                <div className="text-emerald-600/70 text-sm mt-1">4x+ profit multiple</div>
              </div>
            </div>

            <div className="fade-up pt-8 border-t border-[#e5e5e5]" style={{ animationDelay: '0.3s' }}>
              <p className="text-[#666] text-lg max-w-xl mx-auto">
                The difference isn't luck or timing. It's <span className="text-[#1a1a1a] font-medium">structure</span>—and you can build it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder credibility */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="fade-up flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <Image
                src="/michael-davidson.jpg"
                alt="Michael Davidson"
                width={128}
                height={128}
                className="w-full h-full object-cover object-[center_25%]"
              />
            </div>
          </div>
          <div className="text-center md:text-left">
            <p className="text-xl md:text-2xl text-[#1a1a1a] font-medium leading-relaxed mb-4">
              "I've helped 20+ agency owners build the infrastructure that turns their business into real equity. Something they actually own, not just operate."
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="text-[#1a1a1a] font-medium">Michael Davidson</span>
              <span className="text-[#999]">·</span>
              <span className="text-[#666]">Founder, ExitLayer</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Objection handling */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="border-t border-[#e5e5e5] pt-16">
          <h3 className="text-center text-sm text-[#999] uppercase tracking-wider mb-8 font-medium fade-up">Common questions</h3>
          <div className="space-y-6">
            <div className="fade-up" style={{ animationDelay: '0.1s' }}>
              <p className="text-[#1a1a1a] font-medium text-lg mb-2">"What if I'm not ready to sell?"</p>
              <p className="text-[#666] leading-relaxed">
                That's the point. Building exit-ready infrastructure makes your business better to <em>run</em>, not just to sell. Most owners who fix these issues end up staying—but now they have the option to leave.
              </p>
            </div>
            <div className="fade-up" style={{ animationDelay: '0.2s' }}>
              <p className="text-[#1a1a1a] font-medium text-lg mb-2">"Is my information private?"</p>
              <p className="text-[#666] leading-relaxed">
                Yes. Your answers are encrypted and never shared. This assessment is for your eyes only.
              </p>
            </div>
            <div className="fade-up" style={{ animationDelay: '0.3s' }}>
              <p className="text-[#1a1a1a] font-medium text-lg mb-2">"What if my score is bad?"</p>
              <p className="text-[#666] leading-relaxed">
                Then you'll know exactly what to fix. Most agencies score lower than expected—that's normal. The value is in seeing the specific gaps holding you back.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Dark gradient */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="scale-up bg-gradient-to-br from-[#0d1c18] via-emerald-950 to-[#0a1612] rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />

          <div className="relative">
            <p className="text-emerald-400/60 text-xs uppercase tracking-wider mb-4 font-medium">Free assessment</p>
            <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4">
              Find out what's keeping you stuck.
            </h2>
            <p className="text-white/50 mb-10 max-w-lg mx-auto leading-relaxed text-lg">
              A 2-minute assessment that shows you exactly which structural issues are trapping you in your business. Plus what your agency would be worth if you fixed them.
            </p>
            <Link
              href="/questionnaire"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-emerald-900 rounded-full font-medium hover:bg-emerald-50 transition-all text-lg hover:scale-105 shadow-2xl shadow-emerald-900/20"
            >
              Take the Assessment
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="text-white/30 text-sm mt-8">Free · No signup required · Instant results</p>
          </div>
        </div>
      </section>

      {/* Results Preview - Blurred teaser */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="text-center mb-8 fade-up">
          <p className="text-xs text-[#999] uppercase tracking-wider mb-3 font-medium">What you'll see</p>
          <h3 className="text-2xl md:text-3xl font-serif font-medium text-[#1a1a1a]">
            Your personalized exit report
          </h3>
        </div>

        {/* Blurred preview card */}
        <div className="fade-up relative" style={{ animationDelay: '0.1s' }}>
          <div
            className="bg-white rounded-2xl p-8 md:p-12 relative overflow-hidden"
            style={{
              boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.04), 0 16px 32px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.06)'
            }}
          >
            {/* Blurred content simulation */}
            <div className="filter blur-[6px] select-none pointer-events-none">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-sm text-[#999] mb-1">Your Exit Score</p>
                  <p className="text-5xl font-serif font-medium text-emerald-600">73</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#999] mb-1">Estimated Value</p>
                  <p className="text-4xl font-serif font-medium text-[#1a1a1a]">$2.4M</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-[#f8f8f6] rounded-lg p-4">
                  <p className="text-xs text-[#999] mb-1">Revenue Mix</p>
                  <p className="text-lg font-medium text-amber-600">Needs Work</p>
                </div>
                <div className="bg-[#f8f8f6] rounded-lg p-4">
                  <p className="text-xs text-[#999] mb-1">Owner Dependency</p>
                  <p className="text-lg font-medium text-red-500">High Risk</p>
                </div>
                <div className="bg-[#f8f8f6] rounded-lg p-4">
                  <p className="text-xs text-[#999] mb-1">Documentation</p>
                  <p className="text-lg font-medium text-emerald-600">Good</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-[#e5e5e5] rounded w-full" />
                <div className="h-3 bg-[#e5e5e5] rounded w-4/5" />
                <div className="h-3 bg-[#e5e5e5] rounded w-3/4" />
              </div>
            </div>

            {/* Overlay CTA */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white via-white/80 to-transparent">
              <div className="text-center">
                <p className="text-[#666] mb-4">See your actual scores</p>
                <Link
                  href="/questionnaire"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-900 text-white rounded-full font-medium hover:bg-emerald-800 transition-all text-lg hover:scale-105 shadow-xl cta-glow"
                >
                  Unlock Your Report
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky CTA Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
          showStickyCTA ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md border-t border-[#e5e5e5] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
            <p className="text-[#666] text-sm hidden sm:block">
              <span className="text-[#1a1a1a] font-medium">Your Exit Score is waiting.</span> 2 minutes to find out.
            </p>
            <Link
              href="/questionnaire"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-900 text-white rounded-full font-medium hover:bg-emerald-800 transition-all text-sm hover:scale-105 cta-pulse"
            >
              Take the Assessment
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer - Large brand display with dark gradient */}
      <footer className="bg-gradient-to-br from-[#0d1c18] via-emerald-950 to-[#0a1612] pt-20 pb-12 overflow-hidden relative">
        {/* Decorative blur elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />

        {/* Large brand name with 3D opaque glass effect */}
        <div className="max-w-7xl mx-auto px-6 mb-12 relative">
          <h2
            className="text-[12vw] md:text-[10vw] lg:text-[8vw] font-serif font-medium leading-none tracking-tight text-center select-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(167,243,208,0.8) 50%, rgba(110,231,183,0.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 4px 8px rgba(0,0,0,0.15), 0 2px 0 rgba(255,255,255,0.2)',
              filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25)) drop-shadow(0 1px 3px rgba(6,95,70,0.15))'
            }}
            aria-hidden="true"
          >
            ExitLayer
          </h2>
        </div>

        {/* Footer content */}
        <div className="max-w-5xl mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/40 text-sm">
            <span>© 2026 ExitLayer</span>
            <div className="flex items-center gap-6">
              <Link href="/questionnaire" className="hover:text-white/60 transition-colors">
                Take Assessment
              </Link>
              <a href="mailto:michael@exitlayer.io" className="hover:text-white/60 transition-colors">
                michael@exitlayer.io
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
