import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { sanitizeInternalRedirect } from '@/lib/security'

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/join-xl-9f7k2m', '/forgot-password', '/reset-password', '/api/auth/callback', '/questionnaire', '/login/admin', '/create-account', '/resume', '/upgrade', '/checkout', '/free-guide', '/icon', '/apple-icon', '/opengraph-image', '/platform-demo']

// Routes that require admin access
const adminRoutes = ['/admin']

function withSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )
  return response
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Allow public routes WITHOUT hitting Supabase (avoids hanging when instance is unreachable)
  const isPublic = publicRoutes.some(
    route => path === route || path.startsWith('/platform-demo') || path.startsWith('/api/')
  )
  const isAuthPage = path === '/login' || path === '/join-xl-9f7k2m'

  if (isPublic && !isAuthPage) {
    return withSecurityHeaders(NextResponse.next())
  }

  // Only call Supabase for protected routes or auth pages (login/signup redirect logic)
  const { supabaseResponse, user } = await updateSession(request)

  if (isPublic) {
    // If user is logged in and tries to access login/signup, redirect appropriately
    if (user && isAuthPage) {
      // ALWAYS check redirect param first to prevent race conditions
      const redirectTo = request.nextUrl.searchParams.get('redirect')
      const safeRedirect = sanitizeInternalRedirect(redirectTo, '/dashboard')
      if (safeRedirect) {
        return withSecurityHeaders(NextResponse.redirect(new URL(safeRedirect, request.url)))
      }

      // Only use default redirect if no redirect param exists
      // Note: Client-side logic in login/page.tsx handles admin-specific routing
      return withSecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)))
    }
    return withSecurityHeaders(supabaseResponse)
  }

  // Protect all other routes - require authentication
  if (!user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', path)
    return withSecurityHeaders(NextResponse.redirect(redirectUrl))
  }

  // Check admin routes - need to fetch profile to check is_admin
  if (adminRoutes.some(route => path.startsWith(route))) {
    // We'll check admin status in the admin layout since we can't easily
    // query Supabase for profile data in middleware without a server client
    // The admin layout will handle the redirect if not admin
  }

  return withSecurityHeaders(supabaseResponse)
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
