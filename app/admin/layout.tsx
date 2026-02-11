import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'michael@exitlayer.io').split(',').map(e => e.trim().toLowerCase())

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login/admin')
  }

  // Check if user is admin by email
  const isAdmin = ADMIN_EMAILS.some(
    admin => admin.toLowerCase() === user.email?.toLowerCase()
  )

  if (!isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Admin nav */}
      <nav className="border-b border-[#e5e5e5] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-3">
                <span className="text-lg font-serif font-medium text-[#1a1a1a]">ExitLayer</span>
                <span className="px-2 py-0.5 bg-emerald-900 text-white text-xs font-medium rounded-full">
                  Admin
                </span>
              </Link>

              <div className="flex items-center gap-1">
                <Link
                  href="/admin"
                  className="px-4 py-2 text-[#666] hover:text-[#1a1a1a] hover:bg-[#f8f8f6] rounded-lg transition-colors text-sm"
                >
                  Overview
                </Link>
                <Link
                  href="/admin/clients"
                  className="px-4 py-2 text-[#666] hover:text-[#1a1a1a] hover:bg-[#f8f8f6] rounded-lg transition-colors text-sm"
                >
                  Clients
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-[#666] hover:text-[#1a1a1a] hover:bg-[#f8f8f6] rounded-lg transition-colors text-sm"
              >
                Client View
              </Link>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="px-4 py-2 text-[#666] hover:text-[#1a1a1a] hover:bg-[#f8f8f6] rounded-lg transition-colors text-sm"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main>{children}</main>
    </div>
  )
}
