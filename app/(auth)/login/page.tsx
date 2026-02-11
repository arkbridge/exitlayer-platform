'use client'

import { Suspense, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from './actions'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    formData.set('redirectTo', redirectTo)

    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) {
        setError(result.error)
      }
      // If successful, the server action redirects - we don't reach here
    })
  }

  return (
    <div
      className="bg-white rounded-2xl p-8 border border-[#e5e5e5]"
      style={{
        boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.04), 0 16px 32px rgba(0,0,0,0.06)',
      }}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-medium text-[#1a1a1a] mb-2">Welcome Back</h1>
        <p className="text-[#666]">Sign in to access your dashboard</p>
      </div>

      <form action={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#1a1a1a] mb-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-4 py-3 bg-[#f8f8f6] border border-[#e5e5e5] rounded-xl text-[#1a1a1a] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 transition-all"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#1a1a1a] mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
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
          disabled={isPending}
          className="w-full py-3.5 px-4 bg-emerald-900 hover:bg-emerald-950 hover:scale-[1.02] disabled:bg-emerald-900/50 disabled:hover:scale-100 text-white font-medium rounded-full transition-all duration-200"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[#e5e5e5] text-center space-y-3">
        <p className="text-[#666] text-sm">
          <Link href="/forgot-password" className="text-emerald-800 hover:text-emerald-950 font-medium transition-colors">
            Forgot your password?
          </Link>
        </p>
        <p className="text-[#666] text-sm">
          New here?{' '}
          <Link href="/questionnaire" className="text-emerald-800 hover:text-emerald-950 font-medium transition-colors">
            Take the assessment
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div
        className="bg-white rounded-2xl p-8 border border-[#e5e5e5] animate-pulse"
        style={{
          boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.04), 0 16px 32px rgba(0,0,0,0.06)',
        }}
      >
        <div className="h-8 bg-[#f0f0f0] rounded mb-4 w-48 mx-auto" />
        <div className="h-4 bg-[#f0f0f0] rounded mb-8 w-64 mx-auto" />
        <div className="space-y-5">
          <div className="h-12 bg-[#f0f0f0] rounded-xl" />
          <div className="h-12 bg-[#f0f0f0] rounded-xl" />
          <div className="h-12 bg-[#f0f0f0] rounded-full" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
