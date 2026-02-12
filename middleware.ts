import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/join-xl-9f7k2m', '/forgot-password', '/reset-password', '/api/auth/callback', '/questionnaire', '/login/admin', '/create-account', '/resume', '/upgrade', '/checkout', '/free-guide', '/icon', '/apple-icon', '/opengraph-image', '/platform-demo']

// Routes that require admin access
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Allow public routes WITHOUT hitting Supabase (avoids hanging when instance is unreachable)
  const isPublic = publicRoutes.some(route => path === route || path.startsWith('/api/auth/') || path.startsWith('/api/audit-session') || path.startsWith('/api/webhooks/') || path.startsWith('/api/submit') || path.startsWith('/platform-demo'))
  const isAuthPage = path === '/login' || path === '/join-xl-9f7k2m'

  if (isPublic && !isAuthPage) {
    return NextResponse.next()
  }

  // Only call Supabase for protected routes or auth pages (login/signup redirect logic)
  const { supabaseResponse, user } = await updateSession(request)

  if (isPublic) {
    // If user is logged in and tries to access login/signup, redirect appropriately
    if (user && isAuthPage) {
      // ALWAYS check redirect param first to prevent race conditions
      const redirectTo = request.nextUrl.searchParams.get('redirect')

      if (redirectTo) {
        return NextResponse.redirect(new URL(redirectTo, request.url))
      }

      // Only use default redirect if no redirect param exists
      // Note: Client-side logic in login/page.tsx handles admin-specific routing
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
