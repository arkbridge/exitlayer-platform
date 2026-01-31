'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Redirect to questionnaire after signup
    router.push('/questionnaire')
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl p-8 border border-[#e5e5e5]">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-medium text-[#1a1a1a] mb-2">Get Started</h1>
        <p className="text-[#666]">Create your account to begin the diagnostic</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-5">
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#1a1a1a] mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-[#f8f8f6] border border-[#e5e5e5] rounded-lg text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#2d4a2d]/20 focus:border-[#2d4a2d] transition-colors"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1a1a1a] mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-[#f8f8f6] border border-[#e5e5e5] rounded-lg text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#2d4a2d]/20 focus:border-[#2d4a2d] transition-colors"
            placeholder="••••••••"
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
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-[#666]">
        Already have an account?{' '}
        <Link href="/login" className="text-[#2d4a2d] hover:text-[#1a2e1a] font-medium">
          Sign in
        </Link>
      </p>

      <p className="mt-4 text-center text-[#999] text-xs">
        ~45 minutes to complete the diagnostic
      </p>
    </div>
  )
}
