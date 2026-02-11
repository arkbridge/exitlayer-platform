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

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Auto-link existing audit_session by email match
    if (authData.user) {
      try {
        // First, check if there's an existing submitted audit session with this email
        const { data: existingSession } = await supabase
          .from('audit_sessions')
          .select('id, session_token')
          .eq('email', email.toLowerCase().trim())
          .eq('status', 'submitted')
          .is('user_id', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (existingSession) {
          // Link the session to the new user account
          const response = await fetch('/api/audit-session/link-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_token: existingSession.session_token,
              user_id: authData.user.id,
            }),
          })

          if (response.ok) {
            console.log('Audit session linked to new account')
          }
        }
      } catch (linkError) {
        // Don't fail signup if linking fails - they can still use the dashboard
        console.error('Failed to auto-link audit session:', linkError)
      }

      // Check for whop_user_id in URL params (post-payment signup flow)
      const whopUserId = new URLSearchParams(window.location.search).get('whop_user_id')
      if (whopUserId) {
        try {
          await supabase
            .from('profiles')
            .update({
              whop_user_id: whopUserId,
              access_tier: 'paid',
              paid_at: new Date().toISOString(),
            })
            .eq('id', authData.user.id)
        } catch (whopError) {
          console.error('Failed to link Whop user:', whopError)
        }
      }
    }

    // Redirect to dashboard (they'll see their linked data there)
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div
      className="bg-white rounded-2xl p-8 border border-[#e5e5e5]"
      style={{
        boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.04), 0 16px 32px rgba(0,0,0,0.06)',
      }}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-medium text-[#1a1a1a] mb-2">Get Started</h1>
        <p className="text-[#666]">Create your account to access your results</p>
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
            className="w-full px-4 py-3 bg-[#f8f8f6] border border-[#e5e5e5] rounded-xl text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 transition-all"
            placeholder="you@example.com"
          />
          <p className="mt-1.5 text-xs text-[#999]">
            Use the same email from your assessment to see your results
          </p>
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
            className="w-full px-4 py-3 bg-[#f8f8f6] border border-[#e5e5e5] rounded-xl text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 transition-all"
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
            className="w-full px-4 py-3 bg-[#f8f8f6] border border-[#e5e5e5] rounded-xl text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 transition-all"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-[#a85454] text-sm font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-emerald-900 hover:bg-emerald-950 hover:scale-[1.02] disabled:bg-emerald-900/50 disabled:hover:scale-100 text-white font-medium rounded-full transition-all duration-200"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[#e5e5e5] text-center">
        <p className="text-[#666] text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-800 hover:text-emerald-950 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
