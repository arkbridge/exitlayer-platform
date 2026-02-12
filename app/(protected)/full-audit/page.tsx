import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FullAuditForm from '@/components/FullAuditForm'

export default async function FullAuditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's audit session
  const { data: auditSession } = await supabase
    .from('audit_sessions')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['submitted', 'account_created'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // No short assessment completed - redirect to questionnaire
  if (!auditSession) {
    redirect('/questionnaire')
  }

  // If already completed, redirect to results
  if (auditSession.full_audit_status === 'completed') {
    redirect('/full-audit/results')
  }

  // If not started yet, start the audit
  if (auditSession.full_audit_status === 'not_started' || !auditSession.full_audit_status) {
    // Call the API to start the audit
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/full-audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `sb-access-token=${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
    })

    if (!response.ok) {
      console.error('Failed to start full audit')
    }
  }

  // Load saved progress
  const initialFormData = auditSession.full_audit_data || {}
  const initialQuestionIndex = auditSession.full_audit_current_question || 0

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0d1c18] via-emerald-950 to-[#0a1612] py-8">
        <div className="max-w-2xl mx-auto px-6">
          <h1
            className="text-2xl font-serif font-medium tracking-tight text-center"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 40%, rgba(167,243,208,0.85) 80%, rgba(110,231,183,0.7) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Full Audit
          </h1>
          <p className="text-white/50 text-center text-sm mt-2">
            74 questions • ~45 minutes
          </p>
        </div>
      </div>

      {/* Form */}
      <FullAuditForm
        initialFormData={initialFormData}
        initialQuestionIndex={initialQuestionIndex}
      />
    </div>
  )
}
