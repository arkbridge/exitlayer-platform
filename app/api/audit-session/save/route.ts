import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { getClientIp, isValidSessionToken } from '@/lib/security'

const saveSessionSchema = z.object({
  session_token: z.string().trim(),
  form_data: z.record(z.string(), z.unknown()),
  current_question_index: z.number().int().min(0).max(200).optional(),
  questions_answered: z.number().int().min(0).max(500).optional(),
})

export async function PUT(request: NextRequest) {
  const rateLimit = checkRateLimit(`audit-session:save:${getClientIp(request.headers)}`, {
    windowMs: 60 * 1000,
    max: 180,
  })
  const rateLimitHeaders = getRateLimitHeaders(rateLimit, 180)

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many save requests. Please wait a moment.' },
      { status: 429, headers: rateLimitHeaders }
    )
  }

  try {
    const parsed = saveSessionSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid save payload' },
        { status: 400, headers: rateLimitHeaders }
      )
    }

    const { session_token, form_data, current_question_index, questions_answered } = parsed.data

    if (!isValidSessionToken(session_token)) {
      return NextResponse.json(
        { error: 'Invalid session token' },
        { status: 400, headers: rateLimitHeaders }
      )
    }

    const supabase = createServiceClient()

    const { error } = await supabase
      .from('audit_sessions')
      .update({
        form_data,
        current_question_index,
        questions_answered,
        last_saved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('session_token', session_token)
      .eq('status', 'in_progress')

    if (error) {
      console.error('Failed to save audit session:', error)
      return NextResponse.json(
        { error: 'Failed to save progress' },
        { status: 500, headers: rateLimitHeaders }
      )
    }

    return NextResponse.json({ saved: true }, { headers: rateLimitHeaders })
  } catch (error) {
    console.error('Audit session save error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: rateLimitHeaders }
    )
  }
}
