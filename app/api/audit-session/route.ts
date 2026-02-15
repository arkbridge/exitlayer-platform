import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { getClientIp, normalizeEmail } from '@/lib/security'

const createSessionSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  company_name: z.string().trim().min(2).max(160),
})

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(`audit-session:create:${getClientIp(request.headers)}`, {
    windowMs: 60 * 1000,
    max: 20,
  })
  const rateLimitHeaders = getRateLimitHeaders(rateLimit, 20)

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: rateLimitHeaders }
    )
  }

  try {
    const parsed = createSessionSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Valid name, email, and company name are required' },
        { status: 400, headers: rateLimitHeaders }
      )
    }

    const { full_name, email, company_name } = parsed.data
    const normalizedEmail = normalizeEmail(email)
    const supabase = createServiceClient()

    // Check for existing in-progress session with this email
    const { data: existing } = await supabase
      .from('audit_sessions')
      .select('session_token, current_question_index, form_data')
      .eq('email', normalizedEmail)
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existing) {
      // Return existing session so they can resume
      return NextResponse.json(
        {
          session_token: existing.session_token,
          resumed: true,
          current_question_index: existing.current_question_index,
          form_data: existing.form_data,
        },
        { headers: rateLimitHeaders }
      )
    }

    // Create new session
    const sessionToken = randomBytes(32).toString('hex')

    const { error } = await supabase.from('audit_sessions').insert({
      email: normalizedEmail,
      full_name,
      company_name,
      session_token: sessionToken,
      form_data: { full_name, email: normalizedEmail, company_name },
      current_question_index: 3, // Past the 3 lead capture questions
      questions_answered: 3,
      status: 'in_progress',
    })

    if (error) {
      console.error('Failed to create audit session:', error)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500, headers: rateLimitHeaders }
      )
    }

    // Fire lead capture to GHL (non-blocking) — captures even if they don't finish
    const ghlWebhookUrl = process.env.GHL_WEBHOOK_URL
    if (ghlWebhookUrl) {
      fetch(ghlWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name,
          email: normalizedEmail,
          company_name,
          source: 'exitlayer_audit_start',
          submitted_at: new Date().toISOString(),
        }),
      }).catch((err) => console.error('GHL webhook failed:', err))
    }

    return NextResponse.json(
      {
        session_token: sessionToken,
        resumed: false,
      },
      { headers: rateLimitHeaders }
    )
  } catch (error) {
    console.error('Audit session creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: rateLimitHeaders }
    )
  }
}
