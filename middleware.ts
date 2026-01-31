import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/api/auth/callback']

// Routes that require admin access
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const path = request.nextUrl.pathname

  // Allow public routes
  if (publicRoutes.some(route => path === route || path.startsWith('/api/auth/'))) {
    // If user is logged in and tries to access login/signup, redirect to dashboard
    if (user && (path === '/login' || path === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // Protect all other routes - require authentication
  if (!user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  // Check admin routes - need to fetch profile to check is_admin
  if (adminRoutes.some(route => path.startsWith(route))) {
    // We'll check admin status in the admin layout since we can't easily
    // query Supabase for profile data in middleware without a server client
    // The admin layout will handle the redirect if not admin
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
