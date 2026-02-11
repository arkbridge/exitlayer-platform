import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/full-audit - Start a full audit
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

    // Find user's audit session (linked by user_id)
    const { data: session, error: sessionError } = await supabase
      .from('audit_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'submitted')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'No completed short assessment found. Please complete the initial assessment first.' },
        { status: 404 }
      )
    }

    // Check if full audit already started
    if (session.full_audit_status === 'in_progress') {
      return NextResponse.json({
        success: true,
        message: 'Full audit already in progress',
        session_id: session.id,
        current_question: session.full_audit_current_question || 0,
        form_data: session.full_audit_data || {},
      })
    }

    if (session.full_audit_status === 'completed') {
      return NextResponse.json({
        success: true,
        message: 'Full audit already completed',
        session_id: session.id,
        completed: true,
      })
    }

    // Start the full audit
    const { error: updateError } = await supabase
      .from('audit_sessions')
      .update({
        full_audit_status: 'in_progress',
        full_audit_current_question: 0,
        full_audit_data: {},
        full_audit_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.id)

    if (updateError) {
      console.error('Failed to start full audit:', updateError)
      return NextResponse.json(
        { error: 'Failed to start full audit' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Full audit started',
      session_id: session.id,
      current_question: 0,
      form_data: {},
    })
  } catch (error) {
    console.error('Full audit start error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
