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

    // Verify session exists and is submitted
    const { data: session, error: fetchError } = await supabase
      .from('audit_sessions')
      .select('id, status, email')
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

    return NextResponse.json({ linked: true })
  } catch (error) {
    console.error('Link account error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
