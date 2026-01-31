import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Admin nav */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <div>
                  <span className="text-white font-semibold text-lg">ExitLayer</span>
                  <span className="ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">
                    Admin
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-1">
                <Link
                  href="/admin"
                  className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Overview
                </Link>
                <Link
                  href="/admin/clients"
                  className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Clients
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm"
              >
                Client View
              </Link>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm"
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
