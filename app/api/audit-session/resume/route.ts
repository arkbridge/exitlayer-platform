import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { getAppBaseUrl, getClientIp, normalizeEmail } from '@/lib/security'

const resumeSchema = z.object({
  email: z.string().trim().email().max(254),
})

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(`audit-session:resume:${getClientIp(request.headers)}`, {
    windowMs: 60 * 60 * 1000,
    max: 8,
  })
  const rateLimitHeaders = getRateLimitHeaders(rateLimit, 8)

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many resume requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders }
    )
  }

  try {
    const parsed = resumeSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'A valid email is required' },
        { status: 400, headers: rateLimitHeaders }
      )
    }

    const email = normalizeEmail(parsed.data.email)
    const supabase = createServiceClient()

    // Find most recent in-progress session for this email
    const { data: session } = await supabase
      .from('audit_sessions')
      .select('session_token, email')
      .eq('email', email)
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Always return success to avoid email enumeration
    if (!session) {
      return NextResponse.json(
        {
          sent: true,
          message: 'If an audit is in progress for that email, a resume link has been sent.',
        },
        { headers: rateLimitHeaders }
      )
    }

    if (!session.email) {
      return NextResponse.json(
        {
          sent: true,
          message: 'If an audit is in progress for that email, a resume link has been sent.',
        },
        { headers: rateLimitHeaders }
      )
    }

    // Build the resume URL
    const baseUrl = getAppBaseUrl(request.nextUrl.origin)
    const resumeUrl = `${baseUrl}/questionnaire?token=${session.session_token}`

    // Send email via Supabase Edge Function or built-in email
    // For now, use a simple approach: send via Supabase Auth magic link pattern
    // We'll send a custom email with the resume link
    const { error: emailError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: session.email,
      options: {
        redirectTo: resumeUrl,
      },
    })

    // If Supabase auth magic link doesn't work for non-users,
    // fall back to storing the resume request and logging it
    if (emailError) {
      console.log(`Resume requested for ${session.email} - link: ${resumeUrl}`)
      // In production, send via Resend/SendGrid here
      // For now, we'll still return success and log the link
    }

    return NextResponse.json(
      {
        sent: true,
        message: 'If an audit is in progress for that email, a resume link has been sent.',
      },
      { headers: rateLimitHeaders }
    )
  } catch (error) {
    console.error('Resume request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: rateLimitHeaders }
    )
  }
}
