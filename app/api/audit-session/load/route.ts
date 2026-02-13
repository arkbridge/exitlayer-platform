import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { getClientIp, isValidSessionToken } from '@/lib/security'

export async function GET(request: NextRequest) {
  const rateLimit = checkRateLimit(`audit-session:load:${getClientIp(request.headers)}`, {
    windowMs: 60 * 1000,
    max: 90,
  })
  const rateLimitHeaders = getRateLimitHeaders(rateLimit, 90)

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: rateLimitHeaders }
    )
  }

  const token = request.nextUrl.searchParams.get('token')

  if (!isValidSessionToken(token)) {
    return NextResponse.json(
      { error: 'Valid token is required' },
      { status: 400, headers: rateLimitHeaders }
    )
  }

  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('audit_sessions')
      .select(
        'session_token, email, full_name, company_name, form_data, current_question_index, questions_answered, status'
      )
      .eq('session_token', token)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404, headers: rateLimitHeaders }
      )
    }

    // Don't allow loading expired or account-created sessions for editing
    if (data.status === 'account_created') {
      return NextResponse.json(
        { error: 'Session already completed', status: data.status },
        { status: 410, headers: rateLimitHeaders }
      )
    }

    return NextResponse.json(
      {
        session_token: data.session_token,
        form_data: data.form_data,
        current_question_index: data.current_question_index,
        questions_answered: data.questions_answered,
        status: data.status,
      },
      { headers: rateLimitHeaders }
    )
  } catch (error) {
    console.error('Audit session load error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: rateLimitHeaders }
    )
  }
}
