import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user is admin to redirect appropriately
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        // If admin and no specific redirect, go to admin
        if (profile?.is_admin && next === '/dashboard') {
          return NextResponse.redirect(new URL('/admin', requestUrl.origin))
        }
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?error=auth', requestUrl.origin))
}
