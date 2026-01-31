import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

// Helper to get score color
function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#eab308'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  submitted: { label: 'New', color: 'bg-blue-500/20 text-blue-400' },
  review: { label: 'In Review', color: 'bg-yellow-500/20 text-yellow-400' },
  call_scheduled: { label: 'Call Scheduled', color: 'bg-cyan-500/20 text-cyan-400' },
  call_complete: { label: 'Call Complete', color: 'bg-indigo-500/20 text-indigo-400' },
  building: { label: 'Building', color: 'bg-purple-500/20 text-purple-400' },
  complete: { label: 'Complete', color: 'bg-green-500/20 text-green-400' },
}

export default async function ClientsListPage() {
  const supabase = await createClient()

  // Fetch all submissions with profiles
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      *,
      profiles:user_id (
        email,
        full_name,
        company_name
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">All Clients</h1>
        <p className="text-gray-400">{submissions?.length || 0} total submissions</p>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-800/50 text-xs font-medium text-gray-400 uppercase tracking-wider">
          <div className="col-span-1">Score</div>
          <div className="col-span-3">Company</div>
          <div className="col-span-2">Contact</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Revenue</div>
          <div className="col-span-2">Date</div>
        </div>

        {/* Table body */}
        <div className="divide-y divide-gray-800">
          {submissions && submissions.length > 0 ? (
            submissions.map((submission: any) => {
              const status = STATUS_LABELS[submission.status] || STATUS_LABELS.submitted
              const revenue = submission.questionnaire_data?.annual_revenue || 0
              const formattedRevenue = revenue >= 1000000
                ? `$${(revenue / 1000000).toFixed(1)}M`
                : `$${(revenue / 1000).toFixed(0)}K`

              return (
                <Link
                  key={submission.id}
                  href={`/admin/clients/${submission.id}`}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-800/50 transition-colors"
                >
                  <div className="col-span-1">
                    <span
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-white font-bold text-sm"
                      style={{ backgroundColor: getScoreColor(submission.overall_score) }}
                    >
                      {submission.overall_score}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <p className="text-white font-medium truncate">
                      {submission.profiles?.company_name || 'No company'}
                    </p>
                    <p className="text-gray-500 text-sm truncate">
                      {submission.profiles?.email}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-300 truncate">
                      {submission.profiles?.full_name || '—'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-300">{formattedRevenue}</p>
                  </div>
                  <div className="col-span-2 flex items-center justify-between">
                    <p className="text-gray-500 text-sm">
                      {new Date(submission.created_at).toLocaleDateString()}
                    </p>
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <p>No submissions yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
