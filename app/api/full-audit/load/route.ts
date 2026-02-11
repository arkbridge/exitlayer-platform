import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/full-audit/load - Load full audit progress
export async function GET() {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find user's audit session
    const { data: session, error: sessionError } = await supabase
      .from('audit_sessions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['submitted', 'account_created'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'No audit session found' },
        { status: 404 }
      )
    }

    // Return full audit state
    return NextResponse.json({
      success: true,
      session_id: session.id,
      full_audit_status: session.full_audit_status || 'not_started',
      full_audit_data: session.full_audit_data || {},
      full_audit_current_question: session.full_audit_current_question || 0,
      full_audit_started_at: session.full_audit_started_at,
      full_audit_completed_at: session.full_audit_completed_at,
      // Also include short assessment data for context
      short_assessment: {
        form_data: session.form_data,
        score_data: session.score_data,
        overall_score: session.overall_score,
      },
    })
  } catch (error) {
    console.error('Full audit load error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
