'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function CreateAccountForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionValid, setSessionValid] = useState(false)
  const [existingUser, setExistingUser] = useState(false)

  // Verify session token on mount
  useEffect(() => {
    if (!token) {
      setError('Missing session token. Please complete the audit first.')
      setLoading(false)
      return
    }

    fetch(`/api/audit-session/load?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.status === 'account_created'
            ? 'Account already created. Please log in.'
            : 'Session not found. Please complete the audit first.'
          )
          if (data.status === 'account_created') {
            setExistingUser(true)
          }
        } else if (data.status !== 'submitted') {
          setError('Please complete the audit before creating an account.')
        } else {
          setSessionValid(true)
          // Pre-fill email from session
          if (data.form_data?.email) {
            setEmail(data.form_data.email)
          }
        }
      })
      .catch(() => {
        setError('Failed to verify session. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)

    try {
      const supabase = createClient()

      // Create account via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        // If user already exists, try signing in instead
        if (authError.message.includes('already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (signInError) {
            setError('An account with this email already exists. Please use the correct password or sign in.')
            setExistingUser(true)
            setSubmitting(false)
            return
          }

          // Link the session to the existing user
          if (signInData.user) {
            await fetch('/api/audit-session/link-account', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                session_token: token,
                user_id: signInData.user.id,
              }),
            })
          }

          // Clear questionnaire localStorage
          localStorage.removeItem('exitlayer-session-token')
          localStorage.removeItem('exitlayer-questionnaire-progress')
          router.push('/dashboard')
          return
        }

        setError(authError.message)
        setSubmitting(false)
        return
      }

      // Link session to new user
      if (authData.user) {
        await fetch('/api/audit-session/link-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_token: token,
            user_id: authData.user.id,
          }),
        })
      }

      // Clear questionnaire localStorage
      localStorage.removeItem('exitlayer-session-token')
      localStorage.removeItem('exitlayer-questionnaire-progress')

      router.push('/dashboard')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogin = () => {
    router.push(`/login?redirect=/dashboard`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-800 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-lg font-medium text-[#1a1a1a] tracking-tight">ExitLayer</span>
        </div>

        <div className="bg-white rounded-xl border border-[#e5e5e5] p-8">
          {error && !sessionValid ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-[#666] mb-6">{error}</p>
              {existingUser ? (
                <button
                  onClick={handleLogin}
                  className="px-6 py-3 bg-emerald-900 text-white rounded-full font-medium hover:bg-emerald-950 transition-colors"
                >
                  Sign In Instead
                </button>
              ) : (
                <a
                  href="/questionnaire"
                  className="px-6 py-3 bg-emerald-900 text-white rounded-full font-medium hover:bg-emerald-950 transition-colors inline-block"
                >
                  Start the Audit
                </a>
              )}
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-900/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-serif font-medium text-[#1a1a1a] mb-2">
                  Audit Complete
                </h1>
                <p className="text-[#666]">
                  Create a password to view your full diagnostic results.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#666] mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full px-4 py-3 bg-[#f8f8f6] border border-[#e5e5e5] rounded-lg text-[#999]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#666] mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-[#f8f8f6] border border-[#e5e5e5] rounded-lg focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-700/10 transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#666] mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-[#f8f8f6] border border-[#e5e5e5] rounded-lg focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-700/10 transition-all"
                  />
                </div>

                {error && sessionValid && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-emerald-900 text-white rounded-full font-medium hover:bg-emerald-950 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    'View My Results'
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-[#999] mt-4">
                Already have an account?{' '}
                <button onClick={handleLogin} className="text-emerald-800 hover:underline">
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-emerald-800 border-t-transparent rounded-full" />
    </div>
  )
}

export default function CreateAccountPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreateAccountForm />
    </Suspense>
  )
}
