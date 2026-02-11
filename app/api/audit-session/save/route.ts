import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function PUT(request: NextRequest) {
  try {
    const { session_token, form_data, current_question_index, questions_answered } =
      await request.json()

    if (!session_token) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
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
        { status: 500 }
      )
    }

    return NextResponse.json({ saved: true })
  } catch (error) {
    console.error('Audit session save error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
