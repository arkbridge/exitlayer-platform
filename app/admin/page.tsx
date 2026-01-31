import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

// Helper to get score color
function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#eab308'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

export default async function AdminOverviewPage() {
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

  // Calculate stats
  const stats = {
    total: submissions?.length || 0,
    submitted: submissions?.filter(s => s.status === 'submitted').length || 0,
    inReview: submissions?.filter(s => s.status === 'review').length || 0,
    building: submissions?.filter(s => s.status === 'building').length || 0,
    complete: submissions?.filter(s => s.status === 'complete').length || 0,
    avgScore: submissions?.length
      ? Math.round(submissions.reduce((sum, s) => sum + (s.overall_score || 0), 0) / submissions.length)
      : 0,
  }

  const recentSubmissions = submissions?.slice(0, 5) || []

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Overview of all client submissions and pipeline.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">Total Clients</div>
          <div className="text-3xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">New</div>
          <div className="text-3xl font-bold text-blue-400">{stats.submitted}</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">In Review</div>
          <div className="text-3xl font-bold text-yellow-400">{stats.inReview}</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">Building</div>
          <div className="text-3xl font-bold text-purple-400">{stats.building}</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">Complete</div>
          <div className="text-3xl font-bold text-green-400">{stats.complete}</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">Avg Score</div>
          <div className="text-3xl font-bold" style={{ color: getScoreColor(stats.avgScore) }}>
            {stats.avgScore}
          </div>
        </div>
      </div>

      {/* Recent submissions */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Submissions</h2>
          <Link
            href="/admin/clients"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="divide-y divide-gray-800">
          {recentSubmissions.length > 0 ? (
            recentSubmissions.map((submission: any) => (
              <Link
                key={submission.id}
                href={`/admin/clients/${submission.id}`}
                className="block px-6 py-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: getScoreColor(submission.overall_score) }}
                    >
                      {submission.overall_score}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {submission.profiles?.company_name || submission.profiles?.email || 'Unknown'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {submission.profiles?.full_name || 'No name'} • {new Date(submission.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      submission.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' :
                      submission.status === 'review' ? 'bg-yellow-500/20 text-yellow-400' :
                      submission.status === 'building' ? 'bg-purple-500/20 text-purple-400' :
                      submission.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {submission.status}
                    </span>
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))
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
