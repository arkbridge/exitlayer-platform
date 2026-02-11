import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PUT /api/full-audit/save - Save full audit progress (debounced from client)
export async function PUT(request: NextRequest) {
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

    const { form_data, current_question } = await request.json()

    if (form_data === undefined) {
      return NextResponse.json(
        { error: 'form_data is required' },
        { status: 400 }
      )
    }

    // Find user's in-progress audit session
    const { data: session, error: sessionError } = await supabase
      .from('audit_sessions')
      .select('id, full_audit_status')
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

    // Save progress
    const { error: updateError } = await supabase
      .from('audit_sessions')
      .update({
        full_audit_data: form_data,
        full_audit_current_question: current_question ?? 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.id)

    if (updateError) {
      console.error('Failed to save full audit progress:', updateError)
      return NextResponse.json(
        { error: 'Failed to save progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      saved: true,
      session_id: session.id,
    })
  } catch (error) {
    console.error('Full audit save error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
