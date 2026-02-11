import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/full-audit/submit - Submit completed full audit
export async function POST(request: NextRequest) {
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

    const { form_data } = await request.json()

    if (!form_data) {
      return NextResponse.json(
        { error: 'form_data is required' },
        { status: 400 }
      )
    }

    // Find user's in-progress audit session
    const { data: session, error: sessionError } = await supabase
      .from('audit_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('full_audit_status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'No in-progress full audit found' },
        { status: 404 }
      )
    }

    // Count answered questions
    const answeredCount = Object.keys(form_data).filter(key =>
      form_data[key] !== undefined &&
      form_data[key] !== '' &&
      form_data[key] !== null
    ).length

    // Mark as completed
    const { error: updateError } = await supabase
      .from('audit_sessions')
      .update({
        full_audit_data: form_data,
        full_audit_status: 'completed',
        full_audit_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.id)

    if (updateError) {
      console.error('Failed to submit full audit:', updateError)
      return NextResponse.json(
        { error: 'Failed to submit full audit' },
        { status: 500 }
      )
    }

    // TODO: Generate comprehensive analysis from full audit data
    // This could include:
    // - Detailed delegation roadmap
    // - System building priorities
    // - IP extraction opportunities
    // - Action items ranked by impact

    return NextResponse.json({
      success: true,
      message: 'Full audit submitted successfully',
      session_id: session.id,
      questions_answered: answeredCount,
    })
  } catch (error) {
    console.error('Full audit submit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
