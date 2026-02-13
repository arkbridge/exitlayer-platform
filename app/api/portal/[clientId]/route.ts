import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isUuid } from '@/lib/security'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params
    const normalizedClientId = clientId.trim()

    if (!normalizedClientId || normalizedClientId.length > 190) {
      return NextResponse.json({ error: 'Invalid client identifier' }, { status: 400 })
    }

    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()
    const isAdmin = !!profile?.is_admin

    let query = supabase.from('audit_sessions').select('*')

    if (isUuid(normalizedClientId)) {
      query = query.eq('id', normalizedClientId)
    } else {
      query = query.eq('client_folder', normalizedClientId)
    }

    if (!isAdmin) {
      query = query.eq('user_id', user.id)
    }

    const { data: session, error } = await query.limit(1).single()

    if (error) {
      console.error('Portal lookup failed:', error)
    }

    if (!session) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Build response from stored data
    const generatedContent =
      (session.generated_content as Record<string, unknown> | null) ?? {}
    const metadata = {
      clientName: session.company_name,
      contactName: session.full_name,
      contactEmail: session.email,
      submissionDate: session.submitted_at || session.created_at,
      overallScore: session.overall_score,
      ...(generatedContent.metadata as Record<string, unknown> | undefined),
    }

    return NextResponse.json({
      metadata,
      score: session.score_data,
      generatedContent: session.generated_content,
    })
  } catch (error) {
    console.error('Portal API error:', error)
    return NextResponse.json({ error: 'Failed to load client data' }, { status: 500 })
  }
}
