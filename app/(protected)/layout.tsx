import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile to check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, company_name, is_admin')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation header */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-white font-semibold text-lg">ExitLayer</span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/questionnaire"
                  className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Questionnaire
                </Link>
                <Link
                  href="/assets"
                  className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Assets
                </Link>
                {profile?.is_admin && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 text-blue-400 hover:text-blue-300 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-white text-sm font-medium">
                  {profile?.full_name || user.email}
                </p>
                {profile?.company_name && (
                  <p className="text-gray-500 text-xs">{profile.company_name}</p>
                )}
              </div>
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
