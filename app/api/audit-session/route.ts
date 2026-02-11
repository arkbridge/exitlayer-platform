import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    const { full_name, email, company_name } = await request.json()

    if (!full_name || !email || !company_name) {
      return NextResponse.json(
        { error: 'Name, email, and company name are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Check for existing in-progress session with this email
    const { data: existing } = await supabase
      .from('audit_sessions')
      .select('session_token, current_question_index, form_data')
      .eq('email', email.toLowerCase().trim())
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (existing) {
      // Return existing session so they can resume
      return NextResponse.json({
        session_token: existing.session_token,
        resumed: true,
        current_question_index: existing.current_question_index,
        form_data: existing.form_data,
      })
    }

    // Create new session
    const sessionToken = randomBytes(32).toString('hex')

    const { error } = await supabase.from('audit_sessions').insert({
      email: email.toLowerCase().trim(),
      full_name: full_name.trim(),
      company_name: company_name.trim(),
      session_token: sessionToken,
      form_data: { full_name, email, company_name },
      current_question_index: 3, // Past the 3 lead capture questions
      questions_answered: 3,
      status: 'in_progress',
    })

    if (error) {
      console.error('Failed to create audit session:', error)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      session_token: sessionToken,
      resumed: false,
    })
  } catch (error) {
    console.error('Audit session creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
