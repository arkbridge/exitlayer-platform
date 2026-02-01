'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-white rounded-xl p-8 border border-[#e5e5e5]">
        <div className="text-center">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-2xl font-serif font-medium text-[#1a1a1a] mb-2">Check Your Email</h1>
          <p className="text-[#666] mb-6">
            We sent a password reset link to <strong>{email}</strong>
          </p>
          <Link
            href="/login"
            className="text-[#2d4a2d] hover:text-[#1a2e1a] font-medium"
          >
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-8 border border-[#e5e5e5]">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-medium text-[#1a1a1a] mb-2">Reset Password</h1>
        <p className="text-[#666]">Enter your email to receive a reset link</p>
      </div>

      <form onSubmit={handleReset} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#1a1a1a] mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-[#f8f8f6] border border-[#e5e5e5] rounded-lg text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#2d4a2d]/20 focus:border-[#2d4a2d] transition-colors"
            placeholder="you@example.com"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-[#2d4a2d] hover:bg-[#1a2e1a] disabled:bg-[#2d4a2d]/50 text-white font-medium rounded-full transition-colors"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="mt-6 text-center text-[#666]">
        Remember your password?{' '}
        <Link href="/login" className="text-[#2d4a2d] hover:text-[#1a2e1a] font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
