'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl p-8 border border-[#e5e5e5]">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-medium text-[#1a1a1a] mb-2">Welcome Back</h1>
        <p className="text-[#666]">Sign in to access your dashboard</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
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
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-[#666]">
        Don't have an account?{' '}
        <Link href="/signup" className="text-[#2d4a2d] hover:text-[#1a2e1a] font-medium">
          Sign up
        </Link>
      </p>
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
