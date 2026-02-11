import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;

    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Query audit_sessions by client_folder or id
    const { data: session, error } = await supabase
      .from('audit_sessions')
      .select('*')
      .or(`client_folder.eq.${clientId},id.eq.${clientId}`)
      .limit(1)
      .single();

    if (error || !session) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Build response from stored data
    const metadata = {
      clientName: session.company_name,
      contactName: session.full_name,
      contactEmail: session.email,
      submissionDate: session.submitted_at || session.created_at,
      overallScore: session.overall_score,
      ...(session.generated_content?.metadata || {}),
    };

    return NextResponse.json({
      metadata,
      score: session.score_data,
      generatedContent: session.generated_content,
    });

  } catch (error) {
    console.error('Portal API error:', error);
    return NextResponse.json(
      { error: 'Failed to load client data' },
      { status: 500 }
    );
  }
}
