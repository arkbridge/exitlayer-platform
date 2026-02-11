'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ResumePage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/audit-session/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
      } else {
        setSubmitted(true)
      }
    } catch {
      setError('Failed to send resume link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-lg font-medium text-[#1a1a1a] tracking-tight">
            ExitLayer
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-[#e5e5e5] p-8">
          {submitted ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-900/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-serif font-medium text-[#1a1a1a] mb-2">
                Check Your Email
              </h1>
              <p className="text-[#666] mb-6">
                If an audit is in progress for <strong>{email}</strong>, we've sent a link to resume where you left off.
              </p>
              <p className="text-[#999] text-sm">
                Didn't get the email? Check spam or{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-emerald-800 hover:underline"
                >
                  try again
                </button>
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-serif font-medium text-[#1a1a1a] mb-2">
                  Resume Your Audit
                </h1>
                <p className="text-[#666]">
                  Enter the email you used when starting the audit. We'll send a link to pick up where you left off.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#666] mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@agency.com"
                    required
                    className="w-full px-4 py-3 bg-[#f8f8f6] border border-[#e5e5e5] rounded-lg focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-700/10 transition-all"
                    autoFocus
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-900 text-white rounded-full font-medium hover:bg-emerald-950 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Resume Link'
                  )}
                </button>
              </form>

              <div className="text-center mt-6 pt-6 border-t border-[#e5e5e5]">
                <p className="text-[#999] text-sm">
                  Don't have an audit in progress?{' '}
                  <Link href="/questionnaire" className="text-emerald-800 hover:underline">
                    Start one now
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
