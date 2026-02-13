import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isValidSessionToken, normalizeEmail } from '@/lib/security'

const requestSchema = z
  .object({
    session_token: z.string().trim().optional(),
  })
  .optional()

type SessionRecord = {
  id: string
  user_id: string | null
  status: string
  email: string | null
  form_data: Record<string, unknown> | null
  overall_score: number | null
  score_data: Record<string, unknown> | null
  generated_content: Record<string, unknown> | null
}

export async function POST(request: NextRequest) {
  try {
    const parsedBody = requestSchema.safeParse(await request.json().catch(() => ({})))
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const requestedToken = parsedBody.data?.session_token?.trim()
    if (requestedToken && !isValidSessionToken(requestedToken)) {
      return NextResponse.json({ error: 'Invalid session token' }, { status: 400 })
    }

    const authClient = await createClient()
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = normalizeEmail(user.email)
    if (!userEmail) {
      return NextResponse.json({ error: 'Account email is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    let session: SessionRecord | null = null

    if (requestedToken) {
      const { data, error } = await supabase
        .from('audit_sessions')
        .select('id, user_id, status, email, form_data, overall_score, score_data, generated_content')
        .eq('session_token', requestedToken)
        .single()

      if (error || !data) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }
      session = data as SessionRecord
    } else {
      const { data, error } = await supabase
        .from('audit_sessions')
        .select('id, user_id, status, email, form_data, overall_score, score_data, generated_content')
        .eq('email', userEmail)
        .eq('status', 'submitted')
        .is('user_id', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Failed to fetch submitted session by email:', error)
        return NextResponse.json({ error: 'Failed to find session' }, { status: 500 })
      }

      if (!data) {
        return NextResponse.json({ linked: false, reason: 'No submitted session found' })
      }
      session = data as SessionRecord
    }

    const sessionEmail = normalizeEmail(session.email)
    if (sessionEmail && sessionEmail !== userEmail) {
      return NextResponse.json({ error: 'Session email does not match your account' }, { status: 403 })
    }

    if (session.user_id && session.user_id !== user.id) {
      return NextResponse.json({ error: 'Session already linked to another account' }, { status: 409 })
    }

    if (!['submitted', 'account_created'].includes(session.status)) {
      return NextResponse.json(
        { error: 'Session must be submitted before linking an account' },
        { status: 400 }
      )
    }

    if (!session.user_id) {
      const { error: updateError } = await supabase
        .from('audit_sessions')
        .update({
          user_id: user.id,
          status: 'account_created',
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id)
        .is('user_id', null)

      if (updateError) {
        console.error('Failed to link account:', updateError)
        return NextResponse.json({ error: 'Failed to link account' }, { status: 500 })
      }
    }

    const { data: existingSubmission, error: submissionFetchError } = await supabase
      .from('submissions')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (submissionFetchError) {
      console.error('Failed to check submission:', submissionFetchError)
    }

    if (!existingSubmission) {
      const scoreData = session.score_data || {}
      const generatedContent = session.generated_content || {}

      const { error: insertError } = await supabase.from('submissions').insert({
        user_id: user.id,
        questionnaire_data: session.form_data || {},
        overall_score: session.overall_score,
        dimension_scores: scoreData.dimensions ?? null,
        financial_metrics: scoreData.financialMetrics ?? null,
        call_prep: generatedContent.callPrep ?? null,
        diagnostic_report: generatedContent.diagnosticReport ?? null,
        build_plan: generatedContent.buildPlan ?? null,
        system_spec: generatedContent.systemSpec ?? null,
        status: 'submitted',
      })

      if (insertError) {
        console.error('Failed to create submission bridge record:', insertError)
      }
    }

    return NextResponse.json({ linked: true, session_id: session.id })
  } catch (error) {
    console.error('Link account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
