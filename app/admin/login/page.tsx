'use client'

import { useState, useTransition } from 'react'
import { adminLogin } from './actions'

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = await adminLogin(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#2a2a2a] rounded-xl p-8 border border-[#333]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-medium text-white mb-2">Admin Access</h1>
            <p className="text-[#888]">ExitLayer Administration</p>
          </div>

          <form action={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#444] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#4a7c4a]/50 focus:border-[#4a7c4a] transition-colors"
                placeholder="admin@exitlayer.io"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#444] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#4a7c4a]/50 focus:border-[#4a7c4a] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 bg-[#4a7c4a] hover:bg-[#3a6a3a] disabled:bg-[#4a7c4a]/50 text-white font-medium rounded-full transition-colors"
            >
              {isPending ? 'Signing in...' : 'Sign In as Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
