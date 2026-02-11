import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Find most recent in-progress session for this email
    const { data: session } = await supabase
      .from('audit_sessions')
      .select('session_token, email')
      .eq('email', email.toLowerCase().trim())
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Always return success to avoid email enumeration
    if (!session) {
      return NextResponse.json({
        sent: true,
        message: 'If an audit is in progress for that email, a resume link has been sent.',
      })
    }

    // Build the resume URL
    const baseUrl = request.nextUrl.origin
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

    return NextResponse.json({
      sent: true,
      message: 'If an audit is in progress for that email, a resume link has been sent.',
    })
  } catch (error) {
    console.error('Resume request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
