'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const WhopCheckoutEmbed = dynamic(
  () => import('@whop/checkout/react').then((mod) => mod.WhopCheckoutEmbed),
  { ssr: false }
)

function CheckoutContent() {
  const searchParams = useSearchParams()
  const status = searchParams.get('status')

  // After successful payment redirect
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-900/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[#1a1a1a] mb-3">
            Payment Successful
          </h1>
          <p className="text-[#666] mb-8">
            Your ExitLayer Sprint access is now active. Create your account to get started.
          </p>
          <Link
            href="/join-xl-9f7k2m"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-900 hover:bg-emerald-950 text-white font-medium rounded-full transition-colors"
          >
            Create Your Account
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="mt-4 text-[#999] text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-800 hover:text-emerald-950">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Navigation */}
      <nav className="border-b border-[#e5e5e5] bg-[#f8f8f6]">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg font-medium text-[#1a1a1a] tracking-tight">
              ExitLayer
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-[#666] hover:text-[#1a1a1a] transition-colors text-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-medium text-[#1a1a1a] mb-4">
            Complete Your Payment
          </h1>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            Secure your ExitLayer Sprint and let&apos;s start building the systems
            that make your agency run without you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* What You Get */}
          <div className="bg-white rounded-xl border border-[#e5e5e5] p-8">
            <h2 className="text-xl font-serif font-medium text-[#1a1a1a] mb-6">
              What&apos;s Included
            </h2>
            <ul className="space-y-4">
              {[
                { title: '74-Question Deep Audit', desc: 'Comprehensive operational assessment across all 5 dimensions' },
                { title: 'Custom System Specification', desc: 'Detailed build plan for your specific automations' },
                { title: 'Discovery Call with Michael', desc: '1-on-1 session to validate priorities and fill gaps' },
                { title: '4-Week Implementation Sprint', desc: 'We build and deploy your custom automation systems' },
                { title: 'Skills Catalog', desc: 'AI-powered capabilities tailored to your workflows' },
                { title: 'Before/After Metrics', desc: 'Track your transformation with real data' },
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <svg className="w-5 h-5 text-emerald-800 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium text-[#1a1a1a]">{item.title}</p>
                    <p className="text-sm text-[#666]">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Checkout */}
          <div className="bg-white rounded-xl border border-[#e5e5e5] p-8">
            <div className="text-center mb-6">
              <p className="text-[#999] text-sm uppercase tracking-wider mb-2">Investment</p>
              <p className="text-4xl font-serif font-medium text-[#1a1a1a]">$10,000</p>
              <p className="text-[#666] text-sm mt-1">One-time sprint fee</p>
            </div>

            <div className="border-t border-[#e5e5e5] pt-6 mb-6">
              <p className="text-sm text-[#666] mb-4">Typical ROI for agency owners:</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Weekly hours reclaimed</span>
                  <span className="font-medium text-[#1a1a1a]">15-25 hrs</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Annual value recovered</span>
                  <span className="font-medium text-[#1a1a1a]">$150K-$400K</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Payback period</span>
                  <span className="font-medium text-[#1a1a1a]">2-4 weeks</span>
                </div>
              </div>
            </div>

            {/* Whop Checkout Embed */}
            <div id="whop-checkout-container" className="mb-6">
              {process.env.NEXT_PUBLIC_WHOP_PLAN_ID ? (
                <WhopCheckout planId={process.env.NEXT_PUBLIC_WHOP_PLAN_ID} />
              ) : (
                <a
                  href="mailto:michael@exitlayer.io?subject=ExitLayer%20Sprint%20Payment"
                  className="block w-full py-4 px-6 bg-emerald-900 hover:bg-emerald-950 text-white font-medium rounded-full transition-colors text-center"
                >
                  Get Started
                </a>
              )}
            </div>

            <p className="text-xs text-[#999] text-center">
              Secure payment processed by Whop. Questions?{' '}
              <a href="mailto:michael@exitlayer.io" className="text-emerald-800 hover:text-emerald-950">
                Contact us
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function WhopCheckout({ planId }: { planId: string }) {
  return (
    <WhopCheckoutEmbed
      planId={planId}
      returnUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/checkout?status=success`}
      fallback={
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-6 w-6 text-emerald-800" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      }
    />
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-emerald-800 border-t-transparent rounded-full" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
