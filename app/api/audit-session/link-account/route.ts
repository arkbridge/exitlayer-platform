import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    const { session_token, user_id } = await request.json()

    if (!session_token || !user_id) {
      return NextResponse.json(
        { error: 'Session token and user ID are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Verify session exists and is submitted — fetch all fields needed for submissions bridge
    const { data: session, error: fetchError } = await supabase
      .from('audit_sessions')
      .select('id, status, email, form_data, overall_score, score_data, generated_content')
      .eq('session_token', session_token)
      .single()

    if (fetchError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    if (session.status !== 'submitted') {
      return NextResponse.json(
        { error: 'Session must be submitted before linking an account' },
        { status: 400 }
      )
    }

    // Link the user to the session
    const { error: updateError } = await supabase
      .from('audit_sessions')
      .update({
        user_id,
        status: 'account_created',
        updated_at: new Date().toISOString(),
      })
      .eq('session_token', session_token)

    if (updateError) {
      console.error('Failed to link account:', updateError)
      return NextResponse.json(
        { error: 'Failed to link account' },
        { status: 500 }
      )
    }

    // Data bridge: create submissions row so admin panel sees this client
    // Check if submission already exists for this user (avoid duplicates)
    const { data: existingSubmission } = await supabase
      .from('submissions')
      .select('id')
      .eq('user_id', user_id)
      .limit(1)
      .maybeSingle()

    if (!existingSubmission) {
      const scoreData = session.score_data as Record<string, any> | null
      const generatedContent = session.generated_content as Record<string, any> | null

      const { error: insertError } = await supabase
        .from('submissions')
        .insert({
          user_id,
          questionnaire_data: session.form_data || {},
          overall_score: session.overall_score,
          dimension_scores: scoreData?.dimensions || null,
          financial_metrics: scoreData?.financialMetrics || null,
          call_prep: generatedContent?.callPrep || null,
          diagnostic_report: generatedContent?.diagnosticReport || null,
          build_plan: generatedContent?.buildPlan || null,
          system_spec: generatedContent?.systemSpec || null,
          status: 'submitted',
        })

      if (insertError) {
        // Log but don't fail the link — the account link is the critical operation
        console.error('Failed to create submission (data bridge):', insertError)
      }
    }

    return NextResponse.json({ linked: true })
  } catch (error) {
    console.error('Link account error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
