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
    <div className="bg-white rounded-xl p-8 border border-[#e5e5e5]">
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
            name="password"
            type="password"
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
          disabled={isPending}
          className="w-full py-3 px-4 bg-[#2d4a2d] hover:bg-[#1a2e1a] disabled:bg-[#2d4a2d]/50 text-white font-medium rounded-full transition-colors"
        >
          {isPending ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <p className="text-[#666]">
          <Link href="/forgot-password" className="text-[#2d4a2d] hover:text-[#1a2e1a] font-medium">
            Forgot your password?
          </Link>
        </p>
        <p className="text-[#666]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#2d4a2d] hover:text-[#1a2e1a] font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="bg-white rounded-xl p-8 border border-[#e5e5e5] animate-pulse">
        <div className="h-8 bg-[#f0f0f0] rounded mb-4 w-48 mx-auto" />
        <div className="h-4 bg-[#f0f0f0] rounded mb-8 w-64 mx-auto" />
        <div className="space-y-5">
          <div className="h-12 bg-[#f0f0f0] rounded-lg" />
          <div className="h-12 bg-[#f0f0f0] rounded-lg" />
          <div className="h-12 bg-[#f0f0f0] rounded-full" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
