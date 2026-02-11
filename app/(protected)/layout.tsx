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

  // Fetch profile to check admin status and payment tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, company_name, is_admin, access_tier')
    .eq('id', user.id)
    .single()

  // Redirect free-tier users to upgrade page (admins bypass)
  if (profile && profile.access_tier !== 'paid' && !profile.is_admin) {
    redirect('/upgrade')
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Navigation header */}
      <nav className="border-b border-[#e5e5e5] bg-[#f8f8f6] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-lg font-medium text-[#1a1a1a] tracking-tight hover:text-emerald-800 transition-colors">
                ExitLayer
              </Link>

              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-[#666] hover:text-[#1a1a1a] hover:bg-white rounded-lg transition-colors text-sm"
                >
                  Dashboard
                </Link>
                <Link
                  href="/questionnaire"
                  className="px-4 py-2 text-[#666] hover:text-[#1a1a1a] hover:bg-white rounded-lg transition-colors text-sm"
                >
                  Questionnaire
                </Link>
                <Link
                  href="/assets"
                  className="px-4 py-2 text-[#666] hover:text-[#1a1a1a] hover:bg-white rounded-lg transition-colors text-sm"
                >
                  Assets
                </Link>
                {profile?.is_admin && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 text-emerald-800 hover:bg-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Admin
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[#1a1a1a] text-sm font-medium">
                  {profile?.full_name || user.email}
                </p>
                {profile?.company_name && (
                  <p className="text-[#999] text-xs">{profile.company_name}</p>
                )}
              </div>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="px-4 py-2 text-[#666] hover:text-[#1a1a1a] hover:bg-white rounded-lg transition-colors text-sm"
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
