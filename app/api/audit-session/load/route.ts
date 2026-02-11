import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json(
      { error: 'Token is required' },
      { status: 400 }
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
        { status: 404 }
      )
    }

    // Don't allow loading expired or account-created sessions for editing
    if (data.status === 'account_created') {
      return NextResponse.json(
        { error: 'Session already completed', status: data.status },
        { status: 410 }
      )
    }

    return NextResponse.json({
      session_token: data.session_token,
      form_data: data.form_data,
      current_question_index: data.current_question_index,
      questions_answered: data.questions_answered,
      status: data.status,
    })
  } catch (error) {
    console.error('Audit session load error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
